import * as vscode from 'vscode';
import * as languagesService from './languages/languagesService';
import { repoPath } from '../extension';

let documentLanguages = languagesService.getAvailableLanguages();
let selectedLanguages: string[] = [];

export async function init() {
  await getLanguages();
  console.log(selectedLanguages);
  if (selectedLanguages.length) {
    getScript();
  }
}

function getScript(){
  let documentsData = languagesService.getFilledLanguageData(selectedLanguages);
  console.log(documentsData);
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
