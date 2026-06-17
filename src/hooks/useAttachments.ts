import { useState, useCallback, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { Attachment, UploadAttachmentPayload } from '@/api/services/attachmentService/attachmentInterface';
import { attachmentService } from '@/api/services/attachmentService/attachmentService';

interface UseAttachmentsResult {
  attachments: Attachment[];
  isLoading: boolean;
  hasFetched: boolean;
  uploadProgress: number | null; // null = not uploading, 0–100 = uploading
  isUploading: boolean;
  refresh: () => Promise<void>;
  uploadAttachment: (payload: Omit<UploadAttachmentPayload, 'onProgress'>) => Promise<void>;
  deleteAttachment: (attachment: Attachment) => Promise<void>;
}

/**
 * Manages attachments for a single patient.
 * Mirrors the shape of useVisits — loading, hasFetched, refresh.
 */
export function useAttachments(patientId: string): UseAttachmentsResult {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isFetchingRef = useRef(false);

  const fetchAttachments = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const result = await attachmentService.getAttachmentsForPatientRequest(patientId);
      setAttachments(result);
      setHasFetched(true);
    } catch (_error) {
      // Silently handle — UI uses hasFetched to determine empty vs loading state
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [patientId]);

  const refresh = useCallback(async () => {
    await fetchAttachments();
  }, [fetchAttachments]);

  const uploadAttachment = useCallback(
    async (payload: Omit<UploadAttachmentPayload, 'onProgress'>) => {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const newAttachment = await attachmentService.uploadAttachmentRequest({
          ...payload,
          onProgress: progress => setUploadProgress(progress),
        });
        setAttachments(prev => [newAttachment, ...prev]);
        Toast.show({ type: 'success', text1: $t('ATTACHMENTS.UPLOAD_SUCCESS') });
      } catch (_error) {
        Toast.show({ type: 'error', text1: $t('ATTACHMENTS.UPLOAD_ERROR') });
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [patientId],
  );

  const deleteAttachment = useCallback(
    async (attachment: Attachment) => {
      try {
        await attachmentService.deleteAttachmentRequest(patientId, attachment);
        setAttachments(prev => prev.filter(a => a.id !== attachment.id));
        Toast.show({ type: 'success', text1: $t('ATTACHMENTS.DELETE_SUCCESS') });
      } catch (_error) {
        Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
      }
    },
    [patientId],
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    attachments,
    isLoading,
    hasFetched,
    uploadProgress,
    isUploading,
    refresh,
    uploadAttachment,
    deleteAttachment,
  };
}
