export enum CHAT_HISTORY_TYPE_ENUM {
  TEXT = 0,
  IMAGE = 1,
  FILE = 2,
}

export const CHAT_HISTORY_TYPE_LABELS: Record<CHAT_HISTORY_TYPE_ENUM, string> =
  {
    [CHAT_HISTORY_TYPE_ENUM.TEXT]: 'text',
    [CHAT_HISTORY_TYPE_ENUM.IMAGE]: 'image',
    [CHAT_HISTORY_TYPE_ENUM.FILE]: 'file',
  };
