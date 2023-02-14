type AuthTypeValues = "" | "QRcode" | "SteamGuardCode";
type SetAuthType = React.Dispatch<React.SetStateAction<AuthTypeValues>>;
type AuthTypeContextType = {
  setAuthType: SetAuthType;
  authType: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
};
