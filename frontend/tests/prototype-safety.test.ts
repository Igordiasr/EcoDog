import { describe, expect, it } from 'vitest';
import { bookingDataUnavailable, monitorDataUnavailable, presenceDataUnavailable, prototypeOperationBlock, recordIdentityUnavailable } from '../src/services/prototype-safety';

describe('prototype operational boundary', () => {
  it('does not authorize identified edits or destructive actions from design examples', () => {
    expect(prototypeOperationBlock('savePet', 'petEdit')).toBe(recordIdentityUnavailable);
    expect(prototypeOperationBlock('savePlan', 'editPlan')).toBe(recordIdentityUnavailable);
    expect(prototypeOperationBlock('saveUser', 'userEdit')).toBe(recordIdentityUnavailable);
    expect(prototypeOperationBlock('deletePet')).toBe(recordIdentityUnavailable);
    expect(prototypeOperationBlock('deletePlan')).toBe(recordIdentityUnavailable);
    expect(prototypeOperationBlock('setLinkActive')).toBe(recordIdentityUnavailable);
    expect(prototypeOperationBlock('saveLink', 'linkPlan')).toBe(recordIdentityUnavailable);
  });
  it('does not turn calendar colours or illustrative presence into permission to write', () => {
    expect(prototypeOperationBlock('book')).toBe(bookingDataUnavailable);
    expect(prototypeOperationBlock('checkOut')).toBe(presenceDataUnavailable);
    expect(prototypeOperationBlock('checkIn')).toBe(presenceDataUnavailable);
  });
  it('does not send visual monitor record IDs to an adapter', () => {
    expect(prototypeOperationBlock('saveRecord')).toBe(monitorDataUnavailable);
    expect(prototypeOperationBlock('completeActivity')).toBe(monitorDataUnavailable);
  });
  it('preserves unrelated creation and normalized administrative flows', () => {
    for (const operation of ['register', 'savePet', 'savePlan', 'saveCapacity', 'saveActivity', 'saveGoal', 'saveRevenue'] as const) {
      expect(prototypeOperationBlock(operation)).toBeNull();
    }
  });
});
