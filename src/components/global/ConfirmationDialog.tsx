import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';

interface ConfirmationDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  children?: ReactNode;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function DialogIcon({ type }: { type: 'danger' | 'warning' | 'info' }) {
  if (type === 'danger') {
    return (
      <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={colors.error} strokeWidth="1.8" />
        <Path
          d="M15 9l-6 6M9 9l6 6"
          stroke={colors.error}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (type === 'warning') {
    return (
      <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3L2 21h20L12 3z"
          stroke={colors.warning}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <Path d="M12 9v4" stroke={colors.warning} strokeWidth="1.8" strokeLinecap="round" />
        <Circle cx="12" cy="16.5" r="1" fill={colors.warning} />
      </Svg>
    );
  }
  return (
    <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={colors.primary} strokeWidth="1.8" />
      <Circle cx="12" cy="8" r="1" fill={colors.primary} />
      <Path d="M12 11v5" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText = $t('COMMON.CONFIRM'),
  cancelText = $t('COMMON.CANCEL'),
  onConfirm,
  onCancel,
  type = 'danger',
  children,
}: ConfirmationDialogProps) {
  const { theme } = useTheme();

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return { confirmBg: theme.error, confirmTextColor: colors.white };
      case 'warning':
        return { confirmBg: colors.warning, confirmTextColor: colors.white };
      case 'info':
        return { confirmBg: theme.primary, confirmTextColor: colors.white };
      default:
        return { confirmBg: theme.error, confirmTextColor: colors.white };
    }
  };

  const typeStyles = getTypeStyles();
  const cardBg = theme.card;
  const borderColor = theme.border;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <TouchableOpacity
          className="flex-1 bg-black/80 justify-center items-center"
          activeOpacity={1}
          onPress={onCancel}>
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
            <View
              style={{ width: SCREEN_WIDTH - 48, backgroundColor: cardBg }}
              className="rounded-2xl mx-6 overflow-hidden">
              <View className="items-center pt-[30px]">
                <View className="items-center justify-center mb-8">
                  <DialogIcon type={type} />
                </View>
                {title && (
                  <Text
                    style={{ color: theme.text }}
                    className="text-[20px] font-ibm-bold text-center px-4 mb-2">
                    {title}
                  </Text>
                )}
              </View>

              <View className="px-6 mb-[10px]">
                <Text
                  style={{ color: theme.textSecondary }}
                  className="text-[14px] text-center leading-6 font-ibm-regular">
                  {message}
                </Text>
              </View>

              {children && <View className="px-6 mb-[20px]">{children}</View>}

              <View style={{ borderTopColor: borderColor }} className="flex-row border-t">
                <TouchableOpacity
                  onPress={onCancel}
                  className="flex-1 py-4 items-center justify-center">
                  <Text
                    style={{ color: theme.textSecondary }}
                    className="text-base font-ibm-medium">
                    {cancelText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
                  style={{ backgroundColor: typeStyles.confirmBg }}
                  className="flex-1 py-4 items-center justify-center">
                  <Text
                    style={{ color: typeStyles.confirmTextColor }}
                    className="text-base font-ibm-bold">
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
