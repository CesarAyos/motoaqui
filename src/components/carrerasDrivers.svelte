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
  let routeLayerConductor;

  let originIcon, destinationIcon;

  if (typeof window !== "undefined") {
    onMount(async () => {
      const L = await import("leaflet");
      await import("leaflet-routing-machine");

      carreras = cargarCarrerasDesdeLocalStorage(); // Cargar carreras desde almacenamiento local
      if (carreras.length === 0) {
        await cargarCarreras(); // Si no hay carreras en almacenamiento local, cargarlas desde la base de datos
      }

      await protegerRuta();

      const mapContainer = document.getElementById("map");
      if (mapContainer) {
        map = L.map("map").setView([8.03687, -72.2603], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        L.control.scale().addTo(map);

        originIcon = L.icon({
          iconUrl: "/moto.png",
          iconSize: [38, 38],
          iconAnchor: [22, 38],
          popupAnchor: [-3, -38],
        });

        destinationIcon = L.icon({
          iconUrl: "/moto.png", // Asegúrate de que esta ruta sea correcta
          iconSize: [38, 38],
          iconAnchor: [22, 38],
          popupAnchor: [-3, -38],
        });
      }
    });
  }

  const cargarCarreras = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session || !session.user) {
      if (typeof window !== "undefined") {
        window.location.href = "/loginUser";
      }
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
      guardarCarrerasEnLocalStorage(carreras); // Guardar carreras en almacenamiento local
    }
  };

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

    const origin = L.latLng(carrera.origen_lat, carrera.origen_lng);
    const destination = L.latLng(carrera.destino_lat, carrera.destino_lng);

    if (routeLayer) {
      map.removeControl(routeLayer);
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

    routeLayer = L.Routing.control({
      waypoints: [origin, destination],
      router: L.Routing.osrmv1({
        serviceUrl: `https://router.project-osrm.org/route/v1`,
      }),
      lineOptions: {
        styles: [{ color: "blue", weight: 4 }],
      },
    }).addTo(map);

    // Ajustar vista del mapa a los puntos de referencia
    const group = L.featureGroup([originMarker, destinationMarker]);
    map.fitBounds(group.getBounds());
  };

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
      actualizarCarreraEnLocalStorage(carreraSeleccionada);
      console.log("Carrera aceptada");

      const origen = L.latLng(
        carreraSeleccionada.origen_lat,
        carreraSeleccionada.origen_lng
      );

      map.on("click", (e) => {
        const conductorLat = e.latlng.lat;
        const conductorLng = e.latlng.lng;

        const conductorUbicacion = L.latLng(conductorLat, conductorLng);

        if (routeLayerConductor) {
          map.removeControl(routeLayerConductor);
        }

        routeLayerConductor = L.Routing.control({
          waypoints: [conductorUbicacion, origen],
          router: L.Routing.osrmv1({
            serviceUrl: `https://router.project-osrm.org/route/v1`,
          }),
          lineOptions: {
            styles: [{ color: "green", weight: 4 }],
          },
        }).addTo(map);

        routeLayerConductor
          .getPlan()
          .setWaypoints([conductorUbicacion, origen]);
        map.fitBounds(L.latLngBounds([conductorUbicacion, origen]));

        // Agregar un marcador con una imagen personalizada
        const icon = L.icon({
          iconUrl: "/direccion.png", // Ruta a la imagen personalizada
          iconSize: [38, 38], // Tamaño del icono
          iconAnchor: [22, 94], // Punto de anclaje del icono
          popupAnchor: [-3, -76], // Punto donde se mostrará el popup
        });

        L.marker([conductorLat, conductorLng], { icon: icon })
          .addTo(map)
          .bindPopup("Ubicación del conductor")
          .openPopup();
      });

      alert("Haga clic en el mapa para indicar su ubicación actual.");
    }
  };

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
      eliminarCarreraDeLocalStorage(carreraSeleccionada.id); // Eliminar del almacenamiento local
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

  const eliminarCarreraDeLocalStorage = (idCarrera) => {
    const carrerasGuardadas =
      JSON.parse(localStorage.getItem("carreras")) || [];
    const carrerasActualizadas = carrerasGuardadas.filter(
      (c) => c.id !== idCarrera
    );
    localStorage.setItem("carreras", JSON.stringify(carrerasActualizadas));
  };

  const guardarCarrerasEnLocalStorage = (carreras) => {
    localStorage.setItem("carreras", JSON.stringify(carreras));
  };

  const cargarCarrerasDesdeLocalStorage = () => {
    const carrerasGuardadas = localStorage.getItem("carreras");
    return carrerasGuardadas ? JSON.parse(carrerasGuardadas) : [];
  };

  const actualizarCarreraEnLocalStorage = (carreraActualizada) => {
    const carrerasGuardadas =
      JSON.parse(localStorage.getItem("carreras")) || [];
    const carrerasActualizadas = carrerasGuardadas.map((c) =>
      c.id === carreraActualizada.id ? carreraActualizada : c
    );
    localStorage.setItem("carreras", JSON.stringify(carrerasActualizadas));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "/carrerasDrivers";
  };
</script>

<div>
  <div id="map" style="height: 400px;"></div>

  <div class="card mt-3">
    <div class="card-header d-flex justify-content-between align-items-center">
      Carreras Asignadas
      <button class="btn btn-outline-primary" on:click={cargarCarreras}
        >Recargar Carreras</button
      >
      <button class="btn btn-danger m-2" on:click={handleLogout}
        >Cerrar Sesión</button
      >
    </div>
    <ul class="list-group list-group-flush">
      {#each carreras as carrera}
        <li
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <button
            type="button"
            class="btn btn-link"
            on:click={() => mostrarRuta(carrera)}
            on:keydown={(e) => e.key === "Enter" && mostrarRuta(carrera)}
            style="text-decoration: none; color: inherit;"
          >
            Carrera ID: {carrera.id}
            <span class="badge badge-primary badge-pill">{carrera.estado}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>

  {#if carreraSeleccionada}
    <div class="card mt-3">
      <div class="card-header">Detalles de la Carrera</div>
      <div class="card-body">
        <h5 class="card-title">Carrera ID: {carreraSeleccionada.id}</h5>
        <p class="card-text">Nombre del Conductor: {conductorNombre}</p>
        <p class="card-text">Nombre del Usuario: {usuarioNombre}</p>
        <button
          class="btn btn-outline-success mt-3"
          on:click={aceptarCarrera}
          disabled={carreraSeleccionada.estado === "aceptada"}
        >
          Carrera Aceptada
        </button>
        <button
          class="btn btn-outline-primary mt-3"
          on:click={carreraRealizada}
        >
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
