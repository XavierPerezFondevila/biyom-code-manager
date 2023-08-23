import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class BeyomActionsProvider
  implements vscode.TreeDataProvider<Dependency>
{
  constructor(
    public readonly viewId: string,
  ) {
    this.viewId = viewId;
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<Dependency[]> {
    const packageJson = vscode.extensions.getExtension(
      "xaviperez.biyom-code-manager"
    )?.packageJSON;
    if (!packageJson) {
      vscode.window.showInformationMessage("No dependency in empty workspace");
      return Promise.resolve([]);
    }

    return Promise.resolve(this.getTreeDependencies(packageJson));
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getTreeDependencies(packageJson: any): Dependency[] {
    const dependencies = packageJson.contributes.commands.map(
      (command: any) => {
        console.clear();
        console.log(command.view, this.viewId);

        if (command.view === this.viewId) {
          return new Dependency(
            command.title,
            vscode.TreeItemCollapsibleState.None,
            {
              command: command.command,
              title: command.title,
              arguments: [command?.argument],
            },
            command?.description,
            command?.iconPath,
          );
        }
      }
    );

    return dependencies ?? [];
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command: vscode.Command,
    public readonly description: string = '',
    public readonly iconPath: string = '',
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label} - ${description}`;
    this.description = description;
    this.iconPath = path.join(__filename, '..', '..', 'images', iconPath);
  }
}
