import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as controllerApi from './files/controller';
import * as internalFilesApi from './files/internalFiles';
import { repoPath } from "../extension";

let controllerData: any = {};

const controllerTypes = [
  {
    label: "Html controller",
    detail: "BaseHtmlController",
  },
  {
    label: "JSON controller",
    detail: "BaseJsonController",
  },
  {
    label: "PDF controller",
    detail: "BasePdfController",
  },
  {
    label: "XML controller",
    detail: "BaseXmlController",
  },
  {
    label: "JS controller",
    detail: "BaseJsController",
  },
];

const controllerPaths = [
  {
    label: "Banner",
    detail:  path.join("Controllers","Banner","Internal"),
  },
  {
    label: "Basket",
    detail: path.join("Controllers","Basket", "Internal"),
  },
  {
    label: "Blog",
    detail: path.join("Controllers","Blog","Internal"),
  },
  {
    label: "Checkout",
    detail: path.join("Controllers","Checkout","Internal"),
  },
  {
    label: "Page",
    detail: path.join("Controllers","Page","Internal"),
  },
  {
    label: "Product",
    detail: path.join("Controllers","Product","Internal"),
  },
  {
    label: "Resources",
    detail: path.join("Controllers","Resources","Internal"),
  },
  {
    label: "User",
    detail: path.join("Controllers","User","Internal"),
  },
  {
    label: "Util",
    detail: path.join("Controllers","Util","Internal"),
  },
];

export async function init() {
  if (!repoPath.length) {
    return;
  }

  await getInputData();
  controllerData.repoPath = repoPath;
  if (!validateInputs()) {
    return console.log("esDeFront");
  }

  
  const controllerPath = path.join(controllerData.repoPath, "src", controllerData.path.detail, controllerData.name + "Controller.php");

  fs.readFile(
    controllerPath,
    function read(err) {
      if (err) {
        controllerApi.createController(controllerData);
        internalFilesApi.createFiles(controllerData);
      } else {
        vscode.window.showInformationMessage("Controller already exists!");
      }
    }
  );
}

async function getInputData() {
  controllerData.name = await vscode.window.showInputBox({
    placeHolder: "ShopBySku",
    prompt: "Enter the controller name",
  });

  controllerData.type = await vscode.window.showQuickPick(controllerTypes, {
    matchOnDetail: true,
  });

  controllerData.path = await vscode.window.showQuickPick(controllerPaths, {
    matchOnDetail: true,
  });
}

function validateInputs() {
  let validInputs = true;

  Object.keys(controllerData).forEach((key) => {
    if (
      typeof controllerData[key] === "undefined" ||
      controllerData[key] === null
    ) {
      validInputs = false;
    }
  });

  if (validInputs && controllerData.name.includes("Controller")) {
    controllerData.name.replace("Controller", "");
  }

  return validInputs;
}
