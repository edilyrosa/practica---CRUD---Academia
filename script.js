//! Creamos las referencias del DOM necesarias.
const userTable = document.getElementById("tBody");
const url = "http://localhost:3000/usuarios"; 

//? la data ingresada a los form debe ser filtrada y sanitizada antes de enviarla al back, LO HAREMOS DESPUES
const titleForm = document.getElementById("title");
const form = document.getElementById("form");
const userId = document.getElementById("userId");
const nombre = document.getElementById("nombre");
const edad = document.getElementById("edad");
const aceptacion = document.getElementById("aceptacion");
const email = document.getElementById("email");
const foto = document.getElementById("foto");
const submitButton = document.getElementById("btnSubmit");
const btnReset = document.getElementById("reset");

//! GET: Cargar usuarios al iniciar
async function fetchUsers() {
    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error(`Codigo de Error ${response.status}: ${response.statusText}`);
        let users = await response.json();
        renderUsers(users);
    } catch (error) { //Error en el fetch()
        userTable.innerHTML = "";  //Quito el loader y pongo lo siguiente
        let row = document.createElement("tr");
        row.innerHTML = `<td colspan="7" class='text-red-500 font-bold text-2xl text-center py-4'> ${error} </td>`
        userTable.appendChild(row);
        console.error("Error al cargar los usuarios:", error);
    }
}

//!Funcion que Renderiza usuarios en la tabla
function renderUsers(users) {
    userTable.innerHTML = ""; //Quito el loader y pongo lo siguiente
   
    //*CONDICIONAL QUE CONTROLE EL FLUJO, DADA LA CONDICIÓN CIERTA QUE EL ARRAY DE USUARIOS QUE SE ESTÁ CONSUMIENDO ESTÁ VACÍO, Y COMO CONSECUENCIA MUESTRE EN LA TABLA UN REGISTRO QUE OCUPE TODAS LAS COLUMNAS QUE DIGA: "No hay ningún registro de usuario en la API"
    if(usuarios.length < 1 ){ //No hay usuarios
      let row = document.createElement("tr");
      row.innerHTML = 
      `<td colspan="7" class='text-red-500 font-bold text-2xl text-center py-4'> 
          NO HAY REGISTROS QUE MOSTRAR
      </td>`
      userTable.appendChild(row);
  }

    users.forEach(user => {
    //*Operador ternario para establecer el color de la fuente, dependiendo del genero, mujer === true y debe ser rosado, hombre === false y debe ser azul 
        let colorGenero = user.genero ? 'text-pink-500' : 'text-blue-500'; // Mujer -> Rosa, Hombre -> Azul
        let colorBarra = user.genero ? 'bg-pink-500' : 'bg-blue-500'; // Mujer -> Rosa, Hombre -> Azul

        let row = document.createElement("tr");
    //?Corregir en <img Escribir bn -> "rounded-full"
    //?<button agregamos las CLASS: edit-btn y delete-btn mas los DATA-ATTRUBUTE: data-id="${user.id} y data-nombre="${user.nombre}
        row.innerHTML = `
            <td> <img class="w-[80px] h-[80px] rounded-full" src="${user.foto}" alt="Foto"></td>
            <td class="border-t-0 px-4 align-middle text-xs font-medium text-gray-900 whitespace-nowrap p-4">${user.nombre}</td>
            <td class="border-t-0 px-4 align-middle text-xs font-medium text-gray-900 whitespace-nowrap p-4" >${user.edad}</td>
            <td class="${colorGenero} text-center border-t-0 px-4 align-middle text-xs font-bold whitespace-nowrap p-4">${user.genero ? 'Mujer' : 'Hombre'}</td>
            <td class="text-center border-t-0 px-4 align-middle text-xs font-medium text-gray-900 whitespace-nowrap p-4">${user.email}</td>

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
                <button class="w-[40%] bg-blue-500 rounded-sm p-1 text-white font-bold mr-2 edit-btn" data-id="${user.id}">✏️ Editar</button>
                <button class="w-[50%] bg-pink-500 rounded-sm p-1 text-white font-bold delete-btn" data-id="${user.id}" data-nombre="${user.nombre}">🗑️ Eliminar</button>
            </td>
        `;
        userTable.appendChild(row);
    });

 //Cada vez que se ejecuta renderUsers, se está modificando el DOM. Al agregar los oyentes dentro de renderUsers, 
//aseguras que cada botón recién creado tenga su propio oyente asociado.


//!BTN OYENTE DE UPDATE: ENVIA INFO AL FORM
//INVESTIGAR: data-attrb y dataset 
//edit-btn, clase que lo diferencia del boton "eliminar", mediante la cual se capturar el id desde el datasert
    document.querySelectorAll(".edit-btn").forEach(btn => 
        btn.addEventListener("click", () => editUser(btn.dataset.id))//cargar la información de un usuario específico en el formulario para su posterior edición
    );

//!BTN OYENTE DE DELETE, abre el modal que pregunta
    document.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => confirmDelete(btn.dataset.id, btn.dataset.nombre))
    );
}

 //! Func manejadora del evento click del boton "Editar" de la tabla
 //!cargar la data de un usuario específicado en el form para su edición
 async function editUser(id) {
  try {
    //La UI cambia explicando q pasa
    titleForm.innerText = "LLENA LOS CAMPOS Y ACTUALIZA EL USUARIO.";
    submitButton.value = "Actualizar";

    let response = await fetch(`${url}/${id}`);
    if (!response.ok) throw new Error(`Usuario con ID ${id} no encontrado`);
    let usuario = await response.json();
    //El <input type="hidden" id="userId"> del FORM.
    //Mismo formulario para hacer POST y PUT, dependiendo si el registro tiene o no id. 
    //El Json-server asigna id a los registros que son posteados.
    
    //como estamos actualizando es un hecho que EXISTE ID, si fuera POST no existiera
    //el input id NO EXISTE EN FORM, ocupamos input oculto, le asignamos el id, que sera usado en la func manejadora del submit
    userId.value = usuario.id; 
    nombre.value = usuario.nombre;
    edad.value = Number(usuario.edad);
    email.value = usuario.email;
    foto.value = usuario.foto;
    aceptacion.value = usuario.aceptacion;

    //? Seleccionar el género en los radio buttons
    //Referencia del input con name="genero" y le establecemos valor, true o false, segun lo que venga en la VAR 
    // luego le ponemos el checked a ese Ele HTML, segun la opcion capturada.
    document.querySelector(
      `input[name="genero"][value="${usuario.genero ? "true" : "false"}"]`
    ).checked = true;

  } catch (error) {
    console.error("Error al cargar usuario:", error);
    alert(error.message);
  }
}

