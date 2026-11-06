// Run with: npm test   (Node 22.18+ strips TypeScript types natively)
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { necBytes, necPattern, NEC_CARRIER_HZ } from '../src/lib/nec.ts';
import { ORIENT_ADDRESS, ORIENT_COMMANDS } from '../src/lib/orient-codes.ts';

const toHex = (bytes) =>
  '0x' + bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join('');

test('frames match the Orient captures in Remote-BLDC-Fan v14.0', () => {
  // Decoded from the raw timing arrays in the app's Orient profile.
  const expected = {
    powerOn: '0x8C7300FF',
    powerOff: '0x8C7310EF',
    speed1: '0x8C7304FB',
    speed2: '0x8C7305FA',
    speed3: '0x8C7306F9',
    speed4: '0x8C7307F8',
    speed5: '0x8C7308F7',
    timer2h: '0x8C7315EA',
    timer4h: '0x8C730EF1',
    timer6h: '0x8C7316E9',
    light: '0x8C7313EC',
  };
  for (const [key, hex] of Object.entries(expected)) {
    assert.equal(toHex(necBytes(ORIENT_ADDRESS, ORIENT_COMMANDS[key])), hex, key);
  }
});

test('pattern has header, 32 LSB-first bits and a stop mark', () => {
  const p = necPattern(0x6b, 0x01);
  assert.equal(p.length, 2 + 64 + 1);
  assert.deepEqual(p.slice(0, 2), [9000, 4500]);
  assert.equal(p[p.length - 1], 560);

  // Decode the pattern back into bytes, LSB first.
  const bits = [];
  for (let i = 2; i < 66; i += 2) {
    assert.equal(p[i], 560);
    bits.push(p[i + 1] > 1000 ? 1 : 0);
  }
  const bytes = [0, 1, 2, 3].map((n) =>
    bits.slice(n * 8, n * 8 + 8).reduce((acc, bit, i) => acc | (bit << i), 0),
  );
  assert.deepEqual(bytes, [0x6b, 0x94, 0x01, 0xfe]);
});

test('carrier is 38 kHz and frame fits Android 2s limit', () => {
  assert.equal(NEC_CARRIER_HZ, 38000);
  const total = necPattern(0x6b, 0xff).reduce((a, b) => a + b, 0);
  assert.ok(total < 2_000_000);
});
