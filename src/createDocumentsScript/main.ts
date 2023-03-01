import * as vscode from 'vscode';
import * as languagesService from './services/languagesService';
import * as scriptService from './services/scriptService';
import { repoPath } from "../extension";

let documentLanguages = languagesService.getAvailableLanguages();
let selectedLanguages: string[] = [];

export async function init() {
  if (!repoPath.length) {
    return;
  }

  await getLanguages();
  if (selectedLanguages.length) {
    getScript();
  }
  documentLanguages = languagesService.getAvailableLanguages();
}

async function getScript(){
  let documentsData = languagesService.getFilledLanguageData(selectedLanguages);
  const content = scriptService.getScript(documentsData);
  const language = 'just\ntext';
  const document = await vscode.workspace.openTextDocument({
    language,
    content,
  });
  vscode.window.showTextDocument(document);
}

async function getLanguages(){
  let promptData: any = null;
  do {
    promptData = await vscode.window.showQuickPick(documentLanguages, {
      matchOnDetail: true,
    });
    if (promptData) {
      selectedLanguages.push(promptData.label);
      documentLanguages = documentLanguages.filter(language => language !== promptData);
    }
  } while (promptData && documentLanguages.length);
}
