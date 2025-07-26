import { QueuePageState } from "../../structures/QueueMetadata";

export function toDisplayString(value: QueuePageState): string {
  switch (value) {
    case QueuePageState.NowPlaying:
      return "Now Playing";
    case QueuePageState.Queue:
      return "Queue";
  }
}

export function fromKebabString(s: string): QueuePageState {
  switch (s) {
    case "now-playing":
      return QueuePageState.NowPlaying;
    case "queue":
      return QueuePageState.Queue;

    default:
      if (/^queue-(0|[1-9][0-9]*)$/.test(s)) {
        return QueuePageState.Queue;
      }

      throw new Error("aah");
  }
}
