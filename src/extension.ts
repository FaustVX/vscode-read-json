import * as vscode from 'vscode';
import * as json5 from 'json5';

interface Args {
	filePath: string;
	jsonPath: string | undefined;
}

export function activate(context: vscode.ExtensionContext) {
	async function readJson(args: Args) : Promise<string | null> {
		let obj = await readFile(args.filePath);
		if (args.jsonPath !== undefined)
			obj = jsonPath(obj, args.jsonPath);
		if (typeof obj === "object")
			return await showQuickPick(obj) as string;
		return obj;

		function jsonPath(obj: any, path: string) : any {
			path.split('.').forEach(element => {
				obj = obj[element];
			});
			return obj;
		}

		async function readFile(path: string) : Promise<object> {
			const uri = vscode.Uri.file((vscode.workspace.workspaceFolders as vscode.WorkspaceFolder[])[0].uri.path + `/${path}`);
			const data = await vscode.workspace.fs.readFile(uri);
			const file = Buffer.from(data).toString('utf8');
			return json5.parse(file);
		}

		async function showQuickPick(obj: any) : Promise<string | object | null> {
			const result = await vscode.window.showQuickPick(Object.keys(obj));
			if (result === undefined) {
				return null;
			} else if (typeof obj[result] === "object") {
				return showQuickPick(obj[result]);
			} else {
				return obj[result];
			}
		}
	}
	context.subscriptions.push(vscode.commands.registerCommand('read-json.read', readJson));
}
