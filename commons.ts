import { Dispatch, SetStateAction } from "react";

export const checkResponseStatus = async (response: Response) => {
  const message = await response.json();
  // response.status >= 200 && response.status < 300
  if (response.ok) return message;
  throw message;
};

export function checkIsUserLoggedIn() {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("session")) return true;
  }

  return false;
}

export function logUserIn(user: any, setIsLoggedIn: Dispatch<SetStateAction<boolean>>) {
  if (typeof window !== "undefined") {
    localStorage.setItem("session", "true");
    localStorage.setItem("user", JSON.stringify(user));
  }
  setIsLoggedIn(true);
}

export function logUserOut(setIsLoggedIn: Dispatch<SetStateAction<boolean>>) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("session");
    localStorage.removeItem("user");
  }
  setIsLoggedIn(false);
}
