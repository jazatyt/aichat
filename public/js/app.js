/**
 * Maneega AI Chat - Main Frontend Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentChatId: null,
    chats: [],
    selectedModel: 'Maneega 1.5',
    isGenerating: false,
    uploadedFiles: [],
    speechRecognition: null,
    isRecording: false,
    chatToDeleteId: null
  };

  // DOM Elements
  const elements = {
    // Layout
    sidebar: document.getElementById('sidebar'),
    mobileOverlay: document.getElementById('mobile-overlay'),
    collapseSidebarBtn: document.getElementById('collapse-sidebar-btn'),
    restoreSidebarBtn: document.getElementById('restore-sidebar-btn'),
    mobileSidebarBtn: document.getElementById('mobile-sidebar-btn'),
    logoHome: document.getElementById('logo-home'),

    // History & Navigation
    newChatBtn: document.getElementById('new-chat-btn'),
    searchChatBtn: document.getElementById('search-chat-btn'),
    myLibraryBtn: document.getElementById('my-library-btn'),
    historyToday: document.getElementById('history-today'),
    historyWeek: document.getElementById('history-week'),

    // Model Selector
    modelSelectBtn: document.getElementById('model-select-btn'),
    currentModelName: document.getElementById('current-model-name'),
    modelDropdownMenu: document.getElementById('model-dropdown-menu'),
    modelsListContainer: document.getElementById('models-list-container'),

    // Views
    welcomeScreen: document.getElementById('welcome-screen'),
    messagesContainer: document.getElementById('messages-container'),
    bottomInputContainer: document.getElementById('bottom-input-container'),
    chatBody: document.getElementById('chat-body'),

    // Welcome Input
    welcomeInput: document.getElementById('welcome-input'),
    welcomeSendBtn: document.getElementById('welcome-send-btn'),
    welcomeAttachBtn: document.getElementById('welcome-attach-btn'),
    welcomeMicBtn: document.getElementById('welcome-mic-btn'),
    welcomeFilesPreview: document.getElementById('welcome-files-preview'),

    // Sticky Chat Input
    chatInput: document.getElementById('chat-input'),
    chatSendBtn: document.getElementById('chat-send-btn'),
    chatAttachBtn: document.getElementById('chat-attach-btn'),
    chatMicBtn: document.getElementById('chat-mic-btn'),
    chatFilesPreview: document.getElementById('chat-files-preview'),

    // File Input
    globalFileInput: document.getElementById('global-file-input'),

    // Modals
    searchModal: document.getElementById('search-modal'),
    searchInput: document.getElementById('search-input'),
    searchResults: document.getElementById('search-results'),
    closeSearchBtn: document.getElementById('close-search-btn'),

    libraryModal: document.getElementById('library-modal'),
    libraryItemsList: document.getElementById('library-items-list'),
    closeLibraryBtn: document.getElementById('close-library-btn'),
    addLibraryItemBtn: document.getElementById('add-library-item-btn'),

    // Status Badge
    backendStatusBadge: document.getElementById('backend-status-badge'),
    backendStatusDot: document.getElementById('backend-status-dot'),
    backendStatusText: document.getElementById('backend-status-text'),
    settingsBackendUrl: document.getElementById('settings-backend-url'),

    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    cancelSettingsBtn: document.getElementById('cancel-settings-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    settingsApiKey: document.getElementById('settings-api-key'),
    settingsSystemPrompt: document.getElementById('settings-system-prompt'),

    // Confirm Delete Modal
    confirmDeleteModal: document.getElementById('confirm-delete-modal'),
    confirmDeleteCard: document.getElementById('confirm-delete-card'),
    cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn')
  };

  // Initialize Lucide icons
  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Auto resize textarea
  function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
  }

  elements.welcomeInput.addEventListener('input', () => autoResize(elements.welcomeInput));
  elements.chatInput.addEventListener('input', () => autoResize(elements.chatInput));

  // Enter to send, Shift+Enter for newline
  elements.welcomeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(elements.welcomeInput.value);
    }
  });
  elements.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(elements.chatInput.value);
    }
  });

  elements.welcomeSendBtn.addEventListener('click', () => handleSendPrompt(elements.welcomeInput.value));
  elements.chatSendBtn.addEventListener('click', () => handleSendPrompt(elements.chatInput.value));

  // Load Initial Data
  async function loadInitialData() {
    await Promise.all([loadModels(), loadChats(), checkBackendStatus()]);
    refreshIcons();
    // Check backend health periodically
    setInterval(checkBackendStatus, 15000);
  }

  // 1. Models
  async function loadModels() {
    try {
      const res = await fetch('/api/models');
      const models = await res.json();
      renderModels(models);
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  }

  function renderModels(models) {
    elements.modelsListContainer.innerHTML = models.map(m => `
      <div class="px-3 py-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors ${state.selectedModel === m.name ? 'bg-purple-50/70 font-semibold text-purple-900' : 'text-gray-700'}" data-model="${m.name}">
        <div>
          <div class="flex items-center gap-2">
            <span>${m.name}</span>
            <span class="text-[10px] px-1.5 py-0.2 bg-gray-100 rounded text-gray-500 font-normal">${m.badge}</span>
          </div>
          <div class="text-[11px] text-gray-400 font-normal mt-0.5">${m.desc}</div>
        </div>
        ${state.selectedModel === m.name ? '<i data-lucide="check" class="w-4 h-4 text-purple-600"></i>' : ''}
      </div>
    `).join('');

    elements.modelsListContainer.querySelectorAll('[data-model]').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedModel = item.dataset.model;
        elements.currentModelName.textContent = state.selectedModel;
        elements.modelDropdownMenu.classList.add('hidden');
        renderModels(models);
        refreshIcons();
      });
    });
  }

  // Toggle model dropdown
  elements.modelSelectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.modelDropdownMenu.classList.toggle('hidden');
  });
  document.addEventListener('click', () => {
    elements.modelDropdownMenu.classList.add('hidden');
  });

  // 2. Chats
  async function loadChats() {
    try {
      const res = await fetch('/api/chats');
      state.chats = await res.json();
      renderSidebarHistory();
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  }

  function renderSidebarHistory() {
    const todayChats = state.chats.filter(c => c.category === 'today');
    const weekChats = state.chats.filter(c => c.category === 'week' || c.category === 'older');

    elements.historyToday.innerHTML = todayChats.length > 0
      ? todayChats.map(c => createHistoryItemHTML(c)).join('')
      : '<div class="text-[11px] text-gray-400 px-3 py-1 italic">ยังไม่มีประวัติวันนี้</div>';

    elements.historyWeek.innerHTML = weekChats.length > 0
      ? weekChats.map(c => createHistoryItemHTML(c)).join('')
      : '<div class="text-[11px] text-gray-400 px-3 py-1 italic">ไม่มีประวัติก่อนหน้า</div>';

    // Bind click events
    document.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.item-actions')) return;
        const chatId = el.dataset.chatId;
        openChat(chatId);
      });
    });

    // Bind delete events
    document.querySelectorAll('.delete-chat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.dataset.chatId;
        openDeleteConfirmModal(chatId);
      });
    });

    refreshIcons();
  }

  function createHistoryItemHTML(chat) {
    const isActive = state.currentChatId === chat.id;
    return `
      <div class="history-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
        <span class="truncate flex-1 pr-2">${escapeHtml(chat.title)}</span>
        <div class="item-actions items-center gap-1">
          <button class="delete-chat-btn p-1 text-gray-400 hover:text-red-500 rounded transition-colors" data-chat-id="${chat.id}" title="ลบ">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }

  // 3. Open specific chat
  async function openChat(chatId) {
    try {
      state.currentChatId = chatId;
      const res = await fetch(`/api/chats/${chatId}`);
      if (!res.ok) throw new Error('Not found');
      const chat = await res.json();

      // Render Messages
      showChatView();
      renderMessages(chat.messages);
      renderSidebarHistory();

      // Mobile: close sidebar on selection
      elements.sidebar.classList.add('-translate-x-full');
      elements.mobileOverlay.classList.add('hidden');
    } catch (err) {
      console.error('Error opening chat:', err);
    }
  }

  function showChatView() {
    elements.welcomeScreen.classList.add('hidden');
    elements.messagesContainer.classList.remove('hidden');
    elements.bottomInputContainer.classList.remove('hidden');
    elements.chatInput.focus();
  }

  function showWelcomeView() {
    state.currentChatId = null;
    elements.welcomeScreen.classList.remove('hidden');
    elements.messagesContainer.classList.add('hidden');
    elements.bottomInputContainer.classList.add('hidden');
    elements.welcomeInput.value = '';
    elements.welcomeFilesPreview.innerHTML = '';
    state.uploadedFiles = [];
    renderSidebarHistory();
  }

  // 4. Render Message list
  function renderMessages(messages) {
    elements.messagesContainer.innerHTML = '';
    messages.forEach(msg => {
      appendMessageToDOM(msg.role, msg.content, msg.files);
    });
    scrollToBottom();
    refreshIcons();
  }

  function appendMessageToDOM(role, content, files = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'w-full flex ' + (role === 'user' ? 'justify-end' : 'justify-start');

    if (role === 'user') {
      let filesHTML = '';
      if (files && files.length > 0) {
        filesHTML = `<div class="flex flex-wrap gap-1.5 mb-2">${files.map(f => `
          <div class="flex items-center gap-1 px-2 py-0.5 bg-white/80 rounded-lg text-xs text-gray-700 border border-gray-200">
            <i data-lucide="file" class="w-3 h-3 text-purple-600"></i>
            <span class="truncate max-w-[140px]">${escapeHtml(f.originalName || f.name)}</span>
          </div>
        `).join('')}</div>`;
      }

      msgDiv.innerHTML = `
        <div class="user-bubble">
          ${filesHTML}
          <div class="text-sm whitespace-pre-wrap">${escapeHtml(content)}</div>
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="flex gap-3 max-w-2xl w-full">
          <div class="w-8 h-8 rounded-full bg-[#EDE8F8] text-[#6046D5] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
          </div>
          <div class="assistant-bubble flex-1 min-w-0">
            <div class="markdown-body font-sans">${MarkdownParser.render(content)}</div>
            <div class="flex items-center gap-1 mt-3 pt-2 text-gray-400 text-xs border-t border-gray-100">
              <button class="msg-action-btn copy-msg p-1 hover:text-gray-700 hover:bg-gray-100 rounded" title="คัดลอกข้อความ">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              </button>
              <button class="msg-action-btn speak-msg p-1 hover:text-gray-700 hover:bg-gray-100 rounded" title="อ่านออกเสียง">
                <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
              </button>
              <button class="msg-action-btn like-msg p-1 hover:text-purple-600 hover:bg-purple-50 rounded" title="ชอบคำตอบ">
                <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i>
              </button>
              <button class="msg-action-btn dislike-msg p-1 hover:text-red-500 hover:bg-red-50 rounded" title="ไม่ชอบคำตอบ">
                <i data-lucide="thumbs-down" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Bind action buttons
      const copyBtn = msgDiv.querySelector('.copy-msg');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(content);
        copyBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i>';
        refreshIcons();
        setTimeout(() => {
          copyBtn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i>';
          refreshIcons();
        }, 2000);
      });

      const speakBtn = msgDiv.querySelector('.speak-msg');
      speakBtn.addEventListener('click', () => speakText(content));
    }

    elements.messagesContainer.appendChild(msgDiv);
    refreshIcons();
    return msgDiv;
  }

  function scrollToBottom() {
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
  }

  // 5. Send Prompt & Handle Streaming
  async function handleSendPrompt(text) {
    const prompt = (text || '').trim();
    if (!prompt && state.uploadedFiles.length === 0) return;
    if (state.isGenerating) return;

    state.isGenerating = true;
    updateSendButtonState(true);

    // If starting from welcome screen
    if (!state.currentChatId) {
      showChatView();
    }

    // Add User Message
    const currentFiles = [...state.uploadedFiles];
    appendMessageToDOM('user', prompt, currentFiles);
    
    // Clear inputs and previews
    elements.welcomeInput.value = '';
    elements.chatInput.value = '';
    elements.welcomeFilesPreview.innerHTML = '';
    elements.chatFilesPreview.innerHTML = '';
    state.uploadedFiles = [];
    autoResize(elements.chatInput);
    autoResize(elements.welcomeInput);
    scrollToBottom();

    // Create Assistant Message Placeholder
    const assistantMsgDiv = document.createElement('div');
    assistantMsgDiv.className = 'w-full flex justify-start';
    assistantMsgDiv.innerHTML = `
      <div class="flex gap-3 max-w-2xl w-full">
        <div class="w-8 h-8 rounded-full bg-[#EDE8F8] text-[#6046D5] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
          <i data-lucide="sparkles" class="w-4 h-4"></i>
        </div>
        <div class="assistant-bubble flex-1 min-w-0">
          <div class="markdown-body font-sans streaming-cursor">กำลังคิด...</div>
        </div>
      </div>
    `;
    elements.messagesContainer.appendChild(assistantMsgDiv);
    refreshIcons();
    scrollToBottom();

    const markdownBody = assistantMsgDiv.querySelector('.markdown-body');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: state.currentChatId,
          message: prompt,
          model: state.selectedModel,
          files: currentFiles,
          stream: true
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      markdownBody.innerHTML = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.chunk) {
                accumulatedText += data.chunk;
                markdownBody.innerHTML = MarkdownParser.render(accumulatedText);
                scrollToBottom();
              }
              if (data.done) {
                if (data.chatId && (!state.currentChatId || state.currentChatId !== data.chatId)) {
                  state.currentChatId = data.chatId;
                }
                markdownBody.classList.remove('streaming-cursor');
                markdownBody.innerHTML = MarkdownParser.render(data.fullText || accumulatedText);
                
                // Add action buttons
                addAssistantActions(assistantMsgDiv, data.fullText || accumulatedText);
              }
            } catch (err) {
              // Parse chunk fallback
            }
          }
        }
      }

      // Reload chats in sidebar to show updated title & order
      await loadChats();
    } catch (err) {
      console.error('Chat error:', err);
      markdownBody.classList.remove('streaming-cursor');
      markdownBody.innerHTML = `<span class="text-red-500">เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง</span>`;
    } finally {
      state.isGenerating = false;
      updateSendButtonState(false);
      refreshIcons();
      scrollToBottom();
    }
  }

  function addAssistantActions(container, text) {
    const bubble = container.querySelector('.assistant-bubble');
    if (bubble.querySelector('.msg-action-btn')) return;

    const actionRow = document.createElement('div');
    actionRow.className = 'flex items-center gap-1 mt-3 pt-2 text-gray-400 text-xs border-t border-gray-100';
    actionRow.innerHTML = `
      <button class="msg-action-btn copy-msg p-1 hover:text-gray-700 hover:bg-gray-100 rounded" title="คัดลอกข้อความ">
        <i data-lucide="copy" class="w-3.5 h-3.5"></i>
      </button>
      <button class="msg-action-btn speak-msg p-1 hover:text-gray-700 hover:bg-gray-100 rounded" title="อ่านออกเสียง">
        <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
      </button>
      <button class="msg-action-btn like-msg p-1 hover:text-purple-600 hover:bg-purple-50 rounded" title="ชอบคำตอบ">
        <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i>
      </button>
      <button class="msg-action-btn dislike-msg p-1 hover:text-red-500 hover:bg-red-50 rounded" title="ไม่ชอบคำตอบ">
        <i data-lucide="thumbs-down" class="w-3.5 h-3.5"></i>
      </button>
    `;

    const copyBtn = actionRow.querySelector('.copy-msg');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text);
      copyBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i>';
      refreshIcons();
      setTimeout(() => {
        copyBtn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i>';
        refreshIcons();
      }, 2000);
    });

    const speakBtn = actionRow.querySelector('.speak-msg');
    speakBtn.addEventListener('click', () => speakText(text));

    bubble.appendChild(actionRow);
    refreshIcons();
  }

  function updateSendButtonState(disabled) {
    elements.welcomeSendBtn.disabled = disabled;
    elements.chatSendBtn.disabled = disabled;
  }

  // 6. Suggestion Cards
  document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', () => {
      const prompt = card.dataset.prompt;
      if (prompt) {
        handleSendPrompt(prompt);
      }
    });
  });

  // 7. Delete Chat & Custom Confirmation Modal
  function openDeleteConfirmModal(chatId) {
    state.chatToDeleteId = chatId;
    elements.confirmDeleteModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      elements.confirmDeleteCard.classList.remove('scale-95', 'opacity-0');
      elements.confirmDeleteCard.classList.add('scale-100', 'opacity-100');
    });
    refreshIcons();
  }

  function closeDeleteConfirmModal() {
    state.chatToDeleteId = null;
    elements.confirmDeleteCard.classList.remove('scale-100', 'opacity-100');
    elements.confirmDeleteCard.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      elements.confirmDeleteModal.classList.add('hidden');
    }, 150);
  }

  elements.confirmDeleteBtn.addEventListener('click', async () => {
    if (state.chatToDeleteId) {
      const chatId = state.chatToDeleteId;
      closeDeleteConfirmModal();
      await deleteChat(chatId);
    }
  });

  elements.cancelDeleteBtn.addEventListener('click', () => closeDeleteConfirmModal());

  elements.confirmDeleteModal.addEventListener('click', (e) => {
    if (e.target === elements.confirmDeleteModal) {
      closeDeleteConfirmModal();
    }
  });

  async function deleteChat(chatId) {
    try {
      await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      if (state.currentChatId === chatId) {
        showWelcomeView();
      }
      await loadChats();
    } catch (err) {
      console.error('Delete chat error:', err);
    }
  }

  // 8. New Chat Button & Logo Click & Shortcut (Cmd/Ctrl + K)
  elements.newChatBtn.addEventListener('click', () => showWelcomeView());
  elements.logoHome.addEventListener('click', () => showWelcomeView());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.confirmDeleteModal.classList.contains('hidden')) {
      closeDeleteConfirmModal();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      showWelcomeView();
    }
  });

  // 9. File Upload Handling
  elements.welcomeAttachBtn.addEventListener('click', () => elements.globalFileInput.click());
  elements.chatAttachBtn.addEventListener('click', () => elements.globalFileInput.click());

  elements.globalFileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.files) {
        state.uploadedFiles.push(...data.files);
        renderFilePreviews();
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
      elements.globalFileInput.value = '';
    }
  });

  function renderFilePreviews() {
    const previewHTML = state.uploadedFiles.map((file, idx) => `
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-xs">
        <i data-lucide="paperclip" class="w-3 h-3 text-purple-600"></i>
        <span class="truncate max-w-[150px] font-medium">${escapeHtml(file.originalName)}</span>
        <button class="text-purple-400 hover:text-red-500 remove-file-btn ml-1" data-idx="${idx}">
          <i data-lucide="x" class="w-3 h-3"></i>
        </button>
      </div>
    `).join('');

    elements.welcomeFilesPreview.innerHTML = previewHTML;
    elements.chatFilesPreview.innerHTML = previewHTML;

    document.querySelectorAll('.remove-file-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        state.uploadedFiles.splice(idx, 1);
        renderFilePreviews();
      });
    });

    refreshIcons();
  }

  // 10. Voice Speech-to-Text
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognizer = new SpeechRecognition();
    recognizer.lang = 'th-TH';
    recognizer.interimResults = true;
    recognizer.continuous = false;

    recognizer.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (!elements.welcomeScreen.classList.contains('hidden')) {
        elements.welcomeInput.value = transcript;
        autoResize(elements.welcomeInput);
      } else {
        elements.chatInput.value = transcript;
        autoResize(elements.chatInput);
      }
    };

    recognizer.onend = () => {
      state.isRecording = false;
      elements.welcomeMicBtn.classList.remove('recording-pulse');
      elements.chatMicBtn.classList.remove('recording-pulse');
    };

    recognizer.onerror = () => {
      state.isRecording = false;
      elements.welcomeMicBtn.classList.remove('recording-pulse');
      elements.chatMicBtn.classList.remove('recording-pulse');
    };

    return recognizer;
  }

  state.speechRecognition = initSpeechRecognition();

  function toggleRecording(btn) {
    if (!state.speechRecognition) {
      alert('เบราว์เซอร์นี้ไม่รองรับการแปลงเสียงเป็นข้อความ หรือไม่ได้อนุญาตการใช้ไมโครโฟน');
      return;
    }

    if (state.isRecording) {
      state.speechRecognition.stop();
      state.isRecording = false;
      btn.classList.remove('recording-pulse');
    } else {
      try {
        state.speechRecognition.start();
        state.isRecording = true;
        btn.classList.add('recording-pulse');
      } catch (err) {
        console.error(err);
      }
    }
  }

  elements.welcomeMicBtn.addEventListener('click', () => toggleRecording(elements.welcomeMicBtn));
  elements.chatMicBtn.addEventListener('click', () => toggleRecording(elements.chatMicBtn));

  // 11. Text-to-Speech (TTS)
  function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Strip markdown formatting for reading
    const plainText = text.replace(/[#*`_~>-]/g, '').replace(/```[\s\S]*?```/g, 'มีบล็อกโค้ดแนบมา');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'th-TH';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  // 12. Search Chat Modal
  elements.searchChatBtn.addEventListener('click', () => {
    elements.searchModal.classList.remove('hidden');
    elements.searchInput.value = '';
    elements.searchInput.focus();
    renderSearchResults('');
  });
  elements.closeSearchBtn.addEventListener('click', () => elements.searchModal.classList.add('hidden'));

  elements.searchInput.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });

  function renderSearchResults(query) {
    const q = (query || '').toLowerCase().trim();
    const filtered = state.chats.filter(c => {
      if (!q) return true;
      if (c.title.toLowerCase().includes(q)) return true;
      return (c.messages || []).some(m => m.content.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      elements.searchResults.innerHTML = '<div class="text-center py-6 text-gray-400 text-xs">ไม่พบการค้นหาที่ตรงกัน</div>';
      return;
    }

    elements.searchResults.innerHTML = filtered.map(c => `
      <div class="p-2.5 hover:bg-purple-50/70 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-purple-200" data-chat-id="${c.id}">
        <div class="font-medium text-xs text-gray-800">${escapeHtml(c.title)}</div>
        <div class="text-[11px] text-gray-400 truncate mt-0.5">${escapeHtml((c.messages && c.messages[0]) ? c.messages[0].content : 'ไม่มีข้อความ')}</div>
      </div>
    `).join('');

    elements.searchResults.querySelectorAll('[data-chat-id]').forEach(el => {
      el.addEventListener('click', () => {
        elements.searchModal.classList.add('hidden');
        openChat(el.dataset.chatId);
      });
    });
  }

  // 13. Library (คลังของฉัน) Modal
  elements.myLibraryBtn.addEventListener('click', async () => {
    elements.libraryModal.classList.remove('hidden');
    await loadLibraryItems();
  });
  elements.closeLibraryBtn.addEventListener('click', () => elements.libraryModal.classList.add('hidden'));

  async function loadLibraryItems() {
    try {
      const res = await fetch('/api/library');
      const items = await res.json();
      renderLibraryItems(items);
    } catch (err) {
      console.error(err);
    }
  }

  function renderLibraryItems(items) {
    elements.libraryItemsList.innerHTML = items.map(item => `
      <div class="p-3.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors group flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-xs text-gray-800 mb-1">${escapeHtml(item.title)}</div>
          <div class="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">${escapeHtml(item.prompt)}</div>
        </div>
        <button class="use-prompt-btn px-2.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0" data-prompt="${escapeHtml(item.prompt)}">
          ใช้งาน
        </button>
      </div>
    `).join('');

    elements.libraryItemsList.querySelectorAll('.use-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        elements.libraryModal.classList.add('hidden');
        if (!elements.welcomeScreen.classList.contains('hidden')) {
          elements.welcomeInput.value = prompt;
          autoResize(elements.welcomeInput);
          elements.welcomeInput.focus();
        } else {
          elements.chatInput.value = prompt;
          autoResize(elements.chatInput);
          elements.chatInput.focus();
        }
      });
    });
  }

  elements.addLibraryItemBtn.addEventListener('click', async () => {
    const title = prompt('ชื่อคำสั่งลัด:');
    if (!title) return;
    const promptText = prompt('ข้อความ Prompt หรือคำสั่ง:');
    if (!promptText) return;

    try {
      await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, prompt: promptText })
      });
      await loadLibraryItems();
    } catch (err) {
      console.error(err);
    }
  });

  // ฟังก์ชัน askAI ที่เพื่อนส่งมา (พร้อมรองรับการเรียกใช้งานโดยตรง)
  async function askAI(userText) {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error("เชื่อมต่อหลังบ้านไม่ได้:", error);
      return "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
    }
  }
  window.askAI = askAI;

  // ตรวจสอบสถานะการเชื่อมต่อไปยัง Backend 5000
  async function checkBackendStatus() {
    if (!elements.backendStatusBadge) return;
    try {
      const res = await fetch('/api/backend-status');
      const data = await res.json();
      if (data.online) {
        elements.backendStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-500';
        elements.backendStatusText.textContent = 'หลังบ้าน 5000: ออนไลน์';
        elements.backendStatusBadge.className = 'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all select-none bg-emerald-50 border-emerald-200 text-emerald-700 cursor-pointer';
        elements.backendStatusBadge.title = 'เซิร์ฟเวอร์หลังบ้าน ' + data.url + ' เชื่อมต่อแล้ว';
      } else {
        elements.backendStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400';
        elements.backendStatusText.textContent = 'หลังบ้าน 5000: ออฟไลน์';
        elements.backendStatusBadge.className = 'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all select-none bg-amber-50 border-amber-200 text-amber-800 cursor-pointer';
        elements.backendStatusBadge.title = 'เซิร์ฟเวอร์ ' + data.url + ' ยังไม่เปิด (ระบบจะใช้ AI จำลองให้ก่อนอัตโนมัติ) คลิกเพื่อทดสอบใหม่';
      }
    } catch {
      elements.backendStatusDot.className = 'w-2 h-2 rounded-full bg-gray-400';
      elements.backendStatusText.textContent = 'หลังบ้าน 5000: ยังไม่เปิด';
    }
  }

  if (elements.backendStatusBadge) {
    elements.backendStatusBadge.addEventListener('click', async () => {
      elements.backendStatusText.textContent = 'กำลังตรวจสอบ...';
      elements.backendStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
      await checkBackendStatus();
      const res = await fetch('/api/backend-status');
      const data = await res.json();
      if (data.online) {
        alert('เชื่อมต่อกับเซิร์ฟเวอร์หลังบ้าน (' + data.url + ') สำเร็จแล้ว!');
      } else {
        alert('ยังไม่สามารถเชื่อมต่อไปยัง ' + data.url + ' ได้\n\n- ตรวจสอบว่าเพื่อนได้รันเซิร์ฟเวอร์พอร์ต 5000 อยู่หรือไม่\n- ระหว่างนี้เว็บจะใช้ระบบ AI ในตัวตอบแทนให้ก่อนอัตโนมัติ');
      }
    });
  }

  // 15. Settings Modal
  elements.settingsBtn.addEventListener('click', async () => {
    elements.settingsModal.classList.remove('hidden');
    try {
      const res = await fetch('/api/settings');
      const settings = await res.json();
      if (settings.backendUrl) elements.settingsBackendUrl.value = settings.backendUrl;
      if (settings.apiKey) elements.settingsApiKey.value = settings.apiKey;
      if (settings.systemPrompt) elements.settingsSystemPrompt.value = settings.systemPrompt;
    } catch (err) {
      console.error(err);
    }
  });

  elements.closeSettingsBtn.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));
  elements.cancelSettingsBtn.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));

  elements.saveSettingsBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backendUrl: elements.settingsBackendUrl.value.trim() || 'http://127.0.0.1:5000/api/chat',
          apiKey: elements.settingsApiKey.value.trim(),
          systemPrompt: elements.settingsSystemPrompt.value.trim()
        })
      });
      elements.settingsModal.classList.add('hidden');
      await checkBackendStatus();
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  });

  // 16. Sidebar Collapse / Mobile Drawer
  elements.collapseSidebarBtn.addEventListener('click', () => {
    elements.sidebar.classList.add('hidden');
    elements.restoreSidebarBtn.classList.remove('hidden');
    elements.restoreSidebarBtn.classList.add('md:block');
  });

  elements.restoreSidebarBtn.addEventListener('click', () => {
    elements.sidebar.classList.remove('hidden');
    elements.restoreSidebarBtn.classList.add('hidden');
    elements.restoreSidebarBtn.classList.remove('md:block');
  });

  elements.mobileSidebarBtn.addEventListener('click', () => {
    elements.sidebar.classList.remove('-translate-x-full');
    elements.mobileOverlay.classList.remove('hidden');
  });

  elements.mobileOverlay.addEventListener('click', () => {
    elements.sidebar.classList.add('-translate-x-full');
    elements.mobileOverlay.classList.add('hidden');
  });

  // Helper Escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start
  loadInitialData();
});
