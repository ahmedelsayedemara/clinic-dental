import React, { useCallback } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import CachedImage from '@/components/global/CachedImage';
import { useTheme } from '@/theme/ThemeProvider';
import { Attachment } from '@/api/services/attachmentService/attachmentInterface';

interface AttachmentTileProps {
  attachment: Attachment;
  onPress: (attachment: Attachment) => void;
  onDelete: (attachment: Attachment) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTypeIcon(type: Attachment['type']): any {
  switch (type) {
    case 'xray':
      return 'radiobox-marked';
    case 'pdf':
      return 'file-pdf-box';
    default:
      return 'image-outline';
  }
}

export default function AttachmentTile({ attachment, onPress, onDelete }: AttachmentTileProps) {
  const { theme } = useTheme();
  const isImage = attachment.type === 'image' || attachment.type === 'xray';

  const handleLongPress = useCallback(() => {
    Alert.alert($t('GLOBAL.CONFIRM_DELETE'), $t('ATTACHMENTS.DELETE_CONFIRM'), [
      { text: $t('COMMON.CANCEL'), style: 'cancel' },
      {
        text: $t('COMMON.DELETE'),
        style: 'destructive',
        onPress: () => onDelete(attachment),
      },
    ]);
  }, [attachment, onDelete]);

  const handlePress = useCallback(() => {
    onPress(attachment);
  }, [attachment, onPress]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[styles.tile, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Thumbnail / icon */}
      <View style={[styles.thumbnail, { backgroundColor: theme.surface }]}>
        {isImage && attachment.downloadUrl ? (
          <CachedImage
            uri={attachment.downloadUrl}
            showLoader
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <MaterialDesignIcons
            name={getTypeIcon(attachment.type)}
            size={32}
            color={attachment.type === 'pdf' ? theme.error : theme.primary}
          />
        )}
      </View>

      {/* Name + size */}
      <Text
        className="text-xs font-ibm-medium mt-1"
        style={{ color: theme.text }}
        numberOfLines={2}>
        {attachment.fileName}
      </Text>
      <Text className="text-xs font-ibm-regular" style={{ color: theme.muted }}>
        {formatBytes(attachment.sizeBytes)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '30%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    margin: '1.5%',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
});
