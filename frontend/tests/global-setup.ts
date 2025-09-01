import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const isCI = process.env.CI === "true";

  if (isCI) {
    console.log(
      "🚀 Running in CI environment - waiting for services to be ready...",
    );

    // In CI, we need to wait for the Docker services to be ready
    // The services should already be running from docker-compose.ci.yml
    await waitForServices(baseURL || "http://localhost:3000");
  }

  // Start the browser and create a new context
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app and wait for it to be ready
    await page.goto(baseURL || "http://localhost:3000");

    // Wait for the app to be fully loaded
    await page.waitForLoadState("networkidle");

    // Take a screenshot of the initial state (only in non-CI)
    if (!isCI) {
      await page.screenshot({ path: "test-results/initial-state.png" });
    }

    console.log("✅ Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function waitForServices(baseURL: string) {
  const maxAttempts = 30;
  const delay = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `🔄 Attempt ${attempt}/${maxAttempts}: Checking if services are ready...`,
      );

      // Check if the frontend is responding
      const response = await fetch(`${baseURL}/api/health`);
      if (response.ok) {
        console.log("✅ Frontend service is ready");

        // Check if the backend is responding
        const backendResponse = await fetch("http://localhost:5001/health");
        if (backendResponse.ok) {
          console.log("✅ Backend service is ready");
          return;
        }
      }
    } catch (error) {
      console.log(`⏳ Services not ready yet (attempt ${attempt}): ${error}`);
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting ${delay}ms before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Services failed to become ready within the expected time");
}

export default globalSetup;
