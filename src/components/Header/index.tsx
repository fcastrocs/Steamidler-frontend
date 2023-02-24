import React, { useContext } from "react";
import styles from "../../styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { logout } from "../../commons";
import { useRouter } from "next/router";
import { AuthContext } from "../../providers/AuthProvider";

function Header() {
  return (
    <header>
      <TopHeader />
    </header>
  );
}

function TopHeader() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  return (
    <div className={styles.topHeader}>
      <div className={styles.logoBox}>
        <Link href="/"><Image className={styles.logo} src="/android-chrome-192x192.png" alt="icon" width={70} height={70} /></Link>
        <Link href="/" className={`h3 mx-2`} id={styles.textLink}>Steamidler.com</Link>
      </div>
      {auth.isLoggedIn && (
        <div>
          <Link href="/dashboard" className={`h2 text-center`} id={styles.dashboardLink}>Dashboard</Link>
        </div>
      )}
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
        <div className={styles.logContainer}>
          <Link className={styles.topHeaderBtn} id={styles.logIn} href="/login">
            Login
          </Link>
          <Link className={styles.topHeaderBtn} id={styles.signUp} href="/register">
            Sign Up
          </Link>
        </div>
      )}


    </div>
  );
}


export default Header;
