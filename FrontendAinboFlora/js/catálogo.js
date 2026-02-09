function mostrarDetalles(titulo, descripcion, precio) {
    document.getElementById("modal-title").innerText = titulo;
    document.getElementById("modal-description").innerText = descripcion;
    document.getElementById("modal-price").innerText = precio;
    document.getElementById("modal").style.display = "block";
  }
  
  function cerrarModal() {
    document.getElementById("modal").style.display = "none";
  }
  

  



  