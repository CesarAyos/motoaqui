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
      window.location.href = "/loginUser";
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

  

  
</script>

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
   <li> <strong>Bienvenido</strong> Estos son los pasos para pedir un motoaqui</li>
   <li> <strong>Selecciona manualmente</strong> en donde estas ubicado y tu destino</li>
   <li> <strong>Elige la moneda</strong> en la que quieres cancelar</li>
   <li> <strong>Indicanos si debemos llevar vueltos</strong> y dinos que billete tienes</li>
   <li> <strong>Dinos en que tiempo quieres</strong> que te busquemos</li>
   <li> <strong>Dale pedir carrera</strong> esto nos enviara un mensaje de whatsapp</li>
   <li> <strong>Vuelve a la aplicacion</strong> </li>
   <li> <strong>Dale click en </strong> Chequear carrera </li>
   <li> <strong>Dale click en  </strong>  recargar </li>
   <li> <strong>En unos instantes te aparecera </strong>Los datos necesario de tu conductor asignado </li>
   <li> <strong>Ten un feliz viaje </strong> recomiendanos </li>
  </ol>
</div>




<div>
  <Maps />
</div>
