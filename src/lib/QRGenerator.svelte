<script>
    import { onMount } from 'svelte';
    import QRCode from 'qrcode';
  
    export let text = '';
  
    let qrDataUrl = '';
  
    onMount(async () => {
      if (text) {
        qrDataUrl = await QRCode.toDataURL(text);
      }
    });
  </script>
  
  <div class="qr-container">
    {#if qrDataUrl}
      <img src="{qrDataUrl}" alt="QR Code" />
    {/if}
  </div>
  