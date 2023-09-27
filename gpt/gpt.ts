import {Plugin} from "obsidian";
import {GPTView, VIEW_TYPE_GPT} from ".";
import "./styles.css"

export class GPTPlugin extends Plugin {


	async onload() {
		const d = await this.loadData();
		this.registerView(
				VIEW_TYPE_GPT,
				(leaf) => {
					return new GPTView(leaf, d)
				}
		);

		this.addRibbonIcon("dice", "Activate view", () => {
			this.activateView();
		});


	}

	async onunload() {
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_GPT);

		const data = await this.loadData();
		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_GPT,
			active: true,
			state: data
		});

		this.app.workspace.revealLeaf(
				this.app.workspace.getLeavesOfType(VIEW_TYPE_GPT)[0]
		);
	}
}
