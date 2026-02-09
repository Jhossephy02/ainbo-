const form = document.getElementById('alert-form');
const alertsContainer = document.getElementById('alerts-container');

// Mostrar alertas guardadas al cargar
document.addEventListener('DOMContentLoaded', mostrarAlertas);

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const plantName = document.getElementById('plant-name').value;
  const careType = document.getElementById('care-type').value;
  const alertDate = document.getElementById('alert-date').value;

  const alerta = {
    plantName,
    careType,
    alertDate
  };

  guardarAlerta(alerta);
  mostrarToast("¡Alerta guardada exitosamente!");
  form.reset();
  mostrarAlertas();
});

function guardarAlerta(alerta) {
  let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
  alertas.push(alerta);
  localStorage.setItem('alertas', JSON.stringify(alertas));
}

function mostrarAlertas() {
  const alertas = JSON.parse(localStorage.getItem('alertas')) || [];
  alertsContainer.innerHTML = '';

  alertas.forEach((alerta, index) => {
    const card = document.createElement('div');
    card.className = 'alert-card';
    card.innerHTML = `
      <strong>${alerta.plantName}</strong> - ${alerta.careType}<br>
      📅 Fecha: ${alerta.alertDate}
      <button class="delete-btn" onclick="eliminarAlerta(${index})">X</button>
    `;
    alertsContainer.appendChild(card);
  });
}

function eliminarAlerta(index) {
  let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
  alertas.splice(index, 1);
  localStorage.setItem('alertas', JSON.stringify(alertas));
  mostrarToast("¡Alerta eliminada!");
  mostrarAlertas();
}

function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.className = "toast show";

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}
