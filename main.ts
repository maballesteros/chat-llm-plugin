import { App, Editor, MarkdownView, MarkdownRenderer, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, ItemView } from 'obsidian';

// Configuración del plugin
interface ChatPluginSettings {
	apiKey: string;
	model: string;
}

const DEFAULT_SETTINGS: ChatPluginSettings = {
	apiKey: '',
	model: 'gpt-4o'
};

/**
 * Servicio para interactuar con la API de OpenAI.
 */
class GPTService {
	plugin: ChatPlugin;

	constructor(plugin: ChatPlugin) {
		this.plugin = plugin;
	}

	async fetchResponse(messages: any[]): Promise<string> {
		const apiKey = this.plugin.settings.apiKey;
		if (!apiKey) {
			new Notice('Configura tu API Key en los ajustes del plugin.');
			return 'Error: No API Key';
		}

		// Preparar y registrar el payload antes de enviarlo
		const payload = {
			model: this.plugin.settings.model,
			messages: messages
		};
		console.log("GPTService: enviando a OpenAI payload:", payload);
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify(payload)
		});

		const data = await response.json();
		return data.choices?.[0]?.message?.content || 'Error en la respuesta de OpenAI';
	}
}

export default class ChatPlugin extends Plugin {
	settings: ChatPluginSettings;
	gptService: GPTService;

	async onload() {
		await this.loadSettings();

		// Inicializamos el servicio de GPT
		this.gptService = new GPTService(this);

		// Agregar el panel lateral de chat
		this.registerView('chat-panel', (leaf) => new ChatView(leaf, this));

		this.addRibbonIcon('message-square', 'Open Chat', () => this.activateChatView());

		// Nuevo ribbon button para crear y abrir la nota diaria
		console.log("Agregando botón de nota diaria!");
		this.addRibbonIcon('document', 'Crear Nota Diaria', () => this.createDailyNote());

		// Agregar pestaña de configuración
		this.addSettingTab(new ChatSettingTab(this.app, this));

		// Nuevo comando para autocompletar con IA sin depender de la vista de chat
		this.addCommand({
			id: 'autocomplete-with-ai',
			name: 'Autocompletar con IA',
			callback: () => this.autocompleteWithAI()
		});
	}

	/**
	 * Obtiene el editor Markdown activo.
	 */
	getActiveMarkdownEditor(): Editor | null {
		const markdownLeaf = this.app.workspace
			.getLeavesOfType("markdown")
			.find(leaf => leaf.containerEl.offsetParent !== null && leaf.view instanceof MarkdownView);
		if (markdownLeaf) {
			return (markdownLeaf.view as MarkdownView).editor;
		}
		return null;
	}

	/**
	 * Comando de autocompletar: obtiene el contenido actual del editor,
	 * consulta a GPT y agrega la respuesta.
	 */
	async autocompleteWithAI() {
		const editor = this.getActiveMarkdownEditor();
		if (!editor) {
			new Notice("No se encontró un editor activo.");
			return;
		}

		// Antiguo: enviaba todo el contenido de la nota; si no funciona, restaura la línea siguiente.
		// const userText = editor.getValue().trim();
		// Obtener solo el texto hasta la posición actual del cursor
		const cursor = editor.getCursor();
		const userText = editor.getRange({ line: 0, ch: 0 }, cursor).trim();
		if (!userText) {
			new Notice("El editor está vacío. Escribe algo antes de autocompletar.");
			return;
		}

		const messages = [
			{ role: 'system', content: "Eres un asistente IA que completa los textos que te envían los usuarios, respetando el estilo y tono previo. No dices nada más, simplemente continúas el texto que te pasan." },
			{ role: 'user', content: userText }
		];

		// Depurar payload: mostrar en consola lo que se envía a la IA
		console.log("AutocompleteWithAI payload:", messages);
		const response = await this.gptService.fetchResponse(messages);
		if (!response || response.startsWith("Error")) {
			new Notice("Hubo un problema obteniendo la respuesta de la IA.");
			return;
		}

		// Insertar la respuesta en la posición original del cursor
		editor.replaceRange(`\n${response}`, cursor);
		new Notice("Texto autocompletado con IA.");
	}

	async activateChatView() {
		const { workspace } = this.app;
		let leaf = workspace.getLeavesOfType('chat-panel')[0];
		if (!leaf) {
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({ type: 'chat-panel', active: true });
		}
		workspace.revealLeaf(leaf);
	}

