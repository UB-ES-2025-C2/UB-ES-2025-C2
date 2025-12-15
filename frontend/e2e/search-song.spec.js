import { expect, test } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test('Flux complet: Buscar una cançó, filtrar i obrir-la', async ({ page }) => {
  // 0️⃣ Dades de prova
  // Posa aquí una part del títol d'una cançó que sàpigues que existeix.
  // Als logs anteriors veia que tenies una "Cançó de test".
  const searchTerm = 'test'
  await page.goto(BASE_URL)

  // -----------------------------------------------------------
  // 2️⃣ ÚS DEL BUSCADOR
  // -----------------------------------------------------------
  const searchInput = page.locator('input[type="search"]')

  // Assegurem que l'input és visible
  await expect(searchInput).toBeVisible()

  // Escrivim i premem Enter
  await searchInput.fill(searchTerm)
  await searchInput.press('Enter')

  // Esperem que la URL canvïi per incloure la query
  // El teu router fa: /search?q=...
  await page.waitForURL(/.*\/search\?q=/)

  // -----------------------------------------------------------
  // 3️⃣ FILTRAT PER PESTANYA "CANÇONS"
  // -----------------------------------------------------------
  // Al teu codi tens: <button class="tab">Cançons</button>
  // Cliquem exactament aquest botó per assegurar que el filtre funciona
  await page.click('button.tab:has-text("Cançons")')

  // Opcional: Comprovar que la pestanya ha quedat activa (classe .active)
  const songTab = page.locator('button.tab:has-text("Cançons")')
  await expect(songTab).toHaveClass(/active/)
})
