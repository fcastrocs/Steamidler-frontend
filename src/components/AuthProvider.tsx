import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { request } from "../commons";

type AuthContextType = { isLoggedIn: boolean; setLoggedIn: Dispatch<SetStateAction<boolean>> };
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function AuthProvider(props: { children: JSX.Element }) {
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function verifyAuth() {
      try {
        await request("GET", "user/verifyauth");
        setLoggedIn(true);
      } catch (error) {
        setLoggedIn(false);
        return;
      }
    }

    verifyAuth();
  }, []);

  return <AuthContext.Provider value={{ isLoggedIn, setLoggedIn }}>{props.children}</AuthContext.Provider>;
}

export default AuthProvider;
