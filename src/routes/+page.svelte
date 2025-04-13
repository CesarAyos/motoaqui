<script>
  import LoginUser from "../components/loginUser.svelte";
  import QRGenerator from '$lib/QRGenerator.svelte';
</script>

<div class="app-container">
  <header class="app-header text-center py-4">
    <div class="container">
      <h1 class="app-title">Clientes Rapiditos Colón</h1>
      <p class="app-subtitle">Gestión profesional de clientes</p>
    </div>
  </header>

  <main class="app-content">
    <div class="container">
      <div class="download-section row justify-content-center mb-5">
        <div class="col-lg-10 col-xl-8 text-center">
          <h2 class="section-title mb-4">Descarga nuestra aplicación</h2>
          
          <div class="download-options row justify-content-center">
            <!-- Uptodown Option - Featured -->
            <div class="col-md-6 col-lg-5 uptodown-featured mb-4">
              <div class="download-card p-4 h-100">
                <div class="qr-container mb-3">
                  <QRGenerator text="https://clientes-rapiditos-colon.en.uptodown.com/android" />
                </div>
                <h3 class="mt-3 mb-3">Versión Android</h3>
                <div class="uptodown-badge mb-3">
                  <a href='https://clientes-rapiditos-colon.en.uptodown.com/android' title='Download Clientes Rapiditos Colón'>
                    <img src='https://stc.utdstc.com/img/mediakit/certified-free.png' alt='Download Clientes Rapiditos Colón' class="img-fluid" style="max-width: 200px;">
                  </a>
                </div>
                <p class="text-muted">Disponible en Uptodown - Plataforma certificada y segura</p>
                <a href="https://clientes-rapiditos-colon.en.uptodown.com/android" class="btn btn-primary mt-2">Descargar ahora</a>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div class="trust-badges text-center mb-5">
        <div class="container">
          <h4 class="mb-3">Nuestra aplicación está certificada:</h4>
          <div class="d-flex justify-content-center flex-wrap align-items-center">
            <div class="m-3 badge-item">
              <div class="emoji-badge">✅</div>
              <p class="mt-2 mb-0 fw-semibold">Plataforma verificada</p>
            </div>
            <div class="m-3 badge-item">
              <div class="emoji-badge">🛡️</div>
              <p class="mt-2 mb-0 fw-semibold">Libre de virus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <LoginUser />

  <footer class="app-footer text-center py-3">
    <div class="container">
      <p>© {new Date().getFullYear()} Rapiditos Colón. Todos los derechos reservados.</p>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    overflow-x: hidden;
  }

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    max-width: 100vw;
  }

  .app-header {
    background: linear-gradient(135deg, #2c3e50, #3498db);
    color: white;
  }

  .app-title {
    font-weight: 700;
    font-size: 2.5rem;
  }

  .app-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .app-content {
    flex: 1;
    padding: 2rem 0;
    width: 100%;
  }

  .section-title {
    font-weight: 600;
    color: #2c3e50;
    position: relative;
    padding-bottom: 10px;
  }

  .section-title:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: #3498db;
  }

  .download-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(0,0,0,0.05);
    max-width: 100%;
    overflow: hidden;
  }

  .download-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }

  .qr-container {
    max-width: 200px;
    margin: 0 auto;
  }

  .uptodown-featured {
    position: relative;
  }

  .uptodown-featured:before {
    content: 'RECOMENDADO';
    position: absolute;
    top: -10px;
    right: 20px;
    background: #e74c3c;
    color: white;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: bold;
    z-index: 1;
  }

  .trust-badges {
    background: rgba(52, 152, 219, 0.1);
    padding: 20px;
    border-radius: 10px;
    margin: 0 auto;
    max-width: 800px;
  }

  

  .app-footer {
    background: #2c3e50;
    color: white;
    width: 100%;
  }

  .btn-primary {
    background-color: #3498db;
    border-color: #3498db;
  }

  .btn-primary:hover {
    background-color: #2980b9;
    border-color: #2980b9;
  }

  @media (max-width: 768px) {
    .app-title {
      font-size: 2rem;
    }
    
    .download-options {
      flex-direction: column;
      align-items: center;
    }
    
    .download-card {
      width: 100%;
      max-width: 400px;
    }
    
    .uptodown-featured:before {
      right: 50%;
      transform: translateX(50%);
    }
  }
</style>