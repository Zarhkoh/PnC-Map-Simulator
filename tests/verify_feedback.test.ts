import { test, expect } from '@playwright/test';

test('verify selection and group drag visuals', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('text=Alliance Fortress');

  // Place a building
  const map = page.locator('div.bg-slate-950');
  await page.dragAndDrop('text=Alliance Fortress', 'div.bg-slate-950', {
    targetPosition: { x: 400, y: 300 }
  });

  // 1. Test Selection Rectangle (Improved Math)
  // Drag a rectangle that overlaps the building.
  // The building is placed at 400, 300 relative to map.
  // Let's use absolute coordinates.
  await page.mouse.move(500, 200);
  await page.mouse.down();
  await page.mouse.move(600, 400);
  await page.screenshot({ path: '/home/jules/verification/selection_math_test.png' });
  await page.mouse.up();

  // 2. Test Group Drag Hiding
  // Click to select
  await page.mouse.click(400, 300);

  // Start dragging
  await page.mouse.move(400, 300);
  await page.mouse.down();
  await page.mouse.move(500, 400);
  await page.screenshot({ path: '/home/jules/verification/group_drag_hiding.png' });
  await page.mouse.up();
});
