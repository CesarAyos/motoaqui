<script>
  import { onMount } from "svelte";
  import { supabase } from "../components/supabase.js";

  let carrerasAsignadas = [];
  let user = null;

  onMount(async () => {
    // Obtener la sesión del usuario
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/loginUser";
      return;
    }

    user = session.user;
    console.log("User Email:", user.email); // Verificar el correo del usuario

    await cargarCarrerasAsignadas();
  });

  async function cargarCarrerasAsignadas() {
    // Filtrar las carreras asignadas por el correo del cliente actual
    const { data, error } = await supabase
      .from("carrerasAsignadas")
      .select("*")
      .eq('correo_cliente', user.email);

    console.log("Data:", data); // Verificar los datos devueltos
    console.log("Error:", error); // Verificar errores devueltos

    if (error) {
      console.error("Error fetching carreras asignadas:", error.message);
    } else {
      carrerasAsignadas = data;
    }
  }

  async function recargarCarrerasAsignadas() {
    console.log("Recargando carreras asignadas...");
    await cargarCarrerasAsignadas();
  }
</script>

<div class="card">
  <div class="card-header d-flex justify-content-between">
    Carreras asignadas
    <button class="btn btn-primary" on:click={recargarCarrerasAsignadas}>Recargar</button>
  </div>
  <div class="card-body">
    <blockquote class="blockquote mb-0">
      <!-- Agregar esto para depuración -->
      {#each carrerasAsignadas as carrera}
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Carrera ID: {carrera.id_carrera}</h5>
            <p class="card-text">
              Conductor: {carrera.nombre_conductor} {carrera.apellido_conductor}
            </p>
            <p class="card-text">Teléfono: {carrera.telefono_conductor}</p>
            <p class="card-text">Modelo de la moto: {carrera.modelo_moto}</p>
            <p class="card-text">Placa: {carrera.placa_moto}</p>
            <p class="card-text">Color: {carrera.color_moto}</p>
            <p class="card-text">Control: {carrera.control_conductor}</p>
            <footer class="blockquote-footer">
              <small class="text-muted">Fecha de asignación: {new Date(carrera.fecha_asignacion).toLocaleString()}</small>
            </footer>
          </div>
        </div>
      {/each}
    </blockquote>
  </div>
</div>

<style>
  .card {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
  }

  .card-body {
    padding: 1.25rem;
  }

  .card-title {
    margin-bottom: 0.75rem;
  }

  .card-text {
    margin-bottom: 0.5rem;
  }

  .text-muted {
    color: #6c757d !important;
  }

  .btn {
    margin-left: auto;
  }
</style>
