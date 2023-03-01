import { FarmableGame, Item } from "@machiavelli/steam-web";

declare module "@machiavelli/steam-client" {
  interface Game {
    isIdling: boolean;
  }

  interface AccountData {
    farmableGames: FarmableGame[];
    items: Item[];
    avatarFrame: string;
  }

  interface AccountState {
    status: "online" | "offline" | "reconnecting" | "AccessDenied" | "ingame";
    gamesIdsIdle: number[];
    gamesIdsFarm: number[];
  }

  interface SteamAccount {
    userId: any;
    accountName: string;
    steamId: string;
    data: AccountData;
    state: AccountState;
  }
}
