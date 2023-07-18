// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as createInternal from './createInternal/main';
import * as createScript from './createDocumentsScript/main';
import * as dynamicForms from './importDynamicForms/main';
import * as dynamicLibraries from './importLibrary/main';

import * as fs from 'fs';
import { ExtensionDependenciesProvider } from './treeDataProvider/dataProvider';
const wsPath = vscode.workspace.workspaceFolders;
export const repoPath = getRepositoryPath();

export function activate(context: vscode.ExtensionContext) {

	const contextSubscriptions = [
		vscode.commands.registerCommand('biyom-code-manager.createInternal', () => {
			createInternal.init();
		}),
		vscode.commands.registerCommand('biyom-code-manager.createDocumentsScript', () => {
			createScript.init('create');
		}),
		vscode.commands.registerCommand('biyom-code-manager.getDocumentsScript', () => {
			createScript.init('import');
		}),
		vscode.commands.registerCommand('biyom-code-manager.importDynamicForms', () => {
			dynamicForms.init();
		}),
		vscode.commands.registerCommand('biyom-code-manager.importLibrary', () => {
			dynamicLibraries.init();
		})
	];
	
	contextSubscriptions.forEach((subscription)=> context.subscriptions.push(subscription));
	
	vscode.window.registerTreeDataProvider(
		'extensionDependencies',
		new ExtensionDependenciesProvider()
	);
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
