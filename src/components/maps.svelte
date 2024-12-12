<script>
  import { onMount, onDestroy } from "svelte";
  import "leaflet/dist/leaflet.css";
  import { supabase } from "./supabase.js";
  import { notificationStore } from "../components/notificationStore.js";

  let map;
  let originMarker;
  let destinationMarker;
  let formData = {
    moneda: "",
    llevarVueltos: false,
    cantidadVueltos: "",
    tiempo: "",
  };

  let user = "";
  let userFirstName = "";
  let userLastName = "";
  let notificationMessage = "";
  $: notification = $notificationStore;
  let showModal = false; // Asegúrate de inicializar este valor
  $: showModal;

  onMount(async () => {
    if (typeof window === "undefined") return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user) {
      window.location.href = "/loginUser";
      return;
    }

    user = session.user;

    const { data, error } = await supabase
      .from("motoaquiClient")
      .select("primernombre, primerapellido")
      .eq("correo", user.email)
      .single();

    if (error) {
      alert("Error fetching user data. Please try again later.");
      console.error("Error:", error.message);
      return;
    }

    userFirstName = data.primernombre;
    userLastName = data.primerapellido;

    const L = (await import("leaflet")).default;

    map = L.map("map").setView([8.03687, -72.2603], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    L.control.scale().addTo(map);

    let taxiIcon = L.icon({
      iconUrl: "/moto.png",
      iconSize: [20, 20],
    });

    map.on("click", (e) => handleMapClick(e.latlng, taxiIcon));

    window.addEventListener("notificacion", handleNotification);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("notificacion", handleNotification);
    }
  });

  function handleMapClick(latlng, taxiIcon) {
    if (!originMarker) {
      originMarker = L.marker([latlng.lat, latlng.lng], {
        icon: taxiIcon,
      }).addTo(map);
      originMarker.bindPopup("¿Me puedes buscar aquí?").openPopup();
    } else if (!destinationMarker) {
      destinationMarker = L.marker([latlng.lat, latlng.lng], {
        icon: taxiIcon,
      }).addTo(map);
      destinationMarker.bindPopup("Llévame aquí").openPopup();
    } else {
      destinationMarker.setLatLng([latlng.lat, latlng.lng]);
      destinationMarker.bindPopup("Mejor llévame aquí").openPopup();
    }
  }

  function handleNotification(event) {
    const { mensaje } = event.detail;
    notificationStore.set(mensaje);
    console.log("Notificación recibida:", mensaje);
  }

  async function enviarWhatsApp() {
    if (originMarker && destinationMarker) {
      const origin = originMarker.getLatLng();
      const destination = destinationMarker.getLatLng();
      const originLink = `https://www.openstreetmap.org/?mlat=${origin.lat}&mlon=${origin.lng}#map=18/${origin.lat}/${origin.lng}`;
      const destinationLink = `https://www.openstreetmap.org/?mlat=${destination.lat}&mlon=${destination.lng}#map=18/${destination.lat}/${destination.lng}`;

      const mensaje = `Hola soy ${userFirstName} ${userLastName}. Voy a cancelar en ${formData.moneda}.\n${formData.llevarVueltos ? `Llevar vueltos: ${formData.cantidadVueltos}.\n` : ""}Búscame en: ${formData.tiempo}.\nPor favor búscame aquí: [${originLink}].\nPor favor llévame aquí: [${destinationLink}].`;

      const { data, error } = await supabase
        .from("carreras")
        .insert([
          {
            origen_lat: origin.lat,
            origen_lng: origin.lng,
            destino_lat: destination.lat,
            destino_lng: destination.lng,
            moneda: formData.moneda,
            llevar_vueltos: formData.llevarVueltos,
            cantidad_vueltos: formData.cantidadVueltos,
            tiempo: formData.tiempo,
            fecha: new Date().toISOString(),
            usuario_nombre: `${userFirstName} ${userLastName}`,
          },
        ])
        .single();

      if (error) {
        alert("Error inserting data. Please try again.");
        console.error("Error:", error.message);
      } else {
        const url = `https://wa.me/584169752291?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
        resetForm();
        showModal = true; // Mostrar el modal después de enviar
      }
    } else {
      alert("Por favor selecciona tanto el origen como el destino en el mapa.");
    }
  }

  function resetForm() {
    formData = {
      moneda: "",
      llevarVueltos: false,
      cantidadVueltos: "",
      tiempo: "",
    };

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

{#if showModal}
  <div
    class="modal-overlay"
    on:click={() => (showModal = false)}
    tabindex="0"
    on:keydown={(e) => e.key === "Escape" && (showModal = false)}
  >
    <div class="modal-content">
      <img src="/voy.png" style="height:50px ;width:50px" alt="Conductor en camino" />
      <h2>En unos minutos llegará tu conductor</h2>
      <button
        type="button"
        class="btn btn-primary"
        on:click={() => (showModal = false)}>Cerrar</button
      >
    </div>
  </div>
{/if}

<main class="bg-dark">
  <div class="container">
    <div class="row">
      <div class="col map">
        <div id="map"></div>
      </div>
      <div class="card dform col bg-dark">
        <h3 class="text-white border-bottom border-danger">
          Hola {userFirstName}
          {userLastName}, ¿a dónde iremos hoy?
        </h3>
        {#if notification}
          <div class="notification">
            <p>{notification}</p>
          </div>
        {/if}

        <form on:submit|preventDefault={enviarWhatsApp}>
          <label class="text-white">
            <p class="fs-2 border-bottom border-danger">
              ¿En qué moneda vas a cancelar?
            </p>
            <select
              class="btn btn-outline-warning"
              bind:value={formData.moneda}
              required
            >
              <option value="" disabled selected>Selecciona una opción</option>
              <option value="pesos">Pesos</option>
              <option value="dólares">Dólares</option>
            </select>
          </label>

          <label class="text-white">
            <p class="fs-3 border-bottom border-danger">
              ¿Debemos llevar vueltos?
            </p>
            <input
              type="radio"
              bind:group={formData.llevarVueltos}
              value={true}
            />
            Sí
            <input
              type="radio"
              bind:group={formData.llevarVueltos}
              value={false}
            /> No
          </label>

          {#if formData.llevarVueltos}
            <label class="text-white">
              Valor del billete que tengo:
              <input
                type="number"
                bind:value={formData.cantidadVueltos}
                min="0"
              />
            </label>
          {:else}
            <p class="text-white fs-3 border-bottom border-danger">Perfecto</p>
          {/if}

          <label class="text-white">
            <p class="fs-3 border-bottom border-danger">
              ¿En cuánto tiempo te buscamos?:
            </p>
            <select
              class="btn btn-outline-warning"
              bind:value={formData.tiempo}
              required
            >
              <option value="" disabled selected>Selecciona una opción</option>
              <option value="Ahora mismo">Ahora mismo</option>
              <option value="En 5 minutos">En 5 minutos</option>
              <option value="En 10 minutos">En 10 minutos</option>
              <option value="En 15 minutos">En 15 minutos</option>
              <option value="En 20 minutos">En 20 minutos</option>
              <option value="En 25 minutos">En 25 minutos</option>
              <option value="En 30 minutos">En 30 minutos</option>
            </select>
          </label>

          <div class="d-flex justify-content-end">
            <button class="btn btn-outline-warning m-2" type="submit"
              >Pedir Carrera</button
            >
            <button
              class="btn btn-danger m-2"
              type="button"
              on:click={handleLogout}>Cerrar Sesión</button
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
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background: #343a40; /* Fondo oscuro */
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    width: 70%; /* 70% de ancho */
  }
  img {
    max-width: 100%;
    height: auto;
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
