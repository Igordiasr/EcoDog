import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { nodes, type DesignNode, type DesignScreen } from '../src/design/types';

const artworkName = 'Cachorro e balão • vetores originais';
const designs = readdirSync('src/design').filter(file => file.endsWith('.json')).map(file => ({ file, design: JSON.parse(readFileSync(`src/design/${file}`, 'utf8')) as DesignScreen }));
const size = (node: DesignNode, axis: string) => Number(new RegExp(`${axis}-\\[([\\d.]+)px\\]`).exec(node.className)?.[1]);

describe('shared EcoMigo artwork', () => {
  it('covers every access and assistant avatar in desktop, mobile and steps', () => {
    let accesses = 0, avatars = 0;
    const walk = (node: DesignNode) => {
      if (node.name === 'EcoMigo • Acesso' || node.name === 'Avatar do assistente') {
        const container = node.name === 'EcoMigo • Acesso' ? nodes(node)[0] : node;
        const artwork = nodes(container).find(child => child.name === artworkName);
        expect(artwork, node.id).toBeDefined();
        const width = size(container, 'w'), height = size(container, 'h');
        const x = size(artwork!, 'left'), y = size(artwork!, 'top');
        const artWidth = size(artwork!, 'w'), artHeight = size(artwork!, 'h');
        const left = x - artWidth * .22 / 2, top = y - artHeight * .22 / 2;
        expect(left).toBeGreaterThanOrEqual(0);
        expect(top).toBeGreaterThanOrEqual(0);
        expect(left + artWidth * 1.22).toBeLessThanOrEqual(width);
        expect(top + artHeight * 1.22).toBeLessThanOrEqual(height);
        if (node.name === 'EcoMigo • Acesso') accesses++; else avatars++;
      }
      nodes(node).forEach(walk);
    };
    for (const { design } of designs) [design.desktop, design.mobile, ...design.steps].forEach(walk);
    expect(accesses).toBe(93);
    expect(avatars).toBe(4);
  });
});
