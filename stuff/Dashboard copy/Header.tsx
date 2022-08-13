import styles from "../../styles/Dashboard/Header.module.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.header}>
        <div className={styles.top}>
          <Stats />
        </div>
        <div className={styles.bottom}>
          <FilterBtn />
        </div>
      </div>
    </>
  );
}

function Stats() {
  return (
    <div className={styles.stats}>
      <div className={styles.item}>
        Accounts: <span className={styles.num}>208</span>
      </div>
      <span className={styles.separator}>•</span>
      <div className={styles.item}>
        Online: <span className={styles.num}>0</span>
      </div>
      <div className={styles.separator}>•</div>
      <div className={styles.item}>
        Offline: <span className={styles.num}>208</span>
      </div>
      <div className={styles.separator}>•</div>
      <div className={styles.item}>
        Hours idled: <span className={styles.num}>614,780.225</span>
      </div>
    </div>
  );
}

function FilterBtn() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return <div></div>;
}
