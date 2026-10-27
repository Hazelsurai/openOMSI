import assert from 'node:assert/strict';
import test from 'node:test';
import { continueIsPrimary } from '../ui/js/list-filter.js';

test('Continue is the highlighted action only while the last duty is still saved', () => {
  const last = [{ name: 'Last situation', file: 'a' }];
  const slots = [{ name: 'Before the depot', file: 'b' }];
  assert.equal(continueIsPrimary(last, 'off'), true);
  assert.equal(continueIsPrimary([...last, ...slots], 'host'), true);
  assert.equal(continueIsPrimary(last, 'join'), false);
  assert.equal(continueIsPrimary(slots, 'off'), false);
  assert.equal(continueIsPrimary([], 'off'), false);
  assert.equal(continueIsPrimary(null, 'off'), false);
});
