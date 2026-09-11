let heroes = [
  {
    nombre: "Spider-Man",
    poder: ["Sentido Aracnido", "Trepar paredes", "Telarañas", "Sentidos aumentados"],
    descripcion: "Peter Parker, estudiante de secundaria y niño prodigio, se sumergió en su pasión por la ciencia para evitar las burlas y amenazas de sus compañeros, y se adentró en un mundo que superaba su imaginación. Durante una visita a una exposición pública sobre los últimos avances en manipulación de radiación y genética, Parker sintió la picadura de una araña doméstica común expuesta a un haz de partículas y enfermó de inmediato, sin darse cuenta de cuánto cambiaría su vida en las horas siguientes.",
    bando: "heroe",
    imagen: "https://4kwallpapers.com/images/wallpapers/spider-man-brand-3840x2160-27093.jpg",
    edad: 18,
    altura: 1.78,
    universo: "Marvel",
    nivelDeFuerza: 85,
    activo: true,
  },
  {
    nombre: "Iron Man",
    poder: ["Traje de combate", "Inteligencia artificial", "Vuelo", "Repulsores"],
    descripcion: "Tony Stark, genio, millonario e ingeniero, construyó una armadura para escapar del cautiverio y desde entonces la ha perfeccionado para proteger al mundo como Iron Man.",
    bando: "heroe",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI5vlZVy9y6yGfsx3hazj3QHu8dd2Cbvz3p4tx8hDwtg&s=10",
    edad: 45,
    altura: 1.85,
    universo: "Marvel",
    nivelDeFuerza: 90,
    activo: true,
  },
  {
    nombre: "Batman",
    poder: ["Estrategia", "Artes marciales", "Gadgets", "Riqueza ilimitada"],
    descripcion: "Bruce Wayne presenció el asesinato de sus padres cuando era niño y juró dedicar su vida a combatir el crimen en Ciudad Gótica bajo la identidad de Batman.",
    bando: "heroe",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf8str3cxIO9A3WFk0GjEvnxSdwVbXbP5AL2gMaaMOcA&s=10",
    edad: 40,
    altura: 1.88,
    universo: "DC",
    nivelDeFuerza: 78,
    activo: true,
  },
  {
    nombre: "Wonder Woman",
    poder: ["Fuerza sobrehumana", "Lazo de la verdad", "Vuelo", "Inmortalidad"],
    descripcion: "Diana Prince, princesa amazona de Themyscira, dejó su isla para combatir la injusticia en el mundo de los hombres como Wonder Woman.",
    bando: "heroe",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_N-43Fc2ieV9c4A02CVAiD0LqWYOPYQxqJ374xDYCOQ&s=10",
    edad: 30,
    altura: 1.83,
    universo: "DC",
    nivelDeFuerza: 95,
    activo: true,
  },
  {
    nombre: "Superman",
    poder: ["Vuelo", "Superfuerza", "Visión de calor", "Invulnerabilidad"],
    descripcion: "Kal-El fue enviado desde Krypton a la Tierra siendo un bebé y creció como Clark Kent, convirtiéndose en el protector de Metrópolis conocido como Superman.",
    bando: "heroe",
    imagen: "https://placehold.co/400x300?text=Superman",
    edad: 35,
    altura: 1.9,
    universo: "DC",
    nivelDeFuerza: 99,
    activo: true,
  },
  {
    nombre: "Black Panther",
    poder: ["Fuerza mejorada", "Sigilo", "Traje de vibranium", "Garras retráctiles"],
    descripcion: "T'Challa, rey de Wakanda, protege a su nación y al mundo usando la fuerza que le otorga la hierba en forma de corazón y su traje de vibranium.",
    bando: "heroe",
    imagen: "https://placehold.co/400x300?text=Black+Panther",
    edad: 32,
    altura: 1.83,
    universo: "Marvel",
    nivelDeFuerza: 88,
    activo: true,
  },
  {
    nombre: "Flash",
    poder: ["Supervelocidad", "Regeneración acelerada", "Viaje en el tiempo"],
    descripcion: "Barry Allen fue alcanzado por un rayo mientras estaba rodeado de químicos y despertó con la capacidad de moverse a velocidades imposibles como Flash.",
    bando: "heroe",
    imagen: "https://placehold.co/400x300?text=Flash",
    edad: 28,
    altura: 1.8,
    universo: "DC",
    nivelDeFuerza: 82,
    activo: true,
  },
  {
    nombre: "Doctor Strange",
    poder: ["Manipulación de hechizos", "Viaje interdimensional", "Manto de levitación"],
    descripcion: "Stephen Strange, un cirujano brillante, perdió el uso de sus manos en un accidente y encontró en las artes místicas una nueva forma de proteger la realidad.",
    bando: "heroe",
    imagen: "https://placehold.co/400x300?text=Doctor+Strange",
    edad: 43,
    altura: 1.8,
    universo: "Marvel",
    nivelDeFuerza: 92,
    activo: true,
  },
  {
    nombre: "Wolverine",
    poder: ["Factor de curación", "Garras de adamantium", "Sentidos animales"],
    descripcion: "Logan es un mutante con un extraordinario factor de curación, cuyo esqueleto fue reforzado con adamantium, convirtiéndolo en una de las armas más letales de los X-Men.",
    bando: "heroe",
    imagen: "https://placehold.co/400x300?text=Wolverine",
    edad: 133,
    altura: 1.6,
    universo: "Marvel",
    nivelDeFuerza: 87,
    activo: true,
  },
  {
    nombre: "Joker",
    poder: ["Manipulación psicológica", "Impredecibilidad", "Estratega criminal"],
    descripcion: "Un criminal caído en un tanque de químicos que quedó con la piel blanca y una sonrisa permanente, convirtiéndose en el archienemigo caótico de Batman.",
    bando: "villano",
    imagen: "https://placehold.co/400x300?text=Joker",
    edad: 45,
    altura: 1.8,
    universo: "DC",
    nivelDeFuerza: 60,
    activo: true,
  },
  {
    nombre: "Thanos",
    poder: ["Fuerza titánica", "Guantelete del infinito", "Estratega intergaláctico"],
    descripcion: "El Titán Loco, obsesionado con restaurar el equilibrio del universo, reunió las Gemas del Infinito para borrar la mitad de toda la vida existente.",
    bando: "villano",
    imagen: "https://placehold.co/400x300?text=Thanos",
    edad: 1000,
    altura: 2.03,
    universo: "Marvel",
    nivelDeFuerza: 98,
    activo: false,
  },
  {
    nombre: "Harley Quinn",
    poder: ["Acrobacias", "Resistencia al dolor", "Manejo de armas improvisadas"],
    descripcion: "Harleen Quinzel era psiquiatra en Arkham hasta que se enamoró del Joker y adoptó una identidad caótica y letal como Harley Quinn.",
    bando: "villano",
    imagen: "https://placehold.co/400x300?text=Harley+Quinn",
    edad: 29,
    altura: 1.7,
    universo: "DC",
    nivelDeFuerza: 65,
    activo: true,
  },
];

console.log(heroes.length);
heroes.forEach((heroe) => console.log(heroe.nombre));

const cardsContainer = document.getElementById("galeria");

function createCard(heroe) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img class="card-img" src="${heroe.imagen}" alt="${heroe.nombre}">
    <div class="card-body">
      <span class="card-badge">${heroe.bando}</span>
      <h2 class="card-nombre">${heroe.nombre}</h2>
      <p class="card-meta">
        <span class="pill pill-universo">${heroe.universo}</span>
        <span class="pill pill-edad">${heroe.edad} años</span>
        <span class="pill pill-altura">${heroe.altura} m</span>
      </p>
      <p class="card-descripcion">${heroe.descripcion}</p>
      <ul class="card-poderes">
        ${heroe.poder.map((p) => `<li>${p}</li>`).join("")}
      </ul>
      <p class="card-fuerza">Nivel de fuerza: <span>${heroe.nivelDeFuerza}</span></p>
      <p class="card-activo">Estado: <span>${heroe.activo ? "Activo" : "Inactivo"}</span></p>
    </div>
  `;

  return card;
}

heroes.forEach((heroe) => {
  cardsContainer.appendChild(createCard(heroe));
});

document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
