import { expect, test } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

// URL de la imatge que volem fer servir per al test
const REMOTE_IMAGE_URL =
  'https://lcypkbblbnsdjuvbtneg.supabase.co/storage/v1/object/public/archivosmusicspace/covers/default.png'

test('Afegir portada de la cançó via UI i comprovar backend', async ({ page, request }) => {
  // 1️⃣ PREPARACIÓ: Descarregar imatge de Supabase al vol
  const imageResponse = await request.get(REMOTE_IMAGE_URL)
  expect(imageResponse.status()).toBe(200)

  const imageBuffer = await imageResponse.body()
  // Guardem la imatge temporalment a la carpeta del test amb el nom 'default.png'
  const tempCoverPath = path.join(__dirname, 'temp_default_cover.png')
  fs.writeFileSync(tempCoverPath, imageBuffer)

  try {
    // LOGIN
    const username = 'admin'
    const password = 'admin' // Si el password real és 'admin1234+', canvia-ho aquí

    await page.goto(`${BASE_URL}/login`)
    await page.fill('input#identifier', username)
    await page.fill('input#password', password)
    await page.click('button:has-text("Iniciar Sessió")')

    // Espera visual en lloc de waitForURL (més robust)
    await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible()

    // NAVEGAR AL PERFIL
    await page.click('button[aria-label="User menu"]')
    await page.click('text=El teu perfil')

    // Capturem l'ID de l'usuari de la URL
    await page.waitForURL(/\/profile\/\d+/)
    const profileUrl = page.url()
    const userIdMatch = profileUrl.match(/\/profile\/(\d+)/)
    const userId = userIdMatch ? userIdMatch[1] : null
    expect(userId).toBeTruthy()
    console.log('🟢 User ID:', userId)

    // OBRIR EDICIÓ DE CANÇÓ
    // Esperem que hi hagi com a mínim una cançó i cliquem
    const songCard = page.locator('.song-card').first()
    await expect(songCard).toBeVisible()
    await songCard.click()

    // Esperem el botó de canviar portada per saber que som a l'edició
    const changeCoverBtn = page.getByText('Canviar portada') // Selector flexible
    await expect(changeCoverBtn).toBeVisible()

    // PUJAR LA IMATGE (Usant el fitxer descarregat)
    // Nota: Usem .nth(1) perquè el primer input sol ser el de l'àudio i el segon el de la cover
    const coverInput = page.locator('input[type="file"]').nth(1)
    await coverInput.setInputFiles(tempCoverPath)

    // 6DESAR CANVIS
    await page.click('button:has-text("Desar canvis")')

    // VERIFICAR ÈXIT
    // Esperem que aparegui el missatge i comprovem el text
    const successMsg = page.locator('.success')
    await expect(successMsg).toBeVisible({ timeout: 10000 })
    await expect(successMsg).toContainText('Cançó actualitzada correctament!')

    // TORNAR AL PERFIL I VERIFICAR
    // Esperem la redirecció
    await page.waitForURL(new RegExp(`/profile/${userId}`))

    // Recarreguem fent click a la cançó per veure si la preview s'ha actualitzat
    await songCard.click()

    // Validem visualment que l'src ha canviat (o conté part del nom)
    const previewImg = page.locator('.cover-preview')
    await expect(previewImg).toBeVisible()
    const previewSrc = await previewImg.getAttribute('src')

    // Comprovem que l'SRC no està buit
    expect(previewSrc).toBeTruthy()
    console.log('🟢 Imatge actualitzada src:', previewSrc)

    // COMPROVAR BACKEND (API)
    // Login API per obtenir token
    const loginRes = await request.post(`${API_URL}/api/token/`, {
      data: { username, password },
    })
    expect(loginRes.ok()).toBeTruthy()
    const accessToken = (await loginRes.json()).access

    // Consultar les cançons de l'usuari
    const songsRes = await request.get(`${API_URL}/api/v1/userprofile/${userId}/songs/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(songsRes.ok()).toBeTruthy()

    // Aquí podries buscar la cançó específica si tinguessis l'ID,
    // però si només vols verificar que la crida va bé:
    const songsData = await songsRes.json()
    expect(songsData.length).toBeGreaterThan(0)
  } finally {
    // NETEJA: Esborrar el fitxer temporal encara que el test falli
    if (fs.existsSync(tempCoverPath)) {
      fs.unlinkSync(tempCoverPath)
    }
  }
})
