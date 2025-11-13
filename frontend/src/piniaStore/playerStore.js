// /src/store/playerStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // ÚNIC audio element per tota l’app
  const audio = new Audio()
  audio.preload = 'metadata'

  // Estat
  const queue = ref([]) // [{ id, name, artist, cover, file_audio }, ...]
  const index = ref(-1) // posició a la cua
  const current = computed(() => (index.value >= 0 ? queue.value[index.value] : null))

  const isPlaying = ref(false)
  const duration = ref(0)
  const time = ref(0)
  const volume = ref(1) // 0..1
  const repeat = ref('off') // 'off' | 'one' | 'all'
  const shuffle = ref(false)

  // Helpers
  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec <= 0) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Carrega la cançó actual a l'audio element
  function loadCurrent() {
    const s = current.value
    if (!s) return
    audio.src = s.file_audio
    audio.load()
  }

  // API pública
  function setQueue(list, startAt = 0) {
    queue.value = Array.isArray(list) ? list.slice() : []
    index.value = startAt >= 0 && startAt < queue.value.length ? startAt : 0
    loadCurrent()
  }

  async function playSong(song) {
    // Si ve una cançó fora de la cua, reproduïm-la com a cua d’1 element
    if (song) {
      queue.value = [song]
      index.value = 0
      loadCurrent()
    }
    try {
      await audio.play()
      isPlaying.value = true
    } catch (e) {
      // pot fallar per autoplay policies si no hi ha interacció prèvia
      isPlaying.value = false
      console.warn('No s’ha pogut iniciar la reproducció:', e)
    }
  }

  function toggle() {
    if (!current.value) return
    if (audio.paused)
      playSong() // continua la que hi ha carregada
    else {
      audio.pause()
      isPlaying.value = false
    }
  }

  function pause() {
    audio.pause()
    isPlaying.value = false
  }

  function seek(newTime) {
    if (!current.value) return
    audio.currentTime = Math.min(Math.max(0, Number(newTime)), duration.value || 0)
  }

  function setVolume(v) {
    volume.value = Math.min(Math.max(0, Number(v)), 1)
    audio.volume = volume.value
  }

  function next() {
    if (!queue.value.length) return
    if (shuffle.value) {
      let n = Math.floor(Math.random() * queue.value.length)
      if (queue.value.length > 1) {
        while (n === index.value) n = Math.floor(Math.random() * queue.value.length)
      }
      index.value = n
    } else {
      if (index.value < queue.value.length - 1) index.value += 1
      else if (repeat.value === 'all') index.value = 0
      else {
        isPlaying.value = false
        return
      }
    }
    loadCurrent()
    playSong()
  }

  function prev() {
    if (!queue.value.length) return
    if (audio.currentTime > 3) {
      seek(0)
      return
    } // com Spotify
    if (shuffle.value) {
      let n = Math.floor(Math.random() * queue.value.length)
      if (queue.value.length > 1) {
        while (n === index.value) n = Math.floor(Math.random() * queue.value.length)
      }
      index.value = n
    } else {
      if (index.value > 0) index.value -= 1
      else if (repeat.value === 'all') index.value = queue.value.length - 1
      else {
        seek(0)
        return
      }
    }
    loadCurrent()
    playSong()
  }

  // Listeners una sola vegada
  audio.addEventListener('loadedmetadata', () => {
    duration.value = Number.isFinite(audio.duration) ? audio.duration : 0
  })
  audio.addEventListener('timeupdate', () => {
    time.value = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
  })
  audio.addEventListener('ended', () => {
    if (repeat.value === 'one') {
      seek(0)
      playSong()
      return
    }
    next()
  })

  // Sincronitza volum inicial
  audio.volume = volume.value

  return {
    // state/getters
    queue,
    index,
    current,
    isPlaying,
    duration,
    time,
    volume,
    repeat,
    shuffle,
    formatTime,
    // actions
    setQueue,
    playSong,
    toggle,
    pause,
    seek,
    setVolume,
    next,
    prev,
  }
})
