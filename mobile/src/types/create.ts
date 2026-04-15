import type { LibraryTrack } from '@/types/api';

export type VoiceInputMethod = 'record' | 'file';

export type CreateFlowStep = 'greeting' | 'voice' | 'music' | 'review' | 'result';

export type RenderRequestPayload = {
  greetingText: string;
  voiceUri: string;
  voiceMime: string;
  selectedTrack: LibraryTrack;
};

export type RenderResult = {
  shareId: string;
  shareLink: string;
  outKey: string;
};
