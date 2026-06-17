import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableOpacityProps,
  ListRenderItemInfo,
} from 'react-native';
import { useField } from 'formik';
import { useTheme } from '@/theme/ThemeProvider';
import { isRTL } from '@/helper';
import { Text } from '@/components/UI';

interface Option {
  label: string;
  value: string | number;
}

interface FormSelectProps extends Omit<TouchableOpacityProps, 'onPress'> {
  name: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

const LIST_CONTENT_STYLE = { paddingBottom: 50 };

export const FormSelect = ({
  name,
  label,
  options,
  placeholder,
  className = '',
  multiple = false,
  ...props
}: FormSelectProps) => {
  const [field, meta, helpers] = useField(name);
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const currentValue = field.value;

  const isSelected = useCallback(
    (value: Option['value']) => {
      if (!multiple) {
        return value === currentValue;
      }
      return Array.isArray(currentValue) && currentValue.includes(value);
    },
    [multiple, currentValue],
  );

  const selectedLabel = (() => {
    if (!multiple) {
      return options.find(item => item.value === currentValue)?.label;
    }
    if (!Array.isArray(currentValue)) {
      return undefined;
    }
    const labels = options
      .filter(item => currentValue.includes(item.value))
      .map(item => item.label);
    return labels.length ? labels.join(', ') : undefined;
  })();

  const handleOpen = useCallback(() => {
    if (!props.disabled) {
      setIsOpen(true);
      helpers.setTouched(true);
    }
  }, [props.disabled, helpers]);

  const handleSelect = useCallback(
    (option: Option) => {
      if (!multiple) {
        helpers.setValue(option.value);
        setIsOpen(false);
        return;
      }
      const valueArray = Array.isArray(currentValue) ? currentValue : [];
      const exists = valueArray.includes(option.value);
      helpers.setValue(
        exists
          ? valueArray.filter(val => val !== option.value)
          : [...valueArray, option.value],
      );
    },
    [multiple, currentValue, helpers],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Option>) => (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        style={{
          borderBottomColor: theme.border,
          backgroundColor: isSelected(item.value) ? theme.primary + '33' : 'transparent',
        }}
        className="p-4 border-b">
        <Text
          style={{
            color: isSelected(item.value) ? theme.primary : theme.text,
          }}>
          {item.label}
        </Text>
      </TouchableOpacity>
    ),
    [handleSelect, isSelected, theme],
  );

  return (
    <>
      <View className={`mb-4 w-full ${className}`}>
        {label && (
          <Text style={{ color: theme.text }} className="mb-2 font-ibm-medium">
            {label}
          </Text>
        )}
        <TouchableOpacity
          onPress={handleOpen}
          activeOpacity={props.disabled ? 1 : 0.7}
          style={{
            backgroundColor: theme.card,
            borderColor: meta.touched && meta.error ? theme.error : theme.border,
            opacity: props.disabled ? 0.5 : 1,
          }}
          className="rounded-xl h-16 px-4 pr-12 text-base font-ibm-regular tracking-[-0.5] border items-center flex-row"
          {...props}>
          <Text
            style={{ color: selectedLabel ? theme.text : theme.textSecondary }}
            className="text-[16px]">
            {selectedLabel || placeholder || $t('COMMON.SELECT_OPTION')}
          </Text>
        </TouchableOpacity>
        {meta.touched && meta.error && (
          <Text className="text-error text-sm mt-1">{meta.error}</Text>
        )}
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View style={{ backgroundColor: theme.card }} className="rounded-t-lg max-h-[70%]">
            <View
              style={{ borderBottomColor: theme.border }}
              className="flex-row justify-between items-center p-4 border-b">
              <Text style={{ color: theme.text }} className="text-lg font-ibm-semibold">
                {$t('COMMON.SELECT')}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="font-ibm-medium text-primary">{$t('COMMON.CLOSE')}</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item.value.toString()}
              contentContainerStyle={[LIST_CONTENT_STYLE, isRTL ? { direction: 'rtl' } : undefined]}
              style={isRTL ? { direction: 'ltr' } : undefined}
              renderItem={renderItem}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};
