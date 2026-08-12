import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CATEGORIES_COLLECTION = 'categories';

export interface CustomCategory {
  id: string;
  name: string;
  createdAt: number;
}

const DEFAULT_CATEGORIES = ['Struja', 'Voda', 'Plin', 'Smeće', 'Pričuva', 'Internet/TV', 'Mobitel', 'Ostalo'];

export const getCategories = async (): Promise<CustomCategory[]> => {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Initialize default categories
      const initialized: CustomCategory[] = [];
      let time = Date.now();
      for (const catName of DEFAULT_CATEGORIES) {
        const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
          name: catName,
          createdAt: time++,
        });
        initialized.push({ id: docRef.id, name: catName, createdAt: time });
      }
      return initialized;
    }
    
    const categories: CustomCategory[] = [];
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, name: doc.data().name, createdAt: doc.data().createdAt });
    });
    return categories;
  } catch (error) {
    console.error("Error getting categories: ", error);
    throw error;
  }
};

export const addCategory = async (name: string): Promise<CustomCategory> => {
  try {
    const data = { name, createdAt: Date.now() };
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error adding category: ", error);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting category: ", error);
    throw error;
  }
};
