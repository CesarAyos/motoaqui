<script>
  import Maps from "../../components/maps.svelte";
  import { supabase } from "../../components/supabase.js";
  import { onMount } from "svelte";

  let user = "";
  let userName = "";
  let ultimaCarrera = {};

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/login";
    } else {
      user = session.user;
      const { data, error } = await supabase
        .from("motoaquiClient")
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
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/loginUser";
  };
</script>

<div
  class="offcanvas offcanvas-end"
  data-bs-scroll="true"
  data-bs-backdrop="false"
  tabindex="-1"
  id="offcanvasScrolling"
  aria-labelledby="offcanvasScrollingLabel"
>
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasScrollingLabel">
      {userName} {user}
    </h5>
    <button
      type="button"
      class="btn-close"
      style="background-color: white;"
      data-bs-dismiss="offcanvas"
      aria-label="Close"
    ></button>
  </div>
  <div class="offcanvas-body">
    <h5>Última carrera pedida</h5>
    {#if ultimaCarrera}
      <div>
        <p>Fecha: {ultimaCarrera.fecha}</p>
        <p>Origen: {ultimaCarrera.origen_lat}, {ultimaCarrera.origen_lng}</p>
        <p>Destino: {ultimaCarrera.destino_lat}, {ultimaCarrera.destino_lng}</p>
        <p>Moneda: {ultimaCarrera.moneda}</p>
        <p>Llevar vueltos: {ultimaCarrera.llevar_vueltos ? 'Sí' : 'No'}</p>
        {#if ultimaCarrera.llevar_vueltos}
          <p>Cantidad de vueltos: {ultimaCarrera.cantidad_vueltos}</p>
        {/if}
      </div>
    {:else}
      <p>No has pedido ninguna carrera aún.</p>
    {/if}
  </div>
  <button type="button" class="btn btn-secondary" on:click={handleLogout}>Cerrar sesión</button>
</div>

<div>
  <Maps />
</div>

<div class="d-grid bg-dark gap-2 p-2">
  <button
    class="btn btn-outline-warning"
    type="button"
    data-bs-toggle="offcanvas"
    data-bs-target="#offcanvasScrolling"
    aria-controls="offcanvasScrolling">Menu</button
  >
</div>
