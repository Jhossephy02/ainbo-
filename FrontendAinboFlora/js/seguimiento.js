// === CONFIGURACIÓN DE UBICACIONES Y DISTANCIAS ===
const ubicaciones = {
  "Ucayali": {
    "Coronel Portillo": {
      "Pucallpa": 0,
      "Yarinacocha": 871,
      "Callería": 1198
    },
    "Padre Abad": {
      "Aguaytía": 709,
      "Boquerón": 753
    }
  },
  "Lima": {
    "Lima": {
      "Miraflores": 479,
      "San Isidro": 1451,
      "Surco": 1266,
      "La Molina": 767
    },
    "Huaral": {
      "Huaral": 1331,
      "Chancay": 1256,
      "Aucallama": 1017
    }
  },
  "Cusco": {
    "Cusco": {
      "Cusco": 856,
      "San Sebastián": 1002,
      "San Jerónimo": 847
    },
    "Urubamba": {
      "Urubamba": 735,
      "Ollantaytambo": 1333
    }
  },
  "Arequipa": {
    "Arequipa": {
      "Cayma": 1220,
      "Cercado": 967,
      "Yanahuara": 796
    },
    "Camana": {
      "Camana": 1278,
      "Mariscal Caceres": 447
    }
  }
};

const btnNacional = document.getElementById('btn-nacional');
const btnInternacional = document.getElementById('btn-internacional');
const envioNacional = document.getElementById('envio-nacional');
const envioInternacional = document.getElementById('envio-internacional');

btnNacional.addEventListener('click', function() {
  btnNacional.classList.add('active');
  btnInternacional.classList.remove('active');
  envioNacional.style.display = 'block';
  envioInternacional.style.display = 'none';
  document.getElementById('form-internacional').classList.add('hidden'); // Ocultar campos internacionales
});

btnInternacional.addEventListener('click', function() {
  btnInternacional.classList.add('active');
  btnNacional.classList.remove('active');
  envioNacional.style.display = 'none';
  envioInternacional.style.display = 'block';
  document.getElementById('form-internacional').classList.remove('hidden'); // Mostrar campos internacionales
});

// Inicialmente mostramos nacional
envioNacional.style.display = 'block';
envioInternacional.style.display = 'none';


function populateSelect(select, options) {
  select.innerHTML = '<option disabled selected>Selecciona una opción</option>';
  Object.keys(options).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    select.appendChild(option);
  });
  select.disabled = false;
}

function isInternational() {
  return document.getElementById('btn-internacional').classList.contains('active');
}

function formatCurrency(value) {
  return isInternational() ? `$${value.toFixed(2)} USD` : `$ ${value.toFixed(2)}`;
}

function actualizarPrecioFinal() {
  const base = parseFloat(priceInput.value) || 0;
  const protection = parseFloat(protectionInput.value) || 0;
  const total = base + protection;
  totalPriceDisplay.textContent = formatCurrency(total);
}

depSelect.addEventListener("change", () => {
  const provs = ubicaciones[depSelect.value];
  populateSelect(provSelect, provs);
  distSelect.disabled = true;
  distSelect.innerHTML = '<option disabled selected>Selecciona un distrito</option>';
});

provSelect.addEventListener("change", () => {
  const dists = ubicaciones[depSelect.value][provSelect.value];
  populateSelect(distSelect, dists);
});

distSelect.addEventListener("change", () => {
  const km = ubicaciones[depSelect.value][provSelect.value][distSelect.value];
  const nuevoPrecio = 5 + (km * 0.05);
  priceInput.value = nuevoPrecio.toFixed(2);
  actualizarPrecioFinal();
});

protectionInput.addEventListener("change", actualizarPrecioFinal);

document.querySelectorAll(".toggle").forEach(button => {
  button.addEventListener("click", actualizarPrecioFinal);
});

document.getElementById("shippingForm").addEventListener("submit", function (e) {
  e.preventDefault();
  actualizarPrecioFinal();
});

populateSelect(depSelect, ubicaciones);

document.querySelectorAll('.toggle-group button').forEach(button => {
  button.addEventListener('click', () => {
    const group = button.parentElement;
    group.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    if (button.dataset.target) {
      document.querySelectorAll('.form-section').forEach(sec => sec.classList.add('hidden'));
      document.getElementById('form-' + button.dataset.target).classList.remove('hidden');
    }

    if (button.id === 'prioridad') {
      document.getElementById('seguridad').classList.remove('hidden');
      updateCost(1.10);
    } else if (button.id === 'economico') {
      document.getElementById('seguridad').classList.add('hidden');
      updateCost(1.00);
    }
  });
});

document.getElementById('ruleType').addEventListener('change', e => {
  const container = document.getElementById('dynamicFields');
  const value = e.target.value;
  container.innerHTML = '';

  if (value === 'precio') {
    container.innerHTML = `
      <label>Ingrese el precio</label>
      <input type="number" id="precioInput" placeholder="Precio base">
      <button type="button" onclick="editarPrecio()">✏️ Editar</button>
    `;
  } else if (value === 'producto') {
    container.innerHTML = `
      <label>Precio del producto</label>
      <input type="number" id="precioInput" value="100" disabled>
      <button type="button" onclick="editarPrecio()">✏️ Editar</button>
    `;
  }
});

function editarPrecio() {
  const precioInput = document.getElementById('precioInput');
  precioInput.disabled = false;
  precioInput.focus();
}

function updateCost(mult = 1.00) {
  const precioInput = document.getElementById('precioInput');
  if (!precioInput) return;
  const base = parseFloat(precioInput.value) || 0;
  const total = base * mult;
  document.getElementById('shippingCost').textContent = `S/${total.toFixed(2)} PEN`;
}

document.addEventListener('input', e => {
  if (e.target.id === 'precioInput') {
    const isPrioridad = document.getElementById('prioridad').classList.contains('active');
    updateCost(isPrioridad ? 1.10 : 1.00);
  }
});


function irACheckout() {
    window.location.href = "../../checkout_pago_funcional/check.html";
}

function actualizarCamposPorTipoEnvio() {
    const tipoEnvio = document.querySelector('input[name="tipo-envio"]:checked');
    const camposNacionales = ['departamento', 'provincia', 'distrito'];

    camposNacionales.forEach(id => {
        const campo = document.getElementById(id + '-grupo');
        if (campo) {
            campo.style.display = (tipoEnvio && tipoEnvio.value === 'internacional') ? 'none' : 'block';
        }
    });
}

// Llamar al cambiar el tipo de envío
document.querySelectorAll('input[name="tipo-envio"]').forEach(radio => {
    radio.addEventListener('change', actualizarCamposPorTipoEnvio);
});

// Llamar al cargar la página también
document.addEventListener('DOMContentLoaded', actualizarCamposPorTipoEnvio);

function guardarDatos() {
  // Aquí podrías guardar en servidor, localStorage o simplemente mostrar mensaje.
  alert('Datos guardados correctamente ✅');
}

