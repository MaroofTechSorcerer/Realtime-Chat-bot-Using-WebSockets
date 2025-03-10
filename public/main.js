const socket = io();

const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');
const messageTone = new Audio('/message-tone.mp3');

document.getElementById('dark-mode-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});


let hasFocused = false;
nameInput.addEventListener('focus', () => {
  if (!hasFocused && nameInput.value === 'Enter name') {
    nameInput.value = ''; 
    hasFocused = true; 
  }
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

function sendMessage() {
  if (messageInput.value === '') return;
  const data = {
    name: nameInput.value || 'Anonymous',
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit('message', data);
  addMessageToUI(true, data);
  messageInput.value = '';
}


let typingTimeout;
messageInput.addEventListener('input', () => {
  socket.emit('typing', true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', false);
  }, 1000);
});

socket.on('chat-message', (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

socket.on('typing', (isTyping) => {
  typingIndicator.style.display = isTyping ? 'flex' : 'none';
  if (isTyping) {
    scrollToBottom();
  }
});

function addMessageToUI(isOwnMessage, data) {
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `;
  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}