<script>
    import { supabase } from "../components/supabase.js";
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
        window.location.href = "/profileUser";
      }
    };
  
    onMount(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        window.location.href = "/profileUser";
      }
    });
  </script>
  
  <section class="vh-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem; border: none; box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.6);">
            <div class="card-body p-5 text-center">
              <div class="mb-4">
                <h3 class="fw-bold mb-4 text-uppercase">¿Listo para viaja?</h3>
                <p class="text-white-50 mb-4">Ingresa tus credenciales para continuar</p>
              </div>
  
              <form on:submit|preventDefault={handleLogin}>
                <!-- Email input -->
                <div class="form-outline form-white mb-4">
                  <input
                    type="email"
                    id="typeEmailX"
                    bind:value={email}
                    class="form-control form-control-lg"
                    placeholder=" "
                  />
                  <label class="form-label" for="typeEmailX">Correo electrónico</label>
                </div>
  
                <!-- Password input -->
                <div class="form-outline form-white mb-4">
                  <input
                    type="password"
                    id="typePasswordX"
                    bind:value={password}
                    class="form-control form-control-lg"
                    placeholder=" "
                  />
                  <label class="form-label" for="typePasswordX">Contraseña</label>
                </div>

                <button
                  type="submit"
                  class="btn btn-outline-light btn-lg px-5 w-100"
                >
                  Ingresar
                </button>
  
                <!-- Mostrar mensaje de error -->
                {#if errorMessage}
                  <div class="alert alert-danger mt-4 alert-dismissible fade show" role="alert">
                    {errorMessage}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                {/if}
              </form>
  
              <div class="mt-4">
                <p class="mb-0">¿No tienes una cuenta? <a href="/registros" class="text-white-50 fw-bold">Regístrate</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <style>
    .gradient-custom {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .card {
      backdrop-filter: blur(10px);
      background-color: rgba(0, 0, 0, 0.5) !important;
    }
    
    .form-outline {
      position: relative;
    }
    
    .form-outline input {
      background: transparent;
      color: white;
      border: 1px solid #6c757d;
      transition: all 0.3s;
    }
    
    .form-outline input:focus {
      border-color: #fff;
      box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
    }
    
    .form-outline label {
      position: absolute;
      top: 12px;
      left: 15px;
      color: #adb5bd;
      transition: all 0.3s;
      pointer-events: none;
    }
    
    .form-outline input:focus + label,
    .form-outline input:not(:placeholder-shown) + label {
      top: -10px;
      left: 10px;
      font-size: 0.8rem;
      background-color: rgba(0, 0, 0, 0.7);
      padding: 0 5px;
      color: #fff;
    }
    
    .btn-outline-light:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .alert-danger {
      background-color: rgba(220, 53, 69, 0.2);
      border-color: rgba(220, 53, 69, 0.3);
      color: #fff;
    }
  </style>
  