import MyWorker from "/src/gif-worker.js?worker"

import * as events from "$lib/events";

type CropEventDetail = {
  buffer: Uint8Array,
  imageWidth: number,
  imageHeight: number,
  windowX: number,
  windowY: number,
  windowWidth: number,
  windowHeight: number
};
type CropEvent = CustomEvent<CropEventDetail>;

type ChunkGifResultEvent = CustomEvent<Uint8Array[][]>;

type CropChunkResultEventDetail = {
  data: Uint8Array[],
  chunk: number
};
type CropChunkResultEvent = CustomEvent<CropChunkResultEventDetail>;

type MergeFramesResultEvent = CustomEvent<Uint8Array>;

type CropImageResultEvent = CustomEvent<Uint8Array>;

enum CropperEvent {
  CHUNK_GIF_RESULT = "_cropperInternal_ChunkGifResult",
  CROP_CHUNK_RESULT = "_cropperInternal_CropChunkResult",
  MERGE_FRAMES_RESULT = "_cropperInternal_MergeFramesResult",
  CROP_IMAGE_RESULT = "_cropperInternal_CropImageResult",
} 


const onmessage = (e: MessageEvent<{action: string, data: any, chunk?: number}>) => {
  switch (e.data.action) {

    case ("chunkGifWorkerResult"): {
      document.dispatchEvent(
        new CustomEvent(
          CropperEvent.CHUNK_GIF_RESULT,
          {
            detail: e.data.data
          }
        )
      )
      break;
    }

    case ("cropChunkWorkerResult"): {
      document.dispatchEvent(
        new CustomEvent(
          CropperEvent.CROP_CHUNK_RESULT,
          {
            detail: {
              data: e.data.data,
              chunk: e.data.chunk,
            }
          }
        )
      )
      break;
    }

    case ("mergeFramesWorkerResult"): {
      document.dispatchEvent(
        new CustomEvent(
          CropperEvent.MERGE_FRAMES_RESULT,
          {
            detail: e.data.data
          }
        )
      )
      break;
    }

    case ("cropImageWorkerResult"): {
      document.dispatchEvent(
        new CustomEvent(
          CropperEvent.CROP_IMAGE_RESULT,
          {
            detail: e.data.data
          }
        )
      )
      break;
    }

  }
}

const onerror = (e: ErrorEvent) => {
  console.error(e);
}


let workers = [];
for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
  let worker = new MyWorker;
  workers.push(worker);
  worker.onmessage = onmessage;
  worker.onerror = onerror;
}


document.addEventListener(
  "cropGifInWorker",
  (
    async (e: CropEvent) => {
      let data = e.detail;

      workers[0].postMessage(
        {
          action: "chunkGif",
          data: {
            buffer: data.buffer,
            chunks: workers.length,
          }
        },
        [data.buffer.buffer]
      )

      let chunks: Uint8Array[][];
      {
        let event: ChunkGifResultEvent = await events.consumeSingleEvent(CropperEvent.CHUNK_GIF_RESULT);
        chunks = event.detail;
      }

      let croppedChunks: Uint8Array[];
      {
        let waiters: Promise<CropChunkResultEvent>[] = []

        for (let i = 0; i < workers.length; i++) {
          workers[i].postMessage(
            {
              action: "cropChunk",
              data: {
                buffer: chunks[i],
                w: data.imageWidth,
                h: data.imageHeight,
                sx: data.windowX,
                sy: data.windowY,
                sw: data.windowWidth,
                sh: data.windowHeight,
              },
              chunk: i
            },
          )

          waiters.push(
            events.consumeSingleEvent(
              CropperEvent.CROP_CHUNK_RESULT,
              (e) => e.detail.chunk == i
            )
          )
        }

        croppedChunks = (await Promise.all(waiters)).map((e) => e.detail.data).flat(1);
      }
      
      workers[0].postMessage(
        {
          action: "mergeFrames",
          data: {
            buffer: croppedChunks,
            w: data.windowWidth,
            h: data.windowHeight,
          }
        },
      )

      let combined: MergeFramesResultEvent = await events.consumeSingleEvent(CropperEvent.MERGE_FRAMES_RESULT);
      document.dispatchEvent(
        new CustomEvent(
          "cropGifResult",
          {
            detail: new Blob([combined.detail])
          }
        )
      )

    }
  ) as events.AsyncEventListener
)


document.addEventListener(
  "cropImageInWorker",
  (
    async (e: CropEvent) => {
      let data = e.detail;

      workers[0].postMessage(
        {
          action: "cropImage",
          data: {
            buffer: data.buffer,
            sx: data.windowX,
            sy: data.windowY,
            sw: data.windowWidth,
            sh: data.windowHeight,
          }
        },
        [data.buffer.buffer]
      )

      let event: CropImageResultEvent = await events.consumeSingleEvent(CropperEvent.CROP_IMAGE_RESULT);
      document.dispatchEvent(
        new CustomEvent(
          "cropImageResult",
          {
            detail: new Blob([event.detail])
          }
        )
      )      
    }

  ) as events.AsyncEventListener
)
