import * as vscode from 'vscode';

export class MermaidPreviewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };

        this.updateContent();
        
        // Listen for text document changes
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === vscode.window.activeTextEditor?.document) {
                this.updateContent();
            }
        });
    }

    private updateContent() {
        if (!this._view) return;

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const text = editor.document.getText();
        const mermaidDiagrams = this.extractMermaidDiagrams(text);

        this._view.webview.html = this.getHtmlForWebview(mermaidDiagrams);
    }

    private extractMermaidDiagrams(text: string): string[] {
        const regex = /```mermaid\n([\s\S]*?)\n```/g;
        const diagrams: string[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            diagrams.push(match[1]);
        }

        return diagrams;
    }

    private getHtmlForWebview(diagrams: string[]): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
                <script>
                    mermaid.initialize({ startOnLoad: true });
                </script>
            </head>
            <body>
                ${diagrams.map(diagram => `
                    <div class="mermaid">
                        ${diagram}
                    </div>
                `).join('')}
            </body>
            </html>
        `;
    }
} 