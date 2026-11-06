/**
 * Orient Electric BLDC fan IR codes.
 *
 * Source: the Orient profile in Remote-BLDC-Fan v14.0
 * (https://github.com/callmefarhanzxx/Remote-BLDC-Fan). The repo publishes
 * only an APK, so these were decoded from the raw timing arrays it ships.
 * Every frame is NEC with address 0x8C (sent as 8C 73) and a valid inverse.
 */

export const ORIENT_ADDRESS = 0x8c;

export const ORIENT_COMMANDS = {
  powerOn: 0x00,
  powerOff: 0x10,
  speed1: 0x04,
  speed2: 0x05,
  speed3: 0x06,
  speed4: 0x07,
  speed5: 0x08,
  timer2h: 0x15,
  timer4h: 0x0e,
  timer6h: 0x16,
  light: 0x13,
} as const;

/** Also in that profile, but not wired to a button in this app yet. */
export const ORIENT_EXTRA_COMMANDS = {
  timer8h: 0x11,
  boost: 0x0f,
  speedCenter: 0x03,
} as const;

export type OrientCommand = keyof typeof ORIENT_COMMANDS;
