import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import PrimaryButton from '@/components/PrimaryButton';
import { colors } from '@/theme/colors';
import { createShare, fetchLibrary, renderGreeting, uploadAudio } from '@/services/api';
import type { LibraryTrack } from '@/types/api';

type Step = 1 | 2 | 3;

export default function CreateScreen() {
  const [step, setStep] = useState<Step>(1);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [voiceUri, setVoiceUri] = useState('');
  const [voiceMime, setVoiceMime] = useState('audio/m4a');

  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [query, setQuery] = useState('');
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<LibraryTrack | null>(null);

  const [busy, setBusy] = useState(false);
  const [shareId, setShareId] = useState('');

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((track) => `${track.title || ''} ${track.key}`.toLowerCase().includes(q));
  }, [query, tracks]);

  async function loadLibrary() {
    setLoadingTracks(true);
    try {
      const data = await fetchLibrary();
      setTracks(data);
    } catch (error) {
      Alert.alert('Library error', String(error));
    } finally {
      setLoadingTracks(false);
    }
  }

  async function startRecording() {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Microphone permission required');
      return;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await newRecording.startAsync();
    setRecording(newRecording);
  }

  async function stopRecording() {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI() || '';
    setVoiceUri(uri);
    setVoiceMime('audio/m4a');
    setRecording(null);
  }

  async function pickAudioFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    setVoiceUri(asset.uri);
    setVoiceMime(asset.mimeType || 'audio/mpeg');
  }

  async function submit() {
    if (!voiceUri || !selectedTrack?.key) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: voiceUri,
        name: `voice-${Date.now()}.m4a`,
        type: voiceMime,
      } as unknown as Blob);

      const voiceKey = await uploadAudio(formData);
      const outKey = await renderGreeting(voiceKey, selectedTrack.key);
      const id = await createShare(outKey, 'free');
      setShareId(id);
      setStep(3);
    } catch (error) {
      Alert.alert('Creation failed', String(error));
    } finally {
      setBusy(false);
    }
  }

  const shareLink = shareId ? `https://melody4u.com/#/p/${shareId}` : '';

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create greeting</Text>
      <Text style={styles.meta}>Step {step} of 3</Text>

      {step === 1 ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Voice input</Text>
          <PrimaryButton
            title={recording ? 'Recording… tap stop' : 'Record with microphone'}
            onPress={recording ? stopRecording : startRecording}
            mode={recording ? 'ghost' : 'primary'}
          />
          <PrimaryButton title="Pick existing audio" onPress={pickAudioFile} mode="ghost" />
          <Text style={styles.helper}>{voiceUri ? `Selected: ${voiceUri.split('/').pop()}` : 'No voice selected yet.'}</Text>
          <PrimaryButton title="Continue to music" onPress={() => setStep(2)} disabled={!voiceUri} />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Melody4U music library</Text>
          <PrimaryButton title="Load library" onPress={loadLibrary} mode="ghost" />
          <TextInput
            style={styles.input}
            placeholder="Search by title"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {loadingTracks ? <ActivityIndicator color={colors.accent} /> : null}
          <FlatList
            data={filteredTracks}
            keyExtractor={(item) => item.key}
            style={styles.list}
            renderItem={({ item }) => {
              const active = selectedTrack?.key === item.key;
              return (
                <Pressable style={[styles.track, active && styles.trackActive]} onPress={() => setSelectedTrack(item)}>
                  <Text style={styles.trackTitle}>{item.title || item.key}</Text>
                  <Text style={styles.trackMeta}>{item.key}</Text>
                </Pressable>
              );
            }}
          />
          <PrimaryButton title="Back" onPress={() => setStep(1)} mode="ghost" />
          <PrimaryButton title={busy ? 'Submitting…' : 'Render greeting'} onPress={submit} disabled={!selectedTrack || busy} />
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Success</Text>
          <Text style={styles.helper}>Your greeting is ready.</Text>
          <Text style={styles.link}>{shareLink}</Text>
          <PrimaryButton title="Open share page" onPress={() => Linking.openURL(`melody4u://share/${shareId}`)} />
          <PrimaryButton title="Create another" onPress={() => {
            setStep(1);
            setShareId('');
            setSelectedTrack(null);
            setVoiceUri('');
          }} mode="ghost" />
          <Text style={styles.helper}>Playback and consume logic remains server-controlled via /api/p/:id and /consume.</Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  meta: { color: colors.textMuted },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  section: { color: colors.text, fontSize: 18, fontWeight: '700' },
  helper: { color: colors.textMuted, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    color: colors.text,
  },
  list: { maxHeight: 220 },
  track: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: colors.panelAlt,
  },
  trackActive: { borderColor: colors.accent },
  trackTitle: { color: colors.text, fontWeight: '700' },
  trackMeta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  link: { color: colors.success, fontWeight: '700' },
});
