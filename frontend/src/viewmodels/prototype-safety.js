// These screens still render design examples, not identified operational records.
// This is a fail-closed boundary, not an API contract or a capability detector.
export const recordIdentityUnavailable = 'Operação indisponível: esta listagem contém exemplos sem identidade de domínio e sem fonte de consulta do registro selecionado. Nenhum registro foi alterado.';
export const bookingSelectionNotice = 'Calendário ilustrativo: vagas reais não foram consultadas.';
export const bookingDataUnavailable = `${bookingSelectionNotice} O agendamento depende de pets identificados, disponibilidade operacional e confirmação do sistema. Nenhuma reserva foi criada.`;
export const presenceDataUnavailable = 'Presença ilustrativa: não há fonte operacional de reserva e check-in válido para autorizar esta transição. Nenhuma entrada ou saída foi registrada.';
export const monitorDataUnavailable = 'Feed ilustrativo: não há identidade operacional de pet, agendamento e registro. Nenhum registro foi enviado ou salvo no servidor.';
export function prototypeOperationBlock(operation, dialog = '') {
    if (operation === 'book')
        return bookingDataUnavailable;
    if (operation === 'checkIn' || operation === 'checkOut')
        return presenceDataUnavailable;
    if (operation === 'saveRecord' || operation === 'completeActivity')
        return monitorDataUnavailable;
    if (['saveLink', 'deletePet', 'deletePlan', 'setPlanActive', 'setLinkActive', 'setUserActive'].includes(operation)
        || operation === 'savePet' && dialog === 'petEdit'
        || operation === 'savePlan' && dialog === 'editPlan'
        || operation === 'saveUser' && dialog === 'userEdit')
        return recordIdentityUnavailable;
    return null;
}
