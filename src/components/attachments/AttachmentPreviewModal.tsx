import React, { useCallback } from 'react';
import {
  Dimensions,
  Linking,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import CachedImage from '@/components/global/CachedImage';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { Attachment } from '@/api/services/attachmentService/attachmentInterface';

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AttachmentPreviewModal({
  attachment,
  onClose,
}: AttachmentPreviewModalProps) {
  const { theme } = useTheme();
  const isVisible = attachment !== null;
  const isImage = attachment?.type === 'image' || attachment?.type === 'xray';

  const handleOpenExternal = useCallback(() => {
    if (attachment?.downloadUrl) {
      Linking.openURL(attachment.downloadUrl);
    }
  }, [attachment]);

  if (!isVisible || !attachment) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
        {/* Header */}
        <View style={[styles.header]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <MaterialDesignIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text
            className="text-sm font-ibm-medium flex-1 mx-3"
            style={{ color: '#FFFFFF' }}
            numberOfLines={1}>
            {attachment.fileName}
          </Text>
          {!isImage && (
            <TouchableOpacity
              onPress={handleOpenExternal}
              style={styles.openBtn}
              activeOpacity={0.7}>
              <MaterialDesignIcons name="open-in-new" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {isImage ? (
          <View style={styles.imageContainer}>
            <CachedImage
              uri={attachment.downloadUrl}
              showLoader
              loaderColor={theme.primary}
              loaderBackgroundColor="#000000"
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.pdfPlaceholder}>
            <MaterialDesignIcons name="file-pdf-box" size={80} color={theme.error} />
            <Text className="text-base font-ibm-medium mt-4 text-center" style={{ color: '#FFFFFF' }}>
              {attachment.fileName}
            </Text>
            <TouchableOpacity
              style={[styles.openExternalBtn, { backgroundColor: theme.primary }]}
              onPress={handleOpenExternal}
              activeOpacity={0.8}>
              <Text className="text-sm font-ibm-bold" style={{ color: '#FFFFFF' }}>
                {$t('ATTACHMENTS.OPEN_EXTERNAL')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 4,
  },
  openBtn: {
    padding: 4,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  pdfPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  openExternalBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
