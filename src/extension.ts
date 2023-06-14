// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as createInternal from './createInternal/main';
import * as createScript from './createDocumentsScript/main';
import * as dynamicForms from './importDynamicForms/main';
import * as dynamicLibraries from './importLibrary/main';

import * as fs from 'fs';
const wsPath = vscode.workspace.workspaceFolders;
export const repoPath = getRepositoryPath();

export function activate(context: vscode.ExtensionContext) {
	const createInternalController = vscode.commands.registerCommand('biyom-code-manager.createInternal', () => {
		createInternal.init();
	});

	const createDocumentsScript = vscode.commands.registerCommand('biyom-code-manager.createDocumentsScript', () => {
		createScript.init('create');
	});

	const getDocumentsScript = vscode.commands.registerCommand('biyom-code-manager.getDocumentsScript', () => {
		createScript.init('import');
	});

	const importDynamicForms = vscode.commands.registerCommand('biyom-code-manager.importDynamicForms', () => {
		dynamicForms.init();
	});

	const importLibrary = vscode.commands.registerCommand('biyom-code-manager.importLibrary', () => {
		dynamicLibraries.init();
	});

	context.subscriptions.push(createInternalController);
	context.subscriptions.push(createDocumentsScript);
	context.subscriptions.push(getDocumentsScript);
	context.subscriptions.push(importDynamicForms);
	context.subscriptions.push(importLibrary);
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
