export const getCreateScript = (documentsData: any) => `
  console.clear();
  const localDocuments = ${JSON.stringify(documentsData)};
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
        if (localDocuments[key].boName.toUpperCase() === documents[templateFilledCounter]?.name.toUpperCase()) {
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
`;

export const getImportScript = (documentsData: any, languagesData: any) =>
  `
  console.clear();
  const localDocuments = ${ JSON.stringify(documentsData)};
  const backOfficeLanguages = ${ JSON.stringify(
    Object.assign({}, languagesData)
  )};
  const targetNode = document.querySelector('#windowContainer');
  let config = { childList: true, subtree: true };
  let backOfficeDocuments = [];
  let templateFilledCounter = 0;
  
  const editDocuments = (documents) => {
    const editDocumentObserver = new MutationObserver((mutations, observer) => {
      let languagesCounter = 0;
      let lastEditor = undefined;
      let currentLocalDocumentKey = undefined;
      let languages = undefined;
  
      Object.keys(localDocuments).forEach((key) => {
        if (localDocuments[key].boName.toUpperCase() === documents[templateFilledCounter]?.name.toUpperCase()) {
          currentLocalDocumentKey = key;
        }
      });
  
      if (currentLocalDocumentKey) {
        mutations.forEach((mutation) => {
          if (mutation.target.matches('.ace_editor')) {
            languages = document.querySelector('.window.activedWindow input[name="languages"]')?.value.split(',');
            const editorId = mutation.target?.id;
            if (editorId && languages) {
              if (!lastEditor || lastEditor !== mutation.target) {
                const editor = ace.edit(editorId);
                localDocuments[currentLocalDocumentKey].contents[languages[languagesCounter]] = editor.getValue();
                lastEditor = mutation.target;
                languagesCounter++;
                if (languagesCounter === languages.length) {
                  document.querySelector('.window.activedWindow .windowButtons .closeButton').click();
                  console.log(
                    '%c✅ ' + documents[templateFilledCounter]?.name + ' succesfully imported',
                    "background:#d4edda; color: #155724;padding: .25rem .5rem;"
                  );
                  templateFilledCounter++;
                  const newTemplateId = documents[templateFilledCounter]?.templateId;
                  if (newTemplateId) {
                    setTimeout(() => {
                      editDocumentType(newTemplateId, 1);
                    }, 1000);
                  }
  
                }
              }
            }
          }
        });
      } else {
        if (templateFilledCounter !== documents.length) {
          console.log(
            '%cDocument not found :O',
            "background:#f8d7da; color: #721c24;padding: .25rem .5rem;"
          );
          observer?.disconnect();
        }
      }
      
      if (templateFilledCounter === documents.length) {
        console.log(
          '%cDocument templates were correctly created - Enjoy ✌',
          "background:#d4edda; color: #155724;padding: .25rem .5rem;"
          );
          downloadData(getDownloableData());
          observer?.disconnect();
      }
    });
  
    editDocumentObserver.observe(targetNode, config);
    editDocumentType(documents[templateFilledCounter].templateId, 1);
  };
  
  const downloadData = (documentsData) => {
  
    require(['https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'], function (JSZip) {
      const jsZip = new JSZip();
  
      Object.keys(documentsData).forEach(lang => {
        const folder = jsZip.folder(lang);
        Object.keys(documentsData[lang]).forEach((documentName) => {
          folder.file(documentName + '.twig', documentsData[lang][documentName]);
        });
      });
  
      // Generate the zip file asynchronously
      jsZip.generateAsync({ type: "blob" }).then(function (content) {
        // Download the zip file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = document.title.split('|').pop().trim() + ".zip";
        link.click();
      });
    });
  };
  
  const getDownloableData = () => {
    let downloableData = {};
    Object.keys(localDocuments).forEach((key) => {
      const documentName = key;
      Object.keys(localDocuments[key]?.contents).forEach((languageId) => {
        const languagePrefix = Object.values(backOfficeLanguages).filter(lang => lang.id == languageId).shift()?.key.toLowerCase() || undefined;
        if (languagePrefix) {
          if (!downloableData.hasOwnProperty(languagePrefix)) {
            downloableData[languagePrefix] = {};
          }
          downloableData[languagePrefix][documentName] = localDocuments[documentName].contents[languageId];
        }
      });
    });
    return downloableData;
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
`;
