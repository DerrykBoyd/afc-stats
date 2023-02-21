import { useQuery } from "@tanstack/react-query";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../App";

export interface DbUser {
  email: string;
  name: string;
  profileURL: string;
  uid: string;
}

async function fetchUser(user: User): Promise<DbUser> {
  const localUser = localStorage.getItem("dbUser");
  if (localUser && localUser !== "null" && localUser !== "undefined") {
    return JSON.parse(localUser);
  }
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as DbUser;
  } else {
    console.log("Adding New User to DB");
    const newDbUser: DbUser = {
      email: user.email || "",
      name: user.displayName || "",
      profileURL: user.photoURL || "",
      uid: user.uid,
    };
    await setDoc(docRef, newDbUser);
    return newDbUser;
  }
}

export function useFetchUser(user: User | null) {
  return useQuery({
    queryKey: ["user", user?.uid],
    enabled: !!user,
    staleTime: Infinity,
    queryFn: () => fetchUser(user as User),
  });
}
