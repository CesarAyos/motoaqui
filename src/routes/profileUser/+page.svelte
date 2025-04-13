<script>
  import Maps from "../../components/maps.svelte";
 
</script>

<header class="app-header text-center py-4">
  <div class="container">
    <h1 class="app-title">Clientes Rapiditos Colón</h1>
    <p class="app-subtitle">Gestión profesional de clientes</p>
  </div>
</header>


<div
  class="alert alert-primary alert-dismissible fade show"
  role="alert"
>
  <button
    type="button"
    class="btn-close"
    data-bs-dismiss="alert"
    aria-label="Close"
  ></button>
  <ol>
   <li> <strong>Bienvenido</strong> Estos son los pasos para apartar un puesto en <strong>Rapiditos Colón</strong></li>
   <li> <strong>Usa el boton de usar mi ubicacion exacta</strong> es para dirigir al chofer a tu ubicacion </li>
   <li> <strong>Seleccione el dia y la hora exacta</strong> en la que quieres apartar tu puesto</li>
   <li> <strong>Indicanos el numero de pasajero</strong> o si vas tu solo/a</li>
   <li> <strong>Puedes decir cuantas maletas llevas</strong> 1,2,3...</li>
   <li> <strong>Dale a confirmar servicio carrera</strong> esto nos enviara un mensaje de whatsapp</li>
   <li> <strong>Te saldra un mensaje de solicitud enviada con exito</strong> y te redirigira a nuestro whatsapp principal</li>
   <li> <strong>Vuelve a la aplicacion</strong> </li>
   <li> <strong>En unos instantes te confirmaran tu viaje </strong> </li>
   <li> <strong>Ten un feliz viaje </strong></li>
  </ol>
</div>



<div>
  <Maps />
</div>


<style>
  .app-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
}

.app-title {
  font-weight: 700;
  font-size: 2.5rem;
}

.app-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}
</style>