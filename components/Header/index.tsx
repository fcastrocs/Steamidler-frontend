import React, { Dispatch, SetStateAction } from "react";
import styles from "../../styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { logout } from "../../commons";
import { useRouter } from "next/router";

type Props = {
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
  isLoggedIn: boolean;
};

function Header(props: Props) {
  return (
    <header>
      <TopHeader isLoggedIn={props.isLoggedIn} setLoggedIn={props.setLoggedIn} />
      <BottomHeader />
    </header>
  );
}

function TopHeader(props: Props) {
  const router = useRouter();
  return (
    <div className={styles.topHeader}>
      {props.isLoggedIn && (
        <div
          className={styles.topHeaderBtn}
          onClick={() => {
            logout(props.setLoggedIn);
            router.push("/");
          }}
        >
          Logout
        </div>
      )}
      {!props.isLoggedIn && (
        <Link className={styles.topHeaderBtn} href="/login">
          Login
        </Link>
      )}
      {!props.isLoggedIn && (
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
