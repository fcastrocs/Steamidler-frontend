import React from "react";
import styles from "../../styles/Header.module.css";
import { useContext } from "react";
import { AuthContext } from "../../pages/_app";

import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";
import Logout from "./Logout";
import Image from "next/image";

function Header() {
  return (
    <header>
      <TopHeader />
      <BottomHeader />
    </header>
  );
}

function TopHeader() {
  const value = useContext(AuthContext);
  return (
    <div className={styles.topHeader}>
      {value.isLoggedIn && <Logout />}
      {!value?.isLoggedIn && <LoginModal />}
      {!value?.isLoggedIn && <RegisterModal />}
    </div>
  );
}

function BottomHeader() {
  return (
    <div className={styles.bottomHeader}>
      <div className={styles.logoBox}>
        <Image className={styles.logo} src="/android-chrome-192x192.png" alt="icon" width={192} height={192} />
        <div>Steamidler.com</div>
      </div>
    </div>
  );
}

export default Header;
