import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
  const isCI = process.env.CI === "true";

  console.log("🧹 Starting global teardown...");

  try {
    if (isCI) {
      console.log(
        "🔧 CI environment detected - performing additional cleanup...",
      );

      // In CI, we might want to clean up any test data or perform additional cleanup
      // This could include cleaning up databases, removing test files, etc.

      // Note: In a real CI environment, the Docker containers will be destroyed
      // when the job completes, so we don't need to manually clean them up
    }

    // Add any cleanup logic here
    // For example, cleaning up test data, closing connections, etc.

    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw error in teardown as it might mask test failures
  }
}

export default globalTeardown;
