import React, { useId } from 'react';
import { View, ViewProps } from 'react-native';
import Svg, { Path, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '@/components/UI';
import { colors } from '@/theme/colors';

/**
 * Hany Clinic brand mark — a tooth with a medical cross, matching the app icon.
 *
 *  variant:
 *   - 'badge' : white tooth on a teal rounded-square (use on light backgrounds)
 *   - 'light' : white tooth + teal cross, no background (use on teal/dark backgrounds)
 *   - 'solid' : teal tooth + white cross, no background (minimal, on light backgrounds)
 */
export type LogoVariant = 'badge' | 'light' | 'solid';

const TOOTH_PATH =
  'M512,300 C470,296 430,298 400,326 C372,352 372,392 374,430 ' +
  'C377,486 396,520 410,566 C422,606 428,668 446,706 ' +
  'C456,728 478,728 488,704 C496,684 500,652 512,640 ' +
  'C524,652 528,684 536,704 C546,728 568,728 578,706 ' +
  'C596,668 602,606 614,566 C628,520 647,486 650,430 ' +
  'C652,392 652,352 624,326 C594,298 554,296 512,300 Z';

interface LogoMarkProps {
  size?: number;
  variant?: LogoVariant;
}

export function LogoMark({ size = 64, variant = 'badge' }: LogoMarkProps) {
  const gid = useId();
  const badge = variant === 'badge';
  const toothColor = variant === 'solid' ? colors.primary : `url(#tooth-${gid})`;
  const crossColor = variant === 'solid' ? colors.white : colors.primary;
  // Frame tightly around the tooth for bare marks; full canvas for the badge.
  const viewBox = badge ? '0 0 1024 1024' : '232 234 560 560';

  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      <Defs>
        <LinearGradient id={`bg-${gid}`} x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.primary} />
          <Stop offset="1" stopColor={colors.primaryDark} />
        </LinearGradient>
        <LinearGradient id={`tooth-${gid}`} x1="512" y1="290" x2="512" y2="740" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.white} />
          <Stop offset="1" stopColor="#E0F7FB" />
        </LinearGradient>
      </Defs>

      {badge && <Rect width={1024} height={1024} rx={224} fill={`url(#bg-${gid})`} />}

      <G transform="translate(512 512) scale(1.16) translate(-512 -512)">
        <Path d={TOOTH_PATH} fill={toothColor} />
        <G fill={crossColor}>
          <Rect x={492} y={380} width={40} height={120} rx={12} />
          <Rect x={452} y={420} width={120} height={40} rx={12} />
        </G>
      </G>
    </Svg>
  );
}

interface LogoProps extends ViewProps {
  size?: number;
  variant?: LogoVariant;
  layout?: 'stacked' | 'horizontal';
  showText?: boolean;
}

export default function Logo({
  size = 72,
  variant = 'badge',
  layout = 'stacked',
  showText = true,
  ...rest
}: LogoProps) {
  const onColor = variant === 'light';
  const primaryText = onColor ? colors.white : colors.brandText;
  const secondaryText = onColor ? 'rgba(255,255,255,0.85)' : colors.primary;
  const stacked = layout === 'stacked';

  return (
    <View
      className={stacked ? 'items-center' : 'flex-row items-center'}
      style={{ gap: stacked ? 12 : 12 }}
      {...rest}>
      <LogoMark size={size} variant={variant} />
      {showText && (
        <Text
          className={`font-ibm-bold ${stacked ? 'text-center' : ''}`}
          style={{ fontSize: size * 0.34, color: primaryText }}>
          Hany <Text className="font-ibm-regular" style={{ color: secondaryText }}>Clinic</Text>
        </Text>
      )}
    </View>
  );
}
