<script>
  import { supabase } from "../../components/supabase.js";
  import { onMount } from "svelte";

  let email = "";
  let password = "";
  let errorMessage = "";

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      errorMessage = "Error al iniciar sesión: " + error.message;
    } else {
      // Redirigir al perfil después de iniciar sesión
      window.location.href = "/profileDrivers";
    }
  };

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      window.location.href = "/profileDrivers";
    }
  });
</script>

<section class="vh-100">
  <div class="container login py-5 h-100">
    <div class="row d-flex align-items-center justify-content-center h-100">
      <div class="col-md-8 col-lg-7 col-xl-6">
        <img
          src="/favicon.png"
          class="img-fluid"
          alt="Phone"
        />
      </div>
      <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
        <h3 class="text-center p-2 text-white">Que tengas un día productivo</h3>
        <form on:submit|preventDefault={handleLogin}>
          <!-- Email input -->
          <div class="form-outline mb-4">
            <input
              type="email"
              id="form1Example11"
              bind:value={email}
              class="form-control form-control-lg"
            />
            <label class="form-label text-white" for="form1Example11">Correo electrónico</label>
          </div>

          <!-- Password input -->
          <div class="form-outline mb-4">
            <input
              type="password"
              id="form1Example20"
              bind:value={password}
              class="form-control form-control-lg"
            />
            <label class="form-label text-white" for="form1Example20">Contraseña</label>
          </div>

          <div class="d-flex justify-content-around align-items-center mb-4">
            <!-- Checkbox -->
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                value=""
                id="form1Example3"
                checked
              />
              <label class="form-check-label text-white" for="form1Example3">
                Recordar
              </label>
            </div>
            <a href="#!">¿Olvidaste tu contraseña?</a>
          </div>

          <div class="d-flex justify-content-end">
            <button
              type="submit"
              class="btn btn-outline-warning"
            >Ingresar</button>
          </div>
        </form>
        {#if errorMessage}
          <div class="alert alert-danger mt-3">{errorMessage}</div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  * {
    background: #1b1b1b;
  }
</style>
