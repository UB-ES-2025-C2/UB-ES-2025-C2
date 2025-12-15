import { expect, test } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test('Buscar un usuari existent i navegar al seu perfil públic', async ({ page }) => {
  // 0️⃣ Dades de prova
  // Buscarem l'usuari 'admin' (el mateix amb el que ens loguegem) perquè sabem que existeix segur.
  const targetUser = 'admin'

  await page.goto(BASE_URL)
  // 2️⃣ Interacció amb el Header (Buscador)
  // Segons el teu codi: <input type="search" ... />
  const searchInput = page.locator('input[type="search"]')

  // Comprovem que es veu abans d'escriure
  await expect(searchInput).toBeVisible()

  // Escrivim el nom i premem Enter (el teu form té @submit.prevent="onSubmit")
  await searchInput.fill(targetUser)
  await searchInput.press('Enter')

  // 3️⃣ Validació de la pàgina de cerca
  // El teu router fa push a: /search?q=term
  await page.waitForURL(/.*\/search\?q=admin/)
})
