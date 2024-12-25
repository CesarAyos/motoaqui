<script>
  import { onMount, onDestroy } from "svelte";
  import "leaflet/dist/leaflet.css";
  import { supabase } from "../components/supabase.js"; // Ruta corregida
  import { protegerRuta } from "./protegerRuta.js";


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
  

  onMount(async () => {
    if (typeof window === "undefined") return;
    await protegerRuta(); 

    // Obtener la sesión del usuario
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session || !session.user) {
      window.location.href = "/loginUser";
      return;
    }

    user = session.user;

    const { data, error } = await supabase
      .from("motoaquiClient")
      .select("primernombre, primerapellido")
      .eq("correo", user.email)
      .limit(1) // Asegurarse de que solo se devuelve una fila
      .single();

    if (error) {
      alert("Error fetching user data. Please try again later.");
      console.error("Error:", error.message);
      return;
    }

    if (!data) {
      alert("User data not found.");
      console.error("User data not found");
      return;
    }

    userFirstName = data.primernombre;
    userLastName = data.primerapellido;

    // Inicialización del mapa
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

  async function enviarWhatsApp() {
  if (!originMarker || !destinationMarker) {
    return alert(
      "Por favor selecciona tanto el origen como el destino en el mapa."
    );
  }

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
        usuario_nombre: `${userFirstName} ${userLastName}`, // Asegúrate de que esto se inserta correctamente
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
    window.location.href = "/carreras"; // Redirigir a la página carreras
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

<main class="bg-dark pt-5">
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