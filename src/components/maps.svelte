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

  let user = ""; // Usuario que pide la carrera
  let userFirstName = "";
  let userLastName = "";

  onMount(async () => {
    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/loginUser";
    } else {
      user = session.user;

      // Obtener datos del usuario de la tabla motoaquiClient
      const { data, error } = await supabase
        .from("motoaquiClient")
        .select("primernombre, primerapellido")
        .eq("correo", user.email)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
      } else {
        console.log("Datos del usuario:", data); // Verifica los datos obtenidos
        userFirstName = data.primernombre;
        userLastName = data.primerapellido;
        console.log("Nombre:", userFirstName, "Apellido:", userLastName); // Verificar nombres
      }
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
          originMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: taxiIcon,
          }).addTo(map);
          originMarker.bindPopup("¿Me puedes buscar aquí?").openPopup();
        } else if (!destinationMarker) {
          // Añadir marcador de destino
          destinationMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: taxiIcon,
          }).addTo(map);
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
      console.log("Nombre:", userFirstName, "Apellido:", userLastName); // Verificar nombres antes de enviar
      const origin = originMarker.getLatLng();
      const destination = destinationMarker.getLatLng();
      const originLink = `https://www.openstreetmap.org/?mlat=${origin.lat}&mlon=${origin.lng}#map=18/${origin.lat}/${origin.lng}`;
      const destinationLink = `https://www.openstreetmap.org/?mlat=${destination.lat}&mlon=${destination.lng}#map=18/${destination.lat}/${destination.lng}`;
      const mensaje = `Hola soy ${userFirstName} ${userLastName} Voy a cancelar en ${moneda}.\n${llevarVueltos ? `Llevar vueltos: ${cantidadVueltos}.\n` : ""}Búscame en: ${tiempo}.\nPor favor búscame aquí: [${originLink}].\nPor favor llévame aquí: [${destinationLink}].`;

      // Guardar en la base de datos
      const { error } = await supabase.from("carreras").insert([
        {
          usuario_id: user.id, // Usar el ID del usuario
          origen_lat: origin.lat,
          origen_lng: origin.lng,
          destino_lat: destination.lat,
          destino_lng: destination.lng,
          moneda,
          llevar_vueltos: llevarVueltos,
          cantidad_vueltos: cantidadVueltos,
          tiempo,
          fecha: new Date().toISOString(),
          usuario_nombre: `${userFirstName} ${userLastName}`, // Guardar el nombre del usuario
        },
      ]);
      if (error) {
        console.error("Error inserting data:", error.message);
      } else {
        console.log("Data inserted successfully");
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/loginUser";
  };
</script>

<main class="bg-dark">
  <div class="container">
    <div class="row">
      <div class="col map">
        <div id="map"></div>
      </div>
      <div class="card dform col bg-dark">
        <h3 class="text-white border-bottom border-danger">
          Hola {userFirstName}
          {userLastName} a donde iremos hoy?
        </h3>

        <form on:submit|preventDefault={enviarWhatsApp}>
          <label class="text-white">
            <p class="fs-2 border-bottom border-danger">En que moneda vas a cancelar?</p>
            <select
              class="btn btn-outline-warning"
              bind:value={moneda}
              required
            >
              <option value="" disabled selected>Selecciona una opción</option>
              <option value="pesos">Pesos</option>
              <option value="dólares">Dólares</option>
            </select>
          </label>

          <label class="text-white">
            <p class="fs-3 border-bottom border-danger">Debemos llevar Vueltos?</p>
            <input type="radio" bind:group={llevarVueltos} value={true} /> Sí
            <input type="radio" bind:group={llevarVueltos} value={false} /> No
          </label>
          {#if llevarVueltos}
            <label class="text-white">
              Valor del billete que tengo: <input
                type="number"
                bind:value={cantidadVueltos}
                min="0"
              />
            </label>
          {:else}
            <p class="text-white fs-3 border-bottom border-danger">Perfecto</p>
          {/if}

          <label class="text-white">
            <p class="fs-3 border-bottom border-danger">¿En cuanto tiempo te buscamos?:</p>

            <select
              class="btn btn-outline-warning"
              bind:value={tiempo}
              required
            >
              <option disabled selected>Selecciona una opción</option>
              <option value="5 minutos">Ahora mismo</option>
              <option value="30 minutos">En 5 minutos</option>
              <option value="30 minutos">En 10 minutos</option>
              <option value="30 minutos">En 15 minutos</option>
              <option value="30 minutos">En 20 minutos</option>
              <option value="30 minutos">En 25 minutos</option>
              <option value="30 minutos">En 30 minutos</option>
            </select>
          </label>
          <div class="d-flex justify-content-end">
            <button class="btn btn-outline-warning m-2" type="submit"
              >Pedir Carrera</button
            >
            <button class="btn btn-danger m-2" on:click={handleLogout}>Cerrar Sesión</button
              >
          </div>

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
  label,
  select,
  input,
  button {
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
