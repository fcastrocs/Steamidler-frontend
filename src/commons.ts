import { Dispatch, SetStateAction } from "react";

/**
 * wrap around fetch
 */
export async function request(method: string, url: string, json?: Object) {
  let res: Response;
  try {
    res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/") + url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: json ? JSON.stringify(json) : null,
    });
  } catch (error) {
    console.log(error);
    throw error;
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

  throw response;
};

export async function logout(setLoggedIn: Dispatch<SetStateAction<boolean>>) {
  await request("POST", "user/logout");
  setLoggedIn(false);
}

/**
 * Set to localstorage with expiry.
 * ttl is in seconds
 */
export function setLocalStorage(key: LocalStorageKeys, value: any, ttl: number) {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + ttl * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * get from localstorage
 * ttl is in seconds
 */
export function getLocalStorage(key: LocalStorageKeys) {
  const itemStr = localStorage.getItem(key);

  // if the item doesn't exist, return null
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return { ...item.value, remaining: Math.floor((item.expiry - now.getTime()) / 1000) };
}

export function removeLocalStorage(key: LocalStorageKeys) {
  localStorage.removeItem(key);
}
