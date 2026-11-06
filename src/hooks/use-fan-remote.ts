import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';

import { hasIrEmitter, transmit } from '@/modules/ir-blaster';
import { NEC_CARRIER_HZ, necPattern } from '@/lib/nec';
import { ORIENT_ADDRESS, ORIENT_COMMANDS, type OrientCommand } from '@/lib/orient-codes';

export type Speed = 1 | 2 | 3 | 4 | 5;
export type TimerHours = 2 | 4 | 6 | 8;

const clampSpeed = (n: number) => Math.max(1, Math.min(5, n)) as Speed;

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
  const [boost, setBoost] = useState(false);
  const [light, setLight] = useState(false);
  const [timer, setTimer] = useState<{ hours: TimerHours; startedAt: number } | null>(null);
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
      setBoost(false);
      setTimer(null);
    }
  }, [send]);

  const setFanSpeed = useCallback(
    async (s: Speed) => {
      if (await send(`speed${s}`)) {
        setSpeed(s);
        setBoost(false);
        setPower('on');
      }
    },
    [send],
  );

  // The remote has no relative speed codes, so step from the last speed sent
  // (or the middle one if nothing has been sent yet).
  const speedUp = useCallback(() => {
    if (power === 'off') return powerOn();
    if (boost) return;
    return setFanSpeed(clampSpeed((speed ?? 3) + 1));
  }, [power, boost, speed, powerOn, setFanSpeed]);

  const speedDown = useCallback(() => {
    if (power === 'off') return;
    if (boost) return setFanSpeed(5);
    return setFanSpeed(clampSpeed((speed ?? 3) - 1));
  }, [power, boost, speed, setFanSpeed]);

  const toggleBoost = useCallback(async () => {
    if (boost && power !== 'off') {
      // Leave boost by going back to the speed it replaced.
      await setFanSpeed(speed ?? 5);
      return;
    }
    if (await send('boost')) {
      setBoost(true);
      setPower('on');
    }
  }, [boost, power, speed, send, setFanSpeed]);

  const setFanTimer = useCallback(
    async (h: TimerHours) => {
      if (await send(`timer${h}h`)) setTimer({ hours: h, startedAt: Date.now() });
    },
    [send],
  );

  const toggleLight = useCallback(async () => {
    if (await send('light')) setLight((l) => !l);
  }, [send]);

  return {
    irAvailable,
    sending,
    error,
    power,
    speed,
    boost,
    light,
    timer,
    powerOn,
    powerOff,
    setFanSpeed,
    speedUp,
    speedDown,
    toggleBoost,
    setFanTimer,
    toggleLight,
  };
}
