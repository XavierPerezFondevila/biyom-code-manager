import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class ExtensionDependenciesProvider
  implements vscode.TreeDataProvider<Dependency>
{
  constructor() {}

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

  // Handle the click action
  handleClick(element: Dependency) {
    const packageJson = vscode.extensions.getExtension(
      "xaviperez.biyom-code-manager"
    )?.packageJSON;
    const command = packageJson.contributes.commands.filter((item: any) => {
      item.title === element.label;
    });
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getTreeDependencies(packageJson: any): Dependency[] {
    console.log(packageJson.contributes.commands);
    const dependencies = packageJson.contributes.commands.map(
      (command: any) => {
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
