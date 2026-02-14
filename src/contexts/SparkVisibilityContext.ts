import { createContext, useContext } from 'react';

/**
 * React context providing sidebar visibility state to hooks.
 * Default false — hooks won't poll until panel is shown.
 */
export const SparkVisibilityContext = createContext(false);

export function useSparkVisibility(): boolean {
  return useContext(SparkVisibilityContext);
}
