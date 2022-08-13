import styles from "../../styles/Dashboard/Accounts.module.css";
import AccountAccordion from "./AccountAccordion";

export default function Accounts(props: { accounts: SteamAccount[] }) {
  console.log(props.accounts.length);
  const accounts = props.accounts.map((account) => {
    return <Account account={account} key={account.data.steamId} />;
  });

  return <div className={styles.accounts}>{accounts}</div>;
}

function Account(props: { account: SteamAccount }) {
  const account = props.account;

  return (
    <div className={styles.account}>
      <AccountAccordion account={account} />
    </div>
  );
}
