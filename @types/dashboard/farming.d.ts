import { FarmableGame } from "@fcastrocs/steamweb";
import { Game } from "@fcastrocs/steamclient";

declare module "@fcastrocs/steamweb" {
  interface FarmableGame extends Omit<Game, "isIdling"> {
    isFarming: boolean;
  }
}
