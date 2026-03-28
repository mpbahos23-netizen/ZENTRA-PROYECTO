import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Guarda un mensaje en el historial persistente de Firestore.
 */
export async function saveMessage(userId: number, role: 'user' | 'assistant' | 'system', content: string) {
  const collectionRef = collection(db, `users/${userId}/messages`);
  await addDoc(collectionRef, {
    role,
    content,
    timestamp: serverTimestamp()
  });
}

/**
 * Recupera el historial reciente de la conversación (últimos N mensajes).
 */
export async function getRecentHistory(userId: number, limits: number = 20) {
  const collectionRef = collection(db, `users/${userId}/messages`);
  const q = query(collectionRef, orderBy('timestamp', 'desc'), limit(limits));
  
  const querySnapshot = await getDocs(q);
  const rows = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { role: data.role, content: data.content };
  });
  
  // Lo invertimos para tener el orden crono lógico (el más viejo primero)
  return rows.reverse();
}

/**
 * Guarda un recuerdo clave-valor en Firestore.
 */
export async function saveMemory(userId: number, key: string, value: string) {
  const docRef = doc(db, `users/${userId}/memories`, key);
  await setDoc(docRef, {
    key,
    value,
    updated_at: serverTimestamp()
  }, { merge: true }); // actua como UPSERT
}

/**
 * Obtener todos los recuerdos del usuario desde Firestore.
 */
export async function getAllMemories(userId: number): Promise<Record<string, string>> {
  const collectionRef = collection(db, `users/${userId}/memories`);
  const querySnapshot = await getDocs(collectionRef);
  
  const memories: Record<string, string> = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    memories[data.key] = data.value;
  });
  
  return memories;
}

export default db;
