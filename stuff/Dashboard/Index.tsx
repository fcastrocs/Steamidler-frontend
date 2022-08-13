import { Outlet, useNavigate } from "react-router-dom";
import Header from "../../components/Dashboard/Header";
import styles from "../../styles/Dashboard/Index.module.css";
import { AuthContext } from "../../App";
import { useContext, useEffect } from "react";

export default function Dashboard() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoggedIn) {
      console.log("here");
      navigate("/");
    }
  }, [auth.isLoggedIn, navigate]);

  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.body}>
        <Outlet />
      </div>
    </div>
  );
}
