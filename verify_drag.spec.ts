import { test, expect } from '@playwright/test';

test('drag building to map', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for sidebar
  await page.waitForSelector('aside');

  // Find "Alliance Fortress"
  const fortress = page.locator('text=Alliance Fortress').first();
  const map = page.locator('svg');

  // Try to drag
  const box = await fortress.boundingBox();
  const mapBox = await map.boundingBox();

  if (box && mapBox) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2, { steps: 10 });
    await page.mouse.up();
  }

  // Check if a building is on map (it should have a rect or something)
  // Our Map.tsx renders buildings as groups <g> with a title or something.
  // Actually they are rendered as isometric shapes.

  // Let's just take a screenshot to see if it worked.
  await page.screenshot({ path: 'drag_result.png' });
});
