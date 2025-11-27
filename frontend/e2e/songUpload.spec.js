import { expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { test as customTest } from './fixtures/testUser.js'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

customTest(
  'Flux complet: pujada de cançó amb usuari aleatori (via API)',
  async ({ page, request, testUser }) => {
    const { username, password } = testUser

    console.log('🟢 Token i usuari preparats:', username)

    // 1️⃣ Login per token
    const loginRes = await request.post(`${API_URL}/api/token/`, {
      data: { username, password },
    })
    expect(loginRes.ok()).toBeTruthy()
    const accessToken = (await loginRes.json()).access
    console.log('✅ Token obtingut')

    // 2️⃣ Preparar fitxers

    const audioPath = path.resolve('./e2e/files/sample.mp3')
    const coverPath = path.resolve('./e2e/files/cover.png')

    // 3️⃣ Enviar petició POST amb multipart/form-data
    const songRes = await request.post(`${API_URL}/api/v1/songs/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      multipart: {
        name: 'Cançó de test',
        artist: 'Artista Test',
        topic: 'Pop',
        file_audio: {
          name: 'sample.mp3',
          mimeType: 'audio/mpeg',
          buffer: fs.readFileSync(audioPath),
        },
        file_cover: {
          name: 'cover.png',
          mimeType: 'image/png',
          buffer: fs.readFileSync(coverPath),
        },
      },
    })

    const bodyText = await songRes.text()
    console.log('🟢 Resposta backend:', bodyText)

    expect(songRes.ok()).toBeTruthy()
    const song = JSON.parse(bodyText)
    const songId = song.id
    console.log('✅ Cançó pujada amb ID:', songId)

    // 4️⃣ Comprovar que es pot accedir al detall
    await page.goto(`${BASE_URL}/song/${songId}`)
    await expect(page.locator('h1.title')).toContainText('Cançó de test')
    await expect(page.locator('p.meta')).toContainText('Artista Test')
  },
)
