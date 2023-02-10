import React, { Dispatch, SetStateAction, useContext } from "react";
import styles from "../../styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { logout } from "../../commons";
import { useRouter } from "next/router";
import { AuthContext } from "../AuthProvider";

function Header() {
  return (
    <header>
      <TopHeader />
      <BottomHeader />
    </header>
  );
}

function TopHeader() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  return (
    <div className={styles.topHeader}>
      {auth.isLoggedIn && (
        <div
          className={styles.topHeaderBtn}
          onClick={() => {
            logout(auth.setLoggedIn);
            router.push("/");
          }}
        >
          Logout
        </div>
      )}
      {!auth.isLoggedIn && (
        <Link className={styles.topHeaderBtn} href="/login">
          Login
        </Link>
      )}
      {!auth.isLoggedIn && (
        <Link className={styles.topHeaderBtn} href="/register">
          Regiister
        </Link>
      )}
    </div>
  );
}

function BottomHeader() {
  return (
    <div className={styles.bottomHeader}>
      <div className={styles.logoBox}>
        <Image className={styles.logo} src="/android-chrome-192x192.png" alt="icon" width={192} height={192} />
        <Link href="/">Steamidler.com</Link>
        <Link href="/dashboard">dashboard</Link>
      </div>
    </div>
  );
}

export default Header;
