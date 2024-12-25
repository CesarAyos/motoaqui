<script>
  import { onMount } from "svelte";
  import { supabase } from "../components/supabase.js";
  import "leaflet/dist/leaflet.css";
  import { protegerRuta } from "./protegerRuta.js";
  
  
  let map;
  let originMarker;
  let destinationMarker;
  let routeLayer;
  let carreras = []; // Lista de carreras asignadas
  let carreraSeleccionada = null; // Carrera seleccionada para mostrar en el mapa
  let conductorNombre = "";
  let usuarioNombre = "";

  let originIcon, destinationIcon;

  // Función para cargar las carreras asignadas al usuario
  const cargarCarreras = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/loginUser";
      return;
    }

    const { data: carrerasData, error: carrerasError } = await supabase
      .from("carreras")
      .select("*")
      .eq("estado", "asignada");

    if (carrerasError) {
      console.error("Error fetching carreras:", carrerasError.message);
    } else {
      carreras = carrerasData;
    }
  };

  // Función para mostrar la ruta en el mapa
  const mostrarRuta = async (carrera) => {
    carreraSeleccionada = carrera;
    usuarioNombre = carrera.usuario_nombre;

    const { data: conductorData, error: conductorError } = await supabase
      .from("motoaquiDrivers")
      .select("primernombre, primerapellido")
      .eq("id", carrera.conductor_id)
      .single();

    if (conductorError) {
      console.error("Error fetching conductor data:", conductorError.message);
    } else {
      conductorNombre = `${conductorData.primernombre} ${conductorData.primerapellido}`;
    }

    const origin = [carrera.origen_lat, carrera.origen_lng];
    const destination = [carrera.destino_lat, carrera.destino_lng];

    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

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

    routeLayer = L.polyline([origin, destination], { color: "blue" }).addTo(map);
    map.fitBounds(routeLayer.getBounds());
  };

  // Función para aceptar la carrera
  const aceptarCarrera = async () => {
    if (!carreraSeleccionada) return;

    const { error } = await supabase
      .from("carreras")
      .update({ estado: "aceptada" })
      .eq("id", carreraSeleccionada.id);

    if (error) {
      console.error("Error accepting carrera:", error.message);
    } else {
      carreraSeleccionada.estado = "aceptada";
      carreras = carreras.map((c) =>
        c.id === carreraSeleccionada.id ? { ...c, estado: "aceptada" } : c
      );
      console.log("Carrera aceptada");
    }
  };

  // Función para marcar la carrera como realizada
  const carreraRealizada = async () => {
    if (!carreraSeleccionada) return;

    const { error } = await supabase
      .from("carreras")
      .update({ estado: "completada" })
      .eq("id", carreraSeleccionada.id);

    if (error) {
      console.error("Error completing carrera:", error.message);
    } else {
      console.log("Carrera realizada");
      carreras = carreras.filter((c) => c.id !== carreraSeleccionada.id);
      carreraSeleccionada = null; // Remover la carrera del panel
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
  };

  onMount(async () => {
    await cargarCarreras();
    await protegerRuta();

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      const L = (await import("leaflet")).default;

      map = L.map("map").setView([8.03687, -72.2603], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      L.control.scale().addTo(map);

      // Definir iconos personalizados
      originIcon = L.icon({
        iconUrl: '/moto.png', // Ruta a la imagen del origen
        iconSize: [38, 38], // Tamaño del icono
        iconAnchor: [22, 38], // Punto del icono que corresponde a la ubicación del marcador
        popupAnchor: [-3, -38] // Punto desde el cual se abrirá el popup relativo al icono
      });

      destinationIcon = L.icon({
        iconUrl: '/moto.png', // Ruta a la imagen del destino
        iconSize: [38, 38], // Tamaño del icono
        iconAnchor: [22, 38], // Punto del icono que corresponde a la ubicación del marcador
        popupAnchor: [-3, -38] // Punto desde el cual se abrirá el popup relativo al icono
      });
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/loginUser";
  };
</script>


<div>
  <div id="map" style="height: 400px;"></div>

  <div class="card mt-3">
    <div class="card-header d-flex justify-content-between align-items-center">
      Carreras Asignadas
      <button class="btn btn-outline-primary" on:click={cargarCarreras}>Recargar Carreras</button>
      <button class="btn btn-danger m-2" on:click={handleLogout}
        >Cerrar Sesión</button
      >
    </div>
    <ul class="list-group list-group-flush">
      {#each carreras as carrera}
        <li class="list-group-item d-flex justify-content-between align-items-center" on:click={() => mostrarRuta(carrera)}>
          Carrera ID: {carrera.id}
          <span class="badge badge-primary badge-pill">{carrera.estado}</span>
        </li>
      {/each}
    </ul>
  </div>

  {#if carreraSeleccionada}
    <div class="card mt-3">
      <div class="card-header">
        Detalles de la Carrera
      </div>
      <div class="card-body">
        <h5 class="card-title">Carrera ID: {carreraSeleccionada.id}</h5>
        <p class="card-text">Nombre del Conductor: {conductorNombre}</p>
        <p class="card-text">Nombre del Usuario: {usuarioNombre}</p>
        <button class="btn btn-outline-success mt-3" on:click={aceptarCarrera} disabled={carreraSeleccionada.estado === "aceptada"}>
          Carrera Aceptada
        </button>
        <button class="btn btn-outline-primary mt-3" on:click={carreraRealizada}>
          Carrera Realizada
        </button>
      </div>
    </div>
  {/if}
</div>


<style>
  .card {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
  }

  .card-body {
    padding: 1.25rem;
  }

  .card-title {
    margin-bottom: 0.75rem;
  }

  .card-text {
    margin-bottom: 0.5rem;
  }

  .btn {
    margin-left: auto;
  }

  #map {
    height: 400px;
    width: 100%;
  }
</style>