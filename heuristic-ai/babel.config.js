/**
 * HeuristicAI — Babel Configuration
 *
 * babel-preset-expo v56 internally handles:
 *   - @babel/plugin-proposal-decorators (legacy:true) via lazyDecoratorsPlugin
 *   - @babel/plugin-transform-class-properties (loose:true) via hermes-v0/web configs
 *   - react-native-worklets/plugin (auto-detected, runs before reanimated)
 *   - react-native-reanimated/plugin (auto-detected, runs last)
 *   - nativewind JSX transform (via jsxImportSource: 'nativewind' option)
 *
 * Manually re-registering any of these causes conflicts:
 *   - Double decorator transform => "Decorating class property failed" crash
 *   - Double class-properties => loose/strict mode mismatch
 *   - Double reanimated => worklet compilation errors
 *
 * This config intentionally has NO plugins array.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
        },
      ],
    ],
  };
};
