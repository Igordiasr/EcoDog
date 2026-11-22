import { describe, expect, it } from 'vitest';
import { activityDuration } from '../src/views/design/daily-activities';

describe('duração por grupo da atividade', () => {
    it('divide a duração total pela quantidade de grupos', () => {
        expect(activityDuration({ horaInicio: '09:00:00', horaFim: '10:00:00', grupos: [{ grupo: 1 }, { grupo: 2 }] })).toBe('30 min');
    });

    it('mantém a duração completa para um único grupo', () => {
        expect(activityDuration({ horaInicio: '09:00', horaFim: '10:00', grupos: [{ grupo: 1 }] })).toBe('60 min');
    });

    it('apresenta minutos fracionados quando a divisão não é exata', () => {
        expect(activityDuration({ horaInicio: '09:00', horaFim: '09:10', grupos: [{}, {}, {}] })).toBe('3,33 min');
    });

    it('considera atividades que atravessam a meia-noite', () => {
        expect(activityDuration({ horaInicio: '23:30', horaFim: '00:30', grupos: [{}, {}] })).toBe('30 min');
    });

    it('evita divisão por zero quando não há grupos', () => {
        expect(activityDuration({ horaInicio: '09:00', horaFim: '10:00', grupos: [] })).toBe('60 min');
    });

    it('preserva a indicação de duração não informada para horários inválidos', () => {
        expect(activityDuration({ horaInicio: null, horaFim: '10:00', grupos: [{}, {}] })).toBe('não informada');
    });
});
