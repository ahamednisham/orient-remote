/**
 * NEC infrared protocol encoder.
 *
 * Frame: [address, ~address, command, ~command], each byte sent LSB-first,
 * on a 38 kHz carrier. Output is an alternating mark/space pattern in
 * microseconds, as expected by Android's ConsumerIrManager.transmit().
 */

export const NEC_CARRIER_HZ = 38000;

const HEADER_MARK = 9000;
const HEADER_SPACE = 4500;
const BIT_MARK = 560;
const ZERO_SPACE = 560;
const ONE_SPACE = 1690;

export function necBytes(address: number, command: number): number[] {
  return [address & 0xff, ~address & 0xff, command & 0xff, ~command & 0xff];
}

export function necPattern(address: number, command: number): number[] {
  const pattern = [HEADER_MARK, HEADER_SPACE];
  for (const byte of necBytes(address, command)) {
    for (let bit = 0; bit < 8; bit++) {
      pattern.push(BIT_MARK, (byte >> bit) & 1 ? ONE_SPACE : ZERO_SPACE);
    }
  }
  pattern.push(BIT_MARK);
  return pattern;
}
