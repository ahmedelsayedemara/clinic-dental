import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';

interface SectionLoaderProps {
  height?: number;
  style?: 'card' | 'banner' | 'list';
}

function ShimmerBlock({
  width,
  height,
  borderRadius = 8,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
}) {
  const { isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.7,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [shimmerAnim]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: isDark ? colors.grayStrong : colors.border,
        opacity: shimmerAnim,
      }}
    />
  );
}

function BannerSkeleton() {
  return (
    <View className="mx-4 mt-4">
      <ShimmerBlock width="100%" height={168} borderRadius={12} />
    </View>
  );
}

function CardsSkeleton() {
  return (
    <View className="px-4 mt-5">
      <ShimmerBlock width={160} height={16} borderRadius={4} />
      <View className="flex-row mt-3 gap-3">
        <ShimmerBlock width="48%" height={150} borderRadius={8} />
        <ShimmerBlock width="48%" height={150} borderRadius={8} />
      </View>
      <View className="flex-row mt-3 gap-3">
        <ShimmerBlock width="48%" height={150} borderRadius={8} />
        <ShimmerBlock width="48%" height={150} borderRadius={8} />
      </View>
    </View>
  );
}

function ListSkeleton() {
  return (
    <View className="px-4 mt-4">
      <ShimmerBlock width={140} height={16} borderRadius={4} />
      <View className="mt-3 gap-3">
        {[1, 2, 3, 4].map(i => (
          <View key={i} className="flex-row items-center gap-3">
            <ShimmerBlock width={48} height={48} borderRadius={24} />
            <View className="flex-1 gap-2">
              <ShimmerBlock width="60%" height={14} borderRadius={4} />
              <ShimmerBlock width="40%" height={12} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SectionLoader({ style = 'card' }: SectionLoaderProps) {
  if (style === 'banner') {
    return <BannerSkeleton />;
  }
  if (style === 'list') {
    return <ListSkeleton />;
  }
  return <CardsSkeleton />;
}
