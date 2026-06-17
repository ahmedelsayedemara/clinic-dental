import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useLanguageStore } from '@/store/useLanguageStore';

interface TextProps extends RNTextProps {
  className?: string;
}

export function Text({ className = '', style, ...props }: TextProps) {
  const { currentLanguage } = useLanguageStore();
  const isRTL = currentLanguage === 'ar';

  const hasTextAlignClass = /text-(left|right|center|justify|start|end)/.test(className);
  const defaultTextAlignClass = !hasTextAlignClass ? 'text-left' : '';

  const hasFontFamilyClass = /font-(ibm-(thin|extralight|light|regular|medium|semibold|bold)|sans|serif|mono)/.test(className);
  const defaultFontClass = !hasFontFamilyClass ? 'font-ibm-regular' : '';

  const mergedClassName = [defaultTextAlignClass, defaultFontClass, className]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = Array.isArray(style)
    ? [...style]
    : [style].filter(Boolean);

  return <RNText className={mergedClassName} style={mergedStyle} {...props} />;
}
