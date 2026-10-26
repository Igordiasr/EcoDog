import { describe, expect, it } from 'vitest';
import { screens, navigation } from '../src/screens/catalog';
import { fieldKey, content } from '../src/design/types';
import { unavailableApi, IntegrationPending } from '../src/services/api';
import { existsSync, readFileSync } from 'node:fs';

describe('Especificação EcoDog TL01–TL17', () => {
  it('mantém todas as telas com referências desktop e mobile', () => {
    expect(screens).toHaveLength(17);
    for (const s of screens) {
      expect(existsSync(`src/design/${s.id}.json`)).toBe(true);
      const design = JSON.parse(readFileSync(`src/design/${s.id}.json`, 'utf8'));
      expect(design.desktop.id).toBeTruthy();
      expect(design.mobile.id).toBeTruthy();
    }
  });
  it('não mistura a navegação dos perfis', () => {
    for (const profile of ['tutor', 'monitor', 'admin'] as const) {
      expect(navigation[profile].every(id => screens.find(s => s.id === id)?.profile === profile)).toBe(true);
    }
  });
  it('preserva campos entre etapas', () => {
    expect(fieldKey('Confirmação de senha')).toBe('confirmacao-de-senha');
    expect(fieldKey('E-mail')).toBe('e-mail');
  });
  it('preserva a copy do protótipo, não a copy odontológica divergente', () => {
    const screen = JSON.parse(readFileSync('src/design/TL01.json', 'utf8'));
    expect(content(screen.desktop)).toContain('EcoDog Park');
    expect(content(screen.desktop)).not.toContain('Escolha o dentista');
  });
  it('não autentica nem declara sucesso sem integração', async () => {
    expect(await unavailableApi.session()).toBeNull();
    await expect(unavailableApi.login('email@email.com', 'senha')).rejects.toBeInstanceOf(IntegrationPending);
    await expect(unavailableApi.execute('book', {})).rejects.toBeInstanceOf(IntegrationPending);
  });
});
