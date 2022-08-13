import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Accounts from "../../components/Dashboard/Accounts";

const FETCH_TIME = 3000;

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SteamAccount[]>([]);
  const navigate = useNavigate();

  // periodically fetch accounts
  useEffect(() => {
    refreshDashboard().then((data) => {
      if (!data.length) {
        navigate("/dashboard/addaccount");
        return;
      }
      setAccounts(data);
    });

    const interval = setInterval(() => refreshDashboard().then((data) => setAccounts(data)), FETCH_TIME);

    return () => {
      clearInterval(interval);
    };
  }, [navigate]);

  return <Accounts accounts={accounts} />
}

const refreshDashboard = async (): Promise<SteamAccount[]> => {
  return await fetch("/api/steamaccounts").then((res) => {
    if (!res.ok) return null;
    return res.json();
  });
};
