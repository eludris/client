import * as wasm from "eludris-wasm-cropper";

wasm.init_panic_hook();

onmessage = (e) => {
    switch (e.data.action) {

        case ("chunkGif"): {
            postMessage(
                {
                    action: "chunkGifWorkerResult",
                    data: wasm.chunkGif(e.data.data.buffer, e.data.data.chunks),
                }
            )
            break;
        }

        case ("cropChunk"): {
            postMessage(
                {
                    action: "cropChunkWorkerResult",
                    data: wasm.cropChunk(
                        e.data.data.buffer,
                        e.data.data.w,
                        e.data.data.h,
                        e.data.data.sx,
                        e.data.data.sy,
                        e.data.data.sw,
                        e.data.data.sh,
                    ),
                    chunk: e.data.chunk,
                }
            )
            break;
        }

        case ("mergeFrames"): {
            postMessage(
                {
                    action: "mergeFramesWorkerResult",
                    data: wasm.mergeFrames(
                        e.data.data.buffer,
                        e.data.data.w,
                        e.data.data.h,
                    ),
                }
            )
            break;
        }

        case ("cropImage"): {
            postMessage(
                {
                    action: "cropImageWorkerResult",
                    data: wasm.cropImage(
                        e.data.data.buffer,
                        e.data.data.sx,
                        e.data.data.sy,
                        e.data.data.sw,
                        e.data.data.sh,
                    ),
                }
            )
            break;
        }
    }
};
