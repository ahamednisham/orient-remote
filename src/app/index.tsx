import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, LED_AMBER, LED_GREEN, ledStyle, useTheme, type Theme } from '@/constants/theme';
import { useFanRemote, type Speed, type TimerHours } from '@/hooks/use-fan-remote';

const TITLE = 'Orient Fan Remote';
const SPEEDS: Speed[] = [1, 2, 3, 4, 5];
const TIMERS: TimerHours[] = [2, 4, 6, 8];
// Milliseconds per revolution of the status icon at each speed.
const SPIN_MS = [1100, 2400, 1600, 1100, 800, 600] as const;
const BOOST_SPIN_MS = 350;
// Key labels may grow with the system font size, but only so far: the trays
// have fixed heights so the whole remote fits without scrolling.
const MAX_FONT_SCALE = 1.3;

// Sizes for each layout. The screen uses the first one that fits the height it
// actually has (after status bar, navigation bar and font size are applied).
const METRICS = {
  regular: {
    padTop: 12, padBottom: 20, gap: 14, titleGap: 8,
    powerMin: 176, powerPad: 14, powerRadius: 40, keyLargeGap: 14,
    speed: 100, timer: 96, extras: 100,
    stripPad: 12, stripRadius: 32, keySmallRadius: 22, keySmallGap: 10,
  },
  compact: {
    padTop: 8, padBottom: 12, gap: 10, titleGap: 6,
    powerMin: 150, powerPad: 10, powerRadius: 34, keyLargeGap: 10,
    speed: 76, timer: 72, extras: 76,
    stripPad: 9, stripRadius: 26, keySmallRadius: 18, keySmallGap: 6,
  },
} as const;
type Metrics = (typeof METRICS)[keyof typeof METRICS];

/** Height the screen needs at these sizes, given the measured header and section-title heights. */
function requiredHeight(m: Metrics, header: number, title: number, withExtras: boolean) {
  const sections = withExtras ? 4 : 3;
  return (
    m.padTop + m.padBottom + header +
    sections * (m.gap + title + m.titleGap) +
    m.powerMin + m.speed + m.timer + (withExtras ? m.extras : 0)
  );
}

export default function RemoteScreen() {
  const remote = useFanRemote();
  const theme = useTheme();
  const [available, setAvailable] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [titleHeight, setTitleHeight] = useState(0);
  const measured = available > 0 && headerHeight > 0 && titleHeight > 0;

  // Regular if it fits; else compact; else compact with Extras dropped.
  const fitsRegular = !measured || available >= requiredHeight(METRICS.regular, headerHeight, titleHeight, true);
  const fitsCompact = fitsRegular || available >= requiredHeight(METRICS.compact, headerHeight, titleHeight, true);
  const metrics = fitsRegular ? METRICS.regular : METRICS.compact;
  const showExtras = fitsCompact;
  const styles = useMemo(() => createStyles(theme, metrics), [theme, metrics]);

  const on = remote.power !== 'off';
  const boost = on && remote.boost;
  const speed = on && !boost ? remote.speed : null;

  const status = !remote.irAvailable
    ? 'No IR blaster on this phone'
    : remote.error
      ? remote.error
      : remote.power === 'off'
        ? 'Standby'
        : boost
          ? 'Boost · full airflow'
          : speed
            ? `Running · speed ${speed}`
            : remote.power === 'on'
              ? 'Running'
              : 'Point the IR sensor at the fan';
  const statusIsError = !remote.irAvailable || !!remote.error;

  const timerStatus =
    on && remote.timer
      ? `Off at ${new Date(remote.timer.startedAt + remote.timer.hours * 3_600_000).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}`
      : 'No timer';

  const spinning = remote.power === 'on' || speed !== null || boost;
  const spinMs = boost ? BOOST_SPIN_MS : SPIN_MS[speed ?? 0];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View
        style={[styles.content, !measured && styles.hidden]}
        onLayout={(e) => setAvailable(e.nativeEvent.layout.height)}>
        <View style={styles.header} onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
          <View style={styles.headerMain}>
            <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
              {TITLE}
            </Text>
            <View style={styles.metaRow}>
              {statusIsError ? (
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={theme.negative} />
              ) : (
                <SpinningIcon spinning={spinning} msPerTurn={spinMs} color={theme.muted} />
              )}
              <Text style={[styles.meta, statusIsError && styles.metaError]} numberOfLines={1}>
                {status}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="weather-night" size={15} color={theme.muted} />
            <Text style={styles.meta}>{timerStatus}</Text>
          </View>
        </View>

        <Section
          title="POWER"
          styles={styles}
          grow
          onTitleLayout={(height) => setTitleHeight(height)}>
          <View style={[styles.housing, styles.powerHousing]}>
            <View style={styles.powerKeys}>
              <Key
                theme={theme}
                styles={styles}
                style={styles.flex}
                label="Turn fan on"
                selected={remote.power === 'on'}
                onPress={remote.powerOn}
                led={ledStyle(theme, LED_GREEN, remote.power === 'on')}
                large>
                <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.keyText, styles.powerText]}>ON</Text>
              </Key>
              <Key
                theme={theme}
                styles={styles}
                style={styles.flex}
                label="Turn fan off"
                selected={remote.power === 'off'}
                onPress={remote.powerOff}
                led={ledStyle(theme, LED_AMBER, remote.power === 'off')}
                large>
                <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.keyText, styles.powerText]}>OFF</Text>
              </Key>
            </View>

            <View style={styles.rocker} accessibilityLabel="Speed rocker">
              <Pressable
                onPress={remote.speedUp}
                accessibilityRole="button"
                accessibilityLabel="Speed up"
                style={({ pressed }) => [styles.rockerHalf, pressed && styles.rockerHalfPressed]}>
                <MaterialCommunityIcons name="fan" size={30} color={theme.keyText} />
                <MaterialCommunityIcons name="plus" size={24} color={theme.keyText} />
              </Pressable>
              <View style={styles.rockerDivider} />
              <Pressable
                onPress={remote.speedDown}
                accessibilityRole="button"
                accessibilityLabel="Speed down"
                style={({ pressed }) => [styles.rockerHalf, pressed && styles.rockerHalfPressed]}>
                <MaterialCommunityIcons name="fan" size={24} color={theme.keyText} style={styles.smallFan} />
                <MaterialCommunityIcons name="minus" size={24} color={theme.keyText} />
              </Pressable>
            </View>
          </View>
        </Section>

        <Section title="SPEED" styles={styles}>
          <View style={[styles.housing, styles.stripHousing, styles.speedHousing]}>
            {SPEEDS.map((s) => (
              <Key
                key={s}
                theme={theme}
                styles={styles}
                style={styles.flex}
                label={`Speed ${s}`}
                selected={speed === s}
                onPress={() => remote.setFanSpeed(s)}
                led={ledStyle(theme, LED_GREEN, speed === s)}>
                <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.keyText, styles.speedText]}>{s}</Text>
              </Key>
            ))}
          </View>
        </Section>

        <Section title="SLEEP TIMER" styles={styles}>
          <View style={[styles.housing, styles.stripHousing, styles.timerHousing]}>
            {TIMERS.map((h) => {
              const active = on && remote.timer?.hours === h;
              return (
                <Key
                  key={h}
                  theme={theme}
                  styles={styles}
                  style={styles.flex}
                  label={`Turn off in ${h} hours`}
                  selected={active}
                  onPress={() => remote.setFanTimer(h)}
                  led={ledStyle(theme, LED_GREEN, active)}>
                  <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.keyText, styles.timerText]}>{h}H</Text>
                </Key>
              );
            })}
          </View>
        </Section>

        {/* On screens too short even for the compact layout, Extras is the part that gives way. */}
        {showExtras && (
          <Section title="EXTRAS" styles={styles}>
            <View style={[styles.housing, styles.stripHousing, styles.extrasHousing]}>
              <Key
                theme={theme}
                styles={styles}
                style={styles.flex}
                label="Fan light"
                selected={remote.light}
                onPress={remote.toggleLight}
                led={ledStyle(theme, LED_GREEN, remote.light)}>
                <View style={styles.iconLabel}>
                  <MaterialCommunityIcons name="white-balance-sunny" size={24} color={theme.keyText} />
                  <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.keyText, styles.extraText]}>LED</Text>
                </View>
              </Key>
              <Key
                theme={theme}
                styles={styles}
                style={styles.flex}
                label="Boost"
                selected={boost}
                onPress={remote.toggleBoost}
                led={ledStyle(theme, LED_AMBER, boost)}>
                <View style={styles.iconLabel}>
                  <MaterialCommunityIcons name="weather-windy" size={24} color={theme.keyText} />
                  <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.keyText, styles.extraText]}>BOOST</Text>
                </View>
              </Key>
            </View>
          </Section>
        )}
      </View>
    </SafeAreaView>
  );
}

type Styles = ReturnType<typeof createStyles>;

