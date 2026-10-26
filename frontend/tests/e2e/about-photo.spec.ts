import { expect, test } from '@playwright/test';

for (const width of [320, 410, 1024, 1440, 1920]) {
  test(`Sobre: foto cobre o frame, recorta proporcionalmente e preserva layout (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto('/sobre');
    const selector = width >= 1440 ? '[data-design-id="Nqmkv"]' : '[data-design-id="QDETf"]';
    const photo = page.locator(selector);
    await expect(photo).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(photo).toHaveCSS('height', width >= 1440 ? '360px' : '240px');
    await expect(photo).toHaveCSS('background-size', 'cover');
    await expect(photo).toHaveCSS('background-position', '35% 33%');
    await expect(photo).toHaveCSS('overflow', 'hidden');
    const crop = await photo.evaluate(async element => {
      const frame = element.getBoundingClientRect();
      const style = getComputedStyle(element), layer = getComputedStyle(element, '::before');
      const image = new Image();
      image.src = style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)![1];
      await image.decode();
      const zoom = new DOMMatrix(layer.transform).a;
      const baseScale = Math.max(frame.width / image.naturalWidth, frame.height / image.naturalHeight);
      const scale = baseScale * zoom;
      const drawnWidth = image.naturalWidth * scale, drawnHeight = image.naturalHeight * scale;
      const previousDrawnWidth = image.naturalWidth * baseScale * 1.12;
      const previousDrawnHeight = image.naturalHeight * baseScale * 1.12;
      const verticalPosition = parseFloat(layer.backgroundPosition.split(' ')[1]) / 100;
      const horizontalPosition = parseFloat(layer.backgroundPosition.split(' ')[0]) / 100;
      return {
        frameWidth: frame.width, frameHeight: frame.height, drawnWidth, drawnHeight, previousDrawnWidth,
        naturalRatio: image.naturalWidth / image.naturalHeight,
        topCrop: (drawnHeight - frame.height) * verticalPosition,
        bottomCrop: (drawnHeight - frame.height) * (1 - verticalPosition),
        leftCrop: (drawnWidth - frame.width) * horizontalPosition,
        rightCrop: (drawnWidth - frame.width) * (1 - horizontalPosition),
        previousLeftCrop: (drawnWidth - frame.width) * .40,
        previousRightCrop: (drawnWidth - frame.width) * .60,
        previousTopCrop: (previousDrawnHeight - frame.height) * .25,
        previousBottomCrop: (previousDrawnHeight - frame.height) * .75,
        zoom, origin: parseFloat(layer.transformOrigin.split(' ')[1]) / frame.height,
        horizontalOrigin: parseFloat(layer.transformOrigin.split(' ')[0]) / frame.width,
        layerSize: layer.backgroundSize, layerPosition: layer.backgroundPosition,
        sameImage: layer.backgroundImage === style.backgroundImage,
      };
    });
    expect(crop.layerSize).toBe('cover');
    expect(crop.layerPosition).toBe('35% 33%');
    expect(crop.zoom).toBe(1.10);
    expect(crop.origin).toBeCloseTo(.33);
    expect(crop.horizontalOrigin).toBeCloseTo(.35);
    expect(crop.sameImage).toBe(true);
    expect(crop.drawnWidth).toBeGreaterThanOrEqual(crop.frameWidth);
    expect(crop.drawnWidth).toBeLessThan(crop.previousDrawnWidth);
    expect(crop.drawnHeight).toBeGreaterThan(crop.frameHeight);
    expect(crop.drawnWidth / crop.drawnHeight).toBeCloseTo(crop.naturalRatio);
    expect(crop.topCrop).toBeGreaterThan(0);
    expect(crop.bottomCrop).toBeGreaterThan(crop.topCrop);
    expect(crop.topCrop).toBeGreaterThan(crop.previousTopCrop);
    expect(crop.bottomCrop).toBeLessThan(crop.previousBottomCrop);
    expect(crop.leftCrop).toBeLessThan(crop.previousLeftCrop);
    expect(crop.rightCrop).toBeGreaterThan(crop.previousRightCrop);

    const layout = () => page.locator('[data-design-id]').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { id: element.getAttribute('data-design-id'), x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    const croppedLayout = await layout();
    // Restore the previous 40% horizontal framing, keeping zoom/vertical framing:
    // only painted content may move, never
    // the image frame, texts, other sections or footer.
    const originalPaint = await page.addStyleTag({ content: `${selector}, ${selector}::before { background-position: 40% 33% !important; } ${selector}::before { transform-origin: 40% 33% !important; }` });
    expect(await layout()).toEqual(croppedLayout);
    await originalPaint.evaluate(element => element.parentNode?.removeChild(element));
    expect(await layout()).toEqual(croppedLayout);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
}
