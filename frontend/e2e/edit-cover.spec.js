import { expect, test } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Configuració de __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

// URL de la imatge que volem fer servir per al test
const REMOTE_IMAGE_URL =
  'https://lcypkbblbnsdjuvbtneg.supabase.co/storage/v1/object/public/archivosmusicspace/covers/default.png'

test('Afegir portada de la cançó via UI i comprovar backend', async ({ page, request }) => {
  // PREPARACIÓ: Descarregar imatge
  const imageResponse = await request.get(REMOTE_IMAGE_URL)
  expect(imageResponse.status()).toBe(200)

  const imageBuffer = await imageResponse.body()
  const tempCoverPath = path.join(__dirname, 'temp_default_cover.png')
  fs.writeFileSync(tempCoverPath, imageBuffer)

  try {
    // LOGIN
    const username = 'admin'
    const password = 'admin1234+'

    await page.goto(`${BASE_URL}/login`)
    await page.fill('input#identifier', username)
    await page.fill('input#password', password)
    await page.click('button:has-text("Iniciar Sessió")')
    await page.waitForURL(BASE_URL + '/')

    // Accedir al perfil
    await page.click('button[aria-label="User menu"]')
    await page.click('text=El teu perfil')
    await page.waitForURL(/\/profile\/\d+/)

    // Capturem l'ID de l'usuari
    await page.waitForURL(/\/profile\/\d+/)
    const profileUrl = page.url()
    const userIdMatch = profileUrl.match(/\/profile\/(\d+)/)
    const userId = userIdMatch ? userIdMatch[1] : null
    console.log('🟢 User ID:', userId)

    // OBRIR EDICIÓ DE CANÇÓ
    // Esperem a que les cançons carreguin (donem temps extra per si la xarxa és lenta)
    const songCard = page.locator('.song-card').first()
    await expect(songCard).toBeVisible({ timeout: 10000 })
    await songCard.click()

    const changeCoverBtn = page.getByText('Canviar portada')
    await expect(changeCoverBtn).toBeVisible()

    // PUJAR LA IMATGE
    const coverInput = page.locator('input[type="file"]').nth(1)
    await coverInput.setInputFiles(tempCoverPath)

    // DESAR CANVIS
    await page.click('button:has-text("Desar canvis")')

    // VERIFICAR ÈXIT
    const successMsg = page.locator('.success')
    await expect(successMsg).toBeVisible({ timeout: 10000 })
    await expect(successMsg).toContainText('Cançó actualitzada correctament!')

    // COMPROVAR BACKEND (API)
    const loginRes = await request.post(`${API_URL}/api/token/`, {
      data: { username, password },
    })
    expect(loginRes.ok()).toBeTruthy()
    const accessToken = (await loginRes.json()).access

    const songsRes = await request.get(`${API_URL}/api/v1/userprofile/${userId}/songs/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(songsRes.ok()).toBeTruthy()
    const songsData = await songsRes.json()
    expect(songsData.length).toBeGreaterThan(0)
  } finally {
    // NETEJA
    if (fs.existsSync(tempCoverPath)) {
      fs.unlinkSync(tempCoverPath)
    }
  }
})
