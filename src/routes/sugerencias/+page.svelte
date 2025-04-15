<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "../../components/supabase.js";
  import Cerrarsesion from "../../components/cerrarsesion.svelte";

  // Variables de estado
  let sugerencia = "";
  let tipo = "sugerencia";
  let isLoading = false; // Para el estado de envío del formulario
  let isLoadingCliente = true; // Para la carga inicial de datos del cliente
  let successMessage = "";
  let errorMessage = "";

  // Datos del cliente
  let clienteInfo = {
    primernombre: "",
    primerapellido: "",
    telefono: "",
  };

  onMount(async () => {
    await cargarDatosCliente();
  });

  async function cargarDatosCliente() {
    isLoadingCliente = true;
    errorMessage = "";

    try {
      // 1. Obtener usuario autenticado
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        errorMessage = "Debes iniciar sesión para enviar sugerencias";
        isLoadingCliente = false;
        return;
      }

      // 2. Intentar obtener datos del cliente
      const { data, error } = await supabase
        .from("registro_clientes")
        .select("primernombre, primerapellido, telefono")
        .eq("user_id", user.id)
        .maybeSingle(); // Usamos maybeSingle para manejar 0 resultados

      if (error) throw error;

      // 3. Asignar datos o valores por defecto
      clienteInfo = data
        ? {
            primernombre: data.primernombre || "",
            primerapellido: data.primerapellido || "",
            telefono: data.telefono || "",
          }
        : {
            primernombre: "",
            primerapellido: "",
            telefono: "",
          };
    } catch (err) {
      console.error("Error cargando datos del cliente:", err);
      errorMessage = "Error al cargar tu información de cliente";
    } finally {
      isLoadingCliente = false;
    }
  }

  async function enviarSugerencia() {
    if (!sugerencia.trim()) {
      errorMessage = "Por favor escribe tu sugerencia o queja";
      return;
    }

    isLoading = true;
    errorMessage = "";
    successMessage = "";

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const { error } = await supabase.from("sugerencias_clientes").insert({
        cliente_id: user.id,
        primernombre: clienteInfo.primernombre,
        primerapellido: clienteInfo.primerapellido,
        telefono: clienteInfo.telefono,
        sugerencia: sugerencia.trim(),
        tipo: tipo,
      });

      if (error) throw error;

      successMessage = "¡Gracias por tu feedback! Hemos recibido tu mensaje.";
      sugerencia = "";
      tipo = "sugerencia";
    } catch (err) {
      console.error("Error enviando sugerencia:", err);
      errorMessage =
        "Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="p-2">
<Cerrarsesion/>
</div>


<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h2 class="h5 mb-0">Sugerencias y Quejas</h2>
        </div>

        <div class="card-body">
          {#if isLoadingCliente}
            <div class="text-center my-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p>Cargando tu información...</p>
            </div>
          {:else}
            {#if successMessage}
              <div class="alert alert-success">
                {successMessage}
              </div>
            {/if}

            {#if errorMessage}
              <div class="alert alert-danger">
                {errorMessage}
              </div>
            {/if}

            <form on:submit|preventDefault={enviarSugerencia}>
              <div class="mb-3">
                <label for="tipo" class="form-label">Tipo de mensaje</label>
                <select id="tipo" class="form-select" bind:value={tipo}>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="queja">Queja</option>
                  <option value="felicitacion">Felicitación</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="sugerencia" class="form-label">Tu mensaje</label>
                <textarea
                  id="sugerencia"
                  class="form-control"
                  rows="5"
                  bind:value={sugerencia}
                  placeholder="Escribe aquí tu sugerencia, queja o felicitación..."
                  required
                ></textarea>
              </div>

              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  disabled={isLoading || isLoadingCliente}
                >
                  {isLoading ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </div>
            </form>
          {/if}
        </div>

        {#if !isLoadingCliente && clienteInfo.primernombre}
          <div class="card-footer text-muted small">
            Enviando como: {clienteInfo.primernombre}
            {clienteInfo.primerapellido}
            {clienteInfo.telefono ? `(${clienteInfo.telefono})` : ""}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
