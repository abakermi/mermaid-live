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
                    // Force light theme for better visibility
                    mermaid.initialize({ 
                        startOnLoad: true,
                        theme: 'neutral',
                        securityLevel: 'loose',
                        logLevel: 'error',
                        fontFamily: 'var(--vscode-font-family)',
                    });

                    // Re-render on theme changes
                    window.addEventListener('message', event => {
                        if (event.data.type === 'refresh') {
                            mermaid.initialize();
                            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
                        }
                    });
                </script>
                <style>
                    body {
                        padding: 10px;
                    }
                    .mermaid {
                        background-color: white;
                        color: black;
                        padding: 20px;
                        margin: 10px 0;
                        border-radius: 6px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    }
                    /* Force text colors for better visibility */
                    .mermaid text {
                        fill: black !important;
                    }
                    .mermaid .actor {
                        fill: white !important;
                        stroke: #666 !important;
                    }
                    .mermaid .messageText {
                        fill: black !important;
                        stroke: none !important;
                    }
                </style>
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