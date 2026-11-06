import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FanVisual } from '@/components/fan-visual';
import { Palette } from '@/constants/palette';
import { useFanRemote, type Speed, type TimerHours } from '@/hooks/use-fan-remote';

const SPEEDS: Speed[] = [1, 2, 3, 4, 5];
const TIMERS: TimerHours[] = [2, 4, 6];
const ICON = 20;

export default function RemoteScreen() {
  const remote = useFanRemote();
  const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });

  const fanOff = remote.power === 'off';
  const speed = fanOff ? null : remote.speed;
  const level = fanOff ? 0 : (speed ?? (remote.power === 'on' ? 2 : 0));
  const fanSize = Math.max(
    120,
    Math.floor(Math.min(heroSize.width - 64, heroSize.height - 104, 320) / 4) * 4,
  );

  const headline = fanOff ? 'Off' : speed ? `Speed ${speed}` : remote.power === 'on' ? 'On' : 'Ready';
  const detail = !remote.irAvailable
    ? 'This phone has no IR blaster'
    : remote.error
      ? remote.error
      : remote.timer && !fanOff
        ? `Timer set for ${remote.timer} h`
        : 'Point the top of your phone at the fan';
  const detailIsError = !remote.irAvailable || !!remote.error;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Orient Fan Remote</Text>
        <View style={styles.irStatus} accessibilityLabel={remote.sending ? 'Sending' : undefined}>
          <View
            style={[
              styles.irDot,
              {
                backgroundColor: !remote.irAvailable
                  ? Palette.negative
                  : remote.sending
                    ? Palette.accent
                    : Palette.textMuted,
              },
            ]}
          />
          <Text style={styles.meta}>{remote.irAvailable ? 'IR' : 'No IR'}</Text>
        </View>
      </View>

      <View
        style={styles.hero}
        onLayout={(e) => setHeroSize(e.nativeEvent.layout)}>
        {heroSize.height > 0 && <FanVisual size={fanSize} level={level} />}
        <View style={styles.heroText}>
          <Text style={styles.headline} accessibilityRole="header">
            {headline}
          </Text>
          <Text style={[styles.detail, detailIsError && styles.detailError]}>{detail}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.row}>
          <Key
            style={styles.flex}
            selected={remote.power === 'on'}
            label="Turn fan on"
            onPress={remote.powerOn}>
            {(selected) => (
              <>
                <MaterialCommunityIcons name="power" size={ICON} color={selected ? Palette.onAccent : Palette.text} />
                <Text style={[styles.keyLabel, selected && styles.onAccent]}>On</Text>
              </>
            )}
          </Key>
          <Key style={styles.flex} label="Turn fan off" onPress={remote.powerOff}>
            {() => (
              <>
                <MaterialCommunityIcons name="power" size={ICON} color={Palette.textSecondary} />
                <Text style={styles.keyLabel}>Off</Text>
              </>
            )}
          </Key>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Speed</Text>
          <View style={styles.speedRow}>
            {SPEEDS.map((s) => {
              // Each step is itself a bar: 48, 60, 72, 84, 96 tall.
              const lit = speed !== null && s <= speed;
              return (
                <Pressable
                  key={s}
                  onPress={() => remote.setFanSpeed(s)}
                  accessibilityRole="button"
                  accessibilityLabel={`Speed ${s}`}
                  accessibilityState={{ selected: speed === s }}
                  style={({ pressed }) => [
                    styles.speedStep,
                    { height: 36 + s * 12 },
                    lit && styles.speedStepLit,
                    pressed && (lit ? styles.speedStepLitPressed : styles.keyPressed),
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.speedNumber, lit && styles.onAccent]}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.flex]}>
            <Text style={styles.cardLabel}>Timer</Text>
            <View style={styles.segments}>
              {TIMERS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => remote.setFanTimer(h)}
                  accessibilityRole="button"
                  accessibilityLabel={`Turn off after ${h} hours`}
                  accessibilityState={{ selected: remote.timer === h }}
                  style={({ pressed }) => [
                    styles.segment,
                    remote.timer === h && styles.segmentSelected,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.segmentText, remote.timer === h && styles.accentText]}>{h} h</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={remote.toggleLight}
            accessibilityRole="button"
            accessibilityLabel="Toggle light"
            style={({ pressed }) => [styles.card, styles.lightTile, pressed && styles.cardPressed]}>
            <MaterialCommunityIcons name="lightbulb-outline" size={ICON} color={Palette.text} />
            <Text style={styles.keyLabel}>Light</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Key({
  label,
  onPress,
  selected = false,
  style,
  children,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  children: (selected: boolean) => ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.key,
        selected && styles.keySelected,
        pressed && (selected ? styles.keySelectedPressed : styles.keyPressed),
        pressed && styles.pressed,
        style,
      ]}>
      {children(selected)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: Palette.text,
  },
  irStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  irDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  meta: {
    fontSize: 13,
    color: Palette.textSecondary,
  },

  // Hero
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 16,
  },
  heroText: {
    alignItems: 'center',
    gap: 4,
  },
  headline: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '500',
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
  detail: {
    fontSize: 14,
    lineHeight: 20,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  detailError: {
    color: Palette.negative,
  },

  // Controls
  controls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  key: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.raised,
    borderWidth: 1,
    borderColor: Palette.hairline,
  },
  keyPressed: {
    backgroundColor: Palette.raisedPressed,
  },
  keySelected: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  keySelectedPressed: {
    backgroundColor: Palette.accentPressed,
  },
  keyLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.text,
  },
  onAccent: {
    color: Palette.onAccent,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },

  card: {
    padding: 8,
    paddingTop: 12,
    gap: 8,
    borderRadius: 20,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.hairline,
  },
  cardPressed: {
    backgroundColor: Palette.raised,
  },
  cardLabel: {
    paddingHorizontal: 8,
    fontSize: 13,
    color: Palette.textMuted,
  },

  // Speed
  speedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  speedStep: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: Palette.hairline,
    backgroundColor: Palette.raised,
  },
  speedStepLit: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  speedStepLitPressed: {
    backgroundColor: Palette.accentPressed,
  },
  speedNumber: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: Palette.textSecondary,
    fontVariant: ['tabular-nums'],
  },

  // Timer
  segments: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.hairline,
    backgroundColor: Palette.raised,
  },
  segmentSelected: {
    backgroundColor: Palette.raisedPressed,
    borderColor: Palette.accent,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  accentText: {
    color: Palette.accent,
  },

  // Light
  lightTile: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
});
