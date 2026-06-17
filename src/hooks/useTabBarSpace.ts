import { useSafeAreaInsets } from 'react-native-safe-area-context';

// CustomTabBar = inner bar (h-16 = 64px) + outer paddingBottom (max(insets.bottom, 8)).
const TAB_BAR_HEIGHT = 64;

/**
 * Bottom padding (px) needed so a tab screen's scroll/list content clears the
 * floating CustomTabBar instead of hiding behind it. `extra` adds breathing room.
 */
export function useTabBarSpace(extra = 16): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + extra;
}
