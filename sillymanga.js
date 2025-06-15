(function () {
    const context = SillyTavern.getContext();
    const { extension_settings, saveSettingsDebounced } = context;

    const extensionName = "sillymanga";
    const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
    
    const defaultSettings = {
        workflow: null,
        characters: {},
    };

    function getSettings() {
        if (!extension_settings[extensionName]) {
            extension_settings[extensionName] = { ...defaultSettings };
        }
        // Ensure all default keys exist
        for (const key in defaultSettings) {
            if (extension_settings[extensionName][key] === undefined) {
                extension_settings[extensionName][key] = defaultSettings[key];
            }
        }
        return extension_settings[extensionName];
    }

    function onSelectWorkflow() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const workflow = JSON.parse(e.target.result);
                        getSettings().workflow = workflow;
                        saveSettingsDebounced();
                        toastr.success("Workflow loaded successfully!");
                    } catch (error) {
                        toastr.error("Failed to load workflow. Make sure it's a valid JSON file.");
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    function onConnectComfyUI() {
        // This is a placeholder for the actual connection logic
        toastr.info("Connecting to ComfyUI...");
    }

    function onCreatePrompt() {
        const lastMessage = context.chat.slice(-1)[0];
        if (lastMessage && lastMessage.mes) {
            let prompt = lastMessage.mes;
            const characterKeywords = getSettings().characters;
            for (const character in characterKeywords) {
                if (prompt.includes(character)) {
                    prompt += `, ${characterKeywords[character]}`;
                }
            }
            // This is a placeholder for sending the prompt to ComfyUI
            toastr.info(`Generated prompt: ${prompt}`);
        } else {
            toastr.warning("No message to create a prompt from.");
        }
    }

    function onAddCharacter() {
        const characterName = prompt("Enter character name:");
        if (characterName) {
            const keywords = prompt(`Enter keywords for ${characterName}:`);
            if (keywords) {
                getSettings().characters[characterName] = keywords;
                saveSettingsDebounced();
                renderCharacterKeywords();
            }
        }
    }

    function renderCharacterKeywords() {
        const container = document.getElementById('character_keywords');
        if (!container) return;
        container.innerHTML = '';
        const characters = getSettings().characters;
        for (const character in characters) {
            const div = document.createElement('div');
            div.innerHTML = `<b>${character}:</b> ${characters[character]} <button class="delete_character" data-character="${character}">Delete</button>`;
            container.appendChild(div);
        }
        $('.delete_character').on('click', function() {
            const characterToDelete = $(this).data('character');
            delete getSettings().characters[characterToDelete];
            saveSettingsDebounced();
            renderCharacterKeywords();
        });
    }

    jQuery(async () => {
        const settingsHtml = await $.get(`${extensionFolderPath}/sillymanga.html`);
        $("#extensions_settings").append(settingsHtml);

        $("#select_workflow").on("click", onSelectWorkflow);
        $("#connect_comfyui").on("click", onConnectComfyUI);
        $("#create_prompt").on("click", onCreatePrompt);
        $("#add_character").on("click", onAddCharacter);

        // Initial load
        getSettings();
        renderCharacterKeywords();
    });
})();
