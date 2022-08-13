import "antd/dist/antd.css";
import "../styles/globals.css";

import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";

import Home from "./Home";
import MiniHeader from "../components/Header/Header";
import Footer from "../components/Layout/Footer";
import { checkIsUserLoggedIn } from "../commons";

const AuthContext = createContext<{ isLoggedIn: boolean; setIsLoggedIn: Dispatch<SetStateAction<boolean>> }>({} as any);
export { AuthContext };

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const res = checkIsUserLoggedIn();
    setIsLoggedIn(res);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <MiniHeader />
      <main>
        <Home />
      </main>
      <Footer />
    </AuthContext.Provider>
  );
}
