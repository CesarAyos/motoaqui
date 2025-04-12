<script>
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";
  import { supabase } from "../components/supabase.js";
  import { protegerRuta } from "./protegerRuta.js";
  import Cerrarsesion from "./cerrarsesion.svelte";

  let map;
  let pickupMarker;
  let userLocation = null;
  let loadingLocation = false;
  let locationError = null;
  let showConfirmationModal = false;

  let formData = {
    horaServicio: "",
    llevaMaletas: false,
    cantidadMaletas: 0,
    pasajeros: 1,
    direccion: "Ubicando tu posición...",
  };

  let user = null;
  let userInfo = {
    nombre: "Usuario",
    email: "",
    telefono: "",
    foto: "",
  };

  async function checkLocationPermission() {
    try {
      if (navigator.permissions) {
        const status = await navigator.permissions.query({
          name: "geolocation",
        });

        if (status.state === "denied") {
          alert(
            "El acceso a la ubicación está bloqueado. Por favor, ve a la configuración de tu navegador o dispositivo para habilitarlo."
          );
          return false;
        } else if (status.state === "prompt") {
          alert(
            "Se necesita acceso a tu ubicación. Por favor acepta la solicitud cuando aparezca."
          );
        }

        return status.state === "granted";
      }
      return true;
    } catch (e) {
      console.error("Error al verificar permisos:", e);
      return false;
    }
  }

  async function getCurrentLocation() {
    loadingLocation = true;
    locationError = null;

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      if (map) {
        map.setView([userLocation.lat, userLocation.lng], 16);

        if (!pickupMarker) {
          pickupMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
            radius: 8,
            fillColor: "#3388ff",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
            draggable: true,
          }).addTo(map);

          pickupMarker
            .bindPopup("<b>Punto de recogida</b><br>Arrastra para ajustar")
            .openPopup();

          pickupMarker.on("dragend", async function (e) {
            const newPos = e.target.getLatLng();
            userLocation = { lat: newPos.lat, lng: newPos.lng };
            await updateAddress();
          });
        } else {
          pickupMarker.setLatLng([userLocation.lat, userLocation.lng]);
        }

        await updateAddress();
      }
    } catch (error) {
      console.error("Error getting location:", error);
      locationError = error.message || "No se pudo obtener la ubicación.";

      if (!userLocation && map) {
        userLocation = { lat: 8.03687, lng: -72.2603 };
        map.setView([userLocation.lat, userLocation.lng], 14);
      }

      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "La aplicación necesita acceso a tu ubicación. Por favor habilita los permisos en la configuración de tu celular."
        );
      }
    } finally {
      loadingLocation = false;
    }
  }

  async function updateAddress() {
    if (!userLocation) return;

    try {
      const { data, error } = await supabase.rpc("geocode_reverse", {
        lat: userLocation.lat,
        lon: userLocation.lng,
      });

      if (!error && data) {
        formData.direccion =
          data.display_name ||
          `Ubicación (${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)})`;
      } else {
        formData.direccion = `Ubicación exacta (${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)})`;
      }
    } catch (err) {
      console.error("Error en geocodificación:", err);
      formData.direccion = `Ubicación (${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)})`;
    }
  }

  onMount(async () => {
    if (typeof window === "undefined") return;

    await protegerRuta();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      window.location.href = "/loginUser";
      return;
    }

    user = session.user;
    userInfo.email = user.email;

    const { data: userData, error } = await supabase
      .from("registro_clientes")
      .select("primernombre, primerapellido, telefono, foto")
      .eq("correo", user.email)
      .maybeSingle();

    if (userData) {
      userInfo.nombre = `${userData.primernombre} ${userData.primerapellido}`;
      userInfo.telefono = userData.telefono;

      
    }

    const L = (await import("leaflet")).default;
    map = L.map("map").setView([8.03687, -72.2603], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    await getCurrentLocation();
  });

  async function confirmarServicio() {
    if (!userLocation) {
      alert(
        "Por favor permite el acceso a tu ubicación o selecciona un punto en el mapa"
      );
      return;
    }

    if (!formData.horaServicio) {
      alert("Por favor ingresa la hora en que necesitas el servicio");
      return;
    }

    if (formData.llevaMaletas && formData.cantidadMaletas < 1) {
      alert("Por favor ingresa cuántas maletas llevarás");
      return;
    }

    try {
      const horaServicio = new Date(formData.horaServicio);
      if (isNaN(horaServicio.getTime())) {
        alert("La hora ingresada no es válida");
        return;
      }

      const { error } = await supabase.from("solicitudes_servicio").insert([
        {
          usuario_id: user.id,
          usuario_email: userInfo.email,
          usuario_nombre: userInfo.nombre,
          punto_recogida: `POINT(${userLocation.lng} ${userLocation.lat})`,
          latitud: userLocation.lat,
          longitud: userLocation.lng,
          direccion_recogida: formData.direccion,
          hora_servicio: horaServicio.toISOString(),
          lleva_maletas: formData.llevaMaletas,
          cantidad_maletas: formData.llevaMaletas
            ? formData.cantidadMaletas
            : null,
          pasajeros: formData.pasajeros,
        },
      ]);

      if (error) throw error;

      showConfirmationModal = true;
      setTimeout(() => {
        showConfirmationModal = false;
        resetForm();
      }, 5000);

      const mensaje = `🚖 *Nueva solicitud de servicio*  
      
👤 *Pasajero:* ${userInfo.nombre}  
📧 *Contacto:* ${userInfo.email}  
${userInfo.telefono ? `📱 *Teléfono:* ${userInfo.telefono}\n` : ""}
👥 *Pasajeros:* ${formData.pasajeros}  

📍 *Punto de recogida:*  
${formData.direccion}  
Ver en mapa: https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}  

🕒 *Hora requerida:* ${horaServicio.toLocaleTimeString()}  

🧳 *Maletas:* ${formData.llevaMaletas ? formData.cantidadMaletas : "No"}  

*Por favor confirma si puedes atender esta solicitud.*`;

      const whatsappUrl = `https://wa.me/584268754094?text=${encodeURIComponent(mensaje)}`;
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("Error al guardar la solicitud:", error);
      alert(
        "Ocurrió un error al registrar tu solicitud. Por favor intenta nuevamente."
      );
    }
  }

  function resetForm() {
    formData = {
      horaServicio: "",
      llevaMaletas: false,
      cantidadMaletas: 0,
      pasajeros: 1,
      direccion: "Ubicando tu posición...",
    };
    if (pickupMarker) {
      map.removeLayer(pickupMarker);
      pickupMarker = null;
    }
  }
