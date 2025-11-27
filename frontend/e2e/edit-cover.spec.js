import { expect } from '@playwright/test'
import { test } from './fixtures/testUser.js'

const BASE_URL =  process.env.FRONTEND_URL|| 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

test('Afegir portada de la cançó via UI i comprovar backend', async ({ page, request }) => {
  // 1️⃣ Login amb usuari hardcodejat
  const username = 'admin'
  const password = 'admin'
  
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', username)
  await page.fill('input#password', password)
  await page.click('button:has-text("Iniciar Sessió")')
  await page.waitForURL(BASE_URL + '/')

  // 2️⃣ Obre el perfil
  await page.click('button[aria-label="User menu"]')
  await page.click('text=El teu perfil')

  // 2.1️⃣ Captura el userId de la URL
  await page.waitForURL(/\/profile\/\d+/)
  const profileUrl = page.url()
  const userId = profileUrl.match(/\/profile\/(\d+)/)[1]
  console.log('🟢 User ID:', userId)

  // 3️⃣ Espera que carreguin les cançons i clica la primera
  await page.waitForSelector('.song-card')
  await page.click('.song-card:first-child')

  // 4️⃣ Estem a la pàgina d’edició
  await page.waitForSelector('button:has-text("Canviar portada")')

  // 5️⃣ Selecciona una imatge vàlida
  const coverFile = './files/default.png' // assegura't que existeix aquest fitxer
  const coverInput = page.locator('input[type="file"]').nth(1) // segon input
  await coverInput.setInputFiles(coverFile)

  // 6️⃣ Desa els canvis
  await page.click('button:has-text("Desar canvis")')

  // 7️⃣ Comprova que apareix missatge d’èxit
  const successMsg = page.locator('.success')
  await expect(successMsg).toContainText('Cançó actualitzada correctament!')

  // 8️⃣ Espera que la redirecció al perfil es completi amb el userId
  await page.waitForURL(`${BASE_URL}/profile/${userId}`)

  // 9️⃣ Recarrega la pàgina de la cançó i comprova que la portada s’ha actualitzat
  await page.click('.song-card:first-child')
  await page.waitForSelector('.cover-preview')
  const previewSrc = await page.locator('.cover-preview').getAttribute('src')
  expect(previewSrc).toMatch(/default_.*\.png$/)

  // 🔟 Opcional: comprovar backend
  const loginRes = await request.post(`${API_URL}/api/token/`, {
    data: { username, password },
  })
  expect(loginRes.ok()).toBeTruthy()
  const accessToken = (await loginRes.json()).access

  const songsRes = await request.get(`${API_URL}/api/v1/userprofile/${userId}/songs/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  expect(songsRes.ok()).toBeTruthy()
  const songs = await songsRes.json()
  await page.waitForSelector('.cover-preview')
  const previewSrcAfter = await page.locator('.cover-preview').getAttribute('src')
  //comprovar que és una imatge
  expect(previewSrcAfter).toMatch(/default_.*\.png$/)
})
