const vscode = require('vscode');

function activate(context) {
    let timeout = null;

    // Function to fold the front matter
    const foldFrontMatter = (editor) => {
        if (!editor || editor.document.languageId !== 'markdown') return;

        const document = editor.document;
        const text = document.getText();
        const frontMatterEndMatch = text.match(/^---[\s\S]*?---\n/m);

        if (frontMatterEndMatch) {
            const endOfFrontMatterPos = document.positionAt(frontMatterEndMatch.index + frontMatterEndMatch[0].length);
            const range = new vscode.Range(0, 0, endOfFrontMatterPos.line, 0);

            vscode.commands.executeCommand('editor.fold', {selectionLines: [range.start.line]}).then(() => {
                editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
            });
        }
    };

    // Automatically fold when the active editor changes to a Markdown file
    const activeEditorChangedDisposable = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => foldFrontMatter(editor), 1);
    });

    // Automatically fold when a Markdown file is opened
    const documentOpenedDisposable = vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === 'markdown') {
            let editor = vscode.window.activeTextEditor;
            if (editor && editor.document.uri === document.uri) {
                foldFrontMatter(editor);
            }
        }
    });

    context.subscriptions.push(activeEditorChangedDisposable, documentOpenedDisposable);
}

exports.activate = activate;
