<script>
  import { fade } from "svelte/transition";
  import { supabase } from "../../components/supabase.js";
  import { onMount } from "svelte";

  let steps = [
    { id: 1, question: "¿Hola como te llamas?", field: "primernombre", type: "text" },
    { id: 2, question: "¿Y te pusieron segundo nombre?", field: "segundonombre", type: "text" },
    { id: 3, question: "¿Y tu primer apellido?", field: "primerapellido", type: "text" },
    { id: 4, question: "¿También tienes segundo apellido?", field: "segundoapellido", type: "text" },
    { id: 5, question: "Crea una contraseña segura", field: "contraseña", type: "password" },
    { id: 6, question: "¿Cuál es tu número de teléfono?", field: "telefono", type: "tel" },
    { id: 7, question: "¿Cuál es tu edad?", field: "edad", type: "number" },
    { id: 8, question: "¿En qué ciudad vives?", field: "ciudad", type: "text" },
    { id: 9, question: "¿Cuál es tu correo electrónico?", field: "correo", type: "email" },
    { id: 10, question: "¿Cuál es tu número de cédula?", field: "cedula", type: "number" },
    { id: 11, question: "¿En qué sector vives?", field: "sector", type: "text" },
    { id: 12, question: "¿Cuál es tu grupo sanguíneo?", field: "sanguineo", type: "text" },
    { id: 13, question: "Toma una foto de tu rostro (frontal)", field: "foto", type: "face" }, // Cambiado a "foto"
    { id: 14, question: "Toma una foto de tu cédula (frontal)", field: "cedula_foto", type: "document" }, // Cambiado a "cedula_foto"
  ];

  let currentStep = 1;
  let client = {};
  let videoStream;
  let isLoading = false;
  let progress = 0;
  let errorMessage = "";
  let cameraActive = false;

  $: progress = Math.round((currentStep / steps.length) * 100);

  const toggleCamera = async () => {
    if (!cameraActive) {
      await startCamera();
    } else {
      await capturePhoto();
    }
  };

  const startCamera = async () => {
    try {
      stopCamera();
      
      // Configuración diferente para cámara frontal (rostro) vs trasera (documento)
      const isFaceStep = steps.find(s => s.id === currentStep).type === 'face';
      const constraints = {
        video: {
          facingMode: isFaceStep ? 'user' : { exact: 'environment' }, // Fuerza cámara trasera para documentos
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = document.getElementById("video");
      video.srcObject = videoStream;
      cameraActive = true;
    } catch (error) {
      errorMessage = "No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.";
      console.error("Error al acceder a la cámara:", error);
      
      // Intento alternativo si falla la cámara trasera
      if (steps.find(s => s.id === currentStep).type === 'document') {
        errorMessage += " Si no puedes acceder a la cámara trasera, intenta con la frontal.";
      }
    }
  };

  const capturePhoto = async () => {
    const video = document.getElementById("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      const currentField = steps.find(s => s.id === currentStep).field;
      const fileName = `${currentField}-${client.cedula || 'temp'}-${Date.now()}.jpg`;
      
      // Convertir a Blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      
      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from("user-documents")
        .upload(fileName, blob);
      
      if (error) throw error;
      
      // Obtener URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from("user-documents")
        .getPublicUrl(fileName);
      
      // Guardar URL en el campo correspondiente
      client[currentField] = publicUrl;
      
      stopCamera();
      nextStep();
    } catch (error) {
      errorMessage = "Error al guardar la foto. Intenta nuevamente.";
      console.error("Error al capturar foto:", error);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
    cameraActive = false;
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      currentStep += 1;
    } else {
      submitForm();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      currentStep -= 1;
    }
  };

  const submitForm = async () => {
    isLoading = true;
    errorMessage = "";
    
    try {
      // 1. Verificar si el correo o cédula ya existen
      const { data: existingUser, error: checkError } = await supabase
        .rpc('check_existing_client', {
          p_correo: client.correo,
          p_cedula: client.cedula
        });
      
      if (checkError) throw checkError;
      if (existingUser.exists) {
        throw new Error(existingUser.message || 'El correo o cédula ya están registrados');
      }

      // 2. Llamar a la función de registro completo
      const { data, error: rpcError } = await supabase.rpc('register_complete_client', {
        p_email: client.correo,
        p_password: client.contraseña,
        p_primernombre: client.primernombre,
        p_segundonombre: client.segundonombre || null,
        p_primerapellido: client.primerapellido,
        p_segundoapellido: client.segundoapellido || null,
        p_telefono: client.telefono,
        p_edad: client.edad,
        p_ciudad: client.ciudad,
        p_cedula: client.cedula,
        p_sector: client.sector,
        p_sanguineo: client.sanguineo,
        p_foto_url: client.foto,
        p_cedula_foto_url: client.cedula_foto
      });

      if (rpcError) throw rpcError;

      // 3. Redirigir a página de éxito
      window.location.href = '/';
      
    } catch (error) {
      errorMessage = error.message || "Error en el registro. Intenta nuevamente.";
      console.error("Registration error:", error);
      
      if (error.message.includes('already registered') || 
          error.message.includes('ya están registrados')) {
        errorMessage = "Este correo o cédula ya están registrados. Serás redirigido al login...";
        setTimeout(() => window.location.href = '/login', 3000);
      }
    } finally {
      isLoading = false;
    }
  };

</script>

<div class="form-wrapper">
  <div class="progress-bar" style={`width: ${progress}%`}></div>
  
  <div class="form-container">
    {#if errorMessage}
      <div class="error-message">
        {errorMessage}
        {#if errorMessage.includes('redirigido')}
          <div class="spinner"></div>
        {/if}
      </div>
    {/if}
    
    {#each steps as step (step.id)}
      {#if step.id === currentStep}
        <div transition:fade class="form-step">
          <div class="step-indicator">Paso {step.id} de {steps.length}</div>
          <h2 class="form-question">{step.question}</h2>
          
          {#if step.type === 'face' || step.type === 'document'}
            <div class="camera-section">
              <div class="camera-preview-large">
                <video id="video" autoplay playsinline></video>
                <button class="camera-control-btn" on:click={toggleCamera}>
                  <span class="icon">
                    {#if cameraActive}
                      ⏺️
                    {:else}
                      📷
                    {/if}
                  </span>
                  {cameraActive ? 'Capturar Foto' : 'Activar Cámara'}
                </button>
              </div>
              <div class="photo-instructions">
                <p>Instrucciones:</p>
                <ul>
                  {#if step.type === 'face'}
                    <li>Asegúrate de tener buena iluminación</li>
                    <li>Mira directamente a la cámara</li>
                    <li>Mantén un fondo neutro</li>
                  {:else}
                    <li>Coloca la cédula dentro del marco</li>
                    <li>Asegúrate que todos los datos sean legibles</li>
                    <li>Evita sombras y reflejos</li>
                  {/if}
                </ul>
              </div>
            </div>
          {:else}
            <input
              bind:value={client[step.field]}
              type={step.type}
              placeholder={step.question}
              class="form-input"
              required
              on:input={() => errorMessage = ""}
            />
          {/if}

          <div class="actions">
            {#if currentStep > 1}
              <button class="btn secondary" on:click={prevStep}>
                <span class="icon">←</span> Anterior
              </button>
            {/if}
            
            <button 
              class="btn next" 
              on:click={nextStep}
              disabled={isLoading || 
                ((step.type === 'face' || step.type === 'document') && !client[step.field])}
            >
              {isLoading ? 'Procesando...' : currentStep === steps.length ? 'Completar Registro' : 'Siguiente'}
            </button>
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: #f8fafc;
    color: #1e293b;
  }

  .form-wrapper {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
    position: relative;
  }

  .progress-bar {
    height: 6px;
    background: linear-gradient(90deg, #3b82f6, #10b981);
    border-radius: 3px;
    margin-bottom: 2rem;
    transition: width 0.4s ease;
  }

  .error-message {
    background: #fee2e2;
    color: #b91c1c;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-left: 4px solid #dc2626;
  }

  .spinner {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 2px solid #b91c1c;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .form-step {
    width: 100%;
    padding: 1.5rem;
  }

  .step-indicator {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-question {
    font-size: 1.5rem;
    color: #1e293b;
    margin: 0 0 1.5rem 0;
    font-weight: 600;
    line-height: 1.3;
  }

  .form-input {
    width: 100%;
    padding: 14px 16px;
    font-size: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    transition: all 0.3s;
    background: #f8fafc;
  }

  .form-input:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    background: white;
  }

  .form-input:invalid {
    border-color: #f87171;
  }

  .camera-section {
    margin-bottom: 2rem;
  }

  .camera-preview-large {
    position: relative;
    width: 100%;
    height: 500px;
    background: #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 3px dashed #4CAF50;
  }

  .document-capture-section .camera-preview-large {
    border-color: #3b82f6;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .camera-control-btn {
    position: absolute;
    bottom: 20px;
    padding: 14px 28px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .document-capture-section .camera-control-btn {
    background: #3b82f6;
  }

  .camera-control-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  .camera-control-btn .icon {
    font-size: 1.3rem;
  }

  .photo-instructions {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 10px;
    border-left: 4px solid #4CAF50;
  }

  .document-capture-section .photo-instructions {
    border-left-color: #3b82f6;
  }

  .photo-instructions p {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.1rem;
  }

  .photo-instructions ul {
    padding-left: 20px;
    color: #34495e;
    margin-bottom: 0;
  }

  .photo-instructions li {
    margin-bottom: 8px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    font-size: 0.95rem;
    font-weight: 500;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    flex: 1;
  }

  .btn.secondary {
    background-color: #e2e8f0;
    color: #334155;
    margin-right: 0.5rem;
  }

  .btn.secondary:hover {
    background-color: #cbd5e1;
  }

  .btn.next {
    background-color: #1e293b;
    color: white;
  }

  .btn.next:hover {
    background-color: #0f172a;
  }

  .btn:disabled {
    background-color: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
  }

  .icon {
    margin-right: 8px;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .form-wrapper {
      margin: 0;
      padding: 1.5rem;
      border-radius: 0;
      min-height: 100vh;
    }
    
    .camera-preview-large {
      height: 400px;
    }
    
    .camera-control-btn {
      font-size: 1rem;
      padding: 12px 24px;
    }
    
    .form-question {
      font-size: 1.3rem;
    }
    
    .actions {
      flex-direction: column;
    }
    
    .btn.secondary {
      margin-right: 0;
      margin-bottom: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .camera-preview-large {
      height: 350px;
    }
    
    .photo-instructions {
      padding: 1rem;
    }
  }
</style>