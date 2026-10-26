import { nodes, type DesignNode, type DesignScreen } from './types';

export function findDesignNode(root: DesignNode, name: string): DesignNode | undefined {
  if (root.name === name) return root;
  for (const child of nodes(root)) { const found = findDesignNode(child, name); if (found) return found; }
}

export function structureBookingDesign(original: DesignNode, scheduling: DesignScreen, mobile: boolean, action?: DesignNode): DesignNode {
  const servicePage = mobile ? scheduling.steps[0] : scheduling.desktop;
  const calendarPage = mobile ? scheduling.steps[1] : scheduling.desktop;
  const calendar = findDesignNode(calendarPage, 'Calendário de agosto')!;
  const serviceCard = mobile ? findDesignNode(servicePage, 'Card · Serviço')! : findDesignNode(servicePage, 'Painel')!;
  const heading = mobile ? findDesignNode(servicePage, 'Selecione o tipo de agendamento')!.children![0] : nodes(serviceCard).find(node => node.id === 'RODsn')!;
  const options = mobile ? findDesignNode(servicePage, 'Opções')! : findDesignNode(servicePage, 'Tipos de agendamento')!;
  const button = action && (findDesignNode(action, 'botao-quero-agendar') || action);
  const introduction = nodes(original).slice(0, 2);
  return {
    ...original, id: `${original.id}-booking`, name: 'Calendário de agendamento público',
    className: 'structure-booking-calendar box-border w-full h-fit flex flex-col gap-[24px]',
    children: [
      { ...serviceCard, id: 'structure-booking-services', name: 'Serviços', className: `${serviceCard.className} booking-controls`, children: [...introduction, heading, options] },
      button ? { ...calendar, children: [...(calendar.children || []), button] } : calendar,
    ],
  };
}
