// Builds a release APK for arm64 phones.
//
// Points Gradle at the newest CMake in the Android SDK: CMake 3.22's bundled
// ninja 1.10 can't handle Windows paths over 260 chars, which breaks the
// react-native-worklets C++ build. Ninja 1.12+ (CMake 3.30+) can.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!sdk) throw new Error('Set ANDROID_HOME to your Android SDK folder');

const run = (cmd, cwd) => execSync(cmd, { stdio: 'inherit', cwd });

run('npx expo prebuild --platform android --no-install');

const toProp = (p) => p.replaceAll('\\', '/').replace(':', '\\:');
const props = [`sdk.dir=${toProp(sdk)}`];
const cmakeRoot = path.join(sdk, 'cmake');
if (existsSync(cmakeRoot)) {
  const newest = readdirSync(cmakeRoot)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .at(-1);
  if (newest) props.push(`cmake.dir=${toProp(path.join(cmakeRoot, newest))}`);
}
writeFileSync('android/local.properties', props.join('\n') + '\n');

const gradlew = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
run(`${gradlew} assembleRelease -PreactNativeArchitectures=arm64-v8a`, 'android');
console.log('\nAPK: android/app/build/outputs/apk/release/app-release.apk');
