import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import type { SupportRequest } from '../types';

interface AppContextData {
  requests: SupportRequest[];
  addRequest: (request: Omit<SupportRequest, 'id' | 'codigo'>) => Promise<void>;
  updateRequest: (id: string, request: Partial<SupportRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

const COLLECTION = 'requests';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<SupportRequest[]>(() => {
    const stored = localStorage.getItem('@GerenciadorN2:requests');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  });

  // Sync from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('codigo'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: SupportRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SupportRequest);
      });
      setRequests(list);
      localStorage.setItem('@GerenciadorN2:requests', JSON.stringify(list));
    });
    return unsub;
  }, []);

  const getNextCodigo = async () => {
    const maxCodigo = requests.reduce(
      (max, r) => Math.max(max, parseInt(r.codigo || '0')),
      1000
    );
    return String(maxCodigo + 1);
  };

  const addRequest = async (newRequest: Omit<SupportRequest, 'id' | 'codigo'>) => {
    const codigo = await getNextCodigo();
    await addDoc(collection(db, COLLECTION), { ...newRequest, codigo });
  };

  const updateRequest = async (id: string, updatedFields: Partial<SupportRequest>) => {
    await updateDoc(doc(db, COLLECTION, id), updatedFields);
  };

  const deleteRequest = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  };

  return (
    <AppContext.Provider value={{ requests, addRequest, updateRequest, deleteRequest }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
