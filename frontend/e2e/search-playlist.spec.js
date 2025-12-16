import { expect, test } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test('Flux complet: Buscar una playlist, filtrar i obrir-la', async ({ page }) => {
  // 0️⃣ Dades de prova
  // Posa aquí el nom d'una playlist que tinguis creada a la Base de Dades.
  // Si encara no tens playlists reals i uses les "mock" del codi Vue, busca "Playlist de prueba".
  const searchTerm = 'Test'
  await page.goto(BASE_URL)

  // -----------------------------------------------------------
  //  CERCA
  // -----------------------------------------------------------
  const searchInput = page.locator('input[type="search"]')
  await expect(searchInput).toBeVisible()

  await searchInput.fill(searchTerm)
  await searchInput.press('Enter')

  // Esperem la redirecció a /search
  await page.waitForURL(/.*\/search\?q=/)

  // -----------------------------------------------------------
  // FILTRAT PER PESTANYA "PLAYLISTS"
  // -----------------------------------------------------------
  // Al teu Search.vue tens: <button ...>Playlists</button>
  // Cliquem per filtrar només playlists
  await page.click('button.tab:has-text("Playlists")')

  // Verifiquem visualment que la pestanya està activa
  const playlistTab = page.locator('button.tab:has-text("Playlists")')
  await expect(playlistTab).toHaveClass(/active/)

})
