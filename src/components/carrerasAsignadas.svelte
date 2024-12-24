<script>
  import { onMount } from "svelte";
  import { supabase } from "../components/supabase.js";

  let carrerasAsignadas = [];
  let user = null;
  let userFirstName = "";
  let userLastName = "";

  // Función para cargar las carreras asignadas al usuario
  const cargarCarrerasAsignadas = async () => {
    if (!user) {
      console.error("No user information available.");
      return;
    }

    const fullName = `${userFirstName} ${userLastName}`;

    // Obtener las carreras asignadas al usuario
    const { data: carrerasData, error: carrerasError } = await supabase
      .from("carreras")
      .select("*")
      .eq("usuario_nombre", fullName)
      .eq("estado", "asignada"); // Filtrar por el nombre del usuario y el estado "asignada"

    if (carrerasError) {
      console.error("Error fetching data:", carrerasError.message);
    } else {
      if (carrerasData.length === 0) {
      } else {
        // Para cada carrera, obtener los detalles del conductor
        for (let carrera of carrerasData) {
          const { data: conductorData, error: conductorError } = await supabase
            .from("motoaquiDrivers")
            .select("*")
            .eq("id", carrera.conductor_id) // Filtrar por el ID del conductor
            .single();

          if (conductorError) {
            console.error(`Error fetching conductor data for carrera ID ${carrera.id}:`, conductorError.message);
          } else {
            // Añadir los detalles del conductor a la carrera
            carrera.conductor = conductorData;
          }
        }
        carrerasAsignadas = carrerasData;
      }
    }
  };

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      window.location.href = "/loginUser";
      return;
    }

    user = session.user;

    // Obtener el nombre del usuario de la sesión
    userFirstName = user.user_metadata.first_name;
    userLastName = user.user_metadata.last_name;

    await cargarCarrerasAsignadas(); // Cargar las carreras al montar el componente
  });

  // Función para recargar las carreras
  const recargarCarrerasAsignadas = async () => {
    await cargarCarrerasAsignadas();
  };
</script>

<div class="card">
  <div class="card-header d-flex justify-content-between">
    Carreras asignadas
    <button class="btn btn-outline-warning" on:click={recargarCarrerasAsignadas}>Recargar</button>
  </div>
  <div class="card-body">
    <blockquote class="blockquote mb-0">
      {#if carrerasAsignadas.length > 0}
        {#each carrerasAsignadas as carrera}
          <div class="card mb-3">
            <div class="card-body">
              {#if carrera.conductor}
                <p class="card-text">
                  Conductor: {carrera.conductor.primernombre} {carrera.conductor.primerapellido}
                </p>
                <p class="card-text">Teléfono: {carrera.conductor.telefono}</p>
                <p class="card-text">Modelo de la moto: {carrera.conductor.modelo}</p>
                <p class="card-text">Placa: {carrera.conductor.placa}</p>
                <p class="card-text">Color: {carrera.conductor.color}</p>
                <p class="card-text">Control: {carrera.conductor.control}</p>
                <p class="text-end text-danger">Ultima Carrera</p>
              {/if}
            </div>
          </div>
        {/each}
      {:else}
        <p>No hay carreras asignadas.</p>
      {/if}
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
