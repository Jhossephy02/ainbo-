const plantForm = document.getElementById("plantForm");
const cardsContainer = document.getElementById("cardsContainer");

plantForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("plantName").value.trim();
    const date = document.getElementById("plantDate").value;
    const note = document.getElementById("plantNote").value.trim();
    const image = document.getElementById("plantImage").value.trim() || "https://via.placeholder.com/200x150?text=Planta";

    if (!name || !date) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
        <img src="${image}" alt="Imagen de planta">
        <h3>${name}</h3>
        <p><strong>Fecha:</strong> ${date}</p>
        <p class="note">${note}</p>
        <button class="delete-btn">Eliminar</button>
    `;

    // Agregar evento para eliminar
    card.querySelector(".delete-btn").addEventListener("click", () => {
        card.remove();
    });

    cardsContainer.appendChild(card);
    plantForm.reset();
});
