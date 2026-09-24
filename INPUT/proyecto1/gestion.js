(() => {
  const form = document.getElementById("form-destino");
  const btnSubmit = document.getElementById("btn-submit");
  const listaMostrar = document.getElementById("lista-mostrar");
  const listaActualizar = document.getElementById("lista-actualizar");
  const listaEliminar = document.getElementById("lista-eliminar");

  let destinos = obtenerDestinos();

  let siguienteId = 13;
  let editIndex = null;
  let sesionActiva = false;

  function guardarDestinos(lista) {
    if (!sesionActiva) return;
    localStorage.setItem(CLAVE_DESTINOS, JSON.stringify(lista));
  }

  function mostrarPanel(nombrePanel) {
    document.querySelectorAll(".panel").forEach((panel) => {
      panel.hidden = panel.id !== `panel-${nombrePanel}`;
    });
    document.querySelectorAll(".sidebar-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.panel === nombrePanel);
    });
  }

  document.querySelectorAll(".sidebar-item").forEach((btn) => {
    btn.addEventListener("click", () => mostrarPanel(btn.dataset.panel));
  });

  function crearItemLista(destino, botonHtml) {
    const item = document.createElement("div");
    item.className = "gestion-item";
    item.innerHTML = `
      <div class="gestion-item-info"><strong>${destino.nombre}</strong> — ${destino.pais} (${destino.tipo})</div>
      ${botonHtml}
    `;
    return item;
  }

  function renderTodo() {
    listaMostrar.innerHTML = "";
    destinos.forEach((destino) => {
      listaMostrar.appendChild(crearItemLista(destino, ""));
    });

    listaActualizar.innerHTML = "";
    destinos.forEach((destino, index) => {
      listaActualizar.appendChild(
        crearItemLista(destino, `<button class="btn-editar" data-index="${index}">Editar</button>`)
      );
    });

    listaEliminar.innerHTML = "";
    destinos.forEach((destino, index) => {
      listaEliminar.appendChild(
        crearItemLista(destino, `<button class="btn-eliminar" data-index="${index}">Eliminar</button>`)
      );
    });
  }

  function cargarFormulario(destino) {
    document.getElementById("input-nombre").value = destino.nombre;
    document.getElementById("input-tipo").value = destino.tipo;
    document.getElementById("input-pais").value = destino.pais;
    document.getElementById("input-continente").value = destino.continente;
    document.getElementById("input-idioma").value = destino.idioma;
    document.getElementById("input-imagen").value = destino.imagen;
    document.getElementById("input-descripcion").value = destino.descripcion;
    document.getElementById("input-caracteristicas").value = destino.caracteristicas.join(", ");
    document.getElementById("input-calificacion").value = destino.calificacion;
    document.getElementById("input-recomendado").checked = destino.recomendado;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!sesionActiva) return;

    const datosDestino = {
      nombre: document.getElementById("input-nombre").value,
      caracteristicas: document
        .getElementById("input-caracteristicas")
        .value.split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
      descripcion: document.getElementById("input-descripcion").value,
      tipo: document.getElementById("input-tipo").value,
      imagen: document.getElementById("input-imagen").value,
      pais: document.getElementById("input-pais").value,
      continente: document.getElementById("input-continente").value,
      idioma: document.getElementById("input-idioma").value,
      calificacion: Number(document.getElementById("input-calificacion").value),
      recomendado: document.getElementById("input-recomendado").checked,
    };

    if (editIndex === null) {
      datosDestino.id = siguienteId;
      siguienteId++;
      destinos.push(datosDestino);
    } else {
      datosDestino.id = destinos[editIndex].id;
      destinos[editIndex] = datosDestino;
      editIndex = null;
      btnSubmit.textContent = "Agregar destino";
    }

    guardarDestinos(destinos);
    form.reset();
    renderTodo();
  });

  listaActualizar.addEventListener("click", (event) => {
    if (!sesionActiva) return;
    if (!event.target.classList.contains("btn-editar")) return;

    editIndex = Number(event.target.dataset.index);
    cargarFormulario(destinos[editIndex]);
    btnSubmit.textContent = "Guardar cambios";
    mostrarPanel("crear");
  });

  listaEliminar.addEventListener("click", (event) => {
    if (!sesionActiva) return;
    if (!event.target.classList.contains("btn-eliminar")) return;

    const index = Number(event.target.dataset.index);
    destinos.splice(index, 1);
    guardarDestinos(destinos);

    if (editIndex === index) {
      editIndex = null;
      form.reset();
      btnSubmit.textContent = "Agregar destino";
    }

    renderTodo();
  });

  const formLogin = document.getElementById("form-login");
  const seccionLogin = document.getElementById("login");
  const layout = document.querySelector(".layout");
  const loginError = document.getElementById("login-error");

  formLogin.addEventListener("submit", (event) => {
    event.preventDefault();

    const usuarioIngresado = document.getElementById("input-usuario").value;
    const contrasenaIngresada = document.getElementById("input-contrasena").value;

    if (!verificarLogin(usuarioIngresado, contrasenaIngresada)) {
      loginError.hidden = false;
      formLogin.reset();
      return;
    }

    sesionActiva = true;
    seccionLogin.hidden = true;
    layout.hidden = false;
    renderTodo();
    mostrarPanel("crear");
  });
})();
