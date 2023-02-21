import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { auth } from "../App";
import { useGameStore } from "../store/store";

export function useAuthUser() {
  const [authUser, setAuthUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const clearStorage = useGameStore.persist.clearStorage;
  // listen for auth state changes and site updates
  useEffect(() => {
    // show toast for successful update
    if (localStorage.getItem("serviceWorkerUpdated") === "true") {
      toast.success("Site Updated");
      localStorage.setItem("serviceWorkerUpdated", "false");
    }
    // listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // user signed in
        setAuthUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        // user signed out
        localStorage.removeItem("user");
        localStorage.removeItem("dbUser");
        setAuthUser(user);
        clearStorage();
      }
    });
    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  return authUser;
}
