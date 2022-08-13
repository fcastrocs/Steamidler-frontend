import React from "react";
import { useContext } from "react";
import { AuthContext } from "../../pages/_app";
import { logUserOut } from "../../commons";
import styles from "../../styles/Auth.module.css";

export default function Logout() {
  const auth = useContext(AuthContext);

  const logout = async (form: any) => {
    await fetch("/api/user/logout", {
      method: "POST",
    });

    logUserOut(auth.setIsLoggedIn);
  };

  return (
    <div className={styles.topHeaderBtn} onClick={logout}>
      Logout
    </div>
  );
}
