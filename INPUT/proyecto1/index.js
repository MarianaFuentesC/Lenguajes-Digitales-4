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

function renderizarObjetos(listaObjetos) {
  cardsContainer.innerHTML = "";
  listaObjetos.forEach((objeto) => {
    cardsContainer.appendChild(createCard(objeto));
  });
}

const destinos = obtenerDestinos();

renderizarObjetos(destinos);

const filtroIdioma = document.getElementById("filtro-idioma");

const idiomas = [...new Set(destinos.map((destino) => destino.idioma))].sort();
idiomas.forEach((idioma) => {
  const opcion = document.createElement("option");
  opcion.value = idioma;
  opcion.textContent = idioma;
  filtroIdioma.appendChild(opcion);
});

const filtroCalificacion = document.getElementById("filtro-calificacion");
const valorCalificacion = document.getElementById("valor-calificacion");

const calificaciones = destinos.map((destino) => destino.calificacion);
filtroCalificacion.min = Math.min(...calificaciones);
filtroCalificacion.max = Math.max(...calificaciones);
filtroCalificacion.value = filtroCalificacion.min;
valorCalificacion.textContent = filtroCalificacion.value;

const filtroContinentes = document.getElementById("filtro-continentes");
let continenteElegido = "todos";

const continentes = [...new Set(destinos.map((destino) => destino.continente))].sort();
["todos", ...continentes].forEach((continente) => {
  const boton = document.createElement("button");
  boton.className = "btn-continente";
  boton.dataset.continente = continente;
  boton.textContent = continente === "todos" ? "Todos" : continente;
  if (continente === continenteElegido) {
    boton.classList.add("active");
  }
  filtroContinentes.appendChild(boton);
});

filtroContinentes.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".btn-continente");
  if (!boton) return;

  continenteElegido = boton.dataset.continente;
  filtroContinentes.querySelectorAll(".btn-continente").forEach((b) => {
    b.classList.toggle("active", b === boton);
  });
  aplicarFiltros();
});

function aplicarFiltros() {
  const idiomaElegido = filtroIdioma.value;
  const calificacionMinima = Number(filtroCalificacion.value);

  const filtrados = destinos.filter((destino) => {
    const cumpleIdioma = idiomaElegido === "todos" || destino.idioma === idiomaElegido;
    const cumpleContinente = continenteElegido === "todos" || destino.continente === continenteElegido;
    const cumpleCalificacion = destino.calificacion >= calificacionMinima;
    return cumpleIdioma && cumpleContinente && cumpleCalificacion;
  });

  renderizarObjetos(filtrados);
}

filtroIdioma.addEventListener("change", aplicarFiltros);

filtroCalificacion.addEventListener("input", () => {
  valorCalificacion.textContent = filtroCalificacion.value;
  aplicarFiltros();
});

document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
