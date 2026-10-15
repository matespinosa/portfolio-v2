let worker
let nextId = 0
const pending = new Map()

function reset() {
  worker?.terminate()
  worker = null
  for (const { reject, timer } of pending.values()) {
    clearTimeout(timer)
    reject(new Error('Speech recognition is unavailable'))
  }
  pending.clear()
}

function request(type, payload = {}) {
  return new Promise((resolve, reject) => {
    try {
      if (!worker) {
        worker = new Worker(new URL('./portfolioSpeechWorker.js', import.meta.url), { type: 'module' })
        worker.onmessage = ({ data }) => {
          const job = pending.get(data.id)
          if (!job) return
          pending.delete(data.id)
          clearTimeout(job.timer)
          if (data.error) job.reject(new Error(data.error))
          else job.resolve(data.text)
        }
        worker.onerror = reset
      }
      const id = ++nextId
      // Model files are cached by the browser after the first download.
      const timer = setTimeout(reset, 120_000)
      pending.set(id, { resolve, reject, timer })
      worker.postMessage({ id, type, ...payload }, payload.audio ? [payload.audio.buffer] : [])
    } catch (error) {
      reset()
      reject(error)
    }
  })
}

export const browserSpeech = {
  prepare: () => request('load'),
  transcribe: (audio, language) => request('transcribe', { audio, language }),
}
