export interface DesignNode {
  tag: string;
  id?: string;
  name?: string;
  className: string;
  src?: string;
  decorative?: boolean;
  slide?: { index: number; active: boolean };
  children?: Array<DesignNode | string>;
}
export interface DesignScreen {
  desktop: DesignNode;
  mobile: DesignNode;
  steps: DesignNode[];
}
export function content(node: DesignNode | string): string {
  return typeof node === 'string' ? node : (node.children || []).map(content).filter(Boolean).join(' ');
}
export function nodes(node: DesignNode): DesignNode[] {
  return (node.children || []).filter((child): child is DesignNode => typeof child !== 'string');
}
export function fieldKey(label: string): string {
  return label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
