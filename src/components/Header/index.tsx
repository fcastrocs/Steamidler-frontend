import React, { useContext } from "react";
import styles from "../../styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { logout } from "../../commons";
import { useRouter } from "next/router";
import { AuthContext } from "../../providers/AuthProvider";
import { Col, Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { VscAccount } from "react-icons/vsc";

function Header() {
  return (
    <header>
      <TopHeader />
    </header>
  );
}

function TopHeader() {
  const auth = useContext(AuthContext);

  return (
    <Navbar expand="lg" fixed="top" className={styles.navbar}>
      <Container fluid>
        <Navbar.Brand>
          <Link href="/" className="d-flex align-items-center">
            <Image src="/android-chrome-192x192.png" alt="icon" width={35} height={35} />
            <h6 className={`mx-2 ${styles.link}`}> Steamidler</h6>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle className={styles.toggleIcon} />
        <Navbar.Collapse>
          <Nav className={`d-flex ${styles.navLinksAlignment}`}>
            {auth.isLoggedIn && (
              <>
                <Link href="/dashboard" className={`m-1`}>
                  <h6 className={styles.link}>Dashboard</h6>
                </Link>
                <Link href="/status" className={`m-1`}>
                  <h6 className={styles.link}>Status</h6>
                </Link>
                {<Profile />}
              </>
            )}
            {!auth.isLoggedIn && <NotLoggedIn />}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function NotLoggedIn() {
  return (
    <Col className={`d-flex ${styles.profileBtnMobileAlign} ${styles.notLoggedBtns}`}>
      <Link href="/login">
        <h6 className={`p-2 ${styles.linkTransform} ${styles.link}`}>Login</h6>
      </Link>
      <Link href="/register">
        <h6 className={`p-2 ${styles.linkTransform} ${styles.link}`}>Sign Up</h6>
      </Link>
    </Col>
  );
}

function Profile() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  return (
    <Col className={`d-flex ${styles.profileBtnMobileAlign}`}>
      <Dropdown align={"end"} className={`${styles.profileDropDownMobileHide}`}>
        <Dropdown.Toggle className={`${styles.profileDropDown}`}>
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

      <Col className={`mx-2 ${styles.profileLinks}`}>
        <hr />
        <Link href="/me">
          <h6 className={`mb-2 ${styles.link}`}>Profile</h6>
        </Link>

        <h6
          onClick={() => {
            logout(auth.setLoggedIn);
          }}
          className={`mb-2 ${styles.link}`}
        >
          Log out
        </h6>
      </Col>
    </Col>
  );
}

export default Header;
