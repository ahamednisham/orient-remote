import { useColorScheme } from 'react-native';

/**
 * Hardware-console look from the "Fan Remote App" canvas: textured trays
 * holding chunky keys, each with a small indicator LED.
 * Dark mode uses graphite keys; light mode uses pale keys on a pale tray.
 */

export const Fonts = {
  regular: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  semibold: 'Barlow_600SemiBold',
} as const;

export const LED_GREEN = '#3CE65F';
export const LED_AMBER = '#FFA526';

export type Theme = {
  dark: boolean;
  bg: string;
  text: string;
  muted: string;
  negative: string;

  housing: string;
  housingSheen: string;
  housingShadow: string;

  keyText: string;
  keyFace: string;
  keyFacePressed: string;
  keyShadow: string;
  keyShadowSmall: string;

  rockerFace: string;
  rockerShadow: string;
  rockerPressed: string;
  rockerDivider: string;
  rockerDividerHighlight: string;

  ledOffFace: string;
  ledOffShadow: string;
  focus: string;
};

const dark: Theme = {
  dark: true,
  bg: '#111112',
  text: '#EDEDEF',
  muted: '#A2A2A8',
  negative: '#FF6B6B',

  housing: '#1C1C1D',
  housingSheen: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.12))',
  housingShadow:
    '0 0 0 1px #000000, inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 3px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.03), 0 22px 40px -12px rgba(0,0,0,0.9)',

  keyText: '#D8D8DA',
  keyFace: 'linear-gradient(180deg, #2F2F31 0%, #252527 42%, #1F1F21 100%)',
  keyFacePressed: 'linear-gradient(180deg, #29292B 0%, #212123 42%, #1B1B1D 100%)',
  keyShadow:
    'inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -3px 4px rgba(0,0,0,0.35), 0 3px 4px rgba(0,0,0,0.6), 0 0 0 1px #0B0B0C, 0 0 0 4px rgba(0,0,0,0.22)',
  keyShadowSmall:
    'inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -3px 4px rgba(0,0,0,0.35), 0 3px 4px rgba(0,0,0,0.6), 0 0 0 1px #0B0B0C, 0 0 0 3px rgba(0,0,0,0.22)',

  rockerFace:
    'linear-gradient(180deg, #313133 0%, #262628 30%, #1E1E20 49%, #18181A 50.5%, #212123 56%, #262628 100%)',
  rockerShadow:
    'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -3px 4px rgba(0,0,0,0.35), 0 3px 4px rgba(0,0,0,0.6), 0 0 0 1px #0B0B0C, 0 0 0 4px rgba(0,0,0,0.22)',
  rockerPressed: 'rgba(0,0,0,0.25)',
  rockerDivider: 'rgba(0,0,0,0.6)',
  rockerDividerHighlight: 'rgba(255,255,255,0.05)',

  ledOffFace: 'linear-gradient(180deg, #4E4E51, #3E3E41)',
  ledOffShadow: 'inset 0 1px 1px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06)',
  focus: LED_GREEN,
};

const light: Theme = {
  dark: false,
  bg: '#E5E5E3',
  text: '#1D1D1F',
  muted: '#56565B',
  negative: '#B42318',

  housing: '#D3D3D0',
  housingSheen: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(0,0,0,0.04))',
  housingShadow:
    '0 0 0 1px rgba(0,0,0,0.12), inset 0 1px 2px rgba(0,0,0,0.10), inset 0 -1px 0 rgba(255,255,255,0.6), 0 18px 30px -14px rgba(0,0,0,0.28), 0 4px 10px rgba(0,0,0,0.06)',

  keyText: '#2A2A2D',
  keyFace: 'linear-gradient(180deg, #FDFDFC 0%, #F3F3F1 42%, #E7E7E4 100%)',
  keyFacePressed: 'linear-gradient(180deg, #EFEFED 0%, #E6E6E3 42%, #DBDBD8 100%)',
  keyShadow:
    'inset 0 1px 0 rgba(255,255,255,1), inset 0 -3px 4px rgba(0,0,0,0.06), 0 3px 4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.14), 0 0 0 4px rgba(0,0,0,0.04)',
  keyShadowSmall:
    'inset 0 1px 0 rgba(255,255,255,1), inset 0 -3px 4px rgba(0,0,0,0.06), 0 3px 4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.14), 0 0 0 3px rgba(0,0,0,0.04)',

  rockerFace:
    'linear-gradient(180deg, #FDFDFC 0%, #F2F2F0 30%, #E8E8E5 49%, #DADAD7 50.5%, #E6E6E3 56%, #EFEFED 100%)',
  rockerShadow:
    'inset 0 1px 0 rgba(255,255,255,1), inset 0 -3px 4px rgba(0,0,0,0.06), inset 0 30px 30px -24px rgba(255,255,255,0.5), 0 3px 4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.14), 0 0 0 4px rgba(0,0,0,0.04)',
  rockerPressed: 'rgba(0,0,0,0.07)',
  rockerDivider: 'rgba(0,0,0,0.16)',
  rockerDividerHighlight: 'rgba(255,255,255,0.9)',

  ledOffFace: 'linear-gradient(180deg, #C4C4C1, #B6B6B3)',
  ledOffShadow: 'inset 0 1px 1px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.8)',
  focus: '#1F8A3A',
};

export function useTheme(): Theme {
  return useColorScheme() === 'light' ? light : dark;
}

/** Mix a #RRGGBB colour toward white (f > 0) or black (f < 0). */
function shade(hex: string, f: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  let out = '#';
  for (let i = 0; i < 6; i += 2) {
    let v = parseInt(h.slice(i, i + 2), 16);
    v = f > 0 ? Math.round(v + (255 - v) * f) : Math.round(v * (1 + f));
    out += Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  }
  return out;
}

export function ledStyle(theme: Theme, color: string, lit: boolean) {
  if (!lit) return { backgroundImage: theme.ledOffFace, boxShadow: theme.ledOffShadow };
  return {
    backgroundImage: `linear-gradient(180deg, ${shade(color, 0.5)}, ${color})`,
    // On a pale tray the glow needs a darker rim to read as "lit".
    boxShadow: theme.dark
      ? `0 0 3px ${color}E6, 0 0 10px ${color}99, 0 0 22px ${color}40`
      : `0 0 0 1px ${shade(color, -0.35)}80, 0 0 4px ${color}E6, 0 0 12px ${color}80`,
  };
}
