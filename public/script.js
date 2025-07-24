const chatBox = document.getElementById('chatBox');
const input = document.getElementById('questionInput');
const micBtn = document.getElementById('micBtn');

// Add message to UI and localStorage
function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.innerHTML = `
    ${sender === 'bot' ? '<img src="https://i.ibb.co/0fHLK6S/bot.png" class="avatar">' : ''}
    <div class="${sender}">${text}</div>
    ${sender === 'user' ? '<img src="https://i.ibb.co/tZfhBtN/user.png" class="avatar">' : ''}
  `;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Save to localStorage
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  history.push({ text, sender });
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

// Send question to Gemini backend
async function askGemini() {
  const question = input.value.trim();
  if (!question) return;

  addMessage(question, 'user');
  input.value = '';

  try {
    const res = await fetch('/api/gemini', {  // If using server.js locally, change to '/ask'
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!res.ok) throw new Error('Server error');

    const data = await res.json();
    addMessage(data.reply, 'bot');
  } catch (err) {
    addMessage('⚠️ Error contacting server.', 'bot');
  }
}

// Load previous chat
window.onload = () => {
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  history.forEach(m => addMessage(m.text, m.sender));
};

// Voice input using Web Speech API
function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Voice recognition not supported in this browser.');
    return;
  }

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    askGemini();
  };

  recognition.onerror = err => {
    console.error('Speech recognition error:', err);
    addMessage('🎤 Voice input error. Please try again.', 'bot');
  };

  recognition.start();
}

// Optional: Bind mic icon if you have one
if (micBtn) {
  micBtn.addEventListener('click', startVoiceInput);
}
