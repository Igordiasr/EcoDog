import { test, expect } from '@playwright/test';

for (const width of [410, 1440, 1920]) {
  test(`imagem da terceira seção segue o preenchimento da quarta (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/prototipo/TL01');
    const third = page.locator(width < 1440 ? '[data-design-name="Equipe EcoDog Park"]' : '[data-design-name="foto-equipe-ecodog"]');
    const fourth = page.locator(width < 1440 ? '[data-design-name="Estrutura EcoDog Park"]' : '[data-design-name="imagem-estrutura"]');
    await expect(third).toBeVisible();
    const thirdBox = (await third.boundingBox())!;
    const fourthBox = (await fourth.boundingBox())!;
    expect(thirdBox.height).toBe(fourthBox.height);
    expect(thirdBox.width).toBe(fourthBox.width);
    if (width >= 1440) {
      const thirdText = page.locator('[data-design-name="texto-sobre"]');
      const fourthText = page.locator('[data-design-name="card-estrutura"]');
      for (const property of ['background-color', 'border-radius', 'box-shadow', 'padding']) {
        const reference = await fourthText.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);
        await expect(thirdText).toHaveCSS(property, reference);
      }
    }
    await expect(third).toHaveCSS('background-size', 'cover');
    await expect(third).toHaveCSS('background-position', '50% 40%');
    expect(await third.evaluate(element => {
      const image = element.getBoundingClientRect();
      const section = element.parentElement!.getBoundingClientRect();
      return image.top >= section.top && image.bottom <= section.bottom && image.left >= section.left && image.right <= section.right;
    })).toBe(true);
  });
}

for (const width of [410, 1440, 1920]) {
  test(`imagens dos dois carrosséis permanecem contidas ao interagir (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/prototipo/TL01');
    const carousels = width < 1440
      ? page.locator('[data-design-name="Painel"]').filter({ has: page.locator('[data-design-name="Navegação do carrossel"]') })
      : page.locator('[data-design-name="carrosel-apresentacao"], [data-design-name="carrosel-servicos"]');
    await expect(carousels).toHaveCount(2);
    for (let index = 0; index < 2; index++) {
      const carousel = carousels.nth(index);
      const featured = carousel.locator(width < 1440 ? '[data-design-name="Imagem em destaque"]' : '[data-design-name="foto-central"]');
      const bounds = () => featured.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height };
      });
      const before = await bounds();
      const initial = await featured.evaluate(element => getComputedStyle(element).backgroundImage);
      const dots = carousel.locator('[data-carousel-slide]');
      await expect(dots).toHaveCount(3);
      const checkIndicator = async (active: number) => {
        await expect(carousel.locator('[data-carousel-slide][aria-current="true"]')).toHaveCount(1);
        for (let slide = 0; slide < 3; slide++) {
          await expect(dots.nth(slide)).toHaveCSS('background-color', slide === active ? 'rgb(222, 143, 59)' : 'rgb(69, 147, 127)');
        }
      };
      await checkIndicator(1);
      const indicator = carousel.locator(width < 1440 ? '[data-design-name="Indicadores"]' : '[data-design-name="indicador"]');
      const indicatorBox = (await indicator.boundingBox())!;
      expect(Math.abs(indicatorBox.x + indicatorBox.width / 2 - before.x - before.width / 2)).toBeLessThanOrEqual(1);
      if (index === 0) {
        expect(before.height).toBe(width < 1440 ? 472 : 440);
        await expect(featured).toHaveCSS('background-position', '50% 100%');
        const leftImage = carousel.locator(width < 1440
          ? '[data-design-name="Prévia dos slides"] > :first-child [class*="bg-[url"]'
          : '[data-design-name="foto-esq"] [class*="bg-[url"]');
        await expect(leftImage).toHaveCSS('background-position', '50% -10px');
        const imageBounds = await carousel.evaluate(element => {
          const frame = element.getBoundingClientRect();
          return [...element.querySelectorAll('[class*="bg-[url"]')].every(image => {
            const rect = image.getBoundingClientRect();
            return rect.top >= frame.top && rect.bottom <= frame.bottom && rect.left >= frame.left && rect.right <= frame.right;
          });
        });
        expect(imageBounds).toBe(true);
      }
      if (index === 1) {
        const imageGroup = width < 1440 ? featured : carousel.locator('[data-design-name="imagens-servicos"]');
        await expect(imageGroup).toHaveCSS('translate', 'none');
        const leftSlot = carousel.locator(width < 1440
          ? '[data-design-name="Prévia dos slides"] > :first-child'
          : '[data-design-name="foto-esq"]');
        await expect(leftSlot).toHaveCSS('translate', 'none');
      }
      const next = carousel.getByRole('button', { name: width < 1440 ? '→' : 'Próxima imagem', exact: true });
      const previous = carousel.getByRole('button', { name: width < 1440 ? '←' : 'Imagem anterior', exact: true });
      const checkFraming = async () => {
        if (index === 1) {
          const photo = carousel.locator('[class*="image-import-28.jpg"]');
          await expect(photo).toHaveCount(1);
          await expect(photo).toHaveCSS('background-position', '50% 75%');
          await expect(photo).toHaveCSS('translate', 'none');
          return;
        }
        const photo = carousel.locator('[class*="image-import-46.jpg"]');
        await expect(photo).toHaveCount(1);
        await expect(photo).toHaveCSS('background-position', '50% -10px');
      };
      await featured.hover();
      expect(await bounds()).toEqual(before);
      await next.click();
      await checkFraming();
      await checkIndicator(2);
      await expect(featured).not.toHaveCSS('background-image', initial);
      expect(await bounds()).toEqual(before);
      // Every absolute image layer stays inside its original positioned photo wrapper.
      expect(await carousel.evaluate(element => [...element.querySelectorAll('[class*="bg-[url"]')].every(image => {
        const style = getComputedStyle(image);
        if (style.position !== 'absolute') return true;
        const rect = image.getBoundingClientRect();
        const parent = image.parentElement!.getBoundingClientRect();
        return rect.width <= parent.width + 1 && rect.height <= parent.height + 1;
      }))).toBe(true);
      await previous.click();
      await checkFraming();
      await checkIndicator(1);
      await expect(featured).toHaveCSS('background-image', initial);
      await next.click();
      await checkFraming();
      await next.click();
      await checkFraming();
      await checkIndicator(0);
      await next.click();
      await checkFraming();
      await checkIndicator(1);
      await expect(featured).toHaveCSS('background-image', initial);
      expect(await bounds()).toEqual(before);
    }
  });
}
