import { test as base, request as playwrightRequest } from '@playwright/test'

const API_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

export const test = base.extend({
  testUser: async ({}, use) => {
    // 1️⃣ Generar un usuari únic
    const username = 'user_' + Math.random().toString(36).substring(2, 10)
    const password = '1234'

    const req = await playwrightRequest.newContext()

    // 2️⃣ Crear usuari al backend
    const createRes = await req.post(`${API_URL}/api/v1/user/`, {
      data: { username, password },
    })

    if (!createRes.ok()) {
      throw new Error(`No s'ha pogut crear l'usuari de test: ${username}`)
    }

    console.log(`[FIXTURE] Usuari creat: ${username}`)

    // 3️⃣ Proporcionar-lo al test
    await use({ username, password })
  },
})
