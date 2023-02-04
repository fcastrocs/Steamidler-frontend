import { Dispatch, SetStateAction } from "react";
import { json } from "stream/consumers";

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

export function checkIsUserLoggedIn() {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("session")) return true;
  }
  return false;
}

/**
 * wrap around fetch
 */
export async function request(method: string, url: string, json?: Object) {
  return await fetch("https://api.steamidler.com/" + url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: json ? JSON.stringify(json) : JSON.stringify({}),
  }).then((response) => checkResponseStatus(response));
}

/**
 * Check response status
 */
export const checkResponseStatus = async (response: Response) => {
  console.log(response);

  // response is okay
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return await response.json();
  }

  if (response.status === 400 || response.status === 401) {
    const error = (await response.json()) as Error;
    console.debug(error);
    throw error.message;
  }

  // something unexpected
  throw response.statusText;
};
