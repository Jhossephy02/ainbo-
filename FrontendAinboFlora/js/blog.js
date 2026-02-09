document.addEventListener('DOMContentLoaded', function() {
    // Botón para ir arriba
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Formulario de newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        
        // Validación simple
        if (emailInput.value.trim() === '') {
            alert('Por favor ingresa tu correo electrónico');
            return;
        }
        
        // Simulación de envío
        alert('¡Gracias por suscribirte! Pronto recibirás nuestros consejos de jardinería.');
        emailInput.value = '';
        
        // Aquí normalmente harías una petición AJAX para guardar el email
    });
    
    // Efecto de animación al cargar
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Cambiar color de navbar al hacer scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // Tooltips para iconos sociales
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});