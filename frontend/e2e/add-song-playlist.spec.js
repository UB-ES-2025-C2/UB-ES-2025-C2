import { test } from './fixtures/testUser.js'
import { expect } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

test('Afegir una cançó a la playlist i comprovar backend', async ({ page, request }) => {
  // Login amb usuari hardcodejat
  const username = 'admin'
  const password = 'admin123'

  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', username)
  await page.fill('input#password', password)
  await page.click('button:has-text("Iniciar Sessió")')
  await page.waitForURL(BASE_URL + '/')

  // Obrir el menú d'usuari i accedir al perfil
  await page.click('button[aria-label="User menu"]')
  await page.click('text=El teu perfil')

  // Captura l'ID de l'usuari de la URL
  await page.waitForURL(/\/profile\/\d+/)
  const profileUrl = page.url()
  const _userId = profileUrl.match(/\/profile\/(\d+)/)[1]

  // Accedir a la primera playlist
  await page.waitForSelector('.playlist-card')
  await page.click('.playlist-card:first-child')

  // Espera que carregui la pàgina d’afegir cançons i extreu el playlistId
  await page.waitForURL(/addSongPlayList\/\d+/)
  const playlistUrl = page.url()
  const playlistId = Number(playlistUrl.match(/addSongPlayList\/(\d+)/)[1])
  console.log('🎵 Playlist ID detectat:', playlistId)

  // Espera que carreguin les cançons i el selector
  await page.waitForSelector('select.song-select')

  // Selecciona la primera cançó disponible del desplegable
  const firstOption = page.locator('select.song-select option:not([disabled])').first()
  const songId = await firstOption.getAttribute('value')
  const firstOptionText = await firstOption.textContent() // Exemple: "Primera canço - Laura"

  // Separar títol i autor
  const [songTitle, songArtist] = firstOptionText.split(' - ').map((s) => s.trim())

  await page.selectOption('select.song-select', songId)

  // Clicar botó afegir cançó
  await page.click('button.btn-add')

  // Espera i comprova que la cançó apareix a la llista correctament
  const lastRow = page.locator('.song-row').last()
  await expect(lastRow.locator('.col-title')).toContainText(songTitle)
  await expect(lastRow.locator('.col-artist')).toContainText(songArtist)

  // Comprovar backend que la cançó s’ha afegit
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
  expect(playlistSongs.some((song) => song.song.id === parseInt(songId))).toBeTruthy()
})
