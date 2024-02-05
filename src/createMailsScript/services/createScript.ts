import * as vscode from "vscode";

export const getMailsScript = (mailsData: any) => `
  console.clear();
  const backOfficeMails = ${JSON.stringify(mailsData)};
  const settingsMailAccountId = ${
    vscode.workspace.getConfiguration().get("biyom-code-manager.mailId") ?? 1
  }; 
  const targetNode = document.querySelector('#windowContainer');
  let config = { childList: true, subtree: true };
  let defaultMails = undefined;
  let lastEmails = [];
  let currentEmail = undefined;

  const fillMail = (mail, mailId, tabIndex) => {
    const templateName = mail.templates[mailId].name;
    const templateSubject = mail.templates[mailId].subject.length
      ? mail.templates[mailId].subject
      : " ";
  
    document.querySelector(
      '.window.activedWindow .tabContent[index="' +
        tabIndex +
        '"] input[name*="mailDisplayName"]'
    ).value = templateName;
    document.querySelector(
      '.window.activedWindow .tabContent[index="' +
        tabIndex +
        '"] input[name*="subject"]'
    ).value = templateSubject;
  
    const editors = document.querySelectorAll(
      '.window.activedWindow .tabContent[index="' + tabIndex + '"] .ace_editor'
    );
    editors.forEach((editor) => {
      let editorValue = undefined;
      const editorClassList = [...editor.classList];
      if (editorClassList.some((className) => className.includes("header"))) {
        // setHeader
        editorValue = mail.header.html;
      } else if (
        editorClassList.some((className) => className.includes("body"))
      ) {
        // setBody
        editorValue = mail.templates[mailId].html;
      } else {
        // set Footer
        editorValue = mail.footer.html;
      }
      if (!editorValue.length) {
        editorValue = " ";
      }
      ace.edit(editor).setValue(editorValue);
    });
  };
  const editMailCallback = (mutationList, observer) => {
    const mailWindowElement = mutationList.some((ele) =>
      ele.target.matches(".windowFooter")
    );
    let needsToClose = false;
  
    try {
      if (mailWindowElement) {
        if (!document.getElementById("-lucee-err")) {
          const languages = document
            .querySelector('form input[type="hidden"][name="languages"]')
            ?.value?.split(",");
          const languageTabsContainerId = document.querySelector(
            ".languageTabsContainer"
          ).id;
          const mailType = document.querySelector(
            'form input[type="hidden"][name="type"]'
          )?.value;
  
          // selectMailAccountId
          const mailAccountSelector = document.querySelector(
            '.window.activedWindow select[name="mailAccountId"]'
          );
          if (mailAccountSelector.options.length !== 1) {
            mailAccountSelector.value = settingsMailAccountId;
            if (languages && mailType) {
              languages.forEach((lang, index) => {
                if (backOfficeMails[lang]) {
                  fillMail(backOfficeMails[lang], currentEmail.id, index + 1);
                }
              });
              document
                .querySelector(
                  '.window.activedWindow .footerButtons input[type="submit"]'
                )
                .click();
            }
          } else {
            console.log(
              "%c⚠️ Falta configurar el compte de mail",
              "color:#f8d7da; padding: .25rem .5rem;"
            );
            observer.disconnect();
            return;
          }
        } else {
          console.log(
            "%c👎 No s'ha trobat el mail: " + currentEmail.id,
            "background:#f8d7da; color: #721c24; padding: .25rem .5rem;"
          );
          needsToClose = true;
        }
      } else {
        const responseMessageTarget = mutationList.find((ele) =>
          ele.target.matches(".responseMessageTarget.okMessage")
        );
        if (
          responseMessageTarget &&
          responseMessageTarget.target.style.visibility === "visible"
        ) {
          if (currentEmail && !lastEmails.includes(currentEmail.id)) {
            console.log(
              "%c👍 El mail: " + currentEmail.id + " s'ha creat correctament",
              "background:#d4edda; color: #155724;padding: .25rem .5rem;"
            );
  
            lastEmails.push(currentEmail.id);
          }
          needsToClose = true;
        }
      }
    } catch (err) {
      console.log(
        "%c👎 No s'ha trobat el mail: " + currentEmail.id,
        "background:#f8d7da; color: #721c24; padding: .25rem .5rem;"
      );
      needsToClose = true;
    }
  
    if (needsToClose) {
      document
        .querySelector(".window.activedWindow .titleBar .closeButton")
        .click();
      if (defaultMails.length) {
        currentEmail = {
          id: defaultMails.shift(),
        };
  
        editMailType(currentEmail.id, 0, 0, 0);
      } else {
        console.log(
          "%cVScode Emilio Generator ☕ \\n Enjoy! 🌼",
          "font-size: 18px; font-weight: bold; padding-top: 16px; padding-bottom: 16px;"
        );
        observer.disconnect();
      }
    }
  };
  const editMails = () => {
    defaultMails = Object.keys(Object.values(backOfficeMails).shift()?.templates);
    let editMailObserver = new MutationObserver(editMailCallback);
    editMailObserver.observe(targetNode, config);
  
    currentEmail = {
      id: defaultMails.shift(),
    };
  
    editMailType(currentEmail.id, 0, 0, 0);
  };
  const openMailTypesCallback = (mutationList, observer) => {
    let isMailTypesOpened = false;
  
    for (const mutation of mutationList) {
      let addedNodes = [...mutation?.addedNodes];
      if (addedNodes && !isMailTypesOpened) {
        if (addedNodes.length === 1 && addedNodes[0].matches(".mail")) {
          isMailTypesOpened = true;
        }
      }
    }
  
    if (isMailTypesOpened) {
      observer.disconnect();
      editMails();
    }
  };
  const openMailObserver = new MutationObserver(openMailTypesCallback);
  openMailObserver.observe(targetNode, config);
  openMailTypes();
  
`;
