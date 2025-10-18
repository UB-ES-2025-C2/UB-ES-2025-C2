<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApiStore } from '../store'

const route = useRoute()
const api = useApiStore()

async function runSearch() {
  const q = (route.query.q || '').toString().trim()
  if (!q) { api.nUsersResult = []; return }
  await api.searchNUsers(q)
}
onMounted(runSearch)
watch(() => route.query.q, runSearch)
</script>

<template>
  <section class="search-results">
    <h1>Resultats per “{{ route.query.q }}”</h1>

    <p v-if="api.loading">Cercant…</p>
    <p v-else-if="api.error">Error: {{ api.error }}</p>

    <ul v-else-if="api.nUsersResult.length">
      <li v-for="u in api.nUsersResult" :key="u.id || u.username">
        {{ u.username }}
      </li>
    </ul>

    <p v-else>Sense resultats.</p>
  </section>
</template>
