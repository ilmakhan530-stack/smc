"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
export default function LogoutButton(){
 const router=useRouter();
 return <button className="btn" onClick={async()=>{await signOut(auth); router.replace("/login");}}>Logout</button>;
}
