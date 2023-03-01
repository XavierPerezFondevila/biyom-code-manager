let controllerData: any = {};
import * as utils from "../utils/utils";

export function createFiles(data: any) {
  controllerData = data;
  setInternalEnum();
  setRoutePath();
  setCacheControl();
}

function setInternalEnum() {
  let snakeControllerName = utils.camelToSnakeCase(controllerData.name);
  try {
    let filePath =
      controllerData.repoPath +
      `\\src\\Enums\\RouteTypes\\Internal${controllerData.path.label}.php`;
    let fileReplaces = [
      {
        indexQuantity: 2,
        value: "",
      },
      {
        indexQuantity: 1,
        value: `    public const ${snakeControllerName} = '${controllerData.path.label.toUpperCase()}_INTERNAL_${snakeControllerName.toUpperCase()}';`,
      },
    ];
    utils.setFileReplaces(filePath, "public const", fileReplaces, "");
  } catch (error) {
    // error means file doesnt exists so we create it
    const internalName = `Internal${controllerData.path.label}`;
    const internalPathTemplate = `<?php

namespace SITE\\Enums\\RouteTypes;

use FWK\\Enums\\RouteTypes\\${internalName} as FWK${internalName};

abstract class ${internalName} extends FWK${internalName} {

    public const ${snakeControllerName} = '${controllerData.path.label.toUpperCase()}_INTERNAL_${snakeControllerName}';
}
`;
    utils.customWriteFile(
      controllerData.repoPath + "\\src\\Enums\\RouteTypes",
      `${internalName}.php`,
      internalPathTemplate
    );
  }
}

function setRoutePath() {
  let camelControllerName = utils.camelToSnakeCase(controllerData.name);
  let filePath =
    controllerData.repoPath + `\\src\\Core\\Resources\\RoutePaths.php`;
  let fileReplaces = [
    {
      indexQuantity: 0,
      value: `            Internal${
        controllerData.path.label
      }::${camelControllerName} => '/' . INTERNAL_PREFIX . '/${controllerData.path.label.toLowerCase()}/${camelControllerName.toLowerCase()}',`,
    },
  ];
  utils.setFileReplaces(
    filePath,
    "parent::getArrayRouteTypePaths()",
    fileReplaces,
    controllerData.path.label
  );
}

function setCacheControl() {
  let filePath =
    controllerData.repoPath + `\\src\\Core\\Resources\\CacheControl.php`;
  let fileReplaces = [
    {
      indexQuantity: -1,
      value: `            Internal${
        controllerData.path.label
      }::${utils.camelToSnakeCase(controllerData.name)},`,
    },
  ];

  utils.setFileReplaces(
    filePath,
    "parent::getRouteTypesStorables()",
    fileReplaces,
    controllerData.path.label
  );
}