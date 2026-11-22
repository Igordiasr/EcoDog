import { describe, expect, it, vi } from 'vitest';
import { saveLocalPetImage } from '../src/api/local-pet-images';
import { petRegistrationBody } from '../src/models/pet-registration';

describe('Foto local do pet', () => {
    it('envia o arquivo somente ao frontend e obtém URL absoluta', async () => {
        vi.stubGlobal('window', { location: { origin: 'http://localhost:5173' } });
        const request = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ fotoUrl: '/arquivos/pets/abc-123.png' }) });
        vi.stubGlobal('fetch', request);
        try {
            const file = new Blob(['image'], { type: 'image/png' });
            expect(await saveLocalPetImage(file)).toBe('http://localhost:5173/arquivos/pets/abc-123.png');
            expect(request).toHaveBeenCalledWith('/local-api/pet-images', { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: file });
        } finally { vi.unstubAllGlobals(); }
    });
    it('inclui somente a referência no JSON de cadastro', () => {
        const body = petRegistrationBody({ convenio: 'Não', obs: '', 'relacionamento-com-outros-pets': '', photo: new Blob(['image']), fotoUrl: 'http://localhost:5173/arquivos/pets/abc.png' });
        expect(body.fotoUrl).toBe('http://localhost:5173/arquivos/pets/abc.png');
        expect(body).not.toHaveProperty('photo');
    });
});
