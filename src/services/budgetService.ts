import { collection, addDoc, getDocs, deleteDoc, doc, query, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const BUDGETS_COLLECTION = 'budgets';

export interface Budget {
  categoryId: string;
  categoryName: string;
  limit: number;
}

export const getBudgets = async (): Promise<Record<string, Budget>> => {
  try {
    const snapshot = await getDocs(collection(db, BUDGETS_COLLECTION));
    const budgets: Record<string, Budget> = {};
    snapshot.forEach((doc) => {
      const data = doc.data() as Budget;
      budgets[data.categoryName] = data; // store by name for easy lookup
    });
    return budgets;
  } catch (error) {
    console.error("Error getting budgets: ", error);
    throw error;
  }
};

export const setBudget = async (categoryName: string, limit: number): Promise<void> => {
  try {
    // using categoryName as document ID for simplicity since names are unique per user usually
    const docRef = doc(db, BUDGETS_COLLECTION, categoryName);
    await setDoc(docRef, {
      categoryId: categoryName,
      categoryName,
      limit,
    });
  } catch (error) {
    console.error("Error setting budget: ", error);
    throw error;
  }
};

export const deleteBudget = async (categoryName: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, BUDGETS_COLLECTION, categoryName));
  } catch (error) {
    console.error("Error deleting budget: ", error);
    throw error;
  }
};
