import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from '@react-native-firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/constants/firestoreCollections';
import { Visit, AddVisitPayload, PaymentStatus, VISIT_COLLECTION } from './visitInterface';

/**
 * Derive paymentStatus from amountTotal and amountPaid.
 * Written to Firestore so the UI can query/display it without client-side math.
 */
function derivePaymentStatus(total?: number, paid?: number): PaymentStatus {
  if (!total || total <= 0) return 'unpaid';
  if (!paid || paid <= 0) return 'unpaid';
  if (paid >= total) return 'paid';
  return 'partial';
}

function visitsColRef(patientId: string) {
  const db = getFirestore();
  return collection(db, FIRESTORE_COLLECTIONS.PATIENTS, patientId, VISIT_COLLECTION);
}

function visitDocRef(patientId: string, visitId: string) {
  const db = getFirestore();
  return doc(db, FIRESTORE_COLLECTIONS.PATIENTS, patientId, VISIT_COLLECTION, visitId);
}

export const visitService = {
  getVisitsForPatientRequest: async (patientId: string): Promise<Visit[]> => {
    const colRef = visitsColRef(patientId);
    const q = query(colRef, orderBy('visitDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Visit),
    );
  },

  getVisitByIdRequest: async (patientId: string, visitId: string): Promise<Visit | null> => {
    const docRef = visitDocRef(patientId, visitId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Visit;
  },

  postAddVisitRequest: async (patientId: string, data: AddVisitPayload): Promise<string> => {
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? '';

    const amountDue =
      data.amountTotal !== undefined && data.amountPaid !== undefined
        ? Math.max(0, data.amountTotal - data.amountPaid)
        : undefined;

    const paymentStatus = derivePaymentStatus(data.amountTotal, data.amountPaid);

    const payload = {
      ...data,
      patientId,
      amountDue,
      paymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: uid,
    };

    const docRef = await addDoc(visitsColRef(patientId), payload);
    return docRef.id;
  },

  putUpdateVisitRequest: async (
    patientId: string,
    visitId: string,
    data: Partial<AddVisitPayload>,
  ): Promise<void> => {
    const docRef = visitDocRef(patientId, visitId);

    // Re-read current values to compute amountDue correctly when only one payment
    // field is supplied in the partial update.
    const currentSnap = await getDoc(docRef);
    const current = currentSnap.exists() ? (currentSnap.data() as Visit) : null;

    const mergedTotal = data.amountTotal ?? current?.amountTotal;
    const mergedPaid = data.amountPaid ?? current?.amountPaid;
    const amountDue =
      mergedTotal !== undefined && mergedPaid !== undefined
        ? Math.max(0, mergedTotal - mergedPaid)
        : undefined;

    const paymentStatus = derivePaymentStatus(mergedTotal, mergedPaid);

    await updateDoc(docRef, {
      ...data,
      amountDue,
      paymentStatus,
      updatedAt: new Date().toISOString(),
    });
  },

  deleteVisitRequest: async (patientId: string, visitId: string): Promise<void> => {
    await deleteDoc(visitDocRef(patientId, visitId));
  },
};
