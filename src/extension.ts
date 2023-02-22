// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as createInternal from './createInternal/main';
import * as fs from 'fs';
const wsPath = vscode.workspace.workspaceFolders;

export function activate(context: vscode.ExtensionContext) {

	let createInternalController = vscode.commands.registerCommand('biyom-code-manager.createInternal', () => {
		createInternal.init(getRepositoryPath());
	});

	context.subscriptions.push(createInternalController);
}

function getRepositoryPath(): string{
	if (!wsPath?.length) {
		vscode.window.showInformationMessage('Repository directory not found in workspace!');
		return '';
	}
	let repoDirectoryName = fs.readdirSync(wsPath[0].uri.fsPath).filter(dirName => dirName.includes('repo-'));
	if (!repoDirectoryName.length) {
		vscode.window.showInformationMessage('Repository directory not found in workspace!');
		return ''; 
	}

	return wsPath[0].uri.fsPath + '\\' + repoDirectoryName[0];
}

// This method is called when your extension is deactivated
export function deactivate() {}