	async createDailyNote() {
		// Obtener la fecha actual
		const now = new Date();
		const year = now.getFullYear().toString();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
	  
		// Definir las carpetas y la ruta del archivo
		const yearFolder = year;
		const monthFolder = `${year}-${month}`;
		const dayFolder = `${year}-${month}-${day}`;
		const notePath = `${yearFolder}/${monthFolder}/${dayFolder}/${dayFolder}.md`;
	  
		// Verificar si la nota ya existe
		let file = this.app.vault.getAbstractFileByPath(notePath);
		if (!file) {
		  // Crear la estructura de carpetas necesaria. Si la carpeta ya existe, se puede ignorar el error.
		  try { await this.app.vault.adapter.mkdir(yearFolder); } catch (e) {}
		  try { await this.app.vault.adapter.mkdir(`${yearFolder}/${monthFolder}`); } catch (e) {}
		  try { await this.app.vault.adapter.mkdir(`${yearFolder}/${monthFolder}/${dayFolder}`); } catch (e) {}
	  
		  // Crear la nota nueva (aquí puedes definir un contenido inicial si lo deseas)
		  file = await this.app.vault.create(notePath, `# ${dayFolder}\n\n`);
		}
	  
		// Abrir el archivo en un nuevo panel
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(file);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

/**
 * Vista de chat que utiliza el GPTService del plugin para comunicarse con la API.
 */
class ChatView extends ItemView {
   plugin: ChatPlugin;
   messages: HTMLElement;
   // Conversation history including system, user, and assistant messages
   conversation: { role: string; content: string }[];
   // Initial system prompt for the conversation
   static systemPrompt: string = 'Eres un asistente experto en todas las áreas de conocimiento. Para las fórmulas matemáticas siempre empleas la notación de KaTex con delimitadores $$ para displayed formulas y $ para inlines. Generas markdown compatible 100% con Obsidian: tareas, callouts, diagramas mermaid, markmap, etc.';

	constructor(leaf: WorkspaceLeaf, plugin: ChatPlugin) {
		super(leaf);
		this.plugin = plugin;
		// Initialize conversation as empty; system prompt will be added dynamically with context
		this.conversation = [];
	}

	getViewType() {
		return 'chat-panel';
	}

	getDisplayText() {
		return 'Chat with GPT';
	}

	async onOpen() {
		this.render();
	}

	async onClose() {
		// Limpiar recursos si es necesario
	}

	async render() {
		this.containerEl.empty();
	  
		// Inyectar estilos para el chat
		const styleEl = this.containerEl.createEl('style');
		styleEl.setText(`
			.chat-messages {
				padding: 10px;
				overflow-y: auto;
				height: calc(100% - 100px);
				font-size: 14px;
			}
			.user-message-container {
				display: flex;
				justify-content: flex-end;
			}	
			.user-message, .bot-message {
				margin: 10px 0;
				padding: 10px;
				border-radius: 8px;
				line-height: 1.4;
				border: var(--input-border-width) solid var(--background-modifier-border);
			}
			.user-message {
				background-color: #d8fdd2;
				display: inline-block;
				max-width: 80%;
				word-wrap: break-word;
			}
			.bot-message {
				text-align: left;
				position: relative;
				padding: 0px 10px;
				background: var(--background-modifier-form-field);
			}
			.bot-message .transfer-button {
				position: absolute;
				top: 5px;
				right: 5px;
				background: transparent;
				border: none;
				cursor: pointer;
				opacity: 0;
				transition: opacity 0.3s;
				padding: 4px;
			}
			.bot-message:hover .transfer-button {
				opacity: 1;
			}
			.bot-message .transfer-button svg {
				width: 16px;
				height: 16px;
				fill: currentColor;
			}
			.chat-input-container {
				display: flex;
				align-items: center;
				padding: 10px;
				gap: 10px;
			}
			.chat-input {
				flex-grow: 1;
				padding: 8px;
				font-size: 13px;
				resize: none;
			}
			.chat-send-button {
				background: none;
				border: none;
				cursor: pointer;
				padding: 8px;
			}
			.chat-send-button svg {
				width: 24px;
				height: 24px;
				fill: currentColor;
			}
			.spinner {
				border: 4px solid rgba(0, 0, 0, 0.1);
				border-left-color: #767676;
				border-radius: 50%;
				width: 24px;
				height: 24px;
				animation: spin 1s linear infinite;
				margin: 0 auto;
			}
			@keyframes spin {
				to { transform: rotate(360deg); }
			}			
		`);
	  
		// Contenedor de mensajes
		this.messages = this.containerEl.createEl('div', { cls: 'chat-messages' });
	  
		// Contenedor para el input y el botón de enviar
		const inputContainer = this.containerEl.createEl('div', { cls: 'chat-input-container' });
		const input = inputContainer.createEl('textarea', {
		  cls: 'chat-input',
		  attr: { placeholder: 'Escribe un mensaje...' }
		});
		
		const sendButton = inputContainer.createEl('button', { cls: 'chat-send-button', attr: { title: 'Enviar' } });
		sendButton.innerHTML = `
			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			  <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
			</svg>
		`;
	  
		sendButton.addEventListener('click', () => this.sendMessage(input.value));
		input.addEventListener('keypress', (e) => {
		  if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			this.sendMessage(input.value);
		  }
		});
	}

	async sendMessage(userMessage: string) {
		if (!userMessage.trim()) return;
	
		// Limpiar el input
		const inputEl = this.containerEl.querySelector('.chat-input') as HTMLTextAreaElement;
		inputEl.value = '';
	
		// Mostrar mensaje del usuario
		const userMessageWrapper = this.messages.createEl('div', { cls: 'user-message-container' });
		userMessageWrapper.createEl('div', { cls: 'user-message', text: userMessage });
	
		// Mostrar spinner mientras se espera la respuesta
		const spinnerContainer = this.messages.createEl('div', { cls: 'bot-message' });
       		spinnerContainer.createEl('div', { cls: 'spinner' });


		// Obtener contexto desde el editor activo (opcional)
		const editor = this.plugin.getActiveMarkdownEditor();
		let contextText = '';
		if (editor) {
			contextText = editor.getValue();
			console.log("Texto del contexto:", contextText);
		} else {
			console.log("No se encontró ninguna vista Markdown activa.");
		}	

        // Reset conversation if initial or on /new command, including adding context
        const trimmed = userMessage.trim();
        const shouldReset = trimmed === '/new' || this.conversation.length === 0;
        if (shouldReset) {
            this.messages.empty();
            let systemContent = ChatView.systemPrompt;
            if (contextText.trim()) {
                systemContent += `\n\nContexto de la nota:\n${contextText}`;
            }
            this.conversation = [{ role: 'system', content: systemContent }];
            if (trimmed === '/new') {
                new Notice('Started new conversation');
                return;
            }
        }
        // Append user message to conversation history
        this.conversation.push({ role: 'user', content: userMessage });
		// Debug payload: full conversation
		console.log("****ChatView.sendMessage: payload:", this.conversation);
		// Request response from GPT with full conversation
		const response = await this.plugin.gptService.fetchResponse(this.conversation);
		// Append assistant response to conversation history
		this.conversation.push({ role: 'assistant', content: response });
	
		// Reemplazar el spinner por la respuesta renderizada
		spinnerContainer.empty();
		const markdownContainer = spinnerContainer.createEl('div');
		await MarkdownRenderer.renderMarkdown(response, markdownContainer, '', this);
	
		// Botón para insertar la respuesta en el editor
		const transferButton = spinnerContainer.createEl('button', { cls: 'transfer-button' });
		transferButton.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" 
				stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
			</svg>
		`;
		transferButton.addEventListener('click', () => this.insertInEditor(response));
	}
		
	insertInEditor(text: string) {
		const editor = this.plugin.getActiveMarkdownEditor();
		if (editor) {
			editor.replaceRange(text, editor.getCursor());
			new Notice('Mensaje insertado en el editor.');
		} else {
			new Notice('No se encontró un editor activo.');
		}
	}
}

/**
 * Pestaña de configuración del plugin.
 */
class ChatSettingTab extends PluginSettingTab {
	plugin: ChatPlugin;

	constructor(app: App, plugin: ChatPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Introduce tu API Key de OpenAI')
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Modelo')
			.setDesc('Elige el modelo de OpenAI')
			.addDropdown(dropdown => dropdown
				.addOptions({ 'o3': 'o3', 'o4-mini': 'o4-mini', 'gpt-4.1': 'GPT-4.1', 'chatgpt-4o-latest': 'ChatGPT' })
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));
	}
}