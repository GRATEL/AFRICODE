import * as vscode from 'vscode';

type GoogleTranslateResponse = Array<Array<[string, string, unknown, unknown]>>;

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
			const text = editor.document.getText(selection).trim();

			if (!text) {
				vscode.window.showWarningMessage('Select text first');
				return;
			}

			const languageMap: Record<string, string> = {
				Yoruba: 'yo',
				Igbo: 'ig',
				Hausa: 'ha',
				Zulu: 'zu',
				Swahili: 'sw'
			};

			const language = await vscode.window.showQuickPick(
				Object.keys(languageMap),
				{ placeHolder: 'Choose African language' }
			);

			if (!language) {
				return;
			}

			const targetLang = languageMap[language];

			try {
				const url =
					`https://translate.googleapis.com/translate_a/single` +
					`?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

				const response = await fetch(url);

				if (!response.ok) {
					vscode.window.showErrorMessage(`Translation failed: ${response.status}`);
					return;
				}

				const data = (await response.json()) as GoogleTranslateResponse;

				if (!Array.isArray(data) || !Array.isArray(data[0])) {
					vscode.window.showErrorMessage('Unexpected translation response');
					return;
				}

				const translated = data[0]
					.map((item) => item[0])
					.join('')
					.trim();

				if (!translated) {
					vscode.window.showErrorMessage('No translated text returned');
					return;
				}

				await editor.edit((editBuilder) => {
					editBuilder.replace(selection, translated);
				});

				vscode.window.showInformationMessage(`Translated to ${language}`);
			} catch (error) {
				console.error('Translation error:', error);
				vscode.window.showErrorMessage('Translation failed');
			}
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}