import React from "react";
import styles from "../../styles/Header.module.css";
import { useContext } from "react";
import { AuthContext } from "../../pages/_app";

import RegisterModal from "./Register";
import LoginModal from "./Login";
import Logout from "./Logout";

function Header() {
  return (
    <header className={styles.header}>
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
      <div className={styles.home}>
        <img className={styles.logo} src="android-chrome-192x192.png" alt="icon" />
        <div>Steamidler.com</div>
      </div>
    </div>
  );
}

export default Header;
