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
    async function sendMessageHandler() {
        const messageText = userMessage.value.trim();
        if (messageText !== '') {
            // Agregar mensaje del usuario
            addMessage(messageText, 'sent');
            userMessage.value = '';
            
            // Respuesta inteligente según ambiente
            try {
                const host = window.location.hostname || 'localhost';
                const API_BASE = window.AINBO_API || `http://${host}:3000/api`;
                const ambiente = messageText.toLowerCase();
                let filtro = '';
                if (ambiente.includes('sala') || ambiente.includes('interior')) filtro = 'Plantas';
                else if (ambiente.includes('balcón') || ambiente.includes('exterior') || ambiente.includes('jardín')) filtro = 'Plantas';
                else if (ambiente.includes('oficina')) filtro = 'Plantas';
                const resp = await fetch(`${API_BASE}/productos`);
                const j = await resp.json();
                const all = (j && j.success && Array.isArray(j.data)) ? j.data : [];
                const candidatos = all.filter(p => String(p.Categoria||'').toLowerCase().includes(String(filtro||'').toLowerCase()));
                const picks = candidatos.slice(0,3).map(p => `• ${p.Nombre} (S/. ${Number(p.Precio||0).toFixed(2)})`).join('<br>');
                const texto = picks ? `Según tu espacio, te recomiendo:<br>${picks}` : 'Gracias por tu mensaje. ¿Puedes indicar si es interior, balcón u oficina?';
                addMessage(texto, 'received');
            } catch {
                addMessage("Gracias por tu mensaje. ¿Cómo puedo ayudarte?", 'received');
            }
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
