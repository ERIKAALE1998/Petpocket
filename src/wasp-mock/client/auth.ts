import { useState, useEffect } from "react";
import { mockStore } from "../store";

export function useAuth() {
  const [user, setUser] = useState(mockStore.getUser());

  useEffect(() => {
    const unsubscribe = mockStore.subscribe(() => {
      setUser(mockStore.getUser());
    });
    return unsubscribe;
  }, []);

  return {
    data: user,
    isLoading: false,
    error: null,
  };
}

export const logout = async () => {
  console.log("Logged out");
};
