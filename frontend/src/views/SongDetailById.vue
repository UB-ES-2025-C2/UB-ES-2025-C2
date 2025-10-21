<template>
  <section class="page">
    <!-- LOADING / ERROR -->
    <div v-if="loading" class="loading">Carregant…</div>
    <div v-else-if="error" class="error">⚠️ {{ error }}</div>

    <!-- CONTENT -->
    <div v-else>
      <!-- HERO -->
      <header class="hero" :style="heroStyle">
        <div class="hero-bg" :style="bgStyle"></div>

        <img
          v-if="song.cover"
          :src="song.cover"
          alt="Caràtula"
          class="cover"
        />

        <div class="hero-info">
          <div class="badge">Senzill</div>
          <h1 class="title">{{ song.name }}</h1>
          <p class="meta">
            {{ song.artist }}
            <span v-if="song.topic"> • {{ song.topic }}</span>
            <span v-if="durationSec"> • {{ formatTime(durationSec) }}</span>
          </p>

          <div class="controls">
            <button class="btn play" @click="togglePlay">
              <span v-if="!isPlaying">▶</span>
              <span v-else>⏸</span>
            </button>
            <button class="btn ghost" title="Afegir a playlist">＋</button>
            <button class="btn ghost" title="Més opcions">⋯</button>
          </div>
        </div>
      </header>

      <!-- TRACK ROW (una sola cançó) -->
      <div class="list-header">
        <span>#</span>
        <span>Títol</span>
        <span class="clock">⏱</span>
      </div>

      <div class="track-row" @dblclick="togglePlay">
        <div class="idx">1</div>
        <div class="track-main">
          <div class="t-title">{{ song.name }}</div>
          <div class="t-artist">{{ song.artist }}</div>
        </div>
        <div class="t-time">{{ formatTime(durationSec) }}</div>
      </div>

      <!-- PROGRESS BAR -->
      <div v-if="song.file_audio" class="player">
        <div class="timeline">
          <span class="t">{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            min="0"
            :max="Math.max(durationSec, 0.001)"
            step="0.01"
            v-model.number="seekValue"
            @input="onSeek"
          />
          <span class="t">{{ formatTime(durationSec) }}</span>
        </div>
      </div>

      <!-- ÀUDIO ocult: fem servir controls propis -->
      <audio
        v-if="song.file_audio"
        ref="audioRef"
        :src="song.file_audio"
        preload="metadata"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        style="display:none"
      ></audio>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "../services/api";

const route = useRoute();
const song = ref(null);
const loading = ref(true);
const error = ref("");

const audioRef = ref(null);
const isPlaying = ref(false);
const durationSec = ref(0);
const currentTime = ref(0);
const seekValue = ref(0);

const heroStyle = computed(() => ({ background: "linear-gradient(#1f415b, #102735)" }));
const bgStyle = computed(() =>
  song.value?.cover
    ? { backgroundImage: `url('${song.value.cover}')` }
    : {}
);

function formatTime(sec) {
  if (!sec || sec === Infinity) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function togglePlay() {
  const a = audioRef.value;
  if (!a) return;
  if (a.paused) {
    a.play();
    isPlaying.value = true;
  } else {
    a.pause();
    isPlaying.value = false;
  }
}

function onLoadedMetadata(e) {
  durationSec.value = e.target.duration || 0;
}

function onTimeUpdate(e) {
  currentTime.value = e.target.currentTime || 0;
  // si l’usuari no està arrossegant, mantenim el range sincronitzat
  seekValue.value = currentTime.value;
}

function onSeek() {
  const a = audioRef.value;
  if (!a) return;
  a.currentTime = seekValue.value;
}

function onEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
  seekValue.value = 0;
}

onMounted(async () => {
  try {
    const { data } = await api.getSongById(route.params.id);
    song.value = data;
  } catch (e) {
    error.value = e?.response?.data?.detail || e?.message || "Error desconegut";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Layout base */
.page {
  color: #fff;
  background: #121212;
  min-height: 100vh;
}

/* HERO */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  padding: 28px;
  border-radius: 16px;
  overflow: hidden;
  margin: 16px;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(40px) saturate(1.2);
  opacity: 0.35;
  transform: scale(1.1);
}
.cover {
  width: 220px;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(0,0,0,0.45);
}
.hero-info {
  z-index: 1;
  align-self: end;
}
.badge {
  font-size: 0.9rem;
  color: #cbd5e1;
  margin-bottom: 6px;
}
.title {
  font-size: clamp(32px, 7vw, 72px);
  line-height: 0.95;
  font-weight: 800;
  margin: 4px 0 8px;
}
.meta {
  color: #cbd5e1;
  margin-bottom: 16px;
}
.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 16px;
}
.play {
  background: #ff3896; /* verd Spotify */
  color: #fff;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(205, 68, 152, 0.35);
}
.btn.ghost {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

/* LIST HEADER + ROW */
.list-header, .track-row {
  display: grid;
  grid-template-columns: 48px 1fr 80px;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
}
.list-header {
  color: #a3a3a3;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 8px;
  padding-top: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.list-header .clock { justify-self: end; }

.track-row {
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: 10px;
  margin: 4px 16px;
}
.track-row:hover {
  background: rgba(255,255,255,0.06);
}
.idx {
  color: #cbd5e1;
  text-align: center;
}
.track-main .t-title {
  font-weight: 600;
}
.track-main .t-artist {
  color: #a3a3a3;
  font-size: 0.95rem;
}
.t-time {
  justify-self: end;
  color: #cbd5e1;
}

/* PLAYER (barra de progrés) */
.player {
  padding: 8px 24px 24px;
}
.timeline {
  display: grid;
  grid-template-columns: 56px 1fr 56px;
  align-items: center;
  gap: 12px;
}
.timeline .t {
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.timeline input[type="range"] {
  width: 100%;
  appearance: none;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  outline: none;
}
.timeline input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #ff3896;
  margin-top: -5px;
  box-shadow: 0 0 0 6px rgba(30, 215, 96, 0.25);
}
.timeline input[type="range"]::-moz-range-thumb {
  width: 14px; height: 14px; border: none; border-radius: 50%;
  background: #ff3896;
}

/* FEEDBACK */
.loading, .error {
  padding: 2rem;
}
.error { color: #fca5a5; }
</style>
