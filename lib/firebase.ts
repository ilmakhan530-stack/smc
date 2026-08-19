import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { initializeApp as initializeSecondaryApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);


export async function createManagedUser(
  email: string,
  password: string,
  data: Record<string, unknown> = {}
) {
  const secondaryName = `smc-user-create-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const secondaryApp = initializeSecondaryApp(firebaseConfig, secondaryName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim(),
      password
    );

    await setDoc(doc(db, "users", credential.user.uid), {
      email: credential.user.email || email.trim(),
      enabled: true,
      ...data,
      createdAt: Date.now(),
    }, { merge: true });

    await signOut(secondaryAuth);
    return credential.user;
  } catch (error) {
    try { await signOut(secondaryAuth); } catch {}
    throw error;
  }
}
