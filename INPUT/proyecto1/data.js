let destinos = [
  {
    nombre: "París",
    caracteristicas: ["Torre Eiffel", "Museos", "Gastronomía", "Arquitectura"],
    descripcion:
      "París es la capital de Francia y una de las ciudades más visitadas del mundo. Es reconocida por su arte, arquitectura, gastronomía y monumentos como la Torre Eiffel.",
    tipo: "Ciudad",
    imagen:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    pais: "Francia",
    continente: "Europa",
    idioma: "Francés",
    calificacion: 95,
    recomendado: true,
  },

  {
    nombre: "Nueva York",
    caracteristicas: ["Times Square", "Central Park", "Rascacielos", "Broadway"],
    descripcion:
      "Nueva York es una de las ciudades más importantes de Estados Unidos. Su diversidad cultural, sus enormes rascacielos y su actividad constante la convierten en un destino único.",
    tipo: "Ciudad",
    imagen:
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee",
    pais: "Estados Unidos",
    continente: "América del Norte",
    idioma: "Inglés",
    calificacion: 93,
    recomendado: true,
  },

  {
    nombre: "Tokio",
    caracteristicas: ["Tecnología", "Templos", "Anime", "Gastronomía"],
    descripcion:
      "Tokio es la capital de Japón y una ciudad donde la tecnología moderna convive con las tradiciones milenarias. Es famosa por su cultura, comida y barrios llenos de vida.",
    tipo: "Ciudad",
    imagen:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    pais: "Japón",
    continente: "Asia",
    idioma: "Japonés",
    calificacion: 94,
    recomendado: true,
  },

  {
    nombre: "Santorini",
    caracteristicas: ["Playas", "Casas blancas", "Atardeceres", "Mar Egeo"],
    descripcion:
      "Santorini es una isla griega reconocida por sus casas blancas con techos azules, sus impresionantes atardeceres y sus paisajes sobre el mar Egeo.",
    tipo: "Isla",
    imagen:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
    pais: "Grecia",
    continente: "Europa",
    idioma: "Griego",
    calificacion: 96,
    recomendado: true,
  },

  {
    nombre: "Cartagena",
    caracteristicas: [
      "Ciudad amurallada",
      "Playas",
      "Historia",
      "Cultura caribeña",
    ],
    descripcion:
      "Cartagena de Indias es una ciudad colombiana ubicada en la costa del Caribe. Su arquitectura colonial, sus playas y su riqueza histórica la convierten en uno de los destinos más representativos de Colombia.",
    tipo: "Ciudad",
    imagen:
      "https://media.istockphoto.com/id/2163251250/photo/photograph-archive-of-cartagena-colombia.jpg?s=612x612&w=0&k=20&c=8aJEeNRfyqtAKkXtnfhkMNr_opIYOqwlXrrfwxoaviw=",
    pais: "Colombia",
    continente: "América del Sur",
    idioma: "Español",
    calificacion: 92,
    recomendado: true,
  },

  {
    nombre: "Bali",
    caracteristicas: ["Templos", "Naturaleza", "Playas", "Cultura"],
    descripcion:
      "Bali es una isla de Indonesia conocida por sus paisajes naturales, templos, arrozales y playas. Es un destino ideal para quienes buscan conexión con la naturaleza y tranquilidad.",
    tipo: "Isla",
    imagen:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    pais: "Indonesia",
    continente: "Asia",
    idioma: "Indonesio",
    calificacion: 91,
    recomendado: true,
  },

  {
    nombre: "Machu Picchu",
    caracteristicas: ["Historia", "Montañas", "Cultura Inca", "Arqueología"],
    descripcion:
      "Machu Picchu es una antigua ciudadela inca ubicada en las montañas de Perú. Es uno de los lugares arqueológicos más importantes y visitados de América del Sur.",
    tipo: "Destino histórico",
    imagen:
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1",
    pais: "Perú",
    continente: "América del Sur",
    idioma: "Español",
    calificacion: 97,
    recomendado: true,
  },

  {
    nombre: "Dubái",
    caracteristicas: ["Arquitectura moderna", "Desierto", "Lujo", "Compras"],
    descripcion:
      "Dubái es una ciudad de los Emiratos Árabes Unidos conocida por su arquitectura futurista, sus enormes centros comerciales y sus experiencias en el desierto.",
    tipo: "Ciudad",
    imagen:
      "https://thumbs.dreamstime.com/b/burj-khalifa-horizontal-dubai-87529735.jpg",
    pais: "Emiratos Árabes Unidos",
    continente: "Asia",
    idioma: "Árabe",
    calificacion: 89,
    recomendado: true,
  },

  {
    nombre: "Roma",
    caracteristicas: ["Coliseo", "Historia", "Arte", "Gastronomía"],
    descripcion:
      "Roma es la capital de Italia y una ciudad llena de historia. Sus monumentos antiguos, plazas, museos y gastronomía atraen a millones de visitantes cada año.",
    tipo: "Ciudad",
    imagen:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
    pais: "Italia",
    continente: "Europa",
    idioma: "Italiano",
    calificacion: 95,
    recomendado: true,
  },

  {
    nombre: "Ciudad del Cabo",
    caracteristicas: ["Montañas", "Playas", "Naturaleza", "Vida silvestre"],
    descripcion:
      "Ciudad del Cabo es una de las ciudades más importantes de Sudáfrica. Destaca por sus paisajes naturales, la Montaña de la Mesa y su cercanía con el océano.",
    tipo: "Ciudad",
    imagen:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99",
    pais: "Sudáfrica",
    continente: "África",
    idioma: "Inglés",
    calificacion: 90,
    recomendado: true,
  },

  {
    nombre: "Reikiavik",
    caracteristicas: [
      "Auroras boreales",
      "Glaciares",
      "Naturaleza",
      "Aguas termales",
    ],
    descripcion:
      "Reikiavik es la capital de Islandia y un destino conocido por sus paisajes naturales únicos, volcanes, aguas termales y la posibilidad de observar auroras boreales.",
    tipo: "Ciudad",
    imagen:
      "https://static.cozycozy.com/images/catalog/bg2/horizontal-reykjavik.jpg",
    pais: "Islandia",
    continente: "Europa",
    idioma: "Islandés",
    calificacion: 88,
    recomendado: true,
  },

  {
    nombre: "Río de Janeiro",
    caracteristicas: ["Playas", "Carnaval", "Cristo Redentor", "Montañas"],
    descripcion:
      "Río de Janeiro es una ciudad brasileña famosa por sus playas, su carnaval, sus paisajes montañosos y el icónico Cristo Redentor.",
    tipo: "Ciudad",
    imagen:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325",
    pais: "Brasil",
    continente: "América del Sur",
    idioma: "Portugués",
    calificacion: 94,
    recomendado: true,
  },
];