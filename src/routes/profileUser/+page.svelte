<script>
  import Maps from "../../components/maps.svelte";
  import Navbar from "../../components/navbar.svelte";
  import { supabase } from "../../components/supabase.js";
  import { onMount } from "svelte";
  

  let user = "";
  let userName = "";
  let ultimaCarrera = {};
  let loading = true;

  onMount(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        window.location.href = "/loginUser";
        return;
      }

      user = session.user;
      
      const { data, error } = await supabase
        .from("registro_clientes")
        .select("primernombre, primerapellido")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
        userName = user.email; // fallback to email
      } else {
        userName = data.primernombre;
        user = data.primerapellido;
      }
    } catch (e) {
      console.error("Unexpected error:", e);
      window.location.href = "/loginUser";
    } finally {
      loading = false;
    }
  });
</script>

<Navbar />

{#if loading}
  <div class="text-center text-white">Cargando...</div>
{:else}
  <div class="container m-2">
    <p class="text-end"><strong> Bienvenido {userName}</strong></p>
  </div>
{/if}

<div
  class="alert alert-primary alert-dismissible fade show"
  role="alert"
>
  <button
    type="button"
    class="btn-close"
    data-bs-dismiss="alert"
    aria-label="Close"
  ></button>
  <ol>
   <li> <strong>Bienvenido</strong> Estos son los pasos para apartar un puesto en <strong>Rapiditos Colón</strong></li>
   <li> <strong>Usa el boton de usar mi ubicacion exacta</strong> es para dirigir al chofer a tu ubicacion </li>
   <li> <strong>Seleccione el dia y la hora exacta</strong> en la que quieres apartar tu puesto</li>
   <li> <strong>Indicanos el numero de pasajero</strong> o si vas tu solo/a</li>
   <li> <strong>Puedes decir cuantas maletas llevas</strong> 1,2,3...</li>
   <li> <strong>Dale a confirmar servicio carrera</strong> esto nos enviara un mensaje de whatsapp</li>
   <li> <strong>Te saldra un mensaje de solicitud enviada con exito</strong> y te redirigira a nuestro whatsapp principal</li>
   <li> <strong>Vuelve a la aplicacion</strong> </li>
   <li> <strong>En unos instantes te confirmaran tu viaje </strong> </li>
   <li> <strong>Ten un feliz viaje </strong></li>
  </ol>
</div>




<div>
  <Maps />
</div>
