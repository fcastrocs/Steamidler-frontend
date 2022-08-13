import styles from "../../styles/Dashboard/AddAccount.module.css";
import { useState } from "react";

export default function AddAccount() {
  const [error, setError] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [alert, setAlert] = useState("");

  const handler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password) {
      setError(true);
      return;
    }

    await fetch("/api/steamaccount/add", {
      method: "POST",
      body: JSON.stringify({ username, password, code }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (!res.ok) {
        setAlert(res.statusText);
      }
    });
  };

  const changeUserHndlr = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setError(true);
    } else {
      setUsername(event.target.value);
    }
  };

  const changePassHndlr = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setError(true);
    } else {
      setPassword(event.target.value);
    }
  };

  const changeCodeHndlr = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setError(true);
    } else {
      setCode(event.target.value);
    }
  };

  return <div className={styles.content}></div>;
}
