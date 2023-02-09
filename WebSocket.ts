import EventEmitter from "events";

export default class WS extends EventEmitter {
  private ws: WebSocket;

  constructor(url: string) {
    super();
    this.ws = new WebSocket(url);
    this.onOpenListener();
    this.onMessageListener();
  }

  private onOpenListener() {
    this.ws.addEventListener("open", () => {
      this.emit("open");
    });
  }

  public send(message: { type: string; body?: any }) {
    this.ws.send(JSON.stringify(message));
  }

  private onMessageListener() {
    this.ws.addEventListener("message", (event) => {
      const res = JSON.parse(event.data);
      console.log(res);
      this.emit(res.type, res);
    });
  }

  public close() {
    this.ws.close();
  }
}
