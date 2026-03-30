import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('TeamRadar Landing Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/TeamRadar/);
  });

  test('should show the hero section with typing effect', async ({ page }) => {
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    
    const typingSpan = page.locator('#heroTyping');
    await expect(typingSpan).toBeVisible();
    // Typing effect starts with first phrase or part of it
    const text = await typingSpan.innerText();
    expect(text.length).toBeGreaterThan(0);
  });

  test('should have a functional navigation', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check if clicking a nav link smooth scrolls (basic check for target visibility)
    const featuresLink = page.locator('nav a[href="#features"]');
    await featuresLink.click();
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('should show the cookie banner after a delay', async ({ page }) => {
    // Wait for the 800ms delay + some buffer
    await page.waitForTimeout(1500);
    const banner = page.locator('#cookieBanner');
    await expect(banner).toBeVisible();
    
    // Accept and check if it disappears
    const acceptBtn = page.locator('button', { hasText: 'Alle akzeptieren' });
    await acceptBtn.click();
    await expect(banner).not.toBeVisible();
  });

  test('should be responsive (mobile check)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Onboarding cards should be stacked or visible
    const onboarding = page.locator('#onboarding');
    await expect(onboarding).toBeVisible();
  });
});
