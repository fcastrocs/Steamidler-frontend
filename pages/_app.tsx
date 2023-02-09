import "../styles/globals.css";
import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { request } from "../commons";

function App({ Component, pageProps }: AppProps) {
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function verifyAuth() {
      try {
        await request("GET", "user/verifyauth");
        setLoggedIn(true);
      } catch (error) {
        setLoggedIn(false);
      }
    }

    if (!isLoggedIn) {
      verifyAuth();
    }
  }, [isLoggedIn]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn} />
      <main>
        <Component setLoggedIn={setLoggedIn} isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </>
  );
}

export default App;
