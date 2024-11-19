// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MermaidPreviewProvider } from './MermaidPreviewProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const provider = new MermaidPreviewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('mermaid-preview', provider),
		vscode.commands.registerCommand('mermaid-live.preview', () => {
			vscode.commands.executeCommand('workbench.view.extension.mermaid-preview');
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
