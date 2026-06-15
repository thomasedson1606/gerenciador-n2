import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SupportRequest } from '../types';

interface AppContextData {
  requests: SupportRequest[];
  addRequest: (request: Omit<SupportRequest, 'id' | 'codigo'>) => void;
  updateRequest: (id: string, request: Partial<SupportRequest>) => void;
  deleteRequest: (id: string) => void;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<SupportRequest[]>(() => {
    const stored = localStorage.getItem('@GerenciadorN2:requests');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('@GerenciadorN2:requests', JSON.stringify(requests));
  }, [requests]);

  const addRequest = (newRequest: Omit<SupportRequest, 'id' | 'codigo'>) => {
    const nextCodigo = (requests.length > 0 ? Math.max(...requests.map(r => parseInt(r.codigo || '0'))) + 1 : 1000).toString();
    const request: SupportRequest = {
      ...newRequest,
      id: crypto.randomUUID(),
      codigo: nextCodigo,
    };
    setRequests([...requests, request]);
  };

  const updateRequest = (id: string, updatedFields: Partial<SupportRequest>) => {
    setRequests(requests.map(req => (req.id === id ? { ...req, ...updatedFields } : req)));
  };

  const deleteRequest = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
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
