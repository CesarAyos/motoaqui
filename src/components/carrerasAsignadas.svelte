<script>
  import { onMount } from "svelte";
  import { supabase } from "../components/supabase.js";
  import { protegerRuta } from "../components/protegerRuta.js";

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
    window.location.href = "/carrerasDrivers";
  };
</script>

<main>
  <div class="text-center text-warning pt-2 pb-2 bg-dark fs-2">
   <strong> CARRERAS ACEPTADAS </strong>
  </div>
  <div class="card" style="background: #1b1b1b;">
    <div class="card-header d-flex justify-content-between text-white">
      <button
        class="btn btn-outline-warning m-2"
        on:click={recargarCarrerasAsignadas}>Recargar</button
      >
      <a href="/profileUser"
        ><button class="btn btn-success m-2" type="button"
          >Pedir Nueva Carrera</button
        ></a
      >

      <button class="btn btn-danger m-2" type="button" on:click={handleLogout}
        >Cerrar Sesión</button
      >
    </div>

    <div class="container mt-3">
      <div class="row">
        {#if carrerasAsignadas.length > 0}
          {#each carrerasAsignadas as carrera, index}
            <div class="col-12 col-md-6 col-lg-4 col-xl-3 col-xxl-2 mb-3">
              <div class="card h-100">
                <div class="card-body">
                  <p class="card-text text-warning">
                    <strong>
                      Carrera pedida por: <br> {carrera.usuario_nombre}
                    </strong>
                  </p>
                  <p class="card-text text-success">
                    <strong> Estado: {carrera.estado} </strong>
                  </p>
    
                  {#if carrera.conductor}
                    <p class="text-center text-white">
                      <strong>Datos de tu moto taxi</strong>
                    </p>
                    <p class="card-text text-white">
                      <strong>
                        Conductor en camino: {carrera.conductor.primernombre}
                        {carrera.conductor.primerapellido}</strong
                      >
                    </p>
                    <p class="card-text text-white">
                      <strong> Teléfono: {carrera.conductor.telefono}</strong>
                    </p>
                    <p class="card-text text-white">
                      <strong>
                        Modelo de la moto: {carrera.conductor.modelo}</strong
                      >
                    </p>
                    <p class="card-text text-white" >
                      <strong>Placa: {carrera.conductor.placa}</strong>
                    </p>
                    <p class="card-text text-white">
                      <strong> Color: {carrera.conductor.color}</strong>
                    </p>
                    <p class="card-text text-white">
                      <strong> Control: {carrera.conductor.control}</strong>
                    </p>
                    <p class="text-success text-end" style="font-size: 10px;">
                      en minutos llegara tu conductor
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        {:else}
          <p class="text-white">No hay carreras asignadas.</p>
        {/if}
      </div>
    </div>
    
</main>

<style>
  .card {
    background-color: #212529;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
  }

  .btn {
    margin-left: auto;
  }

  .card-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.25rem;
}



@media (max-width: 576px) {
  .col-xxl-2 {
    flex: 0 0 auto;
    width: 100%;
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  .col-md-6 {
    flex: 0 0 auto;
    width: 50%;
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .col-lg-4 {
    flex: 0 0 auto;
    width: 33.33%;
  }
}

@media (min-width: 993px) and (max-width: 1200px) {
  .col-xl-3 {
    flex: 0 0 auto;
    width: 25%;
  }
}

@media (min-width: 1201px) {
  .col-xxl-2 {
    flex: 0 0 auto;
    width: 20%;
  }
}

</style>
