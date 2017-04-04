var vscode = require('vscode');

let diagnosticMap = {};
let spellDiagnostics;

exports.createCommand = function createCommand(state) {
    let subscriptions = state.subscriptions;
    spellDiagnostics = vscode.languages.createDiagnosticCollection('Azure');
    vscode.workspace.onDidOpenTextDocument(triggerDiagnostics, this, subscriptions);
    vscode.workspace.onDidSaveTextDocument(triggerDiagnostics, this, subscriptions);
    if (vscode.window.activeTextEditor) {
        triggerDiagnostics(vscode.window.activeTextEditor.document);
    }
    vscode.languages.registerCodeActionsProvider({ language: 'typescript', scheme: 'file' }, provideCodeActions);
};

function provideCodeActions(document, range, context, token) {
    let diagnostic = context.diagnostics[0];
    let commands = [];
    commands.push({
        title: 'Add to ignore list',
        command: 'test command',
        arguments: [document, diagnostic.message]
    });

    return commands;
}
function triggerDiagnostics(document) {
    let diagnostics = [];
    let lineRange = new vscode.Range(13, 1, 14, 1);
    let docText = document.getText(lineRange);
    let errText = "await resourceClient.resourceGroups.createOrUpdate('',{});";
    if (docText.trim() === errText) {
        let diag = new vscode.Diagnostic(lineRange, 'Potential forgotten assignment', vscode.DiagnosticSeverity.Warning);
        diagnostics.push(diag);
    }

    let lineRange2 = new vscode.Range(8, 1, 9, 1);
    let docText2 = document.getText(lineRange2);
    let errText2 = `let key = kvClient.createKey('','','');`;
    if (docText2.trim() === errText2) {
        let diagMSg2 = `Possible values of keyType are 'EC', 'RSA', 'RSA-HSM', 'oct'`;
        let diag2 = new vscode.Diagnostic(lineRange2, diagMSg2, vscode.DiagnosticSeverity.Error);
        diagnostics.push(diag2);
    }

    spellDiagnostics.set(document.uri, diagnostics);
    diagnosticMap[document.uri.toString()] = diagnostics;
}