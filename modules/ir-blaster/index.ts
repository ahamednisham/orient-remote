import { requireOptionalNativeModule } from 'expo';

type IrBlasterNative = {
  hasIrEmitter(): boolean;
  transmit(frequency: number, pattern: number[]): Promise<void>;
};

// Null on iOS, web and Expo Go, where the native module is not compiled in.
const IrBlaster = requireOptionalNativeModule<IrBlasterNative>('IrBlaster');

export function hasIrEmitter(): boolean {
  return IrBlaster?.hasIrEmitter() ?? false;
}

export async function transmit(frequency: number, pattern: number[]): Promise<void> {
  if (!IrBlaster) throw new Error('IR blaster is only available in the Android app build');
  await IrBlaster.transmit(frequency, pattern);
}
