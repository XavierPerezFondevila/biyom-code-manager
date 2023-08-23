// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as createInternal from './createInternal/main';
import * as createScript from './createDocumentsScript/main';
import * as dynamicForms from './importDynamicForms/main';
import * as dynamicLibraries from './importLibrary/main';
import * as checkLanguageLabels from './checkLanguageLabels/main';
import * as createMailsScript from './createMailsScript/main';

import * as fs from 'fs';
import { BeyomActionsProvider} from './treeDataProvider/dataProvider';
const wsPath = vscode.workspace.workspaceFolders;
export const repoPath = getRepositoryPath();
export const fwkPath = getFWKPath();

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
		}),
		vscode.commands.registerCommand('biyom-code-manager.checkLanguageLabels', () => {
			checkLanguageLabels.init();
		}),
		vscode.commands.registerCommand('biyom-code-manager.createMailsScript', () => {
			createMailsScript.init();
		})
	];

	contextSubscriptions.forEach((subscription) => context.subscriptions.push(subscription));

	const packageJson = vscode.extensions.getExtension(
		"xaviperez.biyom-code-manager"
	)?.packageJSON;

	packageJson.contributes.views.biyomActions.forEach(
		(view: any) => {
			vscode.window.registerTreeDataProvider(
				view.id,
				new BeyomActionsProvider(view.id)
			);
		}
	);
}

function getRepositoryPath(): string {
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

function getFWKPath(): string {
	if (!wsPath?.length) {
		vscode.window.showInformationMessage('FWK directory not found in workspace!');
		return '';
	}
	let frameworkDirectoryName = fs.readdirSync(wsPath[0].uri.fsPath).filter(dirName => dirName.includes('framework-php'));
	if (!frameworkDirectoryName.length) {
		vscode.window.showInformationMessage('FWK directory not found in workspace!');
		return '';
	}

	return wsPath[0].uri.fsPath + '\\' + frameworkDirectoryName[0];
}

// This method is called when your extension is deactivated
export function deactivate() { }
