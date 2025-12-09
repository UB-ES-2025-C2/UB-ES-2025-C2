import { expect } from '@playwright/test'
import { test } from './fixtures/testUser.js'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

test.describe('Escoltar cançó', () => {

  test('Reproduir i pausar des de Home', async ({ page }) => {
    await page.goto(BASE_URL + '/')
    await page.waitForLoadState('networkidle')

    const firstSongCard = page.locator('.cards-list .card').first()
    await firstSongCard.click()
    await page.waitForSelector('.page .hero')

    const playBtn = page.locator('.controls .play').first()
    await expect(playBtn).toBeVisible()

    // Reproduir
    await playBtn.click()
    await expect(page.locator('.controls .play').first().getByText('⏸')).toBeVisible({ timeout: 5000 })

    // Pausar
    await playBtn.click()
    await expect(page.locator('.controls .play').first().getByText('▶')).toBeVisible({ timeout: 5000 })

    // Barra de progreso
    const progressBar = page.locator('[data-test=progress-bar]')
    if (await progressBar.count() > 0) {
      await expect(progressBar.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('Validar backend de la cançó', async ({ page, request }) => {
    await page.goto(BASE_URL + '/')
    await page.waitForLoadState('networkidle')

    const firstSongCard = page.locator('.cards-list .card').first()
    await firstSongCard.click()
    await page.waitForSelector('.page .hero')

    const titleHome = await page.locator('.hero-info .title').innerText()
    const songUrl = page.url()
    const songIdMatch = songUrl.match(/\/song\/(\d+)/)
    expect(songIdMatch).not.toBeNull()
    const songId = songIdMatch[1]

    const songRes = await request.get(`${API_URL}/api/v1/songs/${songId}/`)
    expect(songRes.ok()).toBeTruthy()
    const songData = await songRes.json()
    expect(songData.id).toBe(Number(songId))
    expect(songData.name?.length).toBeGreaterThan(0)
    expect(titleHome.toLowerCase()).toContain(songData.name.toLowerCase())
  })


})

test('Buscar cançó que no existeix y mostrar missatge adequat', async ({ page }) => {
  // Anar a /search
  await page.goto('/search')

  // Escriure una cançó que no existeix
  await page.locator('[data-test="search-input"]').fill('EstaCancionNoExiste')
  await page.waitForTimeout(500) // deixa respirar el debounce/store

  // Comprovar que no hi ha resultats de cançons
  const noResults = page.locator('text=No hi ha playlists.') // missatge per defecte
  await expect(noResults).toBeVisible()
})
