import * as vscode from 'vscode';
import * as json5 from 'json5';

interface Args {
	filePath: string;
	jsonPath: string | undefined;
}

export function activate(context: vscode.ExtensionContext) {
	console.log("read-json activated");
	async function readJson(args: Args | vscode.Uri | undefined) : Promise<string | null> {
		console.log("read-json.read ran");
		args = await setArgs(args);
		let obj = await readFile(args.filePath);
		if (args.jsonPath !== undefined)
			obj = jsonPath(obj, args.jsonPath);
		if (typeof obj === "object")
			return await showQuickPick(obj) as string;
		return obj;

		async function setArgs(args: Args | vscode.Uri | undefined) : Promise<Args> {
			if (args instanceof vscode.Uri)
				return {
					filePath: args.path,
					jsonPath: undefined,
				};
			else if (args === undefined) {
				const file = await vscode.window.showOpenDialog({
					title: "Open JSON file",
					filters: {
						"JSON": ["json"]
					}
				});
				if (file)
				return {
					filePath: file[0].path,
					jsonPath: undefined,
				};
			} else {
				return {
					filePath: (vscode.workspace.workspaceFolders as vscode.WorkspaceFolder[])[0].uri.path + `/${args.filePath}`,
					jsonPath : args?.jsonPath
				};
			}
			return {filePath: "", jsonPath: undefined};
		}

		function jsonPath(obj: any, path: string) : any {
			path.split('.').forEach(element => {
				obj = obj[element];
			});
			return obj;
		}

		async function readFile(path: string) : Promise<object> {
			const uri = vscode.Uri.file(path);
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
