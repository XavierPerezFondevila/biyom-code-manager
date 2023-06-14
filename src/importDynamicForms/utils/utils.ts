import * as fs from "fs";
import { repoPath } from "../../extension";

const commerceDtoUse = 'use SITE\\Core\\Controllers\\DynamicCustomForms\\DynamicCustomForms;';
const commerceDtoContent = `
    /** 
     * This method returns the send forms mail configuration in this commerce.
     *
     * @return array
     */
    public function getSendMailFormsFields(): array {
        return parent::getSendMailFormsFields() + (new DynamicCustomForms())->getFormFields();
    }`;

export function customWriteFile(
  dirPath: string,
  fileName: string,
  fileContent: string
) {
  const projectDirPath = repoPath + dirPath;

  fs.mkdir(projectDirPath, { recursive: true }, function (err) {
    if (err) {
      return err;
    }
    fs.writeFileSync(projectDirPath + `\\${fileName}`, fileContent);
  });
}

export function addCommerceFunction(){
  const filePath = repoPath + '\\src\\Core\\Theme\\Dtos\\Commerce.php'; 
  const splittedContent = commerceDtoContent.split(/\r?\n/);
  let fileContent = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  let lastPosition = fileContent.length;

  while(fileContent[lastPosition] !== '}'){
    lastPosition--;
  }

  fileContent.splice(lastPosition, 0, ...splittedContent);

  let useIndex = (fileContent.findIndex((line) => line.includes('namespace')) + 2);
  fileContent.splice(useIndex, 0, commerceDtoUse);

  fs.writeFileSync(filePath, fileContent.join("\n"));

}