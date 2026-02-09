const reviews = [
    {
      nombre: "Kenni",
      texto: "Recomendado, me ayudaron en todo. Tenía temor de que la planta no se adaptara.",
      estrellas: 5,
      imagen: "image/aaron campana.jpg",
      titulo: "Muy hermosa"
    },
    {
      nombre: "Edgar",
      texto: "Es una planta hermosa. Más grande de lo que imaginé.",
      estrellas: 5,
      imagen: "image/Flor en 4k.jpg",
      titulo: "Muy bueno"
    },
    {
      nombre: "Lee",
      texto: "Es la segunda que compré, siempre me da tranquilidad comprar aquí.",
      estrellas: 5,
      imagen: "image/verdes.jpg",
      titulo: "Absolutamente amo"
    },
    {
      nombre: "Magenta",
      texto: "Llegó súper rápido. Se ve más linda en persona.",
      estrellas: 5,
      imagen: "image/Flor en 4k.jpg",
      titulo: "Perfecta"
    },
    {
      nombre: "Terry",
      texto: "¡Mi rincón favorito ahora es más verde! Gracias.",
      estrellas: 5,
      imagen: "image/verdes.jpg",
      titulo: "Encantadora"
    }
  ];
  
  let currentIndex = 0;
  const reviewsPerPage = 3;
  
  function mostrarReseñas() {
    const container = document.getElementById("carousel");
    container.innerHTML = "";
  
    for (let i = 0; i < reviewsPerPage; i++) {
      const index = (currentIndex + i) % reviews.length;
      const r = reviews[index];
  
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <img src="${r.imagen}" alt="Reseña de ${r.nombre}">
        <h3>⭐️⭐️⭐️⭐️⭐️</h3>
        <p><strong>${r.titulo}</strong></p>
        <p>${r.texto}</p>
        <p class="author">${r.nombre}</p>
      `;
      container.appendChild(card);
    }
  }
  
  function nextReview() {
    currentIndex = (currentIndex + 1) % reviews.length;
    mostrarReseñas();
  }
  
  function prevReview() {
    currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
    mostrarReseñas();
  }
  
  // Auto-rotate
  setInterval(() => {
    nextReview();
  }, 4000);
  
  window.onload = mostrarReseñas;
  