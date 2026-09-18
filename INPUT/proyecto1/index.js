const cardsContainer = document.getElementById("galeria");

function createCard(destino) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img class="card-img" src="${destino.imagen}" alt="${destino.nombre}">
    <div class="card-body">
      <span class="card-badge">${destino.tipo}</span>
      <h2 class="card-nombre">${destino.nombre}</h2>
      <p class="card-meta">
        <span class="pill pill-pais">${destino.pais}</span>
        <span class="pill pill-continente">${destino.continente}</span>
        <span class="pill pill-idioma">${destino.idioma}</span>
      </p>
      <p class="card-descripcion">${destino.descripcion}</p>
      <ul class="card-caracteristicas">
        ${destino.caracteristicas.map((c) => `<li>${c}</li>`).join("")}
      </ul>
      <p class="card-calificacion">Calificación: <span>${destino.calificacion}</span></p>
      <p class="card-recomendado">Estado: <span>${destino.recomendado ? "Recomendado" : "No recomendado"}</span></p>
    </div>
  `;

  return card;
}

destinos = obtenerDestinos();

destinos.forEach((destino) => {
  cardsContainer.appendChild(createCard(destino));
});

document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
