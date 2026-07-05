const STORAGE_KEY = 'adressa_game_device_id';
const NICKNAME_KEY = 'adressa_game_nickname';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function getNickname(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(NICKNAME_KEY) ?? '';
}

export function setNickname(nickname: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NICKNAME_KEY, nickname.trim().slice(0, 20));
}
