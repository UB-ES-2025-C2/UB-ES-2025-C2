import { test } from './fixtures/testUser.js'
import { expect } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Test fet per quan hi ha cançons a la playlist
// S'ha de garantir que la playlist té cançons abans de córrer aquest test
test('Eliminar una cançó d’una playlist i comprovar backend', async ({ page, request }) => {
  const username = 'admin'
  const password = 'admin123'

  // Login
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', username)
  await page.fill('input#password', password)
  await page.click('button:has-text("Iniciar Sessió")')
  await page.waitForURL(BASE_URL + '/')

  // Accedir al perfil
  await page.click('button[aria-label="User menu"]')
  await page.click('text=El teu perfil')
  await page.waitForURL(/\/profile\/\d+/)

  // Obrir la primera playlist
  await page.waitForSelector('.playlist-card')
  await page.click('.playlist-card:first-child')
  await page.waitForURL(/addSongPlayList\/\d+/)
  const playlistId = Number(page.url().match(/addSongPlayList\/(\d+)/)[1])
  console.log('🎵 Playlist ID detectat:', playlistId)

  // Esperar que carreguin les cançons
  await page.waitForSelector('.song-row')
  const songRow = page.locator('.song-row').first()
  const songId = Number(await songRow.getAttribute('data-id'))

  // Automatitzar confirm
  page.on('dialog', dialog => dialog.accept())

  // Clicar el botó eliminar
  await songRow.locator('.btn-delete').click()

  // Esperar que desaparegui la fila concreta del DOM usant data-id
  await expect(page.locator(`.song-row[data-id="${songId}"]`)).toHaveCount(0)

  // Comprovar backend
  const loginRes = await request.post(`${API_URL}/api/token/`, {
    data: { username, password },
  })
  expect(loginRes.ok()).toBeTruthy()
  const accessToken = (await loginRes.json()).access

  const playlistRes = await request.get(`${API_URL}/api/v1/playlist/${playlistId}/songs/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  expect(playlistRes.ok()).toBeTruthy()
  const playlistSongs = await playlistRes.json()
  expect(playlistSongs.some(song => song.song.id === songId)).toBeFalsy()
})
