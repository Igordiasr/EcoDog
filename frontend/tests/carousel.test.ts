import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isCarousel, rotateCarousel } from '../src/design/carousel';
import { nodes, type DesignNode, type DesignScreen } from '../src/design/types';

const design: DesignScreen = JSON.parse(readFileSync('src/design/TL01.json', 'utf8'));
const all = (node: DesignNode): DesignNode[] => [node, ...nodes(node).flatMap(all)];
const withoutImages = (node: DesignNode): unknown => ({
  ...node,
  className: node.className.replace(/bg-\[url\([^)]*\)\]/g, ''),
  children: node.children?.map(child => typeof child === 'string' ? child : withoutImages(child)),
});

describe('Carrosséis da tela inicial', () => {
  for (const variant of ['desktop', 'mobile'] as const) {
    it(`troca somente imagens, preservando posições, camadas e opacidade (${variant})`, () => {
      const carousels = all(design[variant]).filter(isCarousel);
      expect(carousels).toHaveLength(2);
      for (const carousel of carousels) {
        for (const offset of [-4, -1, 1, 2, 4]) {
          const rotated = rotateCarousel(carousel, offset);
          expect(withoutImages(rotated)).toEqual(withoutImages(carousel));
          expect(rotated).not.toEqual(carousel);
        }
        expect(rotateCarousel(carousel, 3)).toEqual(carousel);
        expect(rotateCarousel(rotateCarousel(carousel, 1), -1)).toEqual(carousel);
      }
    });
  }
});
