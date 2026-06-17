import React, { useEffect, useRef } from 'react';
import { Animated, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useLoadingStore } from '@/store/useLoadingStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export default function FullScreenLoader() {
  const { theme } = useTheme();
  const { isLoading } = useLoadingStore();
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bgOpacity, {
      toValue: isLoading ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isLoading, bgOpacity]);

  if (!isLoading) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.container, { opacity: bgOpacity }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});
