import { API_BASE, toAbsoluteApiUrl } from '@/services/config';
import type { RenderRequestPayload, RenderResult } from '@/types/create';
import type { LibraryTrack, Plan, ShareState } from '@/types/api';

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export async function uploadAudio(formData: FormData): Promise<string> {
  const response = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
  const data = await parseJson<{ ok?: boolean; key?: string; error?: string }>(response);
  if (!data?.ok || !data?.key) throw new Error(data?.error || 'upload_failed');
  return data.key;
}

export async function fetchLibrary(): Promise<LibraryTrack[]> {
  const response = await fetch(`${API_BASE}/api/library`);
  const data = await parseJson<{ ok?: boolean; tracks?: LibraryTrack[]; error?: string }>(response);
  if (!data?.ok) throw new Error(data?.error || 'library_failed');
  return (data.tracks || []).filter((track) => !!track.key);
}

export async function renderGreeting(voiceKey: string, musicKey: string): Promise<string> {
  const response = await fetch(`${API_BASE}/api/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceKey, musicKey }),
  });
  const data = await parseJson<{ ok?: boolean; outKey?: string; error?: string }>(response);
  if (!data?.ok || !data?.outKey) throw new Error(data?.error || 'render_failed');
  return data.outKey;
}

export async function createShare(outKey: string, tier = 'free'): Promise<string> {
  const response = await fetch(`${API_BASE}/api/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outKey, tier }),
  });
  const data = await parseJson<{ ok?: boolean; created?: { id?: string }; id?: string; error?: string }>(response);
  const id = data?.created?.id || data?.id;
  if (!data?.ok || !id) throw new Error(data?.error || 'share_failed');
  return id;
}

export async function submitRenderRequest(payload: RenderRequestPayload): Promise<RenderResult> {
  const formData = new FormData();

  formData.append('file', {
    uri: payload.voiceUri,
    // TODO: keep extension aligned with picked file once backend validates mimetype strictly.
    name: `voice-${Date.now()}.m4a`,
    type: payload.voiceMime,
  } as unknown as Blob);

  const voiceKey = await uploadAudio(formData);
  const outKey = await renderGreeting(voiceKey, payload.selectedTrack.key);

  // TODO: pass greetingText to backend once /api/share supports metadata payload.
  const shareId = await createShare(outKey, 'free');

  return {
    shareId,
    outKey,
    shareLink: `https://melody4u.com/#/p/${shareId}`,
  };
}

export async function fetchShareState(shareId: string): Promise<ShareState> {
  const response = await fetch(`${API_BASE}/api/p/${encodeURIComponent(shareId)}`);
  const data = await parseJson<ShareState & { error?: string }>(response);
  if (!data?.ok) throw new Error(data?.error || 'share_state_failed');
  return data;
}

export async function consumeShare(shareId: string): Promise<ShareState> {
  const response = await fetch(`${API_BASE}/api/p/${encodeURIComponent(shareId)}/consume`, { method: 'POST' });
  const data = await parseJson<ShareState & { error?: string }>(response);
  if (!data?.ok) throw new Error(data?.error || 'consume_failed');
  return data;
}

export function getPlayableUrl(payload: { previewUrl?: string; mediaUrl?: string; ticketUrl?: string; audioUrl?: string }): string {
  return toAbsoluteApiUrl(payload.previewUrl || payload.mediaUrl || payload.ticketUrl || payload.audioUrl || '');
}

export function getPlans(): Plan[] {
  return [
    {
      id: 'free',
      name: 'Free',
      priceLabel: '0 CZK',
      status: 'active',
      description: '24 hours of playback. Ideal for trying Melody4U.',
    },
    {
      id: 'standard',
      name: 'Standard',
      priceLabel: 'Preparing',
      status: 'preparing',
      description: 'Paid plan is being prepared. Availability follows backend rollout.',
    },
    {
      id: 'vip',
      name: 'VIP',
      priceLabel: 'Preparing',
      status: 'preparing',
      description: 'Premium tier is not active yet in production.',
    },
  ];
}
