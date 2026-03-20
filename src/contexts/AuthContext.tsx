import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getDownloadURL, ref } from "firebase/storage";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, storage } from "../firebase/config";

import { collection, doc, getDocs, getDoc, query, where } from "firebase/firestore";

import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { capitalizeWords } from "@/utils/stringUtils";

interface UserData {
  adm: boolean;
  nivel: "professor" | "supervisor" | "adm";
  email: string;
  name: string;
  pfpUrl?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string): Promise<boolean> => {
    // Try direct UID lookup first; fallback to authUid field for name-only users upgraded with email
    const directDoc = await getDoc(doc(db, "users", uid));
    let docData: ReturnType<typeof directDoc.data> | undefined;
    if (directDoc.exists()) {
      docData = directDoc.data();
    } else {
      const q = query(collection(db, "users"), where("authUid", "==", uid));
      const qs = await getDocs(q);
      if (!qs.empty) docData = qs.docs[0].data();
    }
    if (docData) {
      const data = docData as {
        adm?: boolean;
        name: string;
        email: string;
        active?: boolean;
        pfpPath?: string;
        nivel?: "professor" | "supervisor" | "adm";
      };
      if (data.active === false) {
        // Usuário desativado no Firestore
        setUserData(null);
        return false;
      }
      let pfpUrl = "";
      if (data.pfpPath) {
        try {
          pfpUrl = await getDownloadURL(ref(storage, data.pfpPath));
        } catch (e) {
          pfpUrl = ""; // Se não encontrar a imagem, deixa vazio
        }
      }
      setUserData({
        adm: data.adm ?? data.nivel === "adm",
        nivel: data.nivel ?? "professor",
        name: capitalizeWords(data.name),
        email: data.email,
        pfpUrl,
      });
      return true;
    } else  {
      setUserData(null);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        const isActive = await fetchUserData(firebaseUser.uid);
        if (!isActive) {
          // Se o usuário estiver desativado, faz signOut e limpa estado
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const isActive = await fetchUserData(cred.user.uid);
      if (!isActive) {
        await signOut(auth);
        setUser(null);
        throw new Error(
          "Seu usuário está desativado. Entre em contato com a coordenação.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
