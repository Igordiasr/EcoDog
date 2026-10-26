import type { KeyboardEvent } from 'react';

export function horizontalScrollKeys(event: KeyboardEvent<HTMLDivElement>): void {
  if (event.target !== event.currentTarget) return;
  const region = event.currentTarget;
  const positions: Record<string, number> = {
    Home: 0, End: region.scrollWidth,
    ArrowLeft: region.scrollLeft - 80, ArrowRight: region.scrollLeft + 80,
  };
  if (!(event.key in positions)) return;
  event.preventDefault();
  region.scrollLeft = positions[event.key];
}
