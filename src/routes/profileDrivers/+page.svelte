<script>
  import { supabase } from "../../components/supabase.js";
  import { onMount } from "svelte"; // Eliminamos onDestroy
  import "leaflet/dist/leaflet.css";

  let map;
  let originMarker;
  let destinationMarker;
  let routeLayer;

  let carreras = [];
  let conductores = [];
  let conductorSeleccionado = "";
  let carreraSeleccionada = null;
  let userFirstName = "";
  let userLastName = "";

  let user = "";
  let userName = "";

  onMount(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/login";
    } else {
      user = session.user;

      const { data, error } = await supabase
        .from("motoaquiDrivers")
        .select("primernombre, primerapellido")
        .eq("correo", user.email)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
        userName = user.email; // fallback to email if error occurs
      } else {
        userName = data.primernombre;
        user = data.primerapellido;
      }
    }

    // Obtener todas las carreras que no están completadas
    const { data: carrerasData, error: carrerasError } = await supabase
      .from("carreras")
      .select("*")
      .or("estado.is.null,estado.neq.completada"); // Incluir carreras cuyo estado es null o no es completada

    if (carrerasError) {
      console.error("Error fetching carreras:", carrerasError.message);
    } else {
      carreras = carrerasData;
      console.log("Carreras no completadas:", carreras); // Añadir esta línea para depuración
    }

    // Obtener todos los conductores
    const { data: conductoresData, error: conductoresError } = await supabase
      .from("motoaquiDrivers")
      .select("*");

    if (conductoresError) {
      console.error("Error fetching conductores:", conductoresError.message);
    } else {
      conductores = conductoresData;
    }

    // Inicializar el mapa
    if (typeof window !== "undefined") {
      const L = (await import("leaflet")).default;

      map = L.map("map").setView([8.03687, -72.2603], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      L.control.scale().addTo(map);
    }
  });

  function mostrarRuta() {
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }
    const L = window.L;

    const origin = [
      carreraSeleccionada.origen_lat,
      carreraSeleccionada.origen_lng,
    ];
    const destination = [
      carreraSeleccionada.destino_lat,
      carreraSeleccionada.destino_lng,
    ];

    if (!originMarker) {
      originMarker = L.marker(origin)
        .addTo(map)
        .bindPopup("Origen")
        .openPopup();
    } else {
      originMarker.setLatLng(origin);
    }

    if (!destinationMarker) {
      destinationMarker = L.marker(destination)
        .addTo(map)
        .bindPopup("Destino")
        .openPopup();
    } else {
      destinationMarker.setLatLng(destination);
    }

    routeLayer = L.polyline([origin, destination], { color: "blue" }).addTo(
      map
    );
    map.fitBounds(routeLayer.getBounds());
  }

  async function asignarConductor() {
    if (carreraSeleccionada && conductorSeleccionado) {
      // Actualizar la carrera con el conductor asignado y cambiar el estado a "asignada"
      const { error } = await supabase
        .from("carreras")
        .update({ conductor_id: conductorSeleccionado, estado: "asignada" })
        .eq("id", carreraSeleccionada.id);

      if (error) {
        console.error("Error updating carrera:", error.message);
      } else {
        console.log("Conductor asignado exitosamente");
        // Notificar al usuario de la carrera
        await notificarUsuario();
        // Actualizar la lista de carreras localmente
        const index = carreras.findIndex(
          (c) => c.id === carreraSeleccionada.id
        );
        carreras[index].estado = "asignada";
        carreras = [...carreras]; // Forzar la reactividad
      }
    } else {
      alert("Selecciona una carrera y un conductor.");
    }
  }

  async function cancelarCarrera() {
    if (carreraSeleccionada) {
      // Eliminar la carrera de la base de datos
      const { error } = await supabase
        .from("carreras")
        .delete()
        .eq("id", carreraSeleccionada.id);

      if (error) {
        console.error("Error cancelando carrera:", error.message);
      } else {
        console.log("Carrera cancelada correctamente");
        // Eliminar la carrera de la lista localmente
        carreras = carreras.filter((c) => c.id !== carreraSeleccionada.id);
        carreraSeleccionada = null;
        if (routeLayer) {
          map.removeLayer(routeLayer);
        }
        if (originMarker) {
          map.removeLayer(originMarker);
          originMarker = null;
        }
        if (destinationMarker) {
          map.removeLayer(destinationMarker);
          destinationMarker = null;
        }
      }
    } else {
      alert("No hay ninguna carrera seleccionada para cancelar.");
    }
  }

  async function notificarUsuario() {
  if (!carreraSeleccionada) {
    console.error("No hay carrera seleccionada.");
    return;
  }

  // Obtener el número de teléfono del cliente que solicitó la carrera
  const { data: clientData, error: clientError } = await supabase
    .from("motoaquiClient")
    .select("telefono")
    .eq("id", carreraSeleccionada.usuario_id) // Asegúrate de que este campo coincide con tu estructura de base de datos
    .single();

  if (clientError) {
    console.error("Error fetching user's phone number:", clientError.message);
    return;
  }

  if (!clientData) {
    console.error("No se encontró el número de teléfono del cliente.");
    return;
  }

  // Encontrar al conductor seleccionado
  const conductor = conductores.find((c) => c.id === conductorSeleccionado);
  if (!conductor) {
    console.error("Conductor no encontrado.");
    return;
  }

  // Crear el mensaje de WhatsApp
  const mensaje = `Tu carrera ha sido asignada al conductor/a ${conductor.primernombre} ${conductor.primerapellido}.
  Número de Teléfono: ${conductor.telefono}.
  Modelo de la moto: ${conductor.modelo}.
  Placa de la moto: ${conductor.placa}.
  Color de la moto: ${conductor.color}.
  Control del conductor: ${conductor.control}.`;

  // Crear la URL para abrir WhatsApp
  const url = `https://wa.me/${clientData.telefono}?text=${encodeURIComponent(mensaje)}`;

  // Abrir la URL en una nueva pestaña
  window.open(url, "_blank");
}


  function seleccionarCarrera(carrera) {
    carreraSeleccionada = carrera;
    userFirstName = carrera.usuario_nombre.split(" ")[0];
    userLastName = carrera.usuario_nombre.split(" ")[1];
    mostrarRuta();
  }

  async function actualizarEstadoCarrera(estado) {
    if (estado === "completada") {
      // Actualiza el estado de la carrera a 'completada'
      const { error } = await supabase
        .from("carreras")
        .update({ estado: "completada" })
        .eq("id", carreraSeleccionada.id);

      if (error) {
        console.error("Error updating carrera:", error.message);
      } else {
        // Eliminar la carrera actual de la lista
        carreras = carreras.filter((c) => c.id !== carreraSeleccionada.id);
        carreraSeleccionada = null;
        if (routeLayer) {
          map.removeLayer(routeLayer);
        }
        if (originMarker) {
          map.removeLayer(originMarker);
          originMarker = null;
        }
        if (destinationMarker) {
          map.removeLayer(destinationMarker);
          destinationMarker = null;
        }
        console.log("Carrera actualizada correctamente a completada.");
        carreras = [...carreras]; // Forzar la reactividad
      }
    } else {
      console.error("Estado no válido");
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/loginUser";
  };
</script>

<section class="bg-dark">
  <div class="container pt-4 bg-dark">
    <h1 class="text-center text-white">Asignar Conductores a Carreras</h1>

    <div class="row">
      <div class="col-md-8">
        <div id="map" class="mb-3"></div>
      </div>
      <div class="col-md-4">
        <ul class="list-group mb-3">
          {#each carreras as carrera}
            <li
              class="list-group-item d-flex justify-content-between align-items-center {carrera.estado ===
              'pendiente'
                ? 'bg-danger text-white'
                : carrera.estado === 'asignada'
                  ? 'bg-success text-white'
                  : ''}"
            >
              <div>
                <strong>{carrera.descripcion}</strong><br />
                <small>Carrera solicitada por: {carrera.usuario_nombre}</small>
                <small
                  >Fecha y hora de solicitud: {new Date(
                    carrera.created_at
                  ).toLocaleString()}
                </small>
              </div>
              <button
                class="btn btn-primary btn-sm"
                on:click={() => seleccionarCarrera(carrera)}>Seleccionar</button
              >
            </li>
          {/each}
        </ul>

        <h3 class="text-white">Seleccionar Conductor</h3>
        <select class="form-select mb-3" bind:value={conductorSeleccionado}>
          <option value="" disabled selected>Seleccione un conductor</option>
          {#each conductores as conductor}
            <option value={conductor.id}
              >{conductor.primernombre} {conductor.primerapellido}</option
            >
          {/each}
        </select>

        <button class="btn btn-success" on:click={asignarConductor}
          >Asignar Conductor</button
        >

        <!-- Botón para cancelar la carrera -->
        <button class="btn btn-danger" on:click={cancelarCarrera}
          >Cancelar Carrera</button
        >

        <h3 class="mt-4 text-white">Actualizar Estado de Carrera</h3>
        <button
          class="btn btn-warning"
          on:click={() => actualizarEstadoCarrera("completada")}
          >Marcar como Completada</button
        >
      </div>
      <button class="btn btn-danger m-2" on:click={handleLogout}
        >Cerrar Sesión</button
      >
    </div>
  </div>
</section>

<style>
  /* Estilos adicionales si es necesario */
  #map {
    height: 400px; /* Ajusta la altura según sea necesario */
  }

  .bg-danger {
    background-color: #dc3545 !important; /* Rojo */
  }

  .bg-success {
    background-color: #28a745 !important; /* Verde */
  }
</style>
