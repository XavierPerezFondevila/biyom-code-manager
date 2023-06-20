import * as vscode from "vscode";
import * as utils from './utils/utils';
import { repoPath } from "../extension";

export async function init() {

  if (!repoPath.length) {
    return;
  }

  if(!vscode.workspace.getConfiguration().get('biyom-code-manager.accessToken')){
    vscode.window.showInformationMessage('Access token is required!');
    return;
  }

  const repos = await utils.fetchRepositoriesWithTopics(vscode.workspace.getConfiguration().get('biyom-code-manager.topics') ?? ["libs", "beyond"]);

  const selectedRepo = await vscode.window.showQuickPick(repos, {
    matchOnDetail: true,
  });

  const result = await vscode.window.showQuickPick(['Yes', 'No'], {
    placeHolder: 'Are you sure you want to override the ' + selectedRepo?.label + ' lib?',
    canPickMany: false,
  });

  if(result !== 'Yes'){
    return;
  }

  if(selectedRepo?.label){
    utils.fetchRepositoryCode(selectedRepo?.label);
  }
}

