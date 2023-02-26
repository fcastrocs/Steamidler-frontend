import { FarmableGame } from "@machiavelli/steam-web";
import { Game } from "@machiavelli/steam-client";

declare module "@machiavelli/steam-web" {
  interface FarmableGame extends Omit<Game, "isIdling"> {
    isFarming: boolean;
  }
}
