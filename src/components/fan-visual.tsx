import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/palette';

// Milliseconds per revolution at each speed step (0 = stopped).
const REVOLUTION_MS = [0, 2400, 1700, 1200, 850, 600] as const;

type Props = {
  size: number;
  /** 0 stops the fan, 1–5 spins it at that speed. */
  level: 0 | 1 | 2 | 3 | 4 | 5;
};

/**
 * A top-down ceiling fan that spins at the last speed sent and coasts to a
 * stop when switched off. Three blades, so one full turn looks identical to
 * the start, which lets us wrap the angle without a visible jump.
 */
export function FanVisual({ size, level }: Props) {
  const [rotation] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  // The angle is tracked in JS: reading it back from the native driver
  // (stopAnimation's callback) never resolves on this React Native version.
  const motion = useRef({ turns: 0, startedAt: 0, msPerTurn: 0 });

  useEffect(() => {
    const m = motion.current;
    const wasSpinning = m.msPerTurn > 0;
    const from = (wasSpinning ? m.turns + (Date.now() - m.startedAt) / m.msPerTurn : m.turns) % 1;

    rotation.stopAnimation();
    rotation.setValue(from);
    motion.current = { turns: from, startedAt: Date.now(), msPerTurn: 0 };

    if (reduceMotion) return;

    if (level === 0) {
      if (!wasSpinning) return;
      // Coast down rather than freezing mid-turn.
      motion.current.turns = from + 0.3;
      Animated.timing(rotation, {
        toValue: from + 0.3,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    const msPerTurn = REVOLUTION_MS[level];
    motion.current.msPerTurn = msPerTurn;
    // One full turn looks the same as the start, so looping from..from+1 is seamless.
    Animated.loop(
      Animated.timing(rotation, {
        toValue: from + 1,
        duration: msPerTurn,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [level, reduceMotion, rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  const bladeWidth = size * 0.14;
  const bladeLength = size * 0.42;
  const hub = size * 0.2;
  const cap = size * 0.07;

  return (
    <View
      style={[styles.sweep, { width: size, height: size, borderRadius: size / 2 }]}
      accessible={false}
      importantForAccessibility="no-hide-descendants">
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: spin }] }]}>
        {[0, 120, 240].map((angle) => (
          <View key={angle} style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${angle}deg` }] }]}>
            <View
              style={[
                styles.blade,
                {
                  left: (size - bladeWidth) / 2,
                  top: size / 2 - bladeLength - hub * 0.3,
                  width: bladeWidth,
                  height: bladeLength,
                  borderRadius: bladeWidth / 2,
                },
              ]}>
              <View style={[styles.bladeShade, { width: bladeWidth * 0.32 }]} />
            </View>
          </View>
        ))}
      </Animated.View>
      <View style={[styles.hub, { width: hub, height: hub, borderRadius: hub / 2 }]}>
        <View style={{ width: cap, height: cap, borderRadius: cap / 2, backgroundColor: Palette.blade }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sweep: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.hairline,
  },
  blade: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: Palette.blade,
  },
  bladeShade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Palette.bladeShade,
  },
  hub: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.hub,
    borderWidth: 1,
    borderColor: Palette.highlight,
  },
});
