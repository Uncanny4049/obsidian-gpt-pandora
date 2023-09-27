import {ItemView, WorkspaceLeaf} from "obsidian";
import {v4 as uuidv4} from "uuid";

export const VIEW_TYPE_GPT = "obsidian_gpt_view";

interface GPTPluginSettings {
	GPT_URL: string;
	TALK_MODEL: string
	TALK_CONVERSATION_ID: string
	TALK_PARENT_MESSAGE_ID: string
	TALK_STREAM: boolean
}

interface PostConversationTalkRS {
	conversation_id: string;
	error: any;
	message: {
		author: {
			metadata: {
				// Define metadata properties here
			};
			name: any;
			role: string;
		};
		content: {
			content_type: string;
			parts: string[];
		};
		create_time: number;
		end_turn: boolean;
		id: string;
		metadata: {
			finish_details: {
				stop_tokens: number[];
				type: string;
			};
			is_complete: boolean;
			message_type: string;
			model_slug: string;
			parent_id: string;
		};
		recipient: string;
		status: string;
		update_time: any;
		weight: number;
	};
}


export class GPTView extends ItemView {
	settings: GPTPluginSettings

	constructor(leaf: WorkspaceLeaf, s: GPTPluginSettings) {
		super(leaf);
		this.settings = s
	}

	getDisplayText() {
		return VIEW_TYPE_GPT;
	}

	getViewType() {
		return VIEW_TYPE_GPT;
	}


	async onOpen() {
		this.RenderUI()
	}

	RenderUI() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", {text: "GPT"});
		const body = container.createDiv({cls: "obsidian-gpt"});
		const question = body.createDiv({cls: "obsidian-gpt-question"});
		question.createEl("span", {text: "输入问题"})
		const send = question.createEl("button", {text: "Send"});
		send.addEventListener('click', this.SendGPT)
		body.createEl("textarea", {type: "text", cls: ["ta", "question"]});
		body.createEl("hr")
		const answer = body.createEl("textarea", {type: "text", cls: ["ta", "answer"]});
		answer.addEventListener('input', (e) => {
			answer.style.height = '100px';
			// @ts-ignore
			answer.style.height = `${e.target.scrollHeight}px`;
		});
		answer.addEventListener("wheel", function(e) {
			e.preventDefault(); // 阻止滚轮事件的默认行为
		});
		send.addEventListener('click', () => {
		})
	}


	SendGPT = async () => {
		const question = (this.containerEl.querySelector('.ta.question') as HTMLTextAreaElement).value;
		try {
			if (question == "") return
			const response = await fetch(this.settings.GPT_URL, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					prompt: question,
					model: this.settings.TALK_MODEL,
					message_id: uuidv4(),
					parent_message_id: this.settings.TALK_PARENT_MESSAGE_ID == "" ? uuidv4() : this.settings.TALK_PARENT_MESSAGE_ID,
					conversation_id: this.settings.TALK_CONVERSATION_ID,
					stream: this.settings.TALK_STREAM,
				}), // 请求体数据
			});

			if (!response.ok) {
				console.log("Network response was not ok")
				return
			}

			const data: PostConversationTalkRS = await response.json();

			this.settings.TALK_CONVERSATION_ID = data.conversation_id;
			this.settings.TALK_PARENT_MESSAGE_ID = data.message.id;
			const answer = this.containerEl.querySelector('.ta.answer') as HTMLTextAreaElement;
			if (answer != null) {
				answer.value = data.message.content.parts[0];
			}
		} catch (error) {
			console.error("Fetch error:", error);
		}
	}
	/*async SendGPT() {

	}*/
}
