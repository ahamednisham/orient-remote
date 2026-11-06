// Builds a signed release APK for arm64 phones.
//
// Points Gradle at the newest CMake in the Android SDK: CMake 3.22's bundled
// ninja 1.10 can't handle Windows paths over 260 chars, which breaks the
// react-native-worklets C++ build. Ninja 1.12+ (CMake 3.30+) can.
//
// Signing: reads the release key from a properties file outside the repo
// (default ~/.android-keys/orient-remote-release.properties, or the path in
// ORIENT_REMOTE_SIGNING). Keys: storeFile, storePassword, keyAlias,
// keyPassword. They reach Gradle as android.injected.signing.* properties via
// environment variables, so passwords never appear on a command line.
// Without the file, the APK is signed with the debug key.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!sdk) throw new Error('Set ANDROID_HOME to your Android SDK folder');

const run = (cmd, cwd, env = process.env) => execSync(cmd, { stdio: 'inherit', cwd, env });

function signingEnv() {
  const file =
    process.env.ORIENT_REMOTE_SIGNING ??
    path.join(os.homedir(), '.android-keys', 'orient-remote-release.properties');
  if (!existsSync(file)) {
    console.warn(`\nNo release key at ${file}: signing with the debug key.\n`);
    return {};
  }
  const props = Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.includes('=') && !line.startsWith('#'))
      .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
  );
  for (const key of ['storeFile', 'storePassword', 'keyAlias', 'keyPassword']) {
    if (!props[key]) throw new Error(`${file} is missing ${key}`);
  }
  if (!existsSync(props.storeFile)) throw new Error(`Keystore not found: ${props.storeFile}`);
  console.log(`\nSigning with release key "${props.keyAlias}" from ${props.storeFile}\n`);
  const p = 'ORG_GRADLE_PROJECT_android.injected.signing.';
  return {
    [`${p}store.file`]: props.storeFile,
    [`${p}store.password`]: props.storePassword,
    [`${p}key.alias`]: props.keyAlias,
    [`${p}key.password`]: props.keyPassword,
  };
}

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
run(`${gradlew} assembleRelease -PreactNativeArchitectures=arm64-v8a`, 'android', {
  ...process.env,
  ...signingEnv(),
});
console.log('\nAPK: android/app/build/outputs/apk/release/app-release.apk');
