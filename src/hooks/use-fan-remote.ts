import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';

import { hasIrEmitter, transmit } from '@/modules/ir-blaster';
import { NEC_CARRIER_HZ, necPattern } from '@/lib/nec';
import { ORIENT_ADDRESS, ORIENT_COMMANDS, type OrientCommand } from '@/lib/orient-codes';

export type Speed = 1 | 2 | 3 | 4 | 5;
export type TimerHours = 2 | 4 | 6;

/**
 * IR is one-way, so this tracks what was last *sent*, not what the fan is
 * actually doing. Good enough to show which button you pressed last.
 */
export function useFanRemote() {
  const [irAvailable] = useState(hasIrEmitter);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [power, setPower] = useState<'on' | 'off' | null>(null);
  const [speed, setSpeed] = useState<Speed | null>(null);
  const [timer, setTimer] = useState<TimerHours | null>(null);
  const blinkTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const send = useCallback(async (command: OrientCommand) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    clearTimeout(blinkTimeout.current);
    setSending(true);
    try {
      await transmit(NEC_CARRIER_HZ, necPattern(ORIENT_ADDRESS, ORIENT_COMMANDS[command]));
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      // Keep the LED lit briefly so a ~70 ms burst is still visible.
      blinkTimeout.current = setTimeout(() => setSending(false), 180);
    }
  }, []);

  const powerOn = useCallback(async () => {
    if (await send('powerOn')) setPower('on');
  }, [send]);

  const powerOff = useCallback(async () => {
    if (await send('powerOff')) {
      setPower('off');
      setTimer(null);
    }
  }, [send]);

  const setFanSpeed = useCallback(
    async (s: Speed) => {
      if (await send(`speed${s}`)) {
        setSpeed(s);
        setPower('on');
      }
    },
    [send],
  );

  const setFanTimer = useCallback(
    async (h: TimerHours) => {
      if (await send(`timer${h}h`)) setTimer(h);
    },
    [send],
  );

  const toggleLight = useCallback(() => send('light'), [send]);

  return {
    irAvailable,
    sending,
    error,
    power,
    speed,
    timer,
    powerOn,
    powerOff,
    setFanSpeed,
    setFanTimer,
    toggleLight,
  };
}
