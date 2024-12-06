<script>
  import { supabase } from "../../components/supabase.js";
  import { onMount } from "svelte";

  let user = "";
  let userName = "";

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/login";
    } else {
      user = session.user;
      const { data, error } = await supabase
        .from('motoaquiClient')
        .select('primernombre, primerapellido')
        .eq('correo', user.email)
        .single();
        
      if (error) {
        console.error('Error fetching user data:', error.message);
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

<button class="btn btn-outline-warning" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasScrolling" aria-controls="offcanvasScrolling">Menu</button>

<div class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasScrolling" aria-labelledby="offcanvasScrollingLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasScrollingLabel">{userName} {user}</h5>
    <button type="button" class="btn-close" style="background-color: white;" data-bs-dismiss="offcanvas"  aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <p>Try scrolling the rest of the page to see this option in action.</p>
  </div>
  <button type="button" class="btn btn-secondary" on:click={handleLogout}>Cerrar sesión</button>
</div>