</script>

<div class="user-profile">
  {#if userInfo.foto}
    <img
      src={userInfo.foto}
      alt="Foto de perfil"
      class="user-avatar"
      on:error={(e) => {
        console.error("Error cargando imagen:", e);
        userInfo.foto = null;
      }}
    />
  {:else}
    <div class="default-avatar">
      {userInfo.nombre
        ? userInfo.nombre
            .split(" ")
            .map((n) => n[0])
            .join("")
        : ""}
    </div>
  {/if}

  <div class="user-greeting">
    <span class="welcome-text">Bienvenido</span>
    <span class="user-fullname">{userInfo.nombre}</span>
  </div>
</div>

<main class="container py-4">
  {#if showConfirmationModal}
    <div
      class="modal-backdrop show d-block"
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1040;"
    ></div>
    <div
      class="modal show d-block"
      style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1050;"
    >
      <div
        class="modal-content"
        style="background: white; padding: 20px; border-radius: 5px; max-width: 500px; margin: 0 auto; text-align: center;"
      >
        <div style="color: #28a745; font-size: 3rem; margin-bottom: 1rem;">
          ✓
        </div>
        <h3 style="color: #28a745;">¡Gracias por preferirnos!</h3>
        <p>Solicitud enviada con éxito</p>
        <p>En breve confirmaremos tu viaje</p>
      </div>
    </div>
  {/if}

  <div class="row">
    <div class="col-md-8 mb-4">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h2 class="h5 mb-0">¿Dónde te recogemos?</h2>
        </div>
        <div class="card-body p-0">
          <div id="map" style="height: 400px;"></div>
          <div class="p-3">
            {#if loadingLocation}
              <div class="d-flex align-items-center text-primary">
                <div
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></div>
                <span>Obteniendo tu ubicación...</span>
              </div>
            {:else if locationError}
              <div class="alert alert-warning mb-2">
                {locationError}
              </div>
            {/if}

            <div class="mb-3">
              <p class="form-label fw-bold">Dirección exacta:</p>
              <textarea
                class="form-control"
                rows="2"
                readonly
                bind:value={formData.direccion}
              ></textarea>
            </div>

            <button class="btn btn-primary w-100" on:click={getCurrentLocation}>
              <i class="bi bi-geo-alt-fill me-2"></i> Usar mi ubicación actual
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h2 class="h5 mb-0">Detalles del servicio</h2>
        </div>
        <div class="card-body">
          <form on:submit|preventDefault={confirmarServicio}>
            <div class="mb-3">
              <label for="horaServicio" class="form-label fw-bold">
                <i class="bi bi-clock me-2"></i>Hora requerida:
              </label>
              <input
                type="datetime-local"
                id="horaServicio"
                class="form-control"
                bind:value={formData.horaServicio}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div class="mb-3">
              <label for="pasajeros" class="form-label fw-bold">
                <i class="bi bi-people me-2"></i>Número de pasajeros:
              </label>
              <select
                id="pasajeros"
                class="form-select"
                bind:value={formData.pasajeros}
                required
              >
                <option value="1">1 pasajero</option>
                <option value="2">2 pasajeros</option>
                <option value="3">3 pasajeros</option>
                <option value="4">4 pasajeros</option>
                <option value="5">5 pasajeros</option>
                <option value="6">6 o más pasajeros</option>
              </select>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="llevaMaletas"
                  bind:checked={formData.llevaMaletas}
                />
                <label class="form-check-label fw-bold" for="llevaMaletas">
                  <i class="bi bi-bag-check me-2"></i>¿Llevas maletas?
                </label>
              </div>

              {#if formData.llevaMaletas}
                <div class="mt-2">
                  <label for="cantidadMaletas" class="form-label"
                    >Cantidad de maletas:</label
                  >
                  <select
                    id="cantidadMaletas"
                    class="form-select"
                    bind:value={formData.cantidadMaletas}
                    required
                  >
                    <option value="1">1 maleta</option>
                    <option value="2">2 maletas</option>
                    <option value="3">3 maletas</option>
                    <option value="4">4 maletas</option>
                    <option value="5">5 o más maletas</option>
                  </select>
                </div>
              {/if}
            </div>

            <div class="d-grid gap-2">
              <button
                type="submit"
                class="btn btn-success btn-lg"
                disabled={!userLocation || loadingLocation}
              >
                {#if loadingLocation}
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                {:else}
                  <i class="bi bi-check-circle me-2"></i>
                {/if}
                Confirmar Servicio
              </button>

              <button
                type="button"
                class="btn btn-outline-secondary"
                on:click={resetForm}
              >
                <i class="bi bi-x-circle me-2"></i>Cancelar
              </button>
              <Cerrarsesion />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</main>

<!-- <style>
  #map {
    width: 100%;
    height: 100%;
    min-height: 400px;
    border-radius: 0.25rem 0.25rem 0 0;
  }

  .card {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  .card-header {
    border-radius: 0.25rem 0.25rem 0 0 !important;
  }

  .user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.profile-pic, .default-profile-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.default-profile-pic {
  background-color: #3388ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.welcome {
  font-size: 0.8rem;
  color: #666;
}

.user-name {
  font-weight: bold;
}

  @media (max-width: 767.98px) {
    #map {
      min-height: 300px;
    }
  }
</style> -->

<style>
  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    margin-bottom: 20px;
  }

  .user-avatar,
  .default-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e0e0e0;
  }

  .default-avatar {
    background: #3388ff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
  }

  .user-greeting {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .welcome-text {
    font-size: 0.8rem;
    color: #666;
  }

  .user-fullname {
    font-weight: 600;
    font-size: 1rem;
  }
</style>
