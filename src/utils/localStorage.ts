import { ITokenUser } from "../context/GlobalContext";

export const getFromLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const getUserFromLocalStorage = (): ITokenUser | null => {
  const user = getFromLocalStorage("user");
  return user;
};

export const setToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};
