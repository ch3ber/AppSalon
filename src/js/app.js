let pagina = 1; //pagina en la que se encuentra el usuario

const cita = {
   nombre: '',
   fecha: '',
   hora: '',
   servicios: []

}

document.addEventListener('DOMContentLoaded', function() {
   iniciarApp();
});

function iniciarApp() {
   mostrarServicios();

   //resaltar el DIV actual segun el tab que se presiona
   mostrarSeccion();

   //ocultar o mostrar una seccion segun el tab que se presiona
   cambiarSeccion();

   //cabiar entre la pagina siguiente y la anterior
   paginaSiguiente();
   paginaAnterior();

   //compureba la pagina actual para ocultar o mostrar la paginacion
   botonesPaginador();

   //muestra el resumen de la cita (o un mensaje de error en caso de no pasar la validacion)
   mostrarResumen();

   //almacena el nombre de la cita en el objeto
   nombreCita();

   //almacena la fecha de la cita en el objeto
   fechaCita();

   //deshabilita dias pasados
   deshabilitarFechaAnterior();

   //alamcenar la hora de la cita en el objeto
   horaCita();
}

function mostrarSeccion() {

   //eliminar mostrar-seccion del elemento anterior
   const seccionAnterior = document.querySelector('.mostrar-seccion');
   if (seccionAnterior) {
      seccionAnterior.classList.remove('mostrar-seccion');
   }

   const seccionActual = document.querySelector(`#paso-${pagina}`);
   seccionActual.classList.add('mostrar-seccion');

   //elimina la clase de actual en el tab anterior
   const tabAnterior = document.querySelector('.tabs .actual');
   if (tabAnterior) {
      tabAnterior.classList.remove('actual');
   }

   //resalta el tab actual
   const tab = document.querySelector(`[data-paso="${pagina}"]`)
   tab.classList.add('actual');
}

function cambiarSeccion() {
   const enlaces = document.querySelectorAll('.tabs button');

   enlaces.forEach(enlace => {
      enlace.addEventListener('click', event => {
         event.preventDefault();
         pagina = parseInt(event.target.dataset.paso);

         //llamar la funcion mostrar seccion
         mostrarSeccion();

         botonesPaginador();
      })
   });
}

async function mostrarServicios() {
   try {

      const url = 'http://localhost:8000/servicios.php';

      const resultado = await fetch(url);
      const db = await resultado.json();

      //const {servicios} = db;

      //generar html
      db.forEach( servicio => {
         const {id, nombre, precio} = servicio;

         //DOM Scripting
         //generar nombre del sercivio
         const nombreServicio = document.createElement('P');
         nombreServicio.textContent = nombre;
         nombreServicio.classList.add('nombre-servicio');

         //generar precio del servicio
         const precioServicio = document.createElement('P');
         precioServicio.textContent = `$ ${precio}`;
         precioServicio.classList.add('precio-servicio');

         //generar div contenedor de servicio
         const servicioDiv = document.createElement('DIV');
         servicioDiv.classList.add('servicio');
         servicioDiv.dataset.idServicio = id;

         //selecciona un sercivio para la cita
         servicioDiv.onclick = seleccionarServicio;

         //inyectar precio y nombre al div servicio
         servicioDiv.appendChild(nombreServicio);
         servicioDiv.appendChild(precioServicio);

         //inyerctarlo en HTML
         document.querySelector('#servicios').appendChild(servicioDiv);
      });
   } catch (error) {
      console.log(error);
   }
}

function seleccionarServicio(event) {
   let elemento;
   //forzar que el elemento al que dimos clik sea el DIV
   if (event.target.tagName == 'P') {
      elemento = event.target.parentElement;
   } else {
      elemento = event.target;
   }

   if (elemento.classList.contains('seleccionado')) {
      elemento.classList.remove('seleccionado');
      eliminarServicio(parseInt(elemento.dataset.idServicio));
   } else {
      elemento.classList.add('seleccionado');

      const servicioObj = {
         id: parseInt(elemento.dataset.idServicio),
         nombre: elemento.firstElementChild.textContent,
         precio: elemento.firstElementChild.nextElementSibling.textContent

      }

      agregarServicio(servicioObj);
   }
}

function paginaSiguiente() {
   const paginaSiguiente = document.querySelector('#siguiente');
   paginaSiguiente.addEventListener('click', () => {
      pagina++

      botonesPaginador();
   })
}

function paginaAnterior() {
   const paginaAnterior = document.querySelector('#anterior');
   paginaAnterior.addEventListener('click', () => {
      pagina--

      botonesPaginador();
   })
}

function botonesPaginador() {
   const paginaSiguiente = document.querySelector('#siguiente');
   const paginaAnterior = document.querySelector('#anterior');

   if (pagina === 1) {
      paginaAnterior.classList.add('ocultar');
   } else if (pagina === 3) {
      paginaSiguiente.classList.add('ocultar');
      paginaAnterior.classList.remove('ocultar');

      mostrarResumen(); //estamos en la pagina 3, carga el resumen de la sita
   } else {
      paginaAnterior.classList.remove('ocultar');
      paginaSiguiente.classList.remove('ocultar');
   }

   mostrarSeccion(); //cambia la seccion que se muestra por la de la pagina
}

