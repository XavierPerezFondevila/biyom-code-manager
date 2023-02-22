import * as fs from "fs";

export function setFileReplaces(
  filePath: string,
  fileSearch: string,
  replacements: any,
  includesPath: string
) {
  try {
    let fileContent = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    let fileIndex = fileContent.findIndex((line) => line.includes(fileSearch));

    replacements.forEach((replacement: any) => {
      fileContent.splice(
        replacement.indexQuantity + fileIndex,
        0,
        replacement.value
      );
    });

    if (typeof includesPath !== "undefined" && includesPath.length) {
      fileContent = setInternalIncludes(fileContent, includesPath);
    }

    fs.writeFileSync(filePath, fileContent.join("\n"));
  } catch (error) {
    throw new Error("Es de front");
  }
}

export function setInternalIncludes(file: string[], controllerPath: string) {
  let internalUse = `use SITE\\Enums\\RouteTypes\\Internal${controllerPath};`;
  let useIndex = file.findIndex((line) => line.includes(internalUse));
  if (useIndex === -1) {
    //use isnt found
    let firstUseIndex = file.findIndex((line) => line.includes("use"));
    file.splice(firstUseIndex, 0, internalUse);
  }
  return file;
}

export function customWriteFile(
  dirPath: string,
  fileName: string,
  fileContent: string
) {
  fs.mkdir(dirPath, { recursive: true }, function (err) {
    if (err) {
      return err;
    }
    fs.writeFileSync(dirPath + `\\${fileName}`, fileContent);
  });
}

export function camelToSnakeCase(name: string) {
  return name
    .replace(/[A-Z]/g, (letter, index) => {
      return index === 0 ? letter : "_" + letter;
    })
    .toUpperCase();
}
