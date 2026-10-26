import bexiga from '../../images/Atividade - Brincadeira com Bexiga.jpeg';
import bolinha from '../../images/Atividade - Brincadeira com Bolinha.jpeg';
import boliche from '../../images/Atividade - Brincadeira Boliche.jpeg';
import { nodes, type DesignNode } from './types';

export const structureActivities = [
  { title: 'Brincadeira com Bexiga', image: bexiga },
  { title: 'Brincadeira com Bolinha', image: bolinha },
  { title: 'Brincadeira com Boliche', image: boliche },
] as const;

export function structureActivityDesign(root: DesignNode, index: number): DesignNode {
  const activity = structureActivities[index];
  const visit = (node: DesignNode): DesignNode => {
    if (['KN2Pv', 'Tc8DO'].includes(node.id || '')) return { ...node, children: [`Atividade ${index + 1}`] };
    if (['zNw6H', 'fpx3a'].includes(node.id || '')) return { ...node, children: ['Rotina dos nossos Aulunos'] };
    if (['R9s0y5', 'u9GNY'].includes(node.id || '')) return { ...node, tag: 'img', name: activity.title, src: activity.image, decorative: false, className: `${node.className} object-cover`, children: undefined };
    if (['Vn1fZ', 'h0nNvJ'].includes(node.id || '')) return { ...node, children: nodes(node).slice(0, structureActivities.length).map((child, number) => ({ ...child, className: child.className.replace(/(?:^|\s)opacity-\[[^\]]+\]/g, '') + (number === index ? '' : ' opacity-[0.25]') })) };
    let children = node.children?.map(child => typeof child === 'string' ? child : visit(child));
    if (['cLUFx', 'yqTjv'].includes(node.id || '') && children) {
      const categoryIndex = children.findIndex(child => typeof child !== 'string' && ['l7hgd', 'rU1nq'].includes(child.id || ''));
      const template = children[categoryIndex];
      if (typeof template !== 'string' && template) children.splice(categoryIndex + 1, 0, { ...template, id: 'structure-activity-title', name: 'Nome da atividade', children: [activity.title] });
    }
    return { ...node, children };
  };
  return visit(root);
}
