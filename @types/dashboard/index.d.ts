import { FarmableGame, Item } from "@machiavelli/steam-web";

declare module "@machiavelli/steam-client" {
  interface Game {
    isIdling: boolean;
  }

  interface AccountData {
    farmableGames: FarmableGame[];
    items: Item[];
  }

  interface AccountState {
    farming: boolean;
    status: "online" | "offline" | "reconnecting" | "AccessDenied" | "ingame";
    gamesIdsIdle: number[];
  }

  interface SteamAccount {
    userId: any;
    accountName: string;
    steamId: string;
    data: AccountData;
    state: AccountState;
  }
}
