document.addEventListener('DOMContentLoaded', function() {
    const API_URL = window.location.origin;
    let selectedImage = null;

    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const imageInput = document.getElementById('image-input');
    const imageUploadArea = document.getElementById('image-upload-area');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const imageQuestion = document.getElementById('image-question');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analysisResult = document.getElementById('analysis-result');
    const generationPrompt = document.getElementById('generation-prompt');
    const generateBtn = document.getElementById('generate-btn');
    const generationResult = document.getElementById('generation-result');
    const generatedImage = document.getElementById('generated-image');
    const downloadBtn = document.getElementById('download-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');

    console.log('🚀 Elements loaded:', {
        chatInput: !!chatInput,
        chatSendBtn: !!chatSendBtn,
        chatMessages: !!chatMessages
    });

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Chat
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        console.log('📤 Sending:', message);

        addMessageToChat('user', message);
        chatInput.value = '';
        showLoading('Thinking...');

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            console.log('📥 Status:', response.status);

            const data = await response.json();
            console.log('📥 Data:', data);

            hideLoading();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            if (data.success && data.message) {
                console.log('✅ Adding AI response');
                addMessageToChat('bot', data.message);
            } else {
                addMessageToChat('bot', 'No response received');
            }

        } catch (error) {
            console.error('❌ Chat error:', error);
            addMessageToChat('bot', `Error: ${error.message}`);
            hideLoading();
        }
    }

    function addMessageToChat(sender, text) {
        console.log(`💬 Adding ${sender} message`);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const senderLabel = document.createElement('strong');
        senderLabel.textContent = sender === 'user' ? 'You:' : 'AI:';
        
        const messageText = document.createElement('p');
        messageText.textContent = text;
        messageText.style.margin = '0';
        messageText.style.whiteSpace = 'pre-wrap';
        
        contentDiv.appendChild(senderLabel);
        contentDiv.appendChild(messageText);
        messageDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        console.log('✅ Message added to DOM');
    }

    // Image Upload
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Maximum 5MB.');
            return;
        }

        selectedImage = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imageUploadArea.style.display = 'none';
            imagePreviewContainer.style.display = 'block';
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            selectedImage = null;
            imageInput.value = '';
            imagePreview.src = '';
            imagePreviewContainer.style.display = 'none';
            imageUploadArea.style.display = 'block';
            analyzeBtn.disabled = true;
            analysisResult.style.display = 'none';
        });
    }

    // Image Analysis
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            if (!selectedImage) return;

            showLoading('Analyzing image...');

            try {
                const formData = new FormData();
                formData.append('image', selectedImage);
                formData.append('question', imageQuestion.value);

                const response = await fetch(`${API_URL}/api/image/analyze`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to analyze');
                }

                analysisResult.style.display = 'block';
                analysisResult.querySelector('.result-content').textContent = data.analysis;
                analysisResult.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                console.error('Analysis error:', error);
                alert(`Error: ${error.message}`);
            } finally {
                hideLoading();
            }
        });
    }

    // Image Generation
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const prompt = generationPrompt.value.trim();
            if (!prompt) {
                alert('Please enter a description');
                return;
            }

            showLoading('Generating image... This may take 20-30 seconds...');

            try {
                const response = await fetch(`${API_URL}/api/generate/image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to generate');
                }

                generatedImage.src = data.imageUrl;
                generationResult.style.display = 'block';
                generationResult.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                console.error('Generation error:', error);
                alert(`Error: ${error.message}`);
            } finally {
                hideLoading();
            }
        });
    }

    // Download
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = generatedImage.src;
            link.download = `ai-generated-${Date.now()}.jpg`;
            link.click();
        });
    }

    // Loading
    function showLoading(message = 'Processing...') {
        if (loadingText) loadingText.textContent = message;
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }

    console.log('✅ IntelliChat AI initialized!');
});