import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { checkIsUserLoggedIn } from "../commons";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "../components/header/Header";
import Footer from "../components/layout/Footer";

const AuthContext = createContext<{ isLoggedIn: boolean; setIsLoggedIn: Dispatch<SetStateAction<boolean>> }>({} as any);
export { AuthContext };

function App({ Component, pageProps }: AppProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const res = checkIsUserLoggedIn();
    setIsLoggedIn(res);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
    </AuthContext.Provider>
  );
}

export default App;
