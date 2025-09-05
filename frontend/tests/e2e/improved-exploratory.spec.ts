import { test, expect } from "@playwright/test";
import {
  TestDataGenerator,
  TestSelectors,
  TestConstants,
} from "../utils/test-data";

test.describe("Improved Exploratory Testing", () => {
  test.beforeEach(async ({ page }) => {
    // Reset test data counter before each test
    TestDataGenerator.resetCounter();
  });

  test("should be able to create a new campaign with unique data", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click on "New Campaign" button
    await page.getByRole("button", { name: /new campaign/i }).click();

    // Wait for campaign form page to load
    await expect(page.getByTestId("campaign-name")).toBeVisible();

    // Generate unique test data
    const campaignData = TestDataGenerator.generateCampaignData();

    // Fill in campaign details using test selectors
    await page.getByTestId("campaign-name").fill(campaignData.name);
    await page
      .getByTestId("campaign-description")
      .fill(campaignData.description);
    await page.getByTestId("campaign-theme").click();
    await page.getByRole("option", { name: "Fantasy" }).click();

    // Submit the form
    await page.getByRole("button", { name: /create campaign/i }).click();

    // Wait for success message or redirect
    await page.waitForLoadState("networkidle");

    // Verify campaign was created by checking if it appears in the list
    await expect(page.getByText(campaignData.name).first()).toBeVisible();
  });

  test("should be able to create a character with unique data", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to characters tab
    await page.getByRole("tab", { name: /characters/i }).click();

    // Click create character button
    await page.getByRole("button", { name: /create character/i }).click();

    // Wait for character form page to load
    await expect(page.getByTestId("character-name")).toBeVisible();

    // Select a campaign first (required for character creation)
    await page.locator("text=Choose a campaign for your character").click();
    await page.getByRole("option").first().click();

    // Generate unique test data
    const characterData = TestDataGenerator.generateCharacterData();

    // Fill in character details using test selectors
    await page.getByTestId("character-name").fill(characterData.name);

    // Select race
    await page.getByTestId("character-race").click();
    await page.getByRole("option", { name: characterData.race }).click();

    // Select class
    await page.getByTestId("character-class").click();
    await page.getByRole("option", { name: characterData.class }).click();

    // Submit the form
    await page.getByRole("button", { name: /create character/i }).click();

    // Wait for success and navigate back to characters tab
    await page.waitForLoadState("networkidle");

    // Navigate back to characters tab to see the created character
    await page.getByRole("tab", { name: /characters/i }).click();
    await page.waitForLoadState("networkidle");

    // Verify character was created
    await expect(page.getByText(characterData.name).first()).toBeVisible();
  });

  test("should handle form validation gracefully", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Try to create a campaign with invalid data
    await page.getByRole("button", { name: /new campaign/i }).click();

    // Wait for form page to load
    await expect(page.getByTestId("campaign-name")).toBeVisible();

    // Submit empty form to trigger validation
    await page.getByRole("button", { name: /create campaign/i }).click();

    // Check that form validation prevents submission
    // The form should still be visible (not redirected)
    await expect(page.getByTestId("campaign-name")).toBeVisible();
  });

  test("should be responsive on different screen sizes", async ({ page }) => {
    // Test mobile size
    await page.setViewportSize(TestConstants.viewports.mobile);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify layout still works on mobile
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Test tablet size
    await page.setViewportSize(TestConstants.viewports.tablet);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify layout still works on tablet
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Test desktop size
    await page.setViewportSize(TestConstants.viewports.desktop);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify layout still works on desktop
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should navigate between tabs correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test campaigns tab
    await page.getByRole("tab", { name: /campaigns/i }).click();
    await expect(
      page.getByRole("heading", { name: /your campaigns/i }),
    ).toBeVisible();

    // Test characters tab
    await page.getByRole("tab", { name: /characters/i }).click();
    await expect(
      page.getByRole("heading", { name: /your characters/i }),
    ).toBeVisible();

    // Test play tab
    await page.getByRole("tab", { name: /play/i }).click();
    await expect(
      page.getByRole("heading", { name: /active sessions/i }),
    ).toBeVisible();
  });

  test("should display existing campaigns correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify that existing campaigns are displayed
    await expect(page.getByText("Test Adventure Campaign")).toBeVisible();

    // Click on a campaign to view details
    await page.getByText("Test Adventure Campaign").click();

    // Verify campaign details are displayed
    await expect(page.getByText("Test Adventure Campaign")).toBeVisible();
    await expect(
      page.getByText(
        "A test campaign for exploratory testing of the D&D application",
      ),
    ).toBeVisible();
  });

  test("should handle loading states properly", async ({ page }) => {
    await page.goto("/");

    // Check for loading state initially
    const loadingElement = page.locator('[data-testid="loading-spinner"]');
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toBeVisible();
    }

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Verify loading state is gone
    await expect(loadingElement).not.toBeVisible();
  });
});
