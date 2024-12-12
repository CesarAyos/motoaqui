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


<div>
  <Maps />
</div>
