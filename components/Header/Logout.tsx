import React from "react";
import { useContext } from "react";
import { AuthContext } from "../../pages/_app";
import { logUserOut, request } from "../../commons";
import styles from "../../styles/Auth.module.css";

export default function Logout() {
  const auth = useContext(AuthContext);

  const logout = async (form: any) => {
    await request("POST", "user/logout");
    logUserOut(auth.setIsLoggedIn);
  };

  return (
    <div className={styles.topHeaderBtn} onClick={logout}>
      Logout
    </div>
  );
}
