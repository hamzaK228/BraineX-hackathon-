/**
 * BraineX AI Assistant — Premium 1/3 Sidebar
 * Handles: Authentication, SSE streaming, tool notifications, theme sync
 */
(function () {
  'use strict';

  // ─── State ──────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isStreaming = false;

  // ─── Build DOM ──────────────────────────────────────────────────────────────
  function init() {
    if (document.getElementById('brainex-ai-panel')) return; // Already injected

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'brainex-ai-overlay';
    overlay.addEventListener('click', togglePanel);
    document.body.appendChild(overlay);

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'brainex-ai-toggle';
    toggleBtn.innerHTML = `
      <span class="ai-btn-icon">🤖</span>
      <span>AI Assistant</span>
      <span class="ai-btn-pulse"></span>
    `;
    toggleBtn.addEventListener('click', togglePanel);
    document.body.appendChild(toggleBtn);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'brainex-ai-panel';
    panel.innerHTML = buildPanelHTML();
    document.body.appendChild(panel);

    // Wire events
    wireEvents();
  }

  function buildPanelHTML() {
    return `
      <div class="ai-panel-header">
        <div class="ai-panel-header-left">
          <div class="ai-panel-avatar">🧠</div>
          <div>
            <div class="ai-panel-title">BraineX AI</div>
            <div class="ai-panel-subtitle">Your Academic Architect</div>
          </div>
        </div>
        <div class="ai-panel-header-actions">
          <button id="ai-clear-btn" title="Clear history">🗑️</button>
          <button id="ai-close-btn" title="Close">✕</button>
        </div>
      </div>

      <div class="ai-quick-actions" id="ai-quick-actions">
        <button class="ai-quick-chip" data-prompt="Create a roadmap to score 1500+ on SAT">🎯 SAT Plan</button>
        <button class="ai-quick-chip" data-prompt="Which scholarships match my profile?">💰 Scholarships</button>
        <button class="ai-quick-chip" data-prompt="Recommend universities for my field">🏛️ Universities</button>
        <button class="ai-quick-chip" data-prompt="Help me organize my study schedule this week">📅 Schedule</button>
        <button class="ai-quick-chip" data-prompt="What are my current goals and progress?">📊 My Progress</button>
        <button class="ai-quick-chip" data-prompt="Suggest mentors in my field of interest">🎓 Mentors</button>
      </div>

      <div class="ai-panel-messages" id="ai-panel-messages">
        <div class="ai-msg assistant">
          <div class="ai-msg-avatar">🧠</div>
          <div class="ai-msg-content">
👋 Hey! I'm your <strong>BraineX AI Architect</strong>.<br><br>
I can manage your entire academic workspace:<br>
• 🎯 Create goals & roadmaps<br>
• ✅ Add tasks & deadlines<br>
• 🏛️ Track universities & applications<br>
• 📅 Pin events to your calendar<br>
• 📊 Analyze your progress<br><br>
Just tell me what you need!
          </div>
        </div>
      </div>

      <div class="ai-panel-input" id="ai-input-area">
        <textarea id="ai-panel-textarea" placeholder="Ask anything or tell me to create something..." rows="1"></textarea>
        <button class="ai-send-btn" id="ai-panel-send">➤</button>
      </div>
    `;
  }

  // ─── Wire Events ────────────────────────────────────────────────────────────
  function wireEvents() {
    document.getElementById('ai-close-btn').addEventListener('click', togglePanel);
    document.getElementById('ai-clear-btn').addEventListener('click', clearHistory);
    document.getElementById('ai-panel-send').addEventListener('click', sendMessage);

    const textarea = document.getElementById('ai-panel-textarea');
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });

    // Quick action chips
    document.querySelectorAll('.ai-quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        document.getElementById('ai-panel-textarea').value = prompt;
        sendMessage();
      });
    });
  }

  // ─── Toggle ─────────────────────────────────────────────────────────────────
  function togglePanel() {
    isOpen = !isOpen;
    const panel = document.getElementById('brainex-ai-panel');
    const overlay = document.getElementById('brainex-ai-overlay');
    const toggleBtn = document.getElementById('brainex-ai-toggle');

    if (isOpen) {
      panel.classList.add('open');
      overlay.classList.add('active');
      toggleBtn.style.display = 'none';

      // Check auth and show login prompt if needed
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showLoginPrompt();
      } else {
        hideLoginPrompt();
        loadChatHistory();
        document.getElementById('ai-panel-textarea')?.focus();
      }
    } else {
      panel.classList.remove('open');
      overlay.classList.remove('active');
      toggleBtn.style.display = 'flex';
    }
  }

  // ─── Auth Check ─────────────────────────────────────────────────────────────
  function showLoginPrompt() {
    const messages = document.getElementById('ai-panel-messages');
    const inputArea = document.getElementById('ai-input-area');
    const quickActions = document.getElementById('ai-quick-actions');

    if (messages) messages.style.display = 'none';
    if (inputArea) inputArea.style.display = 'none';
    if (quickActions) quickActions.style.display = 'none';

    // Check if prompt already exists
    if (document.getElementById('ai-login-prompt')) return;

    const loginDiv = document.createElement('div');
    loginDiv.className = 'ai-login-prompt';
    loginDiv.id = 'ai-login-prompt';
    loginDiv.innerHTML = `
      <div class="ai-lock-icon">🔒</div>
      <h3>Sign in to Use AI</h3>
      <p>Log in to access your personalized AI academic planner and workspace tools.</p>
      <button class="ai-login-btn" onclick="window.openModal && window.openModal('loginModal'); document.getElementById('brainex-ai-panel').classList.remove('open'); document.getElementById('brainex-ai-overlay').classList.remove('active'); document.getElementById('brainex-ai-toggle').style.display='flex';">Sign In</button>
    `;
    document.getElementById('brainex-ai-panel').insertBefore(
      loginDiv,
      document.querySelector('.ai-panel-input')
    );
  }

  function hideLoginPrompt() {
    const loginDiv = document.getElementById('ai-login-prompt');
    if (loginDiv) loginDiv.remove();

    const messages = document.getElementById('ai-panel-messages');
    const inputArea = document.getElementById('ai-input-area');
    const quickActions = document.getElementById('ai-quick-actions');

    if (messages) messages.style.display = 'flex';
    if (inputArea) inputArea.style.display = 'flex';
    if (quickActions) quickActions.style.display = 'flex';
  }

  // ─── Send Message ───────────────────────────────────────────────────────────
  async function sendMessage() {
    if (isStreaming) return;
    const textarea = document.getElementById('ai-panel-textarea');
    const message = textarea.value.trim();
    if (!message) return;

    // Check auth
    const token = localStorage.getItem('accessToken');
    if (!token) {
      showLoginPrompt();
      return;
    }

    textarea.value = '';
    textarea.style.height = 'auto';
    document.getElementById('ai-panel-send').disabled = true;
    isStreaming = true;

    // Hide quick actions after first message
    const quickActions = document.getElementById('ai-quick-actions');
    if (quickActions) quickActions.style.display = 'none';

    // Add user message
    appendMessage('user', message);

    // Add typing indicator
    const typingDiv = appendTypingIndicator();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (response.status === 401) {
        removeTyping(typingDiv);
        appendMessage('assistant', '🔒 Your session has expired. Please sign in again.');
        showLoginPrompt();
        isStreaming = false;
        document.getElementById('ai-panel-send').disabled = false;
        return;
      }

      if (!response.ok) throw new Error('Request failed');

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let hasError = false;

      // Replace typing with real assistant message
      removeTyping(typingDiv);
      const assistantMsg = appendMessage('assistant', '', true);
      const contentDiv = assistantMsg.querySelector('.ai-msg-content');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          // Handle tool_applied events
          if (line.startsWith('event: tool_applied')) continue;
          if (line.startsWith('data: ') && line.includes('"type"')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              if (eventData.type === 'roadmapCreated' || eventData.type === 'itemCreated') {
                appendToolNotification(eventData.title || eventData.type);
                window.dispatchEvent(new CustomEvent('roadmapCreated', { detail: eventData }));
              }
            } catch (e) { /* ignore */ }
            continue;
          }

          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              // Show the error message in the chat bubble
              contentDiv.innerHTML = `<span style="color:#ef4444;">⚠️ ${escapeHtml(parsed.error)}</span>`;
              hasError = true;
              break;
            }
            if (parsed.text) {
              fullText += parsed.text;
              contentDiv.innerHTML = formatAIText(fullText);
              scrollToBottom();
            }
          } catch (e) { /* ignore partial chunks */ }
        }
      }

      // If no text was streamed and no error was shown, display a fallback
      if (!fullText && !hasError) {
        contentDiv.innerHTML = '<span style="color:#94a3b8;">No response received. Try again.</span>';
      }
    } catch (err) {
      removeTyping(typingDiv);
      appendMessage('assistant', '⚠️ ' + (err.message || 'Something went wrong. Please try again.'));
    }

    isStreaming = false;
    document.getElementById('ai-panel-send').disabled = false;
    textarea.focus();
  }

  // ─── Message Helpers ────────────────────────────────────────────────────────
  function appendMessage(role, content, isLive = false) {
    const container = document.getElementById('ai-panel-messages');
    const msg = document.createElement('div');
    msg.className = `ai-msg ${role}`;

    const avatar = role === 'assistant' ? '🧠' : '👤';
    msg.innerHTML = `
      <div class="ai-msg-avatar">${avatar}</div>
      <div class="ai-msg-content">${isLive ? '' : formatAIText(content)}</div>
    `;
    container.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function appendTypingIndicator() {
    const container = document.getElementById('ai-panel-messages');
    const typing = document.createElement('div');
    typing.className = 'ai-msg assistant';
    typing.id = 'ai-typing';
    typing.innerHTML = `
      <div class="ai-msg-avatar">🧠</div>
      <div class="ai-msg-content">
        <div class="ai-typing-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    container.appendChild(typing);
    scrollToBottom();
    return typing;
  }

  function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function appendToolNotification(title) {
    const container = document.getElementById('ai-panel-messages');
    const notif = document.createElement('div');
    notif.className = 'ai-tool-notification';
    notif.innerHTML = `<span>✅</span><span>Created: <strong>${escapeHtml(title)}</strong></span>`;
    container.appendChild(notif);
    scrollToBottom();
  }

  function scrollToBottom() {
    const container = document.getElementById('ai-panel-messages');
    if (container) container.scrollTop = container.scrollHeight;
  }

  function formatAIText(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(102,126,234,0.1);padding:2px 6px;border-radius:4px;font-size:13px;">$1</code>');
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  // ─── Load Chat History ─────────────────────────────────────────────────────
  let historyLoaded = false;

  async function loadChatHistory() {
    if (historyLoaded) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch('/api/ai/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const container = document.getElementById('ai-panel-messages');
        // Keep the welcome message, add history after it
        data.data.forEach(msg => {
          appendMessage(msg.role, msg.content);
        });
        scrollToBottom();
        // Hide quick actions since there's existing conversation
        const qa = document.getElementById('ai-quick-actions');
        if (qa) qa.style.display = 'none';
      }
      historyLoaded = true;
    } catch (e) {
      console.warn('Failed to load chat history:', e.message);
    }
  }

  // ─── Clear History ──────────────────────────────────────────────────────────
  async function clearHistory() {
    if (!confirm('Clear your AI chat history?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await fetch('/api/ai/history', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) { /* ignore */ }

    historyLoaded = false;
    const container = document.getElementById('ai-panel-messages');
    container.innerHTML = `
      <div class="ai-msg assistant">
        <div class="ai-msg-avatar">🧠</div>
        <div class="ai-msg-content">Chat cleared! What would you like to work on?</div>
      </div>
    `;
    const qa = document.getElementById('ai-quick-actions');
    if (qa) qa.style.display = 'flex';
  }

  // ─── Initialize ─────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose toggle globally for any page
  window.toggleBraineXAI = togglePanel;
})();
