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
  if (/^now-playing$/.test(s)) {
    return QueuePageState.NowPlaying;
  }
  if (/^queue(-(0|[1-9][0-9]*))?$/.test(s)) {
    return QueuePageState.Queue;
  }

  throw new Error(`Could not get valid 'QueuePageState' from "${s}"`);
}
