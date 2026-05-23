const sessionId = 'session-' + Math.random().toString(36).slice(2);

//MODE SWITCHING
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.mode).classList.add('active');
  });
});

//CHAT
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const clearChatBtn = document.getElementById('clear-chat');

function addMessage(text, role) {
  const welcome = chatMessages.querySelector('.welcome');
  if (welcome) welcome.remove();

  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;

  const meta = document.createElement('div');
  meta.className = 'msg-meta';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'user' ? 'U' : 'AI';

  const name = document.createElement('span');
  name.className = 'msg-name';
  name.textContent = role === 'user' ? 'You' : 'IntelliChat';

  if (role === 'user') {
    meta.appendChild(name);
    meta.appendChild(avatar);
  } else {
    meta.appendChild(avatar);
    meta.appendChild(name);
  }

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;

  wrap.appendChild(meta);
  wrap.appendChild(bubble);
  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

function addThinking() {
  const welcome = chatMessages.querySelector('.welcome');
  if (welcome) welcome.remove();

  const wrap = document.createElement('div');
  wrap.className = 'msg bot';
  wrap.id = 'thinking-bubble';

  const meta = document.createElement('div');
  meta.className = 'msg-meta';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = 'AI';

  const name = document.createElement('span');
  name.className = 'msg-name';
  name.textContent = 'IntelliChat';

  meta.appendChild(avatar);
  meta.appendChild(name);

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';

  wrap.appendChild(meta);
  wrap.appendChild(bubble);
  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeThinking() {
  const el = document.getElementById('thinking-bubble');
  if (el) el.remove();
}

async function sendChat() {
  const message = chatInput.value.trim();
  if (!message) return;

  chatInput.value = '';
  chatInput.style.height = 'auto';
  addMessage(message, 'user');
  addThinking();
  chatSend.disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });
    const data = await res.json();
    removeThinking();
    addMessage(data.reply || data.error, 'bot');
  } catch {
    removeThinking();
    addMessage('Network error. Please try again.', 'bot');
  } finally {
    chatSend.disabled = false;
    chatInput.focus();
  }
}

chatSend.addEventListener('click', sendChat);

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
});

chatInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 140) + 'px';
});

clearChatBtn.addEventListener('click', () => {
  chatMessages.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#wGrad2)"/><path d="M8 12h8M12 8v8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="wGrad2" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs></svg>
      </div>
      <h1>Hello, I'm IntelliChat</h1>
      <p>Your intelligent AI assistant. Ask me anything — I remember context throughout our conversation.</p>
      <div class="welcome-chips">
        <button class="chip" data-msg="Explain quantum computing">Explain quantum computing</button>
        <button class="chip" data-msg="Write a Python function">Write a Python function</button>
        <button class="chip" data-msg="What's the latest in AI?">What's the latest in AI?</button>
      </div>
    </div>`;
});

// Chat chips — use event delegation so it works after clear too
document.addEventListener('click', e => {
  if (e.target.classList.contains('chip')) {
    chatInput.value = e.target.dataset.msg;
    chatInput.dispatchEvent(new Event('input'));
    sendChat();
  }
});

//IMAGE ANALYZE 
const dropZone = document.getElementById('drop-zone');
const imageFile = document.getElementById('image-file');
const imagePreview = document.getElementById('image-preview');
const previewWrap = document.getElementById('preview-wrap');
const analyzePrompt = document.getElementById('analyze-prompt');
const analyzeBtn = document.getElementById('analyze-btn');
const analyzeResult = document.getElementById('analyze-result');
const analyzeResultText = document.getElementById('analyze-result-text');
const clearImageBtn = document.getElementById('clear-image');

let selectedFile = null;

dropZone.addEventListener('click', () => imageFile.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) setPreview(file);
});

imageFile.addEventListener('change', () => {
  if (imageFile.files[0]) setPreview(imageFile.files[0]);
});

function setPreview(file) {
  selectedFile = file;
  const url = URL.createObjectURL(file);
  imagePreview.src = url;
  previewWrap.hidden = false;
  dropZone.hidden = true;
  analyzeResult.hidden = true;
}

clearImageBtn.addEventListener('click', () => {
  selectedFile = null;
  imagePreview.src = '';
  previewWrap.hidden = true;
  dropZone.hidden = false;
  analyzeResult.hidden = true;
  analyzeResultText.textContent = '';
  imageFile.value = '';
});

analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return alert('Please upload an image first.');

  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<span class="spinner-inline"></span> Analyzing...';
  analyzeResult.hidden = true;

  const formData = new FormData();
  formData.append('image', selectedFile);
  formData.append('prompt', analyzePrompt.value || 'Describe this image in detail.');

  try {
    const res = await fetch('/api/analyze', { method: 'POST', body: formData });
    const data = await res.json();
    analyzeResultText.textContent = data.reply || data.error;
    analyzeResult.hidden = false;
    analyzeResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch {
    analyzeResultText.textContent = 'Analysis failed. Please try again.';
    analyzeResult.hidden = false;
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> Analyze Image`;
  }
});

//  IMAGE GENERATE 
const genPrompt = document.getElementById('gen-prompt');
const genBtn = document.getElementById('gen-btn');
const genResult = document.getElementById('gen-result');
const genImage = document.getElementById('gen-image');
const genLoading = document.getElementById('gen-loading');
const genDownload = document.getElementById('gen-download');

// Generate chips — event delegation
document.querySelectorAll('.example-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    genPrompt.value = chip.dataset.prompt;
    genPrompt.focus();
  });
});

genBtn.addEventListener('click', async () => {
  const prompt = genPrompt.value.trim();
  if (!prompt) return alert('Please enter a prompt.');

  genBtn.disabled = true;
  genBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg> Generating...`;
  genResult.hidden = true;
  genLoading.hidden = false;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    genLoading.hidden = true;

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Generation failed.');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    genImage.src = url;
    genDownload.href = url;
    genResult.hidden = false;
    genResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch {
    genLoading.hidden = true;
    alert('Network error. Please try again.');
  } finally {
    genBtn.disabled = false;
    genBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg> Generate Image`;
  }
});
