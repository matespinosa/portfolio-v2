import { env, pipeline } from '@huggingface/transformers'

env.allowLocalModels = false
// A single WASM thread also works on pages without cross-origin isolation.
env.backends.onnx.wasm.numThreads = 1

let transcriber
function load() {
  transcriber ??= pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
    device: 'wasm',
    dtype: 'q8',
  }).catch((error) => {
    transcriber = null
    throw error
  })
  return transcriber
}

self.onmessage = async ({ data: { id, type, audio, language } }) => {
  try {
    const speech = await load()
    const result = type === 'transcribe'
      ? await speech(audio, {
        language: language === 'es' ? 'spanish' : 'english',
        task: 'transcribe',
        max_new_tokens: 128,
        chunk_length_s: 30,
        stride_length_s: 3,
      })
      : null
    self.postMessage({ id, text: result?.text?.trim() || '' })
  } catch {
    self.postMessage({ id, error: type === 'transcribe' ? 'transcription' : 'download' })
  }
}
