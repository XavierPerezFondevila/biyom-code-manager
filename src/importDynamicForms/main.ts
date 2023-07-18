import * as fs from "fs";
import * as vscode from "vscode";
import { repoPath } from "../extension";
import { controllers } from "./files/controllers";
import { enums } from "./files/enums";
import * as utils from './utils/utils';

export async function init() {
  if (!repoPath.length) {
    return;
  }

  if (isModuleInstalled()) {
    return;
  }

  const result = await vscode.window.showQuickPick(['Yes', 'No'], {
    placeHolder: 'Are you sure you want to import the Dynamic Forms lib?',
    canPickMany: false,
  });

  if (result !== 'Yes') {
    return;
  }

  createFiles();
  vscode.window.showInformationMessage('Dynamic Form successfully imported');
}

const isModuleInstalled = (): boolean => {
  const filePath = repoPath + '\\src\\Core\\Theme\\Dtos\\Commerce.php';
  const fileContent = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  return fileContent.findIndex((line) => line.includes('DynamicCustomForms')) !== -1;
};

const createFiles = () => {
  const internalFiles = controllers.concat(enums);

  utils.addCommerceFunction();
  internalFiles.forEach((file: any) => {
    utils.customWriteFile(file.path, file.name, file.content);
  });
};