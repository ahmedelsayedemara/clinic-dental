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
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
} from '@react-native-firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import {
  PATIENT_COLLECTION,
  Patient,
  GetPatientsParams,
  AddPatientPayload,
} from './patientInterface';

export interface GetPatientsResult {
  patients: Patient[];
  lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
}

/**
 * Build prefix search tokens from name, mobile, and fileNumber for
 * Firestore array-contains search.
 */
export function buildPatientSearchKeywords(data: {
  fullName: string;
  mobile: string;
  fileNumber: string;
}): string[] {
  const tokens = new Set<string>();

  // Name: word-prefix tokens
  const normalized = data.fullName.toLowerCase().trim();
  tokens.add(normalized);

  const words = normalized.split(/\s+/);
  for (const word of words) {
    for (let i = 1; i <= word.length; i++) {
      tokens.add(word.substring(0, i));
    }
  }

  // Full-name prefix tokens
  for (let i = 1; i <= normalized.length; i++) {
    tokens.add(normalized.substring(0, i));
  }

  // Mobile: raw string
  if (data.mobile) {
    tokens.add(data.mobile.trim());
  }

  // File number: lowercased
  if (data.fileNumber) {
    tokens.add(data.fileNumber.toLowerCase().trim());
  }

  return Array.from(tokens);
}

export const patientService = {
  getAllPatientsRequest: async (
    params: GetPatientsParams & {
      lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
    },
  ): Promise<GetPatientsResult> => {
    const db = getFirestore();
    const colRef = collection(db, PATIENT_COLLECTION);
    const pageLimit = params.limit ?? 20;

    if (params.searchQuery) {
      // Search mode: use array-contains + nameLower sort; no cursor pagination
      const token = params.searchQuery.toLowerCase().trim();
      const q = query(
        colRef,
        where('searchKeywords', 'array-contains', token),
        orderBy('nameLower'),
        limit(pageLimit),
      );
      const snapshot = await getDocs(q);
      const patients = snapshot.docs.map(
        (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Patient),
      );
      return { patients, lastDoc: null };
    }

    // Default: ordered by createdAt desc with cursor pagination
    let q = query(colRef, orderBy('createdAt', 'desc'), limit(pageLimit));

    if (params.lastDoc) {
      q = query(colRef, orderBy('createdAt', 'desc'), startAfter(params.lastDoc), limit(pageLimit));
    }

    const snapshot = await getDocs(q);
    const patients = snapshot.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Patient),
    );
    const lastDocSnapshot =
      snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { patients, lastDoc: lastDocSnapshot };
  },

  getPatientByIdRequest: async (id: string): Promise<Patient | null> => {
    const db = getFirestore();
    const docRef = doc(db, PATIENT_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Patient;
  },

  postAddPatientRequest: async (data: AddPatientPayload): Promise<string> => {
    const db = getFirestore();
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? '';

    const nameLower = data.fullName.toLowerCase().trim();
    const searchKeywords = buildPatientSearchKeywords({
      fullName: data.fullName,
      mobile: data.mobile,
      fileNumber: data.fileNumber,
    });

    const payload = {
      ...data,
      nameLower,
      searchKeywords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: uid,
    };

    const docRef = await addDoc(collection(db, PATIENT_COLLECTION), payload);
    return docRef.id;
  },

  putUpdatePatientRequest: async (id: string, data: Partial<AddPatientPayload>): Promise<void> => {
    const db = getFirestore();
    const docRef = doc(db, PATIENT_COLLECTION, id);

    const updates: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // If any search-relevant field changed, rebuild full searchKeywords
    if (data.fullName !== undefined || data.mobile !== undefined || data.fileNumber !== undefined) {
      // Read current doc to fill in fields not being updated
      const currentSnap = await getDoc(docRef);
      const current = currentSnap.exists()
        ? ({ id: currentSnap.id, ...currentSnap.data() } as Patient)
        : null;

      const mergedFullName = data.fullName ?? current?.fullName ?? '';
      const mergedMobile = data.mobile ?? current?.mobile ?? '';
      const mergedFileNumber = data.fileNumber ?? current?.fileNumber ?? '';

      updates.nameLower = mergedFullName.toLowerCase().trim();
      updates.searchKeywords = buildPatientSearchKeywords({
        fullName: mergedFullName,
        mobile: mergedMobile,
        fileNumber: mergedFileNumber,
      });
    }

    await updateDoc(docRef, updates);
  },

  deletePatientRequest: async (id: string): Promise<void> => {
    const db = getFirestore();
    await deleteDoc(doc(db, PATIENT_COLLECTION, id));
  },

  searchPatientsRequest: async (searchQuery: string, maxResults = 20): Promise<Patient[]> => {
    const db = getFirestore();
    const colRef = collection(db, PATIENT_COLLECTION);
    const token = searchQuery.toLowerCase().trim();

    const q = query(
      colRef,
      where('searchKeywords', 'array-contains', token),
      orderBy('nameLower'),
      limit(maxResults),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Patient),
    );
  },

  /**
   * Returns the total count of patient documents using Firestore count aggregation.
   * This reads a single aggregation result regardless of collection size — O(1) cost,
   * scalable to 50k+ records without fetching any documents.
   */
  getPatientsCountRequest: async (): Promise<number> => {
    const db = getFirestore();
    const colRef = collection(db, PATIENT_COLLECTION);
    const snapshot = await getCountFromServer(colRef);
    return snapshot.data().count;
  },
};
