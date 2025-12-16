<!-- /src/components/PlayerBar.vue -->
<script setup>
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/piniaStore/playerStore'

const p = usePlayerStore()

const progress = computed({
  get: () => p.time || 0,
  set: (v) => p.seek(v),
})
const max = computed(() => Math.max(p.duration || 0, 0.001))

const vol = computed({
  get: () => p.volume,
  set: (v) => p.setVolume(v),
})

function playFromQueue(i) {
  p.setQueue(p.queue, i)
  p.playSong()
}

const showQueue = ref(false)
</script>

<template>
  <div class="playerbar" v-if="p.current">
    <div class="left">
      <img
        v-if="p.current.cover"
        :src="p.current.cover"
        alt=""
        class="cover"
        data-test="player-cover"
      />
      <div class="meta">
        <div class="title">{{ p.current.name }}</div>
        <div class="artist">{{ p.current.artist }}</div>
      </div>
    </div>

    <div class="center">
      <div class="controls">
        <!-- 🔀 ELIMINAT -->
        <button class="btn" @click="p.prev" title="Anterior">⏮</button>
        <button
          class="btn play"
          data-test="player-play"
          @click="p.toggle"
          :title="p.isPlaying ? 'Pausa' : 'Reprodueix'"
        >
          <span v-if="!p.isPlaying">▶</span><span v-else>⏸</span>
        </button>
        <button class="btn" @click="p.next" title="Següent">⏭</button>
        <!-- 🔁 ELIMINAT -->
      </div>

      <div class="timeline">
        <span class="t" data-test="player-current-time">{{ p.formatTime(p.time) }}</span>
        <input
          type="range"
          min="0"
          :max="max"
          step="0.01"
          data-test="player-progress"
          v-model.number="progress"
        />
        <span class="t" data-test="player-duration">{{ p.formatTime(p.duration) }}</span>
      </div>
    </div>

    <div class="right">
      <span class="icon">🔊</span>
      <input type="range" min="0" max="1" step="0.01" v-model.number="vol" />
      <button class="btn small" @click="showQueue = !showQueue" title="Cua">📜</button>
    </div>

    <!-- Cua (opcional) -->
    <div class="queue" v-if="showQueue">
      <div
        v-for="(s, i) in p.queue"
        :key="s.id || i"
        :class="['qrow', i === p.index ? 'active' : '']"
        @dblclick="playFromQueue(i)"
      >
        <span class="i">{{ i + 1 }}</span>
        <span class="nm">{{ s.name }}</span>
        <span class="ar">{{ s.artist }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playerbar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  height: 92px;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(18, 18, 18, 0.98);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  z-index: 50;
}
.left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.cover {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
}
.meta {
  overflow: hidden;
}
.title {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.artist {
  color: #cbd5e1;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.center {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}
.controls {
  display: flex;
  align-items: center;
  gap: 10px;
} /* lleu ajust del gap */
.btn {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 8px 12px;
  background: #2a2a2a;
  color: #fff;
}
.btn.small {
  padding: 6px 8px;
  font-size: 14px;
}
.btn.play {
  background: #ff3896;
  box-shadow: 0 6px 20px rgba(205, 68, 152, 0.35);
  font-weight: 700;
}

.timeline {
  display: grid;
  grid-template-columns: 56px 1fr 56px;
  gap: 10px;
  align-items: center;
  width: 100%;
}
.t {
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.timeline input[type='range'],
.right input[type='range'] {
  width: 100%;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  outline: none;
}
.timeline input[type='range']::-webkit-slider-thumb,
.right input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ff3896;
  margin-top: -5px;
  box-shadow: 0 0 0 6px rgba(205, 68, 152, 0.25);
}
.timeline input[type='range']::-moz-range-thumb,
.right input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: #ff3896;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-self: end;
  width: 100%;
  max-width: 260px;
}
.icon {
  opacity: 0.9;
}

.queue {
  position: absolute;
  bottom: 92px;
  right: 16px;
  width: 520px;
  max-height: 50vh;
  overflow: auto;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}
.qrow {
  display: grid;
  grid-template-columns: 32px 1fr 1fr;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
}
.qrow:hover {
  background: rgba(255, 255, 255, 0.06);
}
.qrow.active {
  background: rgba(255, 56, 150, 0.12);
}
.i {
  color: #cbd5e1;
  text-align: center;
}
.nm {
  font-weight: 600;
}
.ar {
  color: #a3a3a3;
}

@media (max-width: 900px) {
  .playerbar {
    grid-template-columns: 1fr 1.2fr 0.8fr;
    height: 88px;
  }
  .right {
    max-width: 180px;
  }
}
</style>
