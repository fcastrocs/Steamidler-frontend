import React from "react";
import styles from "../../styles/Footer.module.css";

function Footer() {
  return (
    <footer>
      <Affiliation />
      <CopyRight />
    </footer>
  );
}

function Affiliation() {
  return <div className="affiliation">SteamIdler is a hobby project and is not affiliated with Valve or Steam.</div>;
}

function CopyRight() {
  return (
    <div className="copyright">
      {" "}
      Made by <a href="https://steamcommunity.com/profiles/76561197960410044/"> Machiavelli</a> © 2022
    </div>
  );
}
export default Footer;
