<script>
  import { onMount } from "svelte";
  import { supabase } from "../components/supabase.js";
  import "leaflet/dist/leaflet.css";
  import { protegerRuta } from "./protegerRuta.js";
  import RegistroDriver from "./registroDriver.svelte";
  

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

  let user = null; // Asegúrate de que user se inicializa correctamente

  let originIcon, destinationIcon;

  onMount(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/loginUser";
      return;
    }

    await protegerRuta();

    user = session.user; // Asegúrate de asignar user correctamente aquí

    const { data, error } = await supabase
      .from("motoaquiDrivers")
      .select("primernombre, primerapellido")
      .eq("correo", user.email)
      .single();

    if (error) {
      console.error("Error fetching user data:", error.message);
      userFirstName = user.email; // fallback to email if error occurs
    } else {
      userFirstName = data.primernombre;
      userLastName = data.primerapellido;
    }

    // Obtener todas las carreras que no están completadas
    const { data: carrerasData, error: carrerasError } = await supabase
      .from("carreras")
      .select("*")
      .or("estado.is.null,estado.neq.completada");

    if (carrerasError) {
      console.error("Error fetching carreras:", carrerasError.message);
    } else {
      carreras = carrerasData;
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

      // Definir iconos personalizados
      originIcon = L.icon({
        iconUrl: "/moto.png", // Ruta a la imagen del origen
        iconSize: [38, 38], // Tamaño del icono
        iconAnchor: [22, 38], // Punto del icono que corresponde a la ubicación del marcador
        popupAnchor: [-3, -38], // Punto desde el cual se abrirá el popup relativo al icono
      });

      destinationIcon = L.icon({
        iconUrl: "/moto.png", // Ruta a la imagen del destino
        iconSize: [38, 38], // Tamaño del icono
        iconAnchor: [22, 38], // Punto del icono que corresponde a la ubicación del marcador
        popupAnchor: [-3, -38], // Punto desde el cual se abrirá el popup relativo al icono
      });
    }
  });

  function mostrarRuta() {
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    const origin = [
      carreraSeleccionada.origen_lat,
      carreraSeleccionada.origen_lng,
    ];
    const destination = [
      carreraSeleccionada.destino_lat,
      carreraSeleccionada.destino_lng,
    ];

    if (!originMarker) {
      originMarker = L.marker(origin, { icon: originIcon })
        .addTo(map)
        .bindPopup("Origen")
        .openPopup();
    } else {
      originMarker.setLatLng(origin);
    }

    if (!destinationMarker) {
      destinationMarker = L.marker(destination, { icon: destinationIcon })
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
      // Obtener la sesión y usuario actual
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session.user;

      const { error } = await supabase
        .from("carreras")
        .update({
          conductor_id: conductorSeleccionado,
          estado: "asignada",
          usuario_nombre: `${userFirstName} ${userLastName}`,
        })
        .eq("id", carreraSeleccionada.id);

      if (error) {
        console.error("Error updating carrera:", error.message);
      } else {
        console.log("Conductor asignado exitosamente");
        // Actualizar la lista de carreras localmente
        const index = carreras.findIndex(
          (c) => c.id === carreraSeleccionada.id
        );
        carreras[index].estado = "asignada";
        carreras[index].usuario_nombre = `${userFirstName} ${userLastName}`;
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

  function seleccionarCarrera(carrera) {
    carreraSeleccionada = carrera;
    userFirstName = carrera.usuario_nombre.split(" ")[0];
    userLastName = carrera.usuario_nombre.split(" ")[1];
    mostrarRuta();
  }

  function actualizarMapa() {
    // Realiza cambios en el DOM
    originMarker.setLatLng([lat, lng]);
    destinationMarker.setLatLng([lat, lng]);

    // Usa requestAnimationFrame para medir propiedades
    requestAnimationFrame(() => {
      const originBounds = originMarker.getBounds();
      const destinationBounds = destinationMarker.getBounds();
      // Realiza más mediciones si es necesario
    });
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

  async function recargarCarreras() {
    const { data: carrerasData, error: carrerasError } = await supabase
      .from("carreras")
      .select("*")
      .or("estado.is.null,estado.neq.completada"); // Incluir carreras cuyo estado es null o no es completada

    if (carrerasError) {
      console.error("Error fetching carreras:", carrerasError.message);
    } else {
      carreras = carrerasData;
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

        <!-- Botón para recargar carreras -->
        <button class="btn btn-info" on:click={recargarCarreras}
          >Recargar Carreras</button
        >

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
      <!-- Button trigger modal -->
<button
type="button"
class="btn btn-primary"
data-bs-toggle="modal"
data-bs-target="#exampleModal"
>
Registrar nuevo conductor
</button>

<!-- Modal -->
<div
class="modal fade"
id="exampleModal"
tabindex="-1"
aria-labelledby="exampleModalLabel"
aria-hidden="true"
>
<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h1 class="modal-title fs-5" id="exampleModalLabel">
        Registro de Conductor
      </h1>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-label="Close"
      ></button>
    </div>
    <div class="modal-body">
      <RegistroDriver />
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        data-bs-dismiss="modal"
      >
        Close
      </button>
    </div>
  </div>
</div>
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
