import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';
import { getAuth } from '@react-native-firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/constants/firestoreCollections';
import {
  Attachment,
  ATTACHMENT_SUBCOLLECTION,
  UploadAttachmentPayload,
} from './attachmentInterface';

/**
 * Returns a reference to the attachments subcollection for a patient.
 * Path: patients/{patientId}/attachments
 */
function attachmentsColRef(patientId: string) {
  const db = getFirestore();
  return collection(db, FIRESTORE_COLLECTIONS.PATIENTS, patientId, ATTACHMENT_SUBCOLLECTION);
}

/**
 * Generates a UUID-like string for unique file naming.
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export const attachmentService = {
  /**
   * Fetch all attachments for a patient, ordered newest first.
   */
  getAttachmentsForPatientRequest: async (patientId: string): Promise<Attachment[]> => {
    const colRef = attachmentsColRef(patientId);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }) as Attachment,
    );
  },

  /**
   * Upload a file to Firebase Storage, then write metadata to Firestore.
   * Storage path: patients/{patientId}/attachments/{uuid}_{fileName}
   * Reports upload progress via onProgress callback (0–100).
   */
  uploadAttachmentRequest: async (payload: UploadAttachmentPayload): Promise<Attachment> => {
    const { patientId, type, localUri, fileName, mimeType, onProgress } = payload;
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? '';

    // Build unique storage path
    const uniqueId = generateId();
    const storagePath = `patients/${patientId}/attachments/${uniqueId}_${fileName}`;

    const storage = getStorage();
    const storageRef = storage.ref(storagePath);

    // Upload file with progress
    const task = storageRef.putFile(localUri, { contentType: mimeType });

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        snapshot => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          onProgress?.(progress);
        },
        error => reject(error),
        () => resolve(),
      );
    });

    // Get public download URL
    const downloadUrl = await storageRef.getDownloadURL();

    // Get file size from storage metadata
    const metadata = await storageRef.getMetadata();
    const sizeBytes = metadata.size ?? 0;

    // Write metadata doc to Firestore subcollection
    const now = new Date().toISOString();
    const docPayload = {
      patientId,
      type,
      fileName,
      storagePath,
      downloadUrl,
      mimeType,
      sizeBytes,
      createdAt: now,
      createdBy: uid,
    };

    const colRef = attachmentsColRef(patientId);
    const docRef = await addDoc(colRef, docPayload);

    return { id: docRef.id, ...docPayload };
  },

  /**
   * Delete an attachment: removes the Storage object and then the Firestore metadata doc.
   */
  deleteAttachmentRequest: async (patientId: string, attachment: Attachment): Promise<void> => {
    const storage = getStorage();

    // Delete from Storage
    try {
      await storage.ref(attachment.storagePath).delete();
    } catch (_storageError) {
      // If the storage object was already deleted, continue to remove the Firestore doc
    }

    // Delete Firestore metadata doc
    const db = getFirestore();
    const docRef = doc(
      db,
      FIRESTORE_COLLECTIONS.PATIENTS,
      patientId,
      ATTACHMENT_SUBCOLLECTION,
      attachment.id,
    );
    await deleteDoc(docRef);
  },
};
