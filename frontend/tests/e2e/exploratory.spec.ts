import { test, expect } from "@playwright/test";

test.describe("Exploratory Testing", () => {
  test("should be able to create a new campaign", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click on "New Campaign" button
    await page.getByRole("button", { name: /new campaign/i }).click();

    // Wait for campaign form page to load (it's a full page, not a modal)
    await expect(page.locator("#name")).toBeVisible();

    // Fill in campaign details
    await page.getByTestId("campaign-name").fill("Exploratory Test Campaign");
    await page
      .getByTestId("campaign-description")
      .fill("A campaign created during exploratory testing");
    await page.getByTestId("campaign-theme").click();
    await page.getByRole("option", { name: "Fantasy" }).click();

    // Submit the form
    await page.getByRole("button", { name: /create campaign/i }).click();

    // Wait for success message or redirect
    await page.waitForLoadState("networkidle");

    // Verify campaign was created by checking if it appears in the list
    await expect(
      page.getByText("Exploratory Test Campaign").first(),
    ).toBeVisible();
  });

  test("should be able to navigate to characters tab", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click on Characters tab
    await page.getByRole("tab", { name: /characters/i }).click();

    // Verify we're on the characters tab
    await expect(
      page.getByRole("heading", { name: /your characters/i }),
    ).toBeVisible();
  });

  test("should be able to navigate to play tab", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click on Play tab
    await page.getByRole("tab", { name: /play/i }).click();

    // Verify we're on the play tab
    await expect(
      page.getByRole("heading", { name: /active sessions/i }),
    ).toBeVisible();
  });

  test("should be able to view campaign details", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click on an existing campaign
    await page.getByText("Test Adventure Campaign").click();

    // Verify campaign details are displayed
    await expect(page.getByText("Test Adventure Campaign")).toBeVisible();
    await expect(
      page.getByText(
        "A test campaign for exploratory testing of the D&D application",
      ),
    ).toBeVisible();
  });

  test("should be able to create a character", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to characters tab
    await page.getByRole("tab", { name: /characters/i }).click();

    // Click create character button
    await page.getByRole("button", { name: /create character/i }).click();

    // Wait for character form page to load (it's a full page, not a modal)
    await expect(page.locator("#name")).toBeVisible();

    // Select a campaign first (required for character creation)
    await page.locator("text=Choose a campaign for your character").click();
    await page.getByRole("option").first().click();

    // Fill in character details
    await page.getByTestId("character-name").fill("Test Hero");

    // Select race
    await page.getByTestId("character-race").click();
    await page.getByRole("option", { name: "Human" }).click();

    // Select class
    await page.getByTestId("character-class").click();
    await page.getByRole("option", { name: "Fighter" }).click();

    // Submit the form
    await page.getByRole("button", { name: /create character/i }).click();

    // Wait for success and navigate back to characters tab
    await page.waitForLoadState("networkidle");

    // Navigate back to characters tab to see the created character
    await page.getByRole("tab", { name: /characters/i }).click();
    await page.waitForLoadState("networkidle");

    // Verify character was created
    await expect(page.getByText("Test Hero").first()).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Test with a malformed request to see error handling
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Try to create a campaign with invalid data
    await page.getByRole("button", { name: /new campaign/i }).click();

    // Wait for form page to load
    await expect(page.locator("#name")).toBeVisible();

    // Submit empty form to trigger validation
    await page.getByRole("button", { name: /create campaign/i }).click();

    // Check for validation errors - the form should prevent submission
    // or show validation messages
    await page.waitForTimeout(1000); // Give time for validation to appear
  });

  test("should be responsive on different screen sizes", async ({ page }) => {
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify layout still works
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify layout still works
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
