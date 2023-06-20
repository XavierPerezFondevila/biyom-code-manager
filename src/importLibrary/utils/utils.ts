import * as fs from "fs";
import * as pathLib from 'path';
import axios, { AxiosResponse } from "axios";
import * as vscode from "vscode";
import { repoPath } from "../../extension";

interface GitHubContent {
  name: string;
  path: string;
  type: "file" | "dir";
}

const owner = "Trilogi-Developers"; // Replace with the organization name
const branch = "main"; // Replace with the desired branch name
const accessToken = vscode.workspace.getConfiguration().get('biyom-code-manager.accessToken'); // Replace with your personal access token
const availableFolders:string[] = vscode.workspace.getConfiguration().get('biyom-code-manager.availableFolders') ?? ["assets/", "src/", "themes/"];

let readmeFileContent: string|undefined = undefined;


async function fetchFolderContents(
  repoName: string,
  path: string
): Promise<void> {
  try {
    const response: AxiosResponse<GitHubContent[]> = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const files: GitHubContent[] = response.data.filter(
      (item) => item.type === "file"
    );
    const folders: GitHubContent[] = response.data.filter(
      (item) => item.type === "dir"
    );

    // Process files in the current folder
    for (const file of files) {
      // filter the files that only are on availableFolders
      if (availableFolders.findIndex((folder) => file.path.includes(folder)) !== -1 || file.name.toLowerCase() === 'readme.md') {
        await fetchFileContents(repoName, file.path);
      }
    }

    // Recursively fetch contents of subfolders
    const subfolderPromises: Promise<void>[] = folders.map((folder) =>
      fetchFolderContents(repoName, folder.path)
    );
    await Promise.all(subfolderPromises);
  } catch (error: any) {
    vscode.window.showErrorMessage('Error fetching repository:');
  }
}

async function fetchFileContents(repoName: string, filePath: string): Promise<void> {
  try {
    const response: AxiosResponse<{ content: string }> = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const content: string = Buffer.from(
      response.data.content,
      "base64"
    ).toString("utf-8");

    if(pathLib.basename(filePath).toLocaleLowerCase() === 'readme.md'){
      await openReadme(content);
    }else{
      writeFile(repoPath + '\\' + filePath, content);
    }

  } catch (error: any) {
    vscode.window.showErrorMessage('Error fetching the file content');
  }
}

async function openReadme(readmeContent: string){
  const markdownUri = vscode.Uri.parse('untitled:' + 'Untitled.md');
  vscode.workspace.openTextDocument(markdownUri).then(document => {
      const editor = vscode.window.showTextDocument(document);
      editor.then(editor => {
        editor.edit(editBuilder => {
          const start = new vscode.Position(0, 0);
          editBuilder.insert(start, readmeContent);
        });
      });
    });
}

export async function fetchRepositoriesWithTopics(
  topics: string[]
): Promise<vscode.QuickPickItem[]> {
  try {
    const query = topics.map((topic) => `topic:${topic}`).join("+");
    const response = await axios.get(
      `https://api.github.com/search/repositories?q=org:${owner}+${query}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      const repositories = response.data.items.map((repo: any) => ({
        label: repo.name,
        description: repo.description,
        detail: repo.html_url,
      }));

      return repositories;
    } else {
      vscode.window.showErrorMessage("Failed to fetch repositories");
      throw new Error("Failed to fetch repositories");
    }
  } catch (error: any) {
    vscode.window.showErrorMessage("Failed to fetch repositories");
    throw error;
  }
}

export async function fetchRepositoryCode(repoName: string): Promise<void> {
  await fetchFolderContents(repoName, "");
  vscode.window.showInformationMessage('Files created successfully');
}

function writeFile(filePath: string, content: string): void {
  const dirname = pathLib.dirname(filePath);

  // Create the necessary directories recursively if they don't exist
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      vscode.window.showErrorMessage('An error occurred while writing the file');
    }
    
  });
}