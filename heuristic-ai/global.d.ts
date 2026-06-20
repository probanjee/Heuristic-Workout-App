/**
 * HeuristicAI — Global TypeScript Declarations
 */

/// <reference types="nativewind/types" />

// Allow CSS file imports (used by NativeWind)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
