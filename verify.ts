import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');

  console.log('Page title:', await page.title());

  // Drag Alliance Fortress to the map
  const fortress = page.locator('text=Alliance Fortress').first();
  await fortress.waitFor();

  const startBox = await fortress.boundingBox();
  if (!startBox) throw new Error('No startBox');

  console.log('Fortress in sidebar at:', startBox);

  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(500, 400, { steps: 5 });
  await page.mouse.up();

  const placedFortress = page.locator('svg text:has-text("Alliance Fortress")');
  await placedFortress.waitFor({ timeout: 5000 });

  const box = await placedFortress.boundingBox();
  console.log('Placed at:', box);

  if (box) {
      // Move it
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 50, { steps: 10 });
      await page.mouse.up();

      const newBox = await placedFortress.boundingBox();
      console.log('Moved to:', newBox);
  }

  await page.screenshot({ path: 'verification.png' });
  await browser.close();
})();
