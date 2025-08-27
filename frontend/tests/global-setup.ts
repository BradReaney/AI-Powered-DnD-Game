import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  
  // Start the browser and create a new context
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Navigate to the app and wait for it to be ready
    await page.goto(baseURL || 'http://localhost:3000')
    
    // Wait for the app to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'test-results/initial-state.png' })
    
    console.log('✅ Global setup completed successfully')
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
