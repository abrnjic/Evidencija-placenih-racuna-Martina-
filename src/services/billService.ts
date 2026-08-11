import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Bill } from '../types';

const BILLS_COLLECTION = 'bills';

export const addBill = async (bill: Omit<Bill, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, BILLS_COLLECTION), {
      ...bill,
      createdAt: Date.now(),
    });
    return { id: docRef.id, ...bill };
  } catch (error) {
    console.error("Error adding bill: ", error);
    throw error;
  }
};

export const getBills = async (): Promise<Bill[]> => {
  try {
    const q = query(collection(db, BILLS_COLLECTION), orderBy('datePaid', 'desc'));
    const querySnapshot = await getDocs(q);
    const bills: Bill[] = [];
    querySnapshot.forEach((doc) => {
      bills.push({ id: doc.id, ...doc.data() } as Bill);
    });
    return bills;
  } catch (error) {
    console.error("Error getting bills: ", error);
    throw error;
  }
};

export const deleteBill = async (id: string) => {
  try {
    await deleteDoc(doc(db, BILLS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting bill: ", error);
    throw error;
  }
};

export const updateBill = async (id: string, updatedData: Partial<Bill>) => {
  try {
    const billRef = doc(db, BILLS_COLLECTION, id);
    await updateDoc(billRef, updatedData);
  } catch (error) {
    console.error("Error updating bill: ", error);
    throw error;
  }
};
