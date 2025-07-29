import { useAuth } from "@/contexts/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAdm() {
  const { userData } = useAuth();
  return userData?.adm;
}
