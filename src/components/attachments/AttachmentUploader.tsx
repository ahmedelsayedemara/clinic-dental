import React, { useCallback } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import BottomSheetModal from '@/components/global/BottomSheetModal';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import {
  AttachmentType,
  UploadAttachmentPayload,
} from '@/api/services/attachmentService/attachmentInterface';

interface AttachmentUploaderProps {
  visible: boolean;
  patientId: string;
  isUploading: boolean;
  uploadProgress: number | null;
  onClose: () => void;
  onUpload: (payload: Omit<UploadAttachmentPayload, 'onProgress'>) => void;
}

interface PickerOption {
  icon: any;
  label: string;
  onPress: () => void;
}

export default function AttachmentUploader({
  visible,
  patientId,
  isUploading,
  uploadProgress,
  onClose,
  onUpload,
}: AttachmentUploaderProps) {
  const { theme } = useTheme();

  const handleUpload = useCallback(
    (type: AttachmentType, localUri: string, fileName: string, mimeType: string) => {
      onClose();
      onUpload({ patientId, type, localUri, fileName, mimeType });
    },
    [patientId, onClose, onUpload],
  );

  const handleTakePhoto = useCallback(async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel || !result.assets?.[0]) return;
      const asset = result.assets[0];
      handleUpload(
        'image',
        asset.uri ?? '',
        asset.fileName ?? `photo_${Date.now()}.jpg`,
        asset.type ?? 'image/jpeg',
      );
    } catch (_e) {
      Alert.alert($t('COMMON.ERROR'), $t('COMMON.SOMETHING_WENT_WRONG'));
    }
  }, [handleUpload]);

  const handleChooseImage = useCallback(async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel || !result.assets?.[0]) return;
      const asset = result.assets[0];
      handleUpload(
        'image',
        asset.uri ?? '',
        asset.fileName ?? `image_${Date.now()}.jpg`,
        asset.type ?? 'image/jpeg',
      );
    } catch (_e) {
      Alert.alert($t('COMMON.ERROR'), $t('COMMON.SOMETHING_WENT_WRONG'));
    }
  }, [handleUpload]);

  const handleUploadXray = useCallback(async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 1.0 });
      if (result.didCancel || !result.assets?.[0]) return;
      const asset = result.assets[0];
      handleUpload(
        'xray',
        asset.uri ?? '',
        asset.fileName ?? `xray_${Date.now()}.jpg`,
        asset.type ?? 'image/jpeg',
      );
    } catch (_e) {
      Alert.alert($t('COMMON.ERROR'), $t('COMMON.SOMETHING_WENT_WRONG'));
    }
  }, [handleUpload]);

  const handleUploadPdf = useCallback(async () => {
    try {
      const result = await DocumentPicker.pick({ type: [DocumentPicker.types.pdf] });
      const file = result[0];
      if (!file?.uri) return;
      handleUpload('pdf', file.uri, file.name ?? `document_${Date.now()}.pdf`, 'application/pdf');
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        Alert.alert($t('COMMON.ERROR'), $t('COMMON.SOMETHING_WENT_WRONG'));
      }
    }
  }, [handleUpload]);

  const options: PickerOption[] = [
    {
      icon: 'camera-outline',
      label: $t('ATTACHMENTS.TAKE_PHOTO'),
      onPress: handleTakePhoto,
    },
    {
      icon: 'image-multiple-outline',
      label: $t('ATTACHMENTS.CHOOSE_IMAGE'),
      onPress: handleChooseImage,
    },
    {
      icon: 'radiobox-marked',
      label: $t('ATTACHMENTS.UPLOAD_XRAY'),
      onPress: handleUploadXray,
    },
    {
      icon: 'file-pdf-box',
      label: $t('ATTACHMENTS.UPLOAD_PDF'),
      onPress: handleUploadPdf,
    },
  ];

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={$t('ATTACHMENTS.ADD_ATTACHMENT')}
      maxHeightRatio={0.55}>
      {isUploading ? (
        <View className="items-center justify-center py-10 px-6">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="text-sm font-ibm-medium mt-4" style={{ color: theme.text }}>
            {$t('ATTACHMENTS.UPLOADING')}
            {uploadProgress !== null ? ` ${uploadProgress}%` : ''}
          </Text>
        </View>
      ) : (
        <View className="px-4 pb-4">
          {options.map(option => (
            <TouchableOpacity
              key={option.label}
              activeOpacity={0.7}
              onPress={option.onPress}
              style={[styles.option, { borderBottomColor: theme.border }]}>
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: theme.surface }}>
                <MaterialDesignIcons name={option.icon} size={22} color={theme.primary} />
              </View>
              <Text className="text-base font-ibm-medium" style={{ color: theme.text }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
