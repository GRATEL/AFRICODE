import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand(
		'africode.translateSelectedText',
		async () => {

			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				vscode.window.showErrorMessage('No editor open');
				return;
			}

			const selection = editor.selection;
			const text = editor.document.getText(selection);

			if (!text) {
				vscode.window.showWarningMessage('Select text first');
				return;
			}

			const language = await vscode.window.showQuickPick(
				['Yoruba', 'Igbo', 'Hausa', 'Zulu', 'Swahili'],
				{ placeHolder: 'Choose African language' }
			);

			if (!language) return;

			const translated = `${text} (translated to ${language})`;

			await editor.edit(editBuilder => {
				editBuilder.replace(selection, translated);
			});
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}