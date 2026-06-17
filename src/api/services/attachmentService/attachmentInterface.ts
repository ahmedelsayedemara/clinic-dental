import { FIRESTORE_COLLECTIONS } from '@/constants/firestoreCollections';

export const ATTACHMENT_SUBCOLLECTION = FIRESTORE_COLLECTIONS.ATTACHMENTS; // 'attachments'

export type AttachmentType = 'image' | 'xray' | 'pdf';

export interface Attachment {
  id: string;
  patientId: string;
  type: AttachmentType;
  fileName: string;
  storagePath: string; // gs:// path — e.g., patients/{patientId}/attachments/{uuid}_{fileName}
  downloadUrl: string; // HTTPS download URL
  mimeType: string;
  sizeBytes: number;
  createdAt: string; // ISO-8601
  createdBy: string; // Firebase Auth UID
}

export interface UploadAttachmentPayload {
  patientId: string;
  type: AttachmentType;
  localUri: string; // file:// URI from picker
  fileName: string;
  mimeType: string;
  onProgress?: (progress: number) => void; // 0–100
}
