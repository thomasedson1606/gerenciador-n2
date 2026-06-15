import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAwlKkqYKcyoq4K5BXmslglf54W-MpMJrw',
  authDomain: 'gerenciadorn2.firebaseapp.com',
  projectId: 'gerenciadorn2',
  storageBucket: 'gerenciadorn2.firebasestorage.app',
  messagingSenderId: '411548822709',
  appId: '1:411548822709:web:227bcf2fd6730d7653a2fc',
  measurementId: 'G-4Y095LQ2BK'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
