<script>
  import { onMount } from "svelte";
  import { supabase } from "../components/supabase.js";
  import protegerRuta from "../components/protegerRuta.js";
  
  

  let carrerasAsignadas = [];

  // Función para cargar todas las carreras asignadas
  const cargarCarrerasAsignadas = async () => {
    // Obtener todas las carreras asignadas
    const { data: carrerasData, error: carrerasError } = await supabase
      .from("carreras")
      .select("*")
      .eq("estado", "aceptada");

    if (carrerasError) {
      console.error("Error fetching data:", carrerasError.message);
    } else {
      if (carrerasData.length === 0) {
        console.warn("No se encontraron carreras asignadas.");
      } else {
        for (let carrera of carrerasData) {
          const { data: conductorData, error: conductorError } = await supabase
            .from("motoaquiDrivers")
            .select("*")
            .eq("id", carrera.conductor_id)
            .single();

          if (conductorError) {
            console.error(
              `Error fetching conductor data for carrera ID ${carrera.id}:`,
              conductorError.message
            );
          } else {
            carrera.conductor = conductorData;
          }
        }
        carrerasAsignadas = carrerasData;
        console.log(
          "Carreras Asignadas con detalles del conductor:",
          carrerasAsignadas
        ); // Depuración
      }
    }
  };

  onMount(async () => {
    await protegerRuta();
    await cargarCarrerasAsignadas();
    
  });

  // Función para recargar las carreras
  const recargarCarrerasAsignadas = async () => {
    await cargarCarrerasAsignadas();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/loginUser";
  };
</script>

<main >
<div class="card" style="background: #1b1b1b;">
  <div class="card-header d-flex justify-content-between text-white">
    Carreras aceptadas
    <button class="btn btn-outline-warning" on:click={recargarCarrerasAsignadas}
      >Recargar</button
    >
  </div>
  <button class="btn btn-danger m-2" type="button" on:click={handleLogout}
    >Cerrar Sesión</button
  >
  <div class="row row-cols-2 row-cols-lg-5 g-2 g-lg-3">
    <div class="col">
      <div class=" card-body">
        <blockquote class="blockquote mb-0">
          {#if carrerasAsignadas.length > 0}
            {#each carrerasAsignadas as carrera}
              <div class="card mb-3">
                <div class="card-body">
                  <h5 class="card-title">Carrera ID: {carrera.id}</h5>
                  <p class="card-text">Estado: {carrera.estado}</p>
                  <p class="card-text">Usuario: {carrera.usuario_nombre}</p>
                  {#if carrera.conductor}
                    <p class="card-text">
                      Conductor: {carrera.conductor.primernombre}
                      {carrera.conductor.primerapellido}
                    </p>
                    <p class="card-text">
                      Teléfono: {carrera.conductor.telefono}
                    </p>
                    <p class="card-text">
                      Modelo de la moto: {carrera.conductor.modelo}
                    </p>
                    <p class="card-text">Placa: {carrera.conductor.placa}</p>
                    <p class="card-text">Color: {carrera.conductor.color}</p>
                    <p class="card-text">
                      Control: {carrera.conductor.control}
                    </p>
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
  </div>
</div>
</main>

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

  .btn {
    margin-left: auto;
  }
</style>



  