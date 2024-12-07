<script>
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";
  import { supabase } from "./supabase.js";

  let map;
  let originMarker;
  let destinationMarker;
  let moneda = "";
  let llevarVueltos = false;
  let cantidadVueltos = "";
  let tiempo = "";

  let user = "";  // Usuario que pide la carrera

  onMount(async () => {
    // Obtener la sesión del usuario
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/login";
    } else {
      user = session.user;
    }

    if (typeof window !== "undefined") {
      const L = (await import("leaflet")).default;

      // Crear el mapa
      map = L.map("map").setView([8.03687, -72.2603], 14);

      // Añadir capa de OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Añadir escala
      L.control.scale().addTo(map);

      // Crear icono del taxi
      let taxiIcon = L.icon({
        iconUrl: "/moto.png",
        iconSize: [20, 20],
      });

      // Configurar evento de click en el mapa
      map.on("click", function (e) {
        if (!originMarker) {
          // Añadir marcador de origen
          originMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon: taxiIcon }).addTo(map);
          originMarker.bindPopup("¿Me puedes buscar aquí?").openPopup();
        } else if (!destinationMarker) {
          // Añadir marcador de destino
          destinationMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon: taxiIcon }).addTo(map);
          destinationMarker.bindPopup("Llévame aquí").openPopup();
        } else {
          // Si ambos marcadores existen, actualizar el marcador de destino
          destinationMarker.setLatLng([e.latlng.lat, e.latlng.lng]);
          destinationMarker.bindPopup("Mejor llévame aquí").openPopup();
        }
      });
    }
  });

  async function enviarWhatsApp() {
    if (originMarker && destinationMarker) {
      const origin = originMarker.getLatLng();
      const destination = destinationMarker.getLatLng();
      const originLink = `https://www.openstreetmap.org/?mlat=${origin.lat}&mlon=${origin.lng}#map=18/${origin.lat}/${origin.lng}`;
      const destinationLink = `https://www.openstreetmap.org/?mlat=${destination.lat}&mlon=${destination.lng}#map=18/${destination.lat}/${destination.lng}`;
      const mensaje = `Voy a cancelar en ${moneda}.\n${llevarVueltos ? `Llevar vueltos: ${cantidadVueltos}.\n` : ""}Búscame en: ${tiempo}.\nPor favor búscame aquí: [${originLink}].\nPor favor llévame aquí: [${destinationLink}].`;

      // Guardar en la base de datos
      const { error } = await supabase.from('carreras').insert([{
        usuario_id: user.id,  // Usar el ID del usuario
        origen_lat: origin.lat,
        origen_lng: origin.lng,
        destino_lat: destination.lat,
        destino_lng: destination.lng,
        moneda,
        llevar_vueltos: llevarVueltos,
        cantidad_vueltos: cantidadVueltos,
        tiempo,
        fecha: new Date().toISOString()
      }]);
      if (error) {
        console.error('Error inserting data:', error.message);
      } else {
        console.log('Data inserted successfully');
      }

      // Enviar mensaje por WhatsApp
      const url = `https://wa.me/584169752291?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank");

      // Resetear el formulario y los marcadores
      resetForm();
    } else {
      alert("Por favor selecciona tanto el origen como el destino en el mapa.");
    }
  }

  function resetForm() {
    // Resetear los valores del formulario
    moneda = "";
    llevarVueltos = false;
    cantidadVueltos = "";
    tiempo = "";

    // Eliminar los marcadores del mapa
    if (originMarker) {
      map.removeLayer(originMarker);
      originMarker = null;
    }
    if (destinationMarker) {
      map.removeLayer(destinationMarker);
      destinationMarker = null;
    }
  }
</script>

<main class="bg-dark">
  <div class="container">
    <div class="row">
      <div class="col map">
        <div id="map"></div>
      </div>
      <div class="card dform col bg-dark">
        <form on:submit|preventDefault={enviarWhatsApp}>
          <label class="text-white">
            Moneda:
            <select bind:value={moneda} required>
              <option value="" disabled selected>Selecciona una opción</option>
              <option value="pesos">Pesos</option>
              <option value="dólares">Dólares</option>
            </select>
          </label>

          <label class="text-white">
            Llevar vueltos:
            <input type="checkbox" bind:checked={llevarVueltos} />
          </label>

          {#if llevarVueltos}
            <label class="text-white">
              Valor del billete que tengo:
              <input type="number" bind:value={cantidadVueltos} min="0" />
            </label>
          {/if}

          <label class="text-white">
            ¿Cuándo te buscamos?:
            <select bind:value={tiempo} required>
              <option value="" disabled selected>Selecciona una opción</option>
              <option value="5 minutos">En 5 minutos</option>
              <option value="30 minutos">En 30 minutos</option>
              <option value="ahora">Ahora</option>
            </select>
          </label>

          <button type="submit">Pedir Carrera</button>
        </form>
      </div>
    </div>
  </div>
</main>

<style>
  #map {
    width: 100%;
    height: 600px;
  }
  .map {
    overflow-y: auto;
    max-height: 500px;
  }
  form {
    margin-top: 20px;
  }
  label, select, input, button {
    display: block;
    margin: 10px 0;
  }
  .container {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .col {
    flex: 1;
  }
  @media (max-width: 900px) {
    .row {
      flex-direction: column;
    }
  }
</style>
