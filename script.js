const API_URL = "http://localhost:3000/usuarios"; 
const form = document.getElementById("userForm");
const userTable = document.getElementById("userTable");
const userId = document.getElementById("userId");
const nombre = document.querySelector("input[name='nombre']");
const edad = document.querySelector("input[name='edad']");
const email = document.querySelector("input[name='email']");
const foto = document.querySelector("input[name='foto']");
const aceptacion = document.querySelector("input[name='aceptacion']");
const submitButton = document.querySelector("#userForm input[type='submit']");
const titleForm = document.getElementById("title");
const btnReset = document.getElementById("reset");

// Cargar usuarios al iniciar
async function fetchUsers() {
    try {
        let response = await fetch(API_URL);
        let users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error("Error al cargar los usuarios:", error);
    }
}

// Renderizar usuarios en la tabla
function renderUsers(users) {
    userTable.innerHTML = ""; 
    users.forEach(user => {
        let colorGenero = user.genero ? 'text-pink-500' : 'text-blue-500'; // Mujer -> Rosa, Hombre -> Azul
        let colorBarra = user.genero ? 'bg-pink-500' : 'bg-blue-500'; // Mujer -> Rosa, Hombre -> Azul

        let row = document.createElement("tr");
        row.innerHTML = `
            <td><img class="w-[80px] h-[80px] rounded-full" src="${user.foto}" alt="Foto"></td>
            <td>${user.nombre}</td>
            <td>${user.edad}</td>
            <td class="${colorGenero} font-bold">${user.genero ? 'Mujer' : 'Hombre'}</td>
            <td>${user.email}</td>

            <td class="border-t-0 px-4 align-middle text-xs whitespace-nowrap p-4">
                <div class="flex items-center">
                    <span class="mr-2 text-xs font-medium">${user.aceptacion}%</span>
                        <div class="relative w-full">
                            <div class="w-full bg-gray-200 rounded-sm h-2">
                                <div class="${colorBarra} h-2 rounded-sm" style="width:${user.aceptacion}%"></div>
                            </div>
                        </div>
                </div>
            </td>

            <td>
                <button class="w-[40%] bg-blue-500 rounded-sm p-1 text-white font-bold mr-6 edit-btn" data-id="${user.id}">✏️ Editar</button>
                <button class="w-[40%] bg-pink-500 rounded-sm p-1 text-white font-bold delete-btn" data-id="${user.id}" data-nombre="${user.nombre}">🗑️ Eliminar</button>
            </td>
        `;
        userTable.appendChild(row);
    });

    document.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => editUser(btn.dataset.id))
    );
    document.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => confirmDelete(btn.dataset.id, btn.dataset.nombre))
    );
}

// Guardar usuario (POST o PUT)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let usuario = {
        nombre: nombre.value, 
        edad: Number(edad.value),
        email: email.value,
        foto: foto.value,
        aceptacion: Number(aceptacion.value),
        genero: document.querySelector('input[name="genero"]:checked').value === "true" // "true" = Mujer, "false" = Hombre
    };

    if (userId.value) {
        // Actualizar usuario (PUT)
        usuario.id = userId.value;

        try {
            let response = await fetch(`${API_URL}/${usuario.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuario)
            });

            if (!response.ok) throw new Error(`Error al actualizar: ${response.status}`);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
        }
    } else {
        // Crear nuevo usuario (POST)
        try {
            let response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuario)
            });

            if (!response.ok) throw new Error(`Error al crear: ${response.status}`);
        } catch (error) {
            console.error("Error al crear usuario:", error);
        }
    }

    form.reset();
    userId.value = "";
    submitButton.value = "Send ➤"; // Volver a estado "Crear"
    fetchUsers();
});

// Editar usuario
async function editUser(id) {
    try {
        titleForm.innerText="LLENA LOS CAMPOS Y ACTUALIZA EL USUARIO."
        titleForm.style.color="white"
        titleForm.style.fontWeight="bold"
        let response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(`Usuario con ID ${id} no encontrado`);
        }

        let usuario = await response.json();

        userId.value = usuario.id;
        nombre.value = usuario.nombre;
        edad.value = Number(usuario.edad);
        email.value = usuario.email;
        foto.value = usuario.foto;
        aceptacion.value = usuario.aceptacion;
        
        // Seleccionar el género en los radio buttons
        document.querySelector(`input[name="genero"][value="${usuario.genero ? 'true' : 'false'}"]`).checked = true;

        submitButton.value = "Actualizar"; // Cambiar botón a "Actualizar"
    } catch (error) {
        console.error("Error al cargar usuario:", error);
        alert(error.message);
    }
}

btnReset.addEventListener('click', () => titleForm.innerText='LLENA LOS CAMPOS Y CREA UN USUARIO.')

// Confirmación antes de eliminar
function confirmDelete(id, nombre) {
    if (confirm(`¿Estás seguro de eliminar a ${nombre} con ID ${id}?`)) {
        deleteUser(id);
    }
}

// Eliminar usuario (DELETE)
async function deleteUser(id) {
    try {
        let response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Error al eliminar: ${response.status}`);
        fetchUsers();
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
    }
}

// Iniciar carga de usuarios
fetchUsers();
