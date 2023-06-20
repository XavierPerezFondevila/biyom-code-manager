console.clear();
const localDocuments = ${ JSON.stringify(documentsData)};
const targetNode = document.querySelector('#windowContainer');
let config = { childList: true, subtree: true };
let backOfficeDocuments = [];
let templateFilledCounter = 0;

const editDocuments = (documents) => {
  const editDocumentObserver = new MutationObserver((mutations, observer) => {
    let languagesCounter = 0;
    let lastEditor = undefined;
    let currentLocalDocument = undefined;

    Object.keys(localDocuments).forEach((key) => {
      if (localDocuments[key].boName.toUpperCase() === documents[templateFilledCounter]?.name.toUpperCase() 
        || key.toUpperCase() === documents[templateFilledCounter]?.name.toUpperCase()) {
        currentLocalDocument = localDocuments[key];
      }
    });
    if (currentLocalDocument) {
      mutations.forEach((mutation) => {
        if (mutation.target.matches('.ace_editor')) {
          const languages = document.querySelector('.window.activedWindow input[name="languages"]')?.value.split(',');
          const editorId = mutation.target?.id;
          if (editorId && languages) {
            if (!lastEditor || lastEditor !== mutation.target) {
              const editor = ace.edit(editorId);
              editor.setValue(currentLocalDocument.contents[languages[languagesCounter]]);
              lastEditor = mutation.target;
              languagesCounter++;
              if (languagesCounter === languages.length) {
                saveTemplate().then(() => {
                  console.log(
                    '%c✅ ' + documents[templateFilledCounter]?.name + ' succesfully created',
                    "background:#d4edda; color: #155724;padding: .25rem .5rem;"
                  );
                  templateFilledCounter++;
                  const newTemplateId = documents[templateFilledCounter]?.templateId;
                  if (newTemplateId) {
                    setTimeout(() => {
                      editDocumentType(newTemplateId, 1);
                    }, 1000);
                  }
                }).catch(() => {
                  console.log(
                    '%c⚠️ Error found in ' + documents[templateFilledCounter]?.name,
                    "background:#f8d7da; color: #721c24; padding: .25rem .5rem;"
                  );
                  observer.disconnect();
                });

              }
            }
          }

        }
      });
    }

    if (templateFilledCounter === documents.length) {
      console.log(
        '%cDocument templates were correctly created - Enjoy ✌',
        "background:#d4edda; color: #155724;padding: .25rem .5rem;"
      );
      observer.disconnect();
    }
  });

  editDocumentObserver.observe(targetNode, config);
  editDocumentType(documents[templateFilledCounter].templateId, 1);
};

const saveTemplate = () => {
  return new Promise((resolve, reject) => {
    let saveNodeTarget = document.querySelector('.window.activedWindow .responseMessageTarget');
    let saveConfig = { attributes: true };

    const saveDocumentObserver = new MutationObserver((mutations, observer) => {
      mutations.forEach((mutation) => {
        if (!mutation.target.matches('.loadingMessage')) {
          observer.disconnect();
          if (mutation.target.matches('.okMessage')) {
            document.querySelector('.window.activedWindow .windowButtons .closeButton').click();
            resolve();
          } else if(mutation.target.matches('.errorMessage')){
            document.querySelector('.window.activedWindow .windowButtons .closeButton').click();
          } else {
            reject();
          }
        }
      });
    });

    saveDocumentObserver.observe(saveNodeTarget, saveConfig);
    document.querySelector('.window.activedWindow .rightButtons input[type="submit"]').click();

  });
};

const openDocumentTypesCallback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    let addedNodes = [...mutation.addedNodes];
    try {
      if (addedNodes.length === 1 && addedNodes[0].matches('.document')) {
        const documentData = JSON.parse(addedNodes[0].getAttribute('data'));
        backOfficeDocuments.push({ templateId: documentData?.id, name: documentData?.name });
      }
    } catch (error) {

    }
  }

  if (backOfficeDocuments.length) {
    observer.disconnect();
    editDocuments(backOfficeDocuments);
  }

};

let openDocumentObserver = new MutationObserver(openDocumentTypesCallback);
openDocumentObserver.observe(targetNode, config);
openDocumentTypes();