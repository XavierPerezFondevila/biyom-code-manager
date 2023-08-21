import axios from "axios";
import * as ts from 'typescript';
import * as vscode from "vscode";
import { logiCommerceLanguages } from '../languages/languages';

const owner = "Trilogi-Developers"; // Replace with the organization name
const branch = "main"; // Replace with the desired branch name
const accessToken = vscode.workspace.getConfiguration().get('biyom-code-manager.accessToken'); // Replace with your personal access token
const mailTemplatesRepo = `https://api.github.com/repos/${owner}/beyond-mail-templates/contents/src/languages`;

export async function fetchAvailableLanguages(): Promise<vscode.QuickPickItem[]> {
  try {
    const response = await axios.get(
      `${mailTemplatesRepo}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      const availableLanguages = response.data.filter((langFile: any)=>{
        return langFile.name[0] !== '_';
      });

      const languages = availableLanguages.map((repo: any) => ({
        label: 'Language: ' + repo.name.replace('.ts','').toUpperCase(),
        description: repo.name,
        detail: '',
      }));

      return languages;
    } else {
      vscode.window.showErrorMessage("Failed to fetch languages");
      throw new Error("Failed to fetch languages");
    }
  } catch (error: any) {
    vscode.window.showErrorMessage("Failed to fetch languages");
    throw error;
  }
}


export async function getLanguagesData(languages: any[]) {
  return await Promise.all(languages.map(getLanguageData));
}

export async function getLanguageData(lang: any){
  try {
    const response = await axios.get(
      `${mailTemplatesRepo}/${lang}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      const githubFileContent: string = Buffer.from(
        response.data.content,
        "base64"
      ).toString("utf-8");
      // Transpile the TypeScript code to JavaScript
      const transpileOptions: ts.TranspileOptions = {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS
        }
      };

      const transpileResult = ts.transpileModule(githubFileContent, transpileOptions);

      // Execute the transpiled JavaScript code using eval
      const evaluatedCode = eval(transpileResult.outputText);
      const langCode: any = lang.split('.').shift();

      return {
        [logiCommerceLanguages[langCode]]: evaluatedCode
      };

    } else {
      vscode.window.showErrorMessage("Failed to fetch language file");
      throw new Error("Failed to fetch languages");
    }
  } catch (error: any) {
    vscode.window.showErrorMessage("Failed to fetch language file");
    throw error;
  }
}