import { Dispatch, SetStateAction } from "react";

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
  let res: Response;
  try {
    res = await fetch("http://localhost:8000/" + url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: json ? JSON.stringify(json) : JSON.stringify({}),
    });
  } catch (error) {
    console.log(error);
    throw new Error("Unexpected error occurred.");
  }

  return await checkResponseStatus(res);
}

/**
 * Check response status
 */
export const checkResponseStatus = async (response: Response) => {
  // response is okay
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return await response.json();
  }

  if (response.status === 400 || response.status === 401) {
    const error = await response.json();
    console.log(error);
    throw new Error((error as Error).message);
  }

  // something unexpected happended
  console.log(response.statusText);
  throw new Error("Unexpected error occurred.");
};
