<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import Popup from '$lib/components/Popup.svelte';

  export let avatarFile: Blob | null | undefined;

  let image: HTMLImageElement = document.createElement('img');
  let cutout: HTMLDivElement = document.createElement('div');

  let canvas: HTMLCanvasElement;
  let tempCanvas: HTMLCanvasElement;

  let dragging = false;
  let imageX = 0;
  let imageY = 0;
  let lastX = 0;
  let lastY = 0;
  let xBoundary = 0;
  let yBoundary = 0;
  let scale = 1;

  const reader = new FileReader();
  reader.addEventListener('load', async () => {
    image.src = reader.result as string;
    await tick();
    updateBoundaries();
  });
  reader.readAsDataURL(avatarFile!);

  const dispatcher = createEventDispatcher();
  const cropperDismiss = () => {
    dispatcher('dismiss');
  };

  const updateImagePosition = () => {
    if (image.width * scale > cutout.clientWidth) {
      imageX = Math.max(Math.min(imageX, xBoundary), -xBoundary);
    } else {
      imageX = 0;
    }
    if (image.height * scale > cutout.clientHeight) {
      imageY = Math.max(Math.min(imageY, yBoundary), -yBoundary);
    } else {
      imageY = 0;
    }
    image.style.transform = `translate(${imageX * scale}px, ${imageY * scale}px) scale(${scale})`;
  };

  const updateBoundaries = () => {
    xBoundary = (image.width - cutout.clientWidth / scale) / 2;
    yBoundary = (image.height - cutout.clientHeight / scale) / 2;
  };

  const scaleImage = () => {
    updateBoundaries();
    updateImagePosition();
  };

  const startDrag = (e: MouseEvent) => {
    lastX = e.x;
    lastY = e.y;
    dragging = true;
  };

  const stopDrag = () => {
    dragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) {
      scale = Math.min(scale + 0.1, 5);
    } else {
      scale = Math.max(scale - 0.1, 0.5);
    }
    scaleImage();
  };

  const mouseMove = (e: MouseEvent) => {
    if (dragging) {
      // Divide move distance by scale to slow down movement when zoomed.
      imageX += (e.x - lastX) / scale;
      imageY += (e.y - lastY) / scale;
      updateImagePosition();
      lastX = e.x;
      lastY = e.y;
    }
  };

  const doCrop = async () => {
    let imageResponse = await fetch(image.src);
    let contentType = imageResponse.headers.get('content-type');
    let blob: Blob;

    if (contentType == 'image/gif') {
      // await cropGif(imageResponse);
      throw new Error("Gif cropping is not yet implemented.")
    } else {
      blob = await cropImage();
    }

    dispatcher('success', blob);
  }

  const cropImage = async () => {
    const ctx = canvas.getContext('2d')!;

    // Compensate for any scaling automatically done by css
    let cssScale = image.width / image.naturalWidth;
    let effectiveScale = scale * cssScale;

    ctx.drawImage(
      image,
      (xBoundary - imageX) / cssScale,
      (yBoundary - imageY) / cssScale,
      cutout.clientWidth / effectiveScale,
      cutout.clientHeight / effectiveScale,
      0,
      0,
      cutout.clientWidth,
      cutout.clientHeight
    );

    return (await new Promise<Blob | null>(resolve => {canvas.toBlob(resolve)}))!
  };

  const cropSkip = () => {
    dispatcher('success', image.src);
  }
</script>

<svelte:body on:mouseup={stopDrag} on:mousemove={mouseMove} />

<Popup on:dismiss={cropperDismiss}>
  <span slot="title">Edit image</span>
  <div id="cropper-image-preview">
    <img alt="Fucking balls." id="cropper-img" bind:this={image} />
    <div id="overlay" on:mousedown={startDrag} on:wheel={onWheel}>
      <div id="overlay-cutout" bind:this={cutout} />
    </div>
  </div>
  <div id="cropper-slider">
    <input type="range" min="0.5" max="5" step="0.0001" bind:value={scale} on:input={scaleImage} />
  </div>
  <span slot="control">
    <div id="cropper-buttons">
      <button class="cropper-button" id="cropper-skip-button" on:click={cropSkip}>
        Skip
      </button>
      <div id="button-separator" />
      <button class="cropper-button" id="cropper-cancel-button" on:click={cropperDismiss}>
        Cancel
      </button>
      <button class="cropper-button" id="cropper-crop-button" on:click={doCrop}>
        Crop
      </button>
    </div>
  </span>
</Popup>
<canvas
  id="cropper-canvas"
  width={cutout.clientWidth}
  height={cutout.clientHeight}
  bind:this={canvas}
/>

<style>
  #cropper-image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: var(--purple-100);
    border-radius: 5px;
    overflow: hidden;
  }

  #cropper-img {
    width: 100%;
    border-radius: 5px;
    object-fit: cover;
  }

  #overlay {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    cursor: move;
    touch-action: none;
  }

  #overlay-cutout {
    border: 3px solid white;
    border-radius: 10px;
    box-shadow: 0 0 200px 200px #000c;
    width: 256px;
    height: 256px;
    border-radius: 100%;
  }

  #cropper-slider {
    display: flex;
    margin: 10px auto;
    justify-content: center;
  }

  #cropper-buttons {
    display: flex;
    flex-direction: row;
  }

  .cropper-button {
    margin: 5px;
    background-color: transparent;
    border: none;
    color: white;
    padding: 10px 10px;
    border-radius: 5px;
    font-size: 12pt;
    margin: 0px 20px;
  }

  #button-separator {
    flex-grow: 1;
  }

  #cropper-crop-button {
    background-color: var(--gray-300);
    padding: 10px 40px;
  }

  .cropper-button:hover {
    text-decoration: underline;
  }

  #cropper-crop-button:hover {
    background-color: var(--gray-400);
  }

  #cropper-canvas {
    display: none;
  }
</style>
