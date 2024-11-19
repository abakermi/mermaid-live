"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MermaidPreviewProvider = void 0;
const vscode = __importStar(require("vscode"));
class MermaidPreviewProvider {
    _extensionUri;
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
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
    updateContent() {
        if (!this._view)
            return;
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const text = editor.document.getText();
        const mermaidDiagrams = this.extractMermaidDiagrams(text);
        this._view.webview.html = this.getHtmlForWebview(mermaidDiagrams);
    }
    extractMermaidDiagrams(text) {
        const regex = /```mermaid\n([\s\S]*?)\n```/g;
        const diagrams = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            diagrams.push(match[1]);
        }
        return diagrams;
    }
    getHtmlForWebview(diagrams) {
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
exports.MermaidPreviewProvider = MermaidPreviewProvider;
//# sourceMappingURL=MermaidPreviewProvider.js.map