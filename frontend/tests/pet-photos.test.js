import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { createPresenceApi } from '../src/api/presence-api';
import { presenceDesign } from '../src/views/design/presence';
import { integratedMonitorDesign } from '../src/views/design/monitor-records';
import { petCardFromPrototype } from '../src/views/components/TutorPets';
import { PetPhoto } from '../src/views/components/PetPhoto';
import { findDesignNode } from '../src/views/design/structure-booking';
import presenceTemplate from '../src/views/design/TL11.json';
import tutorTemplate from '../src/views/design/TL05.json';
import monitorTemplate from '../src/views/design/TL10.json';

const pet = { idPet: '550e8400-e29b-41d4-a716-446655440000', idAgendamento: 1, nomePet: 'Mel', nome: 'Mel', situacao: 'AGENDADO' };
const fotoUrl = 'https://example.com/arquivos/pets/mel.webp';
const photos = root => {
    if (typeof root === 'string') return [];
    return [...(root.petPhoto ? [root] : []), ...(root.children || []).flatMap(photos)];
};

it('recebe fotoUrl opcional na lista de check-in/check-out sem quebrar o contrato atual', async () => {
    for (const value of [undefined, null, '', fotoUrl]) {
        const api = createPresenceApi('http://localhost:8080', async () => new Response(JSON.stringify([{ ...pet, fotoUrl: value }]), { headers: { 'Content-Type': 'application/json' } }));
        expect((await api.list('2026-11-25'))[0].fotoUrl).toBe(value ?? null);
    }
});

for (const layout of ['desktop', 'mobile']) {
    for (const value of [undefined, null, '', '   ', fotoUrl]) {
        it(`usa foto real ou template genérico nas telas de pets em ${layout} com foto ${JSON.stringify(value)}`, () => {
            const current = { ...pet, fotoUrl: value };
            const roots = [
                presenceDesign(findDesignNode(presenceTemplate[layout], 'Pets previstos'), { pets: [current] }),
                petCardFromPrototype(findDesignNode(tutorTemplate[layout], 'Pet cadastrado'), current),
                integratedMonitorDesign(monitorTemplate[layout], { data: { pet: current, activities: [], medication: [] } }),
            ];
            for (const root of roots) {
                const images = photos(root);
                expect(images.length).toBeGreaterThan(0);
                for (const image of images) {
                    expect(image.src).toBe(value === fotoUrl ? fotoUrl : undefined);
                    expect(image.tag).toBe(value === fotoUrl ? 'img' : 'div');
                    expect(image.className).not.toContain('url(');
                    expect(image.children).toEqual([]);
                    const html = renderToStaticMarkup(createElement(PetPhoto, { src: image.src, name: image.name, className: image.className }));
                    expect(html).toContain(value === fotoUrl ? `src="${fotoUrl}"` : 'Sem foto');
                    expect(html).toContain(value === fotoUrl ? 'alt="Foto de Mel"' : 'aria-label="Foto do pet não disponível"');
                }
            }
        });
    }
}
