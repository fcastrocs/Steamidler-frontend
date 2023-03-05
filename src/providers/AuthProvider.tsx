import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { request } from "../commons";
import { ToastContext } from "./ToastProvider";

type AuthContextType = { isLoggedIn: boolean; setLoggedIn: Dispatch<SetStateAction<boolean>> };
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function AuthProvider(props: { children: JSX.Element }) {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const addToast = useContext(ToastContext);

  useEffect(() => {
    async function verifyAuth() {
      try {
        await request("GET", "user/verifyauth");
        setLoggedIn(true);
      } catch (error) {
        const response = error as Response;
        if (response.status !== 401) {
          addToast("The site is currently offline.");
          setLoggedIn(false);
        }
      }
    }

    verifyAuth();
  }, []);

  return <AuthContext.Provider value={{ isLoggedIn, setLoggedIn }}>{props.children}</AuthContext.Provider>;
}

export default AuthProvider;
