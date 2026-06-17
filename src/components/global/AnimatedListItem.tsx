import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { useFadeIn } from '@/hooks/useAnimations';

// Remembers which rows have already played their entrance animation. Without this,
// a list refresh / re-render replays the animation on existing rows inside a
// recycling FlatList, which visually glitches (rows overlap / flash). Keyed by a
// stable id so only genuinely new rows animate in.
const animatedKeys = new Set<string>();

interface AnimatedListItemProps {
  /** Item position — drives the staggered entrance delay. */
  index: number;
  /** Stable key (e.g. item id). When provided, the row animates only the first time. */
  itemKey?: string;
  children: React.ReactNode;
}

/**
 * Wraps a list row so it fades in on first appearance, staggered by index.
 * Fade-only (no vertical slide) so an entering row can never overlap its neighbours.
 */
export default function AnimatedListItem({ index, itemKey, children }: AnimatedListItemProps) {
  // Decide once per mount whether this row should animate.
  const shouldAnimate = useRef<boolean | null>(null);
  if (shouldAnimate.current === null) {
    shouldAnimate.current = itemKey == null || !animatedKeys.has(itemKey);
    if (itemKey != null) {
      animatedKeys.add(itemKey);
    }
  }

  const { style } = useFadeIn(400, Math.min(index * 60, 300));

  return (
    <Animated.View style={shouldAnimate.current ? style : undefined}>{children}</Animated.View>
  );
}
