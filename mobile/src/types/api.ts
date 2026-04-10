export type LibraryTrack = {
  key: string;
  title?: string;
  previewUrl?: string;
  durationSec?: number;
  size?: number;
};

export type ShareState = {
  ok: boolean;
  locked?: boolean;
  remaining?: number;
  previewUrl?: string;
  mediaUrl?: string;
  created_at?: string;
};

export type Plan = {
  id: 'free' | 'standard' | 'vip';
  name: string;
  priceLabel: string;
  status: 'active' | 'preparing';
  description: string;
};
