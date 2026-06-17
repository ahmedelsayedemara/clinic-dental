import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image';
import { useTheme } from '@/theme/ThemeProvider';

interface CachedImageProps extends Omit<FastImageProps, 'source'> {
  uri: string;
  showLoader?: boolean;
  loaderColor?: string;
  loaderBackgroundColor?: string;
}

export default function CachedImage({
  uri,
  showLoader = false,
  loaderColor,
  loaderBackgroundColor,
  style,
  onLoadEnd,
  onError,
  ...rest
}: CachedImageProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(showLoader);

  const source = {
    uri: uri.replace(/^http:\/\//, 'https://'),
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  };

  if (!showLoader) {
    return (
      <FastImage {...rest} style={style} source={source} onLoadEnd={onLoadEnd} onError={onError} />
    );
  }

  return (
    <View style={[styles.wrapper, style as StyleProp<ViewStyle>]}>
      <FastImage
        {...rest}
        style={StyleSheet.absoluteFill}
        source={source}
        onLoadEnd={() => {
          setLoading(false);
          onLoadEnd?.();
        }}
        onError={() => {
          setLoading(false);
          onError?.();
        }}
      />
      {loading ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.loader,
            { backgroundColor: loaderBackgroundColor ?? theme.surface },
          ]}>
          <ActivityIndicator size="small" color={loaderColor ?? theme.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
