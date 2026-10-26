import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('adiciona espaço nas emendas sem modificar as patinhas originais', () => {
  const original = readFileSync('public/design-assets/6b856ebc60c656e8.svg', 'utf8');
  const spaced = readFileSync('public/design-assets/scheduling-paws-spaced.svg', 'utf8');
  expect(spaced.match(/<path\b[^>]*>/g)).toEqual(original.match(/<path\b[^>]*>/g));
  expect(spaced).toContain('viewBox="-30.888 -23.849 1440 216"');
  expect(spaced).toContain('preserveAspectRatio="xMidYMid meet"');
});
