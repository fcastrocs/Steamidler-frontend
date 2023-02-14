import EventEmitter from "events";

export default class WS extends EventEmitter {
  private ws: WebSocket;

  constructor(url: string) {
    super();
    this.ws = new WebSocket(url);
    this.onMessageListener();
  }

  public send(message: { type: string; body?: any }) {
    if (!message.body) message.body = {};
    this.ws.send(JSON.stringify(message));
  }

  private onMessageListener() {
    this.ws.addEventListener("message", (event) => {
      const res = JSON.parse(event.data);
      console.log(res);

      // only emit if there is a listener
      if (this.listeners(res.type).length) {
        this.emit(res.type, res);
      } else {
        console.log("No ws listener for: ", res.type);
      }
    });
  }

  public close() {
    this.ws.close();
  }
}
