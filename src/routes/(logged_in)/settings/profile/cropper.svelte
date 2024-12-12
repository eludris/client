<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import Popup from '$lib/components/Popup.svelte';
  import { consumeSingleEvent } from "$lib/events";

  export let cropperFile: Blob | null | undefined;
  export let cropperKind: string;

  let cropping = false;

  let slider: HTMLInputElement = document.createElement("input");
  let image: HTMLImageElement = document.createElement('img');
  let cutout: HTMLDivElement = document.createElement('div');

  let dragging = false;
  let imageX = 0;
  let imageY = 0;
  let lastX = 0;
  let lastY = 0;
  let xBoundary = 0;
  let yBoundary = 0;
  let scale = 1;
  let scaleSnap: number[] = [];
  let minZoom = 0.5;
  let maxZoom = 5;

  const snapDist = 0.03 / 2;  // Fraction of full slider width, divide by 2 as it's bidirectional.

  const reader = new FileReader();
  reader.addEventListener('load', async () => {
    image.onload = (_ev) => {
      // Wait for image to be loaded so that width/height are properly populated.
      updateBoundaries();
      updateZoomBoundaries();
      updateSliderDisplay();
    }
    image.src = reader.result as string;
  });
  reader.readAsDataURL(cropperFile!);

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

  const updateZoomBoundaries = () => {
    // Zoom factors to match smallest/largest dimension
    let [min, max] = scaleSnap = [cutout.clientWidth / image.width, cutout.clientHeight / image.height].sort();
    
    scale = min;  // Start with smallest dimension matched to cutout frame
    minZoom = min * 0.5;  // Min zoom makes the largest dimension fit in the cutout twice
    maxZoom = max * 2;  // Max zoom makes the smallest dimension twice as large as the cutout 

    updateImagePosition();
  }
  
  const updateSliderDisplay = () => {
    let style = "linear-gradient(90deg, var(--cropper-slider-bg-color)"
    let range = maxZoom - minZoom;

    scaleSnap.forEach((tick) => {
      let tickPercentage = (tick - minZoom) / range * 100;
      style += (
        `, var(--cropper-slider-bg-color) ${tickPercentage}%`
        + `, var(--cropper-slider-tick-color) ${tickPercentage}%`
        + `, var(--cropper-slider-tick-color) calc(${tickPercentage}% + 2px)`
        + `, var(--cropper-slider-bg-color) calc(${tickPercentage}% + 2px)`
      )
    })

    slider.style.setProperty("--cropper-slider-bg", style)
  } 

  const updateBoundaries = () => {
    xBoundary = (image.width - cutout.clientWidth / scale) / 2;
    yBoundary = (image.height - cutout.clientHeight / scale) / 2;
  };

  const scaleImage = () => {
    let range = maxZoom - minZoom;
    scaleSnap.forEach((snap) => {
      if (Math.abs(snap - scale) / range < snapDist) {
        scale = snap;
      } 
    })
    
    updateBoundaries();
    updateImagePosition();
  };

  const startDrag = (x: number, y: number) => {
    updateBoundaries();  // Somehow prevents a bug where boundaries aren't set correctly
    lastX = x;
    lastY = y;
    dragging = true;
  };

  const mouseStartDrag = (e: MouseEvent) => {
    startDrag(e.x, e.y);
  };

  const touchStartDrag = (e: TouchEvent) => {
    // TODO: Maybe support zoom by dragging with two fingers
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  };

  const stopDrag = () => {
    dragging = false;
  };

  const move = (x: number, y: number) => {
    if (dragging) {
      // Divide move distance by scale to slow down movement when zoomed.
      imageX += (x - lastX) / scale;
      imageY += (y - lastY) / scale;
      updateImagePosition();
      lastX = x;
      lastY = y;
    }
  }

  const mouseMove = (e: MouseEvent) => {
    move(e.x, e.y);
  };
  
  const touchMove = (e: TouchEvent) => {
    move(e.touches[0].clientX, e.touches[0].clientY)
  }

  const onWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) {
      scale = Math.min(scale + 0.1, maxZoom);
    } else {
      scale = Math.max(scale - 0.1, minZoom);
    }
    scaleImage();
  };

  const cropImpl = async (kind: "GIF" | "image"): Promise<Blob> => {
    let inEvent: string;
    let resultEvent: string;
  
    if (kind == "GIF") {
      inEvent = "cropGifInWorker";
      resultEvent = "cropGifResult";
    } else {
      inEvent = "cropImageInWorker";
      resultEvent = "cropImageResult";
    }

    // Compensate for any scaling automatically done by css...
    let cssScale = image.width / image.naturalWidth;
    let effectiveScale = scale * cssScale;
    
    // Dispatch event to start cropper worker...
    document.dispatchEvent(
      new CustomEvent(
        inEvent,
        {
          detail:
          {
            buffer: new Uint8Array(await cropperFile!.arrayBuffer()),
            imageWidth: image.naturalWidth,
            imageHeight: image.naturalHeight,
            windowX: (xBoundary - imageX) / cssScale,
            windowY: (yBoundary - imageY) / cssScale,
            windowWidth: cutout.clientWidth / effectiveScale,
            windowHeight: cutout.clientHeight / effectiveScale
          }
        }
      )
    )
  
    let event: CustomEvent<Blob> = await consumeSingleEvent(resultEvent, ()=>true);
    
    return event.detail;
  }

  const doCrop = async () => {
    updateBoundaries();

    cropping = true;

    let imageResponse = await fetch(image.src);
    let contentType = imageResponse.headers.get('content-type');
    let blob: Blob;
   
    if (contentType == 'image/gif') {
      blob = await cropImpl("GIF");
    } else {
      blob = await cropImpl("image");
    }

    cropping = false;

    dispatcher("success", blob);
  }

  const cropSkip = () => {
    dispatcher('success', cropperFile);
  }
