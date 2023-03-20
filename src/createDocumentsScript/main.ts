import * as vscode from 'vscode';
import * as languagesService from './services/languagesService';
import * as scriptService from './services/scriptService';
import { repoPath } from "../extension";
import { getBackOfficeLanguages } from './services/languagesService';

let documentLanguages = languagesService.getAvailableLanguages();
let selectedLanguages: string[] = [];


export async function init(mode: string){
  if (!repoPath.length) {
    return;
  }

  await getLanguages();
  if (selectedLanguages.length) {
    getScript(mode);
  }
  documentLanguages = languagesService.getAvailableLanguages();
}
async function getScript(mode: string){
  let content: any = null;
  if (!['create', 'import'].includes(mode)) {
    return;
  }

  
  if (mode === 'create') {
    content = scriptService.getCreateScript(languagesService.getLanguageData(selectedLanguages, true));
  }else{
    content = scriptService.getImportScript(languagesService.getLanguageData(selectedLanguages), getBackOfficeLanguages());
  }

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