//! Func manejadora del evento click del boton "Editar" de la tabla. Confirmación antes de eliminar
  function confirmDelete(id, nombre) {
    if (confirm(`¿Estás seguro de eliminar a ${nombre} con ID ${id}?`)) {
      deleteUser(id);
    }
  }

//! Eliminar usuario (DELETE) llamada en confirmDelete(id, nombre)
  async function deleteUser(id) {
    try {
      let response = await fetch(`${url}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Error al eliminar: ${response.status}`);
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  }

  //! Funciones de Guardar usuario (POST o PUT)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
     //crear el obj body del fetch() con la info que YA ESTA EN EL FORM, gracias a editUser(id)
     //o al usuario si es nuevo registro
    let usuario = {
      nombre: nombre.value,
      edad: Number(edad.value),
      email: email.value,
      foto: foto.value,
      aceptacion: Number(aceptacion.value),
    //?capturamos el .value del Ele input name='genero' que verdaderamente haya sido checked.
      genero:
        document.querySelector('input[name="genero"]:checked').value === "true", // "true" = Mujer, "false" = Hombre
    };
  
    try {
      if (userId.value) {//BANDERA QUE USUARIO EXISTE: Actualizarlo (PUT)
        usuario.id = userId.value;//le asigna el attr "id" al obj q estamos creando.
        await updateUser(usuario);
      } else {
        // Crear nuevo usuario (POST), la API le creara un id
        await postUser(usuario)
      }
      form.reset();
      userId.value = ""; //limpianos el imput hidden
      submitButton.value = "Enviar ➤"; // Volver a estado "Crear"
      fetchUsers(); //Get y repoblacion de la tabla, para mostrar el ultimo actualizado o posteado.
    } catch (error) {
      console.error("Error en la operación:", error);
    }
  });

async function updateUser(usuario) {
  try {
    let response = await fetch(`${url}/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    });

    if (!response.ok) throw new Error(`Error al actualizar: ${response.status}`);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error; //! Re-lanzar el error para que el llamador pueda manejarlo
  }
}
async function postUser(usuario) {
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    });

    if (!response.ok) throw new Error(`Error al postear: ${response.status}`);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error; //! Re-lanzar el error para que el llamador pueda manejarlo
  }
}


  btnReset.addEventListener("click", () => (titleForm.innerText = "LLENA LOS CAMPOS Y CREA UN USUARIO."));

  // Iniciar carga de usuarios
  fetchUsers();



//!INVESTIGAR QUE SON DATA-ATRIBUTOS y la propiedad dataset 
//PARA QUÉ SIRVE: <input type="hidden" id="userId"> EN LOS FORMULARIOS.
//Como podría usar el mismo formulario tanto para hacer POST como para hacer PUT? (la clave es: ese registro tiene o no id?, les comento que Json-server asigna id a los registros que  son posteados, investiguen un poco su funcionamiento)

//!Recuerden, para correr la aplicacion que estamos haciendo:
//1. el index.html lo sirven con open with de live server
//2. db.json lo sirven con ejecutando el comando en la terminal: json-server --watch db.json --port 3000
