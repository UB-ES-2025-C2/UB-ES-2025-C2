import { test as base, request as playwrightRequest } from '@playwright/test'

const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin'

export const test = base.extend({
  // oxlint-disable-next-line no-empty-pattern
  testUser: async ({}, use) => {
    // 1️ Generar dades úniques
    const username = 'user_' + Math.random().toString(36).substring(2, 10)
    const password = '1234'
    const email = `${username}@test.com`

    const req = await playwrightRequest.newContext()

    // 2️ Crear usuari
    const createRes = await req.post(`${API_URL}/api/v1/user/`, {
      data: { username, email, password, password_conf: password },
    })

    if (!createRes.ok()) {
      throw new Error(`No s'ha pogut crear l'usuari de test: ${username}`)
    }

    console.log(`[FIXTURE] Usuari creat: ${username}`)

    // 3️ Recuperar ID del backend
    const createdUser = await createRes.json()
    const userId = createdUser.id

    // 4️ Donar l’usuari al test
    await use({ username, password, userId })

    // 5️ Cleanup: eliminar usuari amb admin
    console.log(`[FIXTURE] Eliminant usuari amb admin: ${username}`)

    try {
      // Login admin
      const adminLoginRes = await req.post(`${API_URL}/api/token/`, {
        data: { username: ADMIN_USER, password: ADMIN_PASS },
      })

      if (!adminLoginRes.ok()) throw new Error('No s’ha pogut fer login admin per eliminar usuari')

      const accessToken = (await adminLoginRes.json()).access

      // Delete usuari
      const deleteRes = await req.delete(`${API_URL}/api/v1/userprofile/${userId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!deleteRes.ok()) {
        console.warn(`[AVÍS] No s'ha pogut eliminar l'usuari: ${username}`)
      }
    } catch (err) {
      console.warn(`[AVÍS] Error eliminant usuari amb admin: ${username}`, err)
    }
  },
})