function Section({
  title,
  styles,
  grow = false,
  onTitleLayout,
  children,
}: {
  title: string;
  styles: Styles;
  grow?: boolean;
  onTitleLayout?: (height: number) => void;
  children: ReactNode;
}) {
  return (
    <View style={[styles.section, grow && styles.sectionGrow]}>
      <Text
        style={styles.sectionTitle}
        accessibilityRole="header"
        onLayout={onTitleLayout && ((e) => onTitleLayout(e.nativeEvent.layout.height))}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Key({
  theme,
  styles,
  label,
  onPress,
  selected,
  led,
  large = false,
  style,
  children,
}: {
  theme: Theme;
  styles: Styles;
  label: string;
  onPress: () => void;
  selected: boolean;
  led: ViewStyle;
  large?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.key,
        large ? styles.keyLarge : styles.keySmall,
        pressed && styles.keyPressed,
        style,
      ]}>
      <View style={[large ? styles.ledLarge : styles.ledSmall, led]} />
      {children}
    </Pressable>
  );
}

function SpinningIcon({ spinning, msPerTurn, color }: { spinning: boolean; msPerTurn: number; color: string }) {
  const [rotation] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    rotation.stopAnimation();
    rotation.setValue(0);
    if (!spinning || reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: msPerTurn,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spinning, msPerTurn, reduceMotion, rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate }] }} importantForAccessibility="no-hide-descendants">
      <MaterialCommunityIcons name="fan" size={16} color={color} />
    </Animated.View>
  );
}

function createStyles(t: Theme, m: Metrics) {
  const housing: ViewStyle = {
    backgroundColor: t.housing,
    backgroundImage: t.housingSheen,
    boxShadow: t.housingShadow,
  };

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.bg,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: m.padTop,
      paddingBottom: m.padBottom,
      gap: m.gap,
    },
    // Kept invisible for the one frame before the screen has been measured.
    hidden: {
      opacity: 0,
    },
    flex: {
      flex: 1,
    },

    // Header
    header: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerMain: {
      flexShrink: 1,
      gap: 4,
    },
    title: {
      fontFamily: Fonts.semibold,
      fontSize: 28,
      lineHeight: 31,
      color: t.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 1,
    },
    meta: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: t.muted,
      flexShrink: 1,
    },
    metaError: {
      color: t.negative,
    },

    // Sections
    section: {
      gap: m.titleGap,
    },
    sectionGrow: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: Fonts.semibold,
      fontSize: 12,
      letterSpacing: 1.9,
      color: t.muted,
    },

    housing,
    powerHousing: {
      flex: 1,
      minHeight: m.powerMin,
      padding: m.powerPad,
      borderRadius: m.powerRadius,
      flexDirection: 'row',
      gap: 12,
    },
    stripHousing: {
      padding: m.stripPad,
      borderRadius: m.stripRadius,
      flexDirection: 'row',
    },
    speedHousing: {
      height: m.speed,
      gap: 9,
    },
    timerHousing: {
      height: m.timer,
      gap: 10,
    },
    extrasHousing: {
      height: m.extras,
      gap: 12,
    },

    // Keys
    key: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: t.keyFace,
      backgroundColor: t.housing,
    },
    keyLarge: {
      borderRadius: m.powerRadius - 12,
      gap: m.keyLargeGap,
      boxShadow: t.keyShadow,
    },
    keySmall: {
      borderRadius: m.keySmallRadius,
      gap: m.keySmallGap,
      boxShadow: t.keyShadowSmall,
    },
    keyPressed: {
      backgroundImage: t.keyFacePressed,
      transform: [{ translateY: 1.5 }],
    },
    ledLarge: {
      width: 22,
      height: 6,
      borderRadius: 3,
    },
    ledSmall: {
      width: 18,
      height: 5,
      borderRadius: 3,
    },
    keyText: {
      fontFamily: Fonts.medium,
      color: t.keyText,
      includeFontPadding: false,
    },
    powerText: {
      fontSize: 28,
      lineHeight: 30,
      letterSpacing: 0.5,
    },
    speedText: {
      fontSize: 24,
      lineHeight: 26,
      fontVariant: ['tabular-nums'],
    },
    timerText: {
      fontSize: 22,
      lineHeight: 24,
      fontVariant: ['tabular-nums'],
    },
    extraText: {
      fontSize: 20,
      lineHeight: 22,
    },
    iconLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    powerKeys: {
      flex: 1,
      gap: 12,
    },

    // Speed rocker
    rocker: {
      flex: 1,
      borderRadius: m.powerRadius - 4,
      overflow: 'hidden',
      backgroundImage: t.rockerFace,
      backgroundColor: t.housing,
      boxShadow: t.rockerShadow,
    },
    rockerHalf: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    },
    rockerHalfPressed: {
      backgroundColor: t.rockerPressed,
    },
    rockerDivider: {
      height: 1,
      marginHorizontal: 18,
      backgroundColor: t.rockerDivider,
      boxShadow: `0 1px 0 ${t.rockerDividerHighlight}`,
    },
    smallFan: {
      marginHorizontal: 3,
    },
  });
}