</script>

<svelte:body
  on:mouseup={stopDrag}
  on:mousemove={mouseMove}
  on:touchend={stopDrag}
  on:touchmove={touchMove}
/>

<Popup on:dismiss={cropperDismiss}>
  <span slot="title">Edit Image</span>
  <div id="cropper">
    <div id="cropper-image-preview">
      <img alt="Cropper preview." id="cropper-img" bind:this={image} />
      <div
        id="overlay"
        role="button"
        tabindex="0"
        on:mousedown={mouseStartDrag}
        on:touchstart={touchStartDrag}
        on:wheel={onWheel}
      >
        <div
          id="overlay-cutout"
          class={cropperKind}
          bind:this={cutout}
        />
      </div>
    </div>
    <div id="cropper-slider">
      <input type="range" min="{minZoom}" max="{maxZoom}" step="0.0001" disabled={cropping} bind:this={slider} bind:value={scale} on:input={scaleImage} />
    </div>
  </div>
  <span slot="control">
    <div id="cropper-buttons">
      <button class="cropper-button" id="cropper-cancel-button" on:click={cropperDismiss}>
        Cancel
      </button>
      <div id="button-separator" />
      <button class="cropper-button" id="cropper-skip-button" disabled={cropping} on:click={cropSkip}>
        Skip
      </button>
      <button class="cropper-button" id="cropper-crop-button" disabled={cropping} on:click={doCrop}>
        {#if cropping}
          Cropping...
        {:else}
          Crop
        {/if}
      </button>
    </div>
  </span>
</Popup>

<style>
  #cropper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  #cropper-image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: var(--purple-100);
    border-radius: 5px;
    overflow: hidden;
    width: max(300px, 60vw);
    height: 300px;
  }

  #cropper-img {
    border-radius: 5px;
    object-fit: cover;
    height: 100%;
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

  #overlay-cutout.avatar{
    border: 3px solid white;
    border-radius: 10px;
    box-shadow: 0 0 200px 200px #000c;
    width: 256px;
    height: 256px;
    border-radius: 100%;
  }

  #overlay-cutout.banner{
    border: 3px solid white;
    border-radius: 10px;
    box-shadow: 0 0 200px 200px #000c;
    width: 90%;
    aspect-ratio: 6;
    border-radius: 5px;
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
    width: 120px;
  }

  .cropper-button:hover {
    text-decoration: underline;
  }

  #cropper-crop-button:hover {
    background-color: var(--gray-400);
    text-decoration: none;
  }

  .cropper-button:disabled {
    text-decoration: none;
    color: #aaa;
  }

  #cropper-crop-button:disabled {
    background-color: var(--purple-300);
  }

  input[type="range"] {
    --cropper-slider-bg-color: var(--purple-100);
    --cropper-slider-tick-color: var(--pink-100);
    --cropper-slider-bg: var(--cropper-slider-bg-color);  /* override with js to set tickmarks */
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    width: 400px;
  }
  
  input[type="range"]::-moz-range-track,
  input[type="range"]::-webkit-slider-runnable-track {
    background: var(--cropper-slider-bg);
    height: 0.75rem;
    border-radius: 0.25rem;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
  }

  input[type="range"]::-moz-range-thumb {
    border: none;
    border-radius: 0;
  }

  input[type="range"]::-webkit-slider-thumb,
  input[type="range"]::-moz-range-thumb {
    background-color: var(--gray-300);
    height: 1rem;
    width: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 0 0 0px white, 0 0 0 5px var(--gray-300);
    transition: ease-in-out 0.2s;
  }

  input[type="range"]:hover::-webkit-slider-thumb,
  input[type="range"]:hover::-moz-range-thumb {
    box-shadow: 0 0 0 2px white, 0 0 0 5px var(--gray-300);
    transition: ease-in-out 0.2s;
  }


</style>
