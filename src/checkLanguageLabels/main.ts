import * as vscode from "vscode";
import * as fs from "fs";
import { repoPath, fwkPath } from "../extension";

/**
 * Retorna array rollo: ['ACCEPT_COOKIES', 'ACCOUNT_DELETED', 'ADD_BILLING_ADDRESS', 'ADD_GIFT_TO_CART']
 * @param fwkPath 
 * @returns {Promise}
 */
const getFwkLanguageKeys = (fwkPath: string) => new Promise((resolve, reject) => {
  let languageLabels: any = [];
  let deprecatedLanguageLabels: any = [];

  fs.readFile(fwkPath + `\\src\\Enums\\LanguageLabels.php`, 'utf8', (err, data) => {
    if (err) { reject(err); }

    const regex = /Enum\s?{(.*?)}/gs;
    const fileLabelsContent = data.match(regex);

    if (fileLabelsContent && fileLabelsContent.length > 0) {
      const lines = fileLabelsContent[0].split('\n');
      lines.shift();
      lines.pop();

      let deprecateAlert = false;
      lines.forEach(line => {
        let isValid = /(public const|PUBLIC CONST)/.test(line);
        let emptyLine = line.trim().length === 0;

        if (line.toLowerCase().includes('deprecate')) {
          deprecateAlert = true;
        }
        if (emptyLine) {
          deprecateAlert = false;
        }
        // Push value from "public const ADD_TO_WISHLIST = 'addToWishlist';"
        // to "ADD_TO_WISHLIST"
        if (!deprecateAlert && isValid) {
          let keys = line.trim().match(/(public const|PUBLIC CONST)\s?([A-Z0-9_]+)/);
          if (keys && keys.length > 2) {
            languageLabels.push(keys[2]);
          }
        } else if (deprecateAlert && isValid) {
          let keys = line.trim().match(/(public const|PUBLIC CONST)\s?([A-Z0-9_]+)/);
          if (keys && keys.length > 2) {
            deprecatedLanguageLabels.push(keys[2]);
          }
        }
      });

      languageLabels = languageLabels.sort();
      resolve([languageLabels, deprecatedLanguageLabels]);
    }
  });
});

/**
 * Returns objecte rollo { 'ACCEPT_COOKIES': 'LanguageLabels::ACCEPT_COOKIES => "Acceptar",', ... }
 * @param fwkPath 
 * @returns {Promise}
 */
const getFwkEsLanguageValues = (fwkPath: string) => new Promise((resolve, reject) => {
  fs.readFile(fwkPath + `\\src\\Languages\\es.php`, 'utf8', (err, data) => {
    if (err) { reject(err); }

    const regex = /return\s?\[(.*?)\]/gs;
    const labelsContent = data.match(regex);

    if (labelsContent && labelsContent.length > 0) {
      const lines = labelsContent[0].split('\n');
      lines.shift();
      lines.pop();

      const resultObj: any = {};

      lines.forEach(line => {
        let keys = line.trim().match(/LanguageLabels::([A-Z0-9_]+)/);
        if (keys && keys.length > 1) {
          resultObj[keys[1]] = line.trim();
        }
      });

      resolve(resultObj);
    }
  });
});

/**
 * Retorna objecte rollo: { 'ca': ['ACCEPT_COOKIES', 'ACCOUNT_DELETED', 'ADD_BILLING_ADDRESS', 'ADD_GIFT_TO_CART'], 'pt': ... }
 * @param repoPath 
 * @returns {Promise}
 */
const getRepoLanguagesKeys = (repoPath: string) => new Promise((resolve, reject) => {
  let data: any = {};
  let finalData: any = {};

  const filenames = fs.readdirSync(repoPath + '\\src\\Languages\\');
  filenames.forEach((name) => {
    if (name.toLowerCase() !== 'es.php' && name.toLowerCase() !== 'en.php') {
      const fullPath = repoPath + '\\src\\Languages\\' + name;
      const file = fs.readFileSync(fullPath, "utf-8");
      data[name.replace('.php', '')] = file;
    }
  });

  Object.keys(data).forEach(key => {
    const content = data[key];
    const regex = /return\s?\[(.*?)\]/gs;
    const labelsContent = content.match(regex);

    if (labelsContent && labelsContent.length > 0) {
      const lines = labelsContent[0].split('\n');
      lines.shift();
      lines.pop();

      const trimArray = lines.map((element: string) => {
        let keys = element.trim().match(/LanguageLabels::([A-Z0-9_]+)/);
        if (keys && keys.length > 1) {
          return keys[1];
        }
      });

      finalData[key] = trimArray;
    }
  });

  resolve(finalData);
});

async function openInUntitled(content: string, language?: string) {
  const document = await vscode.workspace.openTextDocument({
    language,
    content,
  });
  vscode.window.showTextDocument(document);
}

export async function init() {
  if (!repoPath.length || !fwkPath.length) {
    return;
  }
  console.clear();

  Promise.all([
    getFwkLanguageKeys(fwkPath),
    getFwkEsLanguageValues(fwkPath),
    getRepoLanguagesKeys(repoPath)
  ]).then(([_paramFwkLabels, _fwkEsValues, _repoEsValues]) => {
    const _fwkLabels: any = _paramFwkLabels;
    const fwkLabels: any = _fwkLabels[0];
    const fwkLabelsDeprecated: any = _fwkLabels[1];
    const fwkEsValues: any = _fwkEsValues;
    const repoEsValues: any = _repoEsValues;

    const missingLabels: any = {};
    const deprecatedLabels: any = {};

    // Per cada fitxer del repo
    Object.keys(repoEsValues).forEach(lang => {
      missingLabels[lang] = [];
      deprecatedLabels[lang] = [];

      const repoLanguageLabels: string[] = repoEsValues[lang];
      fwkLabels.forEach((fwkKey: string) => {
        if (!repoLanguageLabels.includes(fwkKey) && fwkEsValues[fwkKey]) {
          missingLabels[lang].push(fwkEsValues[fwkKey]);
        }
      });
      fwkLabelsDeprecated.forEach((fwkKey: string) => {
        if (repoLanguageLabels.includes(fwkKey)) {
          deprecatedLabels[lang].push(fwkEsValues[fwkKey]);
        }
      });
    });

    createNewTabFile(missingLabels, deprecatedLabels);
  });
}

const createNewTabFile = (missingLabels: any, deprecatedLabels: any) => {
  let tabConent = '# Languagelabels status report\n\n';

  Object.keys(missingLabels).forEach(lang => {
    const langMissingLabels: string[] = missingLabels[lang];
    let list = '';
    langMissingLabels.forEach(langMissingLabel => {
      list += '- ' + langMissingLabel + '\n';
    });
    let list2 = '';
    deprecatedLabels[lang].forEach((langMissingLabel: string) => {
      list2 += '- ' + langMissingLabel + '\n';
    });

    tabConent += `## ${lang}\n\n`;
    tabConent += `### 🌬️ Missing translated keys:\n\n`;
    tabConent += `${list}\n\n`;
    tabConent += `### 🌬️ Deprecated keys:\n\n`;
    tabConent += `${list2}\n\n`;

  });

  tabConent += '---\n';
  openInUntitled(tabConent, 'markdown');
};