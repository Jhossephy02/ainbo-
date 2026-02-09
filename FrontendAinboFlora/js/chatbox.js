document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const chatIcon = document.getElementById('chatIcon');
    const chatContainer = document.getElementById('chatContainer');
    const closeChat = document.getElementById('closeChat');
    const userMessage = document.getElementById('userMessage');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const notificationBadge = document.querySelector('.notification-badge');
    
    // Mostrar/ocultar chat
    chatIcon.addEventListener('click', function() {
        chatContainer.classList.add('visible');
        notificationBadge.style.display = 'none';
    });
    
    closeChat.addEventListener('click', function() {
        chatContainer.classList.remove('visible');
    });
    
    // Enviar mensaje
    function sendMessageHandler() {
        const messageText = userMessage.value.trim();
        if (messageText !== '') {
            // Agregar mensaje del usuario
            addMessage(messageText, 'sent');
            userMessage.value = '';
            
            // Simular respuesta del bot después de un retraso
            setTimeout(() => {
                const responses = [
                    "Gracias por tu mensaje. ¿Cómo puedo ayudarte?",
                    "Interesante, ¿puedes darme más detalles?",
                    "Estoy procesando tu solicitud...",
                    "¿Hay algo más en lo que pueda ayudarte?",
                    "Voy a verificar eso por ti."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, 'received');
            }, 1000 + Math.random() * 2000);
        }
    }
    
    // Enviar al hacer clic o presionar Enter
    sendMessage.addEventListener('click', sendMessageHandler);
    userMessage.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessageHandler();
        }
    });
    
    // Función para agregar mensajes
    function addMessage(text, type) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${timeString}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Mostrar notificación si el chat está cerrado
        if (!chatContainer.classList.contains('visible') && type === 'received') {
            notificationBadge.style.display = 'flex';
        }
    }
    
    // Simular mensaje inicial después de 5 segundos
    setTimeout(() => {
        if (!chatContainer.classList.contains('visible')) {
            notificationBadge.style.display = 'flex';
        }
    }, 5000);
  });