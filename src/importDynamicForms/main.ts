import * as fs from "fs";
import { repoPath } from "../extension";
import { controllers } from "./files/controllers";
import { enums } from "./files/enums";
import * as utils from './utils/utils';

export function init(){
  if (!repoPath.length) {
    return;
  }

  console.log(isModuleInstalled());

  if(isModuleInstalled()){
    return;
  }

  createFiles();
}

const isModuleInstalled = ():boolean => {
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