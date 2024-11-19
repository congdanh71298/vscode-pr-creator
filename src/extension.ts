// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-pr-creator" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    'vscode-pr-creator.createPR',
    () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      // Get the current branch name
      exec(
        'git branch --show-current',
        { cwd: workspacePath },
        (error, currentBranch, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            return;
          }
          currentBranch = currentBranch.trim();

          // Find the parent branch using reflog
          exec(
            "git reflog | grep -oE 'checkout: moving from [^ ]+ to' | head -n 1 | awk '{print $4}'",
            { cwd: workspacePath },
            (error, parentBranch, stderr) => {
              if (error) {
                parentBranch = 'main';
              } else {
                parentBranch = parentBranch.trim() || 'main';
              }

              // Get the repository URL
              exec(
                'git config --get remote.origin.url',
                { cwd: workspacePath },
                (error, repoUrl, stderr) => {
                  if (error) {
                    vscode.window.showErrorMessage(`Error: ${stderr}`);
                    return;
                  }
                  repoUrl = repoUrl
                    .trim()
                    .replace('git@github.com:', 'https://github.com/')
                    .replace(/\.git$/, '');

                  // Construct the Pull Request URL
                  const prUrl = `${repoUrl}/compare/${parentBranch}...${currentBranch}?expand=1`;

                  // Open the URL in the default browser
                  vscode.env.openExternal(vscode.Uri.parse(prUrl));
                }
              );
            }
          );
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
