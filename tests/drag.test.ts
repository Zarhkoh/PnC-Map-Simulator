import { test, expect } from '@playwright/test';

test('drag and drop building on map', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for sidebar
  await page.waitForSelector('text=Alliance Buildings');

  // Drag Alliance Fortress to the map
  const fortress = page.locator('text=Alliance Fortress').first();
  const map = page.locator('.bg-slate-950').first();

  // Simple dragTo might not work well with custom drag logic sometimes
  // Let's use manual mouse movements
  const startBox = await fortress.boundingBox();
  if (!startBox) throw new Error('No startBox');

  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(500, 400, { steps: 5 });
  await page.mouse.up();

  // Check if it's placed on map
  const placedFortress = page.locator('svg text:has-text("Alliance Fortress")');
  await expect(placedFortress).toBeVisible();

  const box = await placedFortress.boundingBox();
  if (!box) throw new Error('No box');
  console.log('Placed at:', box);

  // Now try to move it on the map
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  // Drag to another position
  await page.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2 + 100, { steps: 10 });
  await page.mouse.up();

  // Take screenshot for visual verification
  await page.screenshot({ path: 'drag-test.png' });

  // Check if position changed
  const newBox = await placedFortress.boundingBox();
  if (!newBox) throw new Error('No new box');
  console.log('Moved to:', newBox);

  expect(newBox.x).not.toBeCloseTo(box.x, 1);
});