function mostrarResumen() {
   //destructuring
   const {nombre, fecha, hora, servicios} = cita;

   //seleccionar el resumen
   const resumenDiv = document.querySelector('.contenido-resumen')

   //limpiar el HTML
   while (resumenDiv.firstChild) {
      resumenDiv.removeChild(resumenDiv.firstChild)
   }

   //validacion de objeto
   if (Object.values(cita).includes('')) {
      const noServicios = document.createElement('P');
      noServicios.textContent = 'Faltan datos de servicios, hora, fecha o nombre';

      noServicios.classList.add('invalidar-cita');

      //agregar a resumenDiv
      resumenDiv.appendChild(noServicios);

      return;
   }

   const headingCita = document.createElement('H3');
   headingCita.textContent = 'Resumen de Cita';

   //mostrar el resumen
   const nombreCita = document.createElement('P');
   nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;

   const fechaCita = document.createElement('P');
   fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

   const horaCita = document.createElement('P');
   horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

   const serviciosCita = document.createElement('DIV');
   serviciosCita.classList.add('resumen-servicios');

   const headingServicios = document.createElement('H3');
   headingServicios.textContent = 'Resumen de Servicios';
   serviciosCita.appendChild(headingServicios);

   let cantidad = 0;

   //iterar sobre el arreglo de servicios
   servicios.forEach(servicio => {
      const {nombre, precio} = servicio;
      const contenedorServicio = document.createElement('DIV');
      contenedorServicio.classList.add('contenedor-servicio');

      const textoServicio = document.createElement('P');
      textoServicio.textContent = nombre;

      const precioServicio = document.createElement('P');
      precioServicio.textContent = precio;
      precioServicio.classList.add('precio');

      const totalServicio = precio.split('$');
      cantidad += parseInt(totalServicio[1].trim());
      console.log(totalServicio)

      //colocar texto y precio en el div
      contenedorServicio.appendChild(textoServicio);
      contenedorServicio.appendChild(precioServicio);

      serviciosCita.appendChild(contenedorServicio);
   });

   resumenDiv.appendChild(headingCita);
   resumenDiv.appendChild(nombreCita);
   resumenDiv.appendChild(fechaCita);
   resumenDiv.appendChild(horaCita);

   resumenDiv.appendChild(serviciosCita);

   const cantidadPagar = document.createElement('P');
   cantidadPagar.classList.add('total');
   cantidadPagar.innerHTML = `<span>Total a Pagar</span> $ ${cantidad}`;
   resumenDiv.appendChild(cantidadPagar);

}

function eliminarServicio(id) {
   const {servicios} = cita;
   cita.servicios = servicios.filter( servicio => servicio.id !== id );
}

function agregarServicio(servicioObj) {
   const {servicios} = cita;
   cita.servicios = [...servicios, servicioObj];
}

function nombreCita() {
   const nombreInput = document.querySelector('#nombre');

   nombreInput.addEventListener('input', event => {
      const nombreTexto = event.target.value;

      if (nombreTexto === '' || nombreTexto.length < 3) {
         mostrarAlerta('Nombre no valido', 'error');
      } else {
         const alerta = document.querySelector('.alerta');
         if (alerta) {
            alerta.remove();
         }
         cita.nombre = nombreTexto;
      }
   })
}

function mostrarAlerta(mensaje, tipo) {
   //si hay una alerta previa, entonces no crear otra
   const alertaPrevia = document.querySelector('.alerta');
   if (alertaPrevia) {
      return;
   }

   const alerta = document.createElement('DIV');
   alerta.textContent = mensaje;
   alerta.classList.add('alerta');

   if (tipo === 'error') {
      alerta.classList.add('error');
   }

   //insertar en el HTML
   const formulario = document.querySelector('.formulario');
   formulario.appendChild(alerta);

   //eliminar alerta despues de 3 segundos
   setTimeout(() => alerta.remove(), 3000)
}

function fechaCita() {
   const fechaInput = document.querySelector('#fecha');
   fechaInput.addEventListener('input', event => {
      const dia = new Date(event.target.value).getUTCDay();

      if ([0, 6].includes(dia)) {
         event.preventDefault();
         fechaInput.value = '';
         mostrarAlerta('Fines de semana no estan permitidos', 'error');
      } else {
         cita.fecha = fechaInput.value;
      }
   })
}

function deshabilitarFechaAnterior() {
   const inputFecha = document.querySelector('#fecha');
   const fechaAhora = new Date();
   const year = fechaAhora.getFullYear()
   const mes = fechaAhora.getMonth() + 1;
   const dia = fechaAhora.getDay() + 1; //no reservar el mismo dia
   //formato deseado AAAA-MM-DD
   const fechaDeshabilitar = `${year}-0${mes}-0${dia}`;
   inputFecha.min = fechaDeshabilitar;
}

function horaCita() {
   const inputHora = document.querySelector('#hora');
   inputHora.addEventListener('input', event => {

      const horaCita = event.target.value;
      const hora = horaCita.split(':');
      if (hora[0] < 10 || hora[1] > 18) {
         mostrarAlerta('Hora no valida', 'error');
         setTimeout(() => inputHora.value = '', 3000);
      } else {
         cita.hora = horaCita;
      }
   })
}
