document.addEventListener('DOMContentLoaded', function() {
    const ratingStars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');
    const commentForm = document.getElementById('commentForm');
    const commentsList = document.getElementById('commentsList');
    
    // Manejar la selección de estrellas
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingValue.value = rating;
            
            // Actualizar la visualización de estrellas
            ratingStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        // Efecto hover
        star.addEventListener('mouseover', function() {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            ratingStars.forEach((s, index) => {
                if (index < hoverRating) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            ratingStars.forEach(s => s.classList.remove('hover'));
        });
    });
    
    // Manejar el envío del formulario
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userName = document.getElementById('userName').value;
        const commentText = document.getElementById('commentText').value;
        const rating = ratingValue.value;
        
        if (rating === "0") {
            alert('Por favor selecciona una calificación');
            return;
        }
        
        // Crear nuevo comentario
        addComment(userName, commentText, rating);
        
        // Resetear formulario
        commentForm.reset();
        ratingStars.forEach(star => star.classList.remove('active'));
        ratingValue.value = "0";
    });
    
    // Función para agregar comentarios
    function addComment(name, text, rating) {
        const now = new Date();
        const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const commentCard = document.createElement('div');
        commentCard.className = 'comment-card';
        commentCard.innerHTML = `
            <div class="comment-header">
                <h5>${name}</h5>
                <div class="user-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(rating)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - rating)}
                </div>
            </div>
            <p>${text}</p>
            <div class="comment-date">${dateString}</div>
        `;
        
        // Agregar al principio de la lista
        commentsList.insertBefore(commentCard, commentsList.firstChild);
    }
    
});