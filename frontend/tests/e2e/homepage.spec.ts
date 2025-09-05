import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display the main page content", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check that the main content is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Check that the main tabs are present (use role selectors for unique identification)
    await expect(page.getByRole("tab", { name: /campaigns/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /characters/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /play/i })).toBeVisible();

    // Check that the campaigns tab content is visible (use heading role for unique identification)
    await expect(
      page.getByRole("heading", { name: /your campaigns/i }),
    ).toBeVisible();

    // Check that campaign data is displayed (use card title for unique identification)
    await expect(page.getByText(/Test Adventure Campaign/i)).toBeVisible();
  });

  test("should have working navigation elements", async ({ page }) => {
    await page.goto("/");

    // Check that the page title is correct
    await expect(page).toHaveTitle(/AI-Powered D&D Game/i);

    // Check that the page has the correct URL
    await expect(page).toHaveURL("/");
  });

  test("should be responsive on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Check that content is still visible on mobile
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Take a screenshot for visual testing
    await page.screenshot({ path: "test-results/homepage-mobile.png" });
  });
});
