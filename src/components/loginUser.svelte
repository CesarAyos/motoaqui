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

<div class="wrapper">
  <div class="container main-card">
      <img src="/favicon.png" alt="icono" class="img-fluid logo" />
      <h1 class="title">¡Bienvenido a <span>Rapiditos Colón</span>!</h1>
      <p class="subtitle">Tu solución de transporte rápido y confiable</p>


      <form on:submit|preventDefault={handleLogin} class="login-form">
          <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input type="email" id="email" bind:value={email} required />
          </div>

          <div class="form-group">
              <label for="password">Contraseña</label>
              <input type="password" id="password" bind:value={password} required />
          </div>

          <button type="submit" class="action-btn driver-btn">
              Ingresar
              <div class="hover-effect"></div>
          </button>

          {#if errorMessage}
              <div class="alert alert-danger">{errorMessage}</div>
          {/if}
      </form>

      <p class="register-link">¿No tienes cuenta? <a href="/registros">Regístrate</a></p>

    
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  :root {
      --primary-blue: #018efa;
      --primary-orange: #f4680a;
      --secondary-blue: #5ab0ff;
      --secondary-orange: #ff8c42;
      --white: #ffffff;
      --light-gray: rgba(255, 255, 255, 0.8);
  }

  

  .wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
  }

  .main-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      border-radius: 24px;
      padding: 2rem;
      text-align: center;
      width: 100%;
      max-width: 400px;
  }

  .logo {
      width: 100px;
      margin-bottom: 1rem;
  }

  .title {
      font-size: 2rem;
      font-weight: bold;
      color: var(--white);
  }

  .subtitle {
      color: var(--light-gray);
      font-size: 1rem;
      margin-bottom: 1.5rem;
  }

  .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
  }

  .form-group label {
      font-size: 0.9rem;
      color: var(--white);
  }

  .form-group input {
      padding: 0.8rem;
      border-radius: 10px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: var(--white);
      font-size: 1rem;
  }

  .action-btn {
      display: inline-block;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 50px;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: 0.3s;
  }

  .driver-btn {
      background: linear-gradient(45deg, var(--primary-blue), var(--secondary-blue));
      color: white;
  }

 

  .action-btn:hover .hover-effect {
      opacity: 1;
  }

  .register-link {
      margin-top: 1rem;
      color: var(--light-gray);
  }

 

 

  @media (max-width: 768px) {
      .title {
          font-size: 1.8rem;
      }

      .subtitle {
          font-size: 0.9rem;
      }

      .action-btn {
          font-size: 0.9rem;
      }
  }
</style>
