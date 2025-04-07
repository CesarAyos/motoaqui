<script>
  import { supabase } from "./supabase.js";

     async function cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/"; // Redirige a la página principal
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Ocurrió un error al cerrar sesión");
    }
  }
</script>

<div class="d-flex justify-content-end mb-3">
    <button 
      on:click={cerrarSesion}
      class="btn btn-outline-danger"
      title="Cerrar sesión"
    >
      <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
    </button>
  </div>