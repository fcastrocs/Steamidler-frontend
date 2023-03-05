import React, { useContext } from "react";
import styles from "../../styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { logout } from "../../commons";
import { useRouter } from "next/router";
import { AuthContext } from "../../providers/AuthProvider";
import { Button, Col, Container, Dropdown, Row } from "react-bootstrap";
import { VscAccount } from "react-icons/vsc";

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
    <Container className={styles.topHeader} fluid>
      <Col className="d-flex align-items-center mx-3 p-1">
        <Link href="/" className="d-flex align-items-center justify-content-start">
          <Image className={styles.logo} src="/android-chrome-192x192.png" alt="icon" width={50} height={50} />
          <h5 className="mx-3">SteamIdler.com</h5>
        </Link>
        <Col className="d-flex justify-content-end">
          {auth.isLoggedIn && <Profile />} {!auth.isLoggedIn && <NotLoggedIn />}
        </Col>
      </Col>
    </Container>
  );
}

function NotLoggedIn() {
  return (
    <Col className="d-flex justify-content-end align-items-center">
      <Link className={styles.topHeaderBtn} id={styles.logIn} href="/login">
        Login
      </Link>
      <Link className={styles.topHeaderBtn} id={styles.signUp} href="/register">
        Sign Up
      </Link>
    </Col>
  );
}

function Profile() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  return (
    <Dropdown>
      <Dropdown.Toggle className={styles.profileDropDown}>
        <VscAccount style={{ fontSize: "30px", color: "white" }} />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => {
            router.push("/me");
          }}
        >
          Profile
        </Dropdown.Item>
        <hr className="p-0 m-0" />
        <Dropdown.Item
          onClick={() => {
            logout(auth.setLoggedIn);
            router.push("/");
          }}
        >
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default Header;
