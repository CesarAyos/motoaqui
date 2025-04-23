<script>
  import QRGenerator from "$lib/QRGenerator.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import LoginUser from "../components/loginUser.svelte";
  
  let showModal = false;
  const dispatcher = createEventDispatcher();

  const closeModal = () => {
    showModal = false;
    dispatcher("close", {});
  };

  const openModal = () => {
    showModal = true;
  };

  onMount(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });
</script>

<div class="container">

<div class="container">
  <LoginUser />
  
  <button type="button" class="scan-btn" on:click={openModal}>
    Escanear QR
  </button>
</div>

{#if showModal}
  <div
    class="modal-overlay"
    tabindex="0"
    role="dialog"
    aria-modal="true"
    on:click={closeModal}
  >
    <div class="modal-content" on:click|stopPropagation>
      <button
        class="close-btn"
        type="button"
        on:click={closeModal}
        aria-label="Cerrar modal">✖</button>

      <header class="app-header text-center">
        <div class="container">
          <h1 class="app-title text-white">Clientes Rapiditos Colón</h1>
          <p class="app-subtitle text-white">Gestión profesional de clientes</p>
        </div>
      </header>

      <main class="app-content">
        <div class="container">
          <div class="download-section row justify-content-center mb-5">
            <div class="col-lg-10 col-xl-8 text-center">
              <h2 class="section-title text-white mb-4">Descarga nuestra aplicación</h2>

              <div class="download-options row justify-content-center">
                <div class="col-md-6 col-lg-5 uptodown-featured mb-4">
                  <div class="download-card p-4 h-100">
                    <div class="qr-container mb-3">
                      <QRGenerator
                        text="https://clientes-rapiditos-colon.en.uptodown.com/android"
                      />
                    </div>
                    <h3 class="mt-3 mb-3 text-white">Versión Android</h3>
                    <div class="uptodown-badge mb-3">
                      <a
                        href="https://clientes-rapiditos-colon.en.uptodown.com/android"
                      >
                        <img
                          src="https://stc.utdstc.com/img/mediakit/certified-free.png"
                          alt="Download Clientes Rapiditos Colón"
                          class="img-fluid"
                          style="max-width: 200px;"
                        />
                      </a>
                    </div>
                    <p class="text-white">
                      Disponible en Uptodown - Plataforma certificada y segura
                    </p>
                    <a
                      href="https://clientes-rapiditos-colon.en.uptodown.com/android"
                      class="btn driver-btn mt-2 text-white">Descargar ahora</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="trust-badges text-center mb-5">
            <div class="container">
              <h4 class="mb-3 text-white">Nuestra aplicación está certificada:</h4>
              <div
                class="d-flex justify-content-center flex-wrap align-items-center"
              >
                <div class="m-3 badge-item">
                  <div class="emoji-badge">✅</div>
                  <p class="mt-2 mb-0 fw-semibold text-white">Plataforma verificada</p>
                </div>
                <div class="m-3 badge-item">
                  <div class="emoji-badge">🛡️</div>
                  <p class="mt-2 mb-0 fw-semibold text-white">Libre de virus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
{/if}
</div>

<style>
  :global(body) {
    font-family: "Poppins", sans-serif;
    background: linear-gradient(
      135deg,
      var(--primary-blue) 0%,
      var(--primary-orange) 100%
    );
    margin: 0;
    position: relative;
  }


  .scan-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    z-index: 100;
  }

  .scan-btn:hover {
    background-color: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    padding: 2rem;
    border-radius: 24px;
    max-width: 600px;
    width: 90%;
    text-align: center;
    position: relative;
    overflow-y: auto;
    max-height: 50vh;
  }

  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    color: white;
    cursor: pointer;
  }
</style>