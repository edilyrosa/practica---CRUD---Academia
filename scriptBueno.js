document.addEventListener('DOMContentLoaded', () => {
  const userTable = document.getElementById('tBody');
  const url = "https://server-usuarios-qsdd.onrender.com/usuarios";

  const titleForm = document.getElementById("title");
  const form = document.getElementById("form");
  const userId = document.getElementById("userId");
  const nombre = document.getElementById("nombre");
  const edad = document.getElementById("edad");
  const aceptacion = document.getElementById("aceptacion");
  const email = document.getElementById("email");
  const foto = document.getElementById("foto");
  const submitButton = document.getElementById("btnSubmit");
  const btnReset = document.getElementById("btnReset"); //! Cambiamos este id en el HTML

  //! Cargar usuarios al iniciar
  async function fetchUsers() {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
      const users = await response.json();
      renderUsers(users);
    } catch (err) {
      userTable.innerHTML = '';
      let row = document.createElement('tr');
      row.innerHTML = `<td colspan="7" class='text-red-600 font-bold text-2xl text-center py-4'>${err.message}</td>`;
      userTable.appendChild(row);
      console.error('ERROR', err);
    }
  }

  //! Renderizar usuarios en la tabla (PINTA)
  function renderUsers(usuarios) {
    userTable.innerHTML = '';
    if (usuarios.length === 0) {
      let row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" class='text-red-500 font-bold text-2xl text-center py-4'>NO HAY REGISTROS QUE MOSTRAR</td>`;
      userTable.appendChild(row);
      return;
    }
    usuarios.forEach(user => { //?Por cada usuario pintamos una row en la tabla
      const colorGenero = user.genero ? 'text-pink-500' : 'text-blue-500';
      const colorBarra = user.genero ? 'bg-pink-500' : 'bg-blue-500';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img class='w-[80px] h-[80px] rounded-full' src="${user.foto}" alt="${user.nombre}" /></td>
        <td class="px-4 py-2">${user.nombre}</td>
        <td class="px-4 py-2">${user.edad}</td>
        <td class="${colorGenero} px-4 py-2 text-center font-bold">${user.genero ? 'Mujer' : 'Hombre'}</td>
        <td class="px-4 py-2">${user.email}</td>
        <td class="px-4 py-2">
          <div class="flex items-center">
            <span class="mr-2 text-xs font-medium">${user.aceptacion}%</span>
            <div class="w-full bg-gray-200 rounded-sm h-2">
              <div class="${colorBarra} h-2 rounded-sm" style="width:${user.aceptacion}%"></div>
            </div>
          </div>
        </td>
        <td class="px-4 py-2">
          <button class="bg-blue-500 text-white p-1 rounded mr-2 edit-btn" data-id="${user.id}">✏️ Editar</button>
          <button class="bg-pink-500 text-white p-1 rounded delete-btn" data-id="${user.id}" data-nombre="${user.nombre}">🗑️ Eliminar</button>
        </td>
      `;
      userTable.appendChild(row);
    });

    // Agregar evento clic a cada boton EDITAR
    document.querySelectorAll(".edit-btn").forEach(btn =>
      btn.addEventListener("click", () => editUser(btn.dataset.id))
    );

    // Agregar evento clic a botones ELIMINAR
    document.querySelectorAll(".delete-btn").forEach(btn =>
      btn.addEventListener("click", () => confirmDelete(btn.dataset.id, btn.dataset.nombre))
    );
  }

   //** Se requiere get/:id */
  //! Cargar usuario en el formulario para editar
  async function editUser(id) {
    try {
      titleForm.innerText = "LLENA LOS CAMPOS Y ACTUALIZA EL USUARIO.";
      submitButton.value = "Actualizar";
      const response = await fetch(`${url}/${id}`); //**se requiere de get/:id */
      if (!response.ok) throw new Error(`Usuario con ID ${id} no encontrado`); //** Para Asivos */
      const usuario = await response.json();
       //** Para Poblar el Form */
      userId.value = usuario.id;
      nombre.value = usuario.nombre;
      edad.value = usuario.edad;
      email.value = usuario.email;
      foto.value = usuario.foto;
      aceptacion.value = usuario.aceptacion;

      // Seleccionar radio correcto para genero
      const generoBool = usuario.genero === true || usuario.genero === "true";
      const radioGenero = document.querySelector(`input[name="genero"][value="${generoBool ? "true" : "false"}"]`);
      if (radioGenero) radioGenero.checked = true;
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert(error.message);
    }
  }

  //! Confirmar y eliminar usuario
  function confirmDelete(id, nombre) {
    if (confirm(`¿Estás seguro de eliminar a ${nombre} con ID ${id}?`)) {
      deleteUser(id);
    }
  }

  //!Borra usuario
  async function deleteUser(id) {
    try {
      const response = await fetch(`${url}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Error al eliminar: ${response.status}`);
      limpiarFormularioYActualizar();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("No se pudo eliminar el usuario.");
    }
  }

  //! Manejar submit para crear o actualizar usuario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const generoInput = document.querySelector('input[name="genero"]:checked');
    if (!generoInput) {
      alert("Por favor selecciona un género.");
      return;
    }
    const genero = generoInput.value === "true";

    const usuario = {
      nombre: nombre.value.trim(),
      edad: Number(edad.value),
      email: email.value.trim(),
      foto: foto.value.trim(),
      aceptacion: Number(aceptacion.value),
      genero: genero,
    };
    try {
      if (userId.value) { //!PUT
        usuario.id = userId.value;
        const response = await fetch(`${url}/${usuario.id}`, { //** Se requiere put/:id */
          method: "PUT", //** aqui */
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuario), //** envia */
        });
        if (!response.ok) throw new Error(`Error al actualizar: ${response.status}`);
      } else { //!POST
        const response = await fetch(url, {
          method: "POST",    //** Se requiere post */
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuario),
        });
        if (!response.ok) throw new Error(`Error al crear usuario: ${response.status}`);
      }
      limpiarFormularioYActualizar();
    } catch (error) {
      console.error("Error en la operación:", error);
      alert("Ocurrió un error. Revisa la consola para más detalles.");
    }
  });

  //! Limpiar formulario y actualizar tabla
  function limpiarFormularioYActualizar() {
    form.reset();
    userId.value = "";
    submitButton.value = "Enviar ➤";
    titleForm.innerText = "LLENA LOS CAMPOS Y CREA UN USUARIO.";
    fetchUsers();
  }

  //! Resetear formulario al hacer click en reset
  btnReset.addEventListener("click", () => {
    titleForm.innerText = "LLENA LOS CAMPOS Y CREA UN USUARIO.";
    form.reset();
    userId.value = "";
    submitButton.value = "Enviar ➤";
  });

  //! Inicializar tabla al cargar página
  fetchUsers();
});
