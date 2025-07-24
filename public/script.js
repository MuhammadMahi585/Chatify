const chatBox = document.getElementById('chatBox');
const input = document.getElementById('questionInput');

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

async function askGemini() {
  const question = input.value;
  if (!question.trim()) return;

  addMessage(question, 'user');
  input.value = '';

  try {
    const res = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    addMessage(data.reply, 'bot');
  } catch (err) {
    addMessage('⚠️ Error contacting server.', 'bot');
  }
}

// Load chat history
window.onload = () => {
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  history.forEach(m => addMessage(m.text, m.sender));
};

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    askGemini();
  };
  recognition.start();
}
