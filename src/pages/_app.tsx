import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";

import Header from "../components/Header";
import Footer from "../components/Footer";
import WebSocketProvider from "../components/WebSocketProvider";
import AuthProvider from "../components/AuthProvider";
import ToastProvider from "../components/ToastProvider";

function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <WebSocketProvider>
          <Header />
          <main>
            <Component />
          </main>
          <Footer />
        </WebSocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
