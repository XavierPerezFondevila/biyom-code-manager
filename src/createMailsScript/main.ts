import * as utils from './utils/utils';
import * as vscode from 'vscode';
import { repoPath } from "../extension";
import { getMailsScript } from './services/createScript';

let selectedLanguages: any = [];

export async function init() {
  if (!repoPath.length) {
    return;
  }
  
  await getSelectedLanguages();

  if(selectedLanguages.length){
    const languageData = await utils.getLanguagesData(selectedLanguages);

    if(languageData.length){
      const content = getMailsScript(Object.assign({}, ...languageData));
      const language = 'just\ntext';
      const document = await vscode.workspace.openTextDocument({
        language,
        content,
      });
      vscode.window.showTextDocument(document);
    }

  }
}

const getSelectedLanguages = async () => {
  let availableLanguages: any = await utils.fetchAvailableLanguages();
  let promptData: any = null;

  do {
    promptData = await vscode.window.showQuickPick(availableLanguages, {
      matchOnDetail: true,
    });
    if (promptData) {
      selectedLanguages.push(promptData.description);   
      availableLanguages = availableLanguages.filter((lang: any) => lang.description !== promptData.description);
    }
  } while (promptData && selectedLanguages.length && availableLanguages.length !== 0);
};