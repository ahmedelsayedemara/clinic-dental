import { TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native';
import { useLanguageStore } from '@/store/useLanguageStore';

interface TextInputProps extends RNTextInputProps {
  className?: string;
}

export function TextInput({ className = '', style, ...props }: TextInputProps) {
  const { currentLanguage } = useLanguageStore();
  const isRTL = currentLanguage === 'ar';

  const hasTextAlignClass = /text-(left|right|center|justify|start|end)/.test(className);
  const defaultTextAlignClass = !hasTextAlignClass ? (isRTL ? 'text-right' : 'text-left') : '';

  const hasFontFamilyClass = /font-(ibm-(thin|extralight|light|regular|medium|semibold|bold)|sans|serif|mono)/.test(className);
  const defaultFontClass = !hasFontFamilyClass ? 'font-ibm-regular' : '';

  const mergedClassName = [defaultTextAlignClass, defaultFontClass, className]
    .filter(Boolean)
    .join(' ');

  const textAlign = isRTL ? ('right' as const) : ('left' as const);
  const mergedStyle = Array.isArray(style)
    ? [{ textAlign }, ...style]
    : [{ textAlign }, style].filter(Boolean);

  return <RNTextInput className={mergedClassName} style={mergedStyle} {...props} />;
}
