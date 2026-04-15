import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenContainer from '@/components/ScreenContainer';
import { submitRenderRequest, fetchLibrary } from '@/services/api';
import { colors } from '@/theme/colors';
import type { CreateFlowStep, VoiceInputMethod } from '@/types/create';
import type { LibraryTrack } from '@/types/api';

function getStepIndex(step: CreateFlowStep): number {
  const stepMap: Record<CreateFlowStep, number> = {
    greeting: 1,
    voice: 2,
    music: 3,
    review: 4,
    result: 5,
  };

  return stepMap[step];
}

export default function CreateScreen() {
  const router = useRouter();

  const [step, setStep] = useState<CreateFlowStep>('greeting');
  const [greetingText, setGreetingText] = useState('');

  const [voiceMethod, setVoiceMethod] = useState<VoiceInputMethod | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [voiceUri, setVoiceUri] = useState('');
  const [voiceMime, setVoiceMime] = useState('audio/m4a');

  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [query, setQuery] = useState('');
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<LibraryTrack | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareId, setShareId] = useState('');
  const [shareLink, setShareLink] = useState('');

  const [errorState, setErrorState] = useState('');
  const [successState, setSuccessState] = useState('');

  function selectVoiceMethod(nextMethod: VoiceInputMethod) {
    if (voiceMethod === nextMethod) return;
    setVoiceMethod(nextMethod);
    setVoiceUri('');
    setVoiceMime('audio/m4a');
    setSuccessState('');
    setErrorState('');
  }

  const selectedVoiceName = useMemo(() => {
    if (!voiceUri) return '';
    return voiceUri.split('/').pop() || voiceUri;
  }, [voiceUri]);

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;

    return tracks.filter((track) => `${track.title || ''} ${track.key}`.toLowerCase().includes(q));
  }, [query, tracks]);

  useEffect(() => {
    if (step !== 'music' || tracks.length > 0 || loadingTracks) return;
    void loadLibrary();
  }, [step]);

  async function loadLibrary() {
    setLoadingTracks(true);
    setErrorState('');

    try {
      const data = await fetchLibrary();
      setTracks(data);
      setSuccessState(data.length ? `Načteno skladeb: ${data.length}.` : 'Hudební knihovna je momentálně prázdná.');
    } catch (error) {
      setErrorState(`Chyba knihovny: ${String(error)}`);
    } finally {
      setLoadingTracks(false);
    }
  }

  async function startRecording() {
    setErrorState('');

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      setErrorState('Pro nahrávání je potřeba povolit mikrofon.');
      return;
    }

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await newRecording.startAsync();
    setRecording(newRecording);
    setSuccessState('Nahrávání spuštěno. Po dokončení klepněte na Stop.');
  }

  async function stopRecording() {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI() || '';

    setVoiceUri(uri);
    setVoiceMime('audio/m4a');
    setRecording(null);
    setSuccessState('Hlas byl úspěšně nahrán.');
  }

  async function pickAudioFile() {
    setErrorState('');

    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setVoiceUri(asset.uri);
    setVoiceMime(asset.mimeType || 'audio/mpeg');
    setSuccessState('Audio soubor byl vybrán.');
  }

  async function submitRender() {
    if (!selectedTrack || !voiceUri || !greetingText.trim()) return;

    setIsSubmitting(true);
    setErrorState('');
    setSuccessState('Odesílám požadavek na render…');

    try {
      const result = await submitRenderRequest({
        greetingText: greetingText.trim(),
        voiceUri,
        voiceMime,
        selectedTrack,
      });

      setShareId(result.shareId);
      setShareLink(result.shareLink);
      setSuccessState('Přání bylo úspěšně vyrenderováno.');
      setStep('result');
    } catch (error) {
      setErrorState(`Vytvoření se nezdařilo: ${String(error)}`);
      setSuccessState('');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function shareResultLink() {
    if (!shareLink) return;
    await Share.share({ message: shareLink, url: shareLink });
  }

  function resetFlow() {
    setStep('greeting');
    setGreetingText('');
    setVoiceMethod(null);
    setRecording(null);
    setVoiceUri('');
    setVoiceMime('audio/m4a');
    setSelectedTrack(null);
    setShareId('');
    setShareLink('');
    setErrorState('');
    setSuccessState('Připraveno pro nové přání.');
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Vytvořit přání</Text>
      <Text style={styles.meta}>Krok {getStepIndex(step)} z 5</Text>

      {errorState ? (
        <View style={[styles.status, styles.error]}>
          <Text style={styles.statusText}>{errorState}</Text>
        </View>
      ) : null}

      {successState ? (
        <View style={[styles.status, styles.success]}>
          <Text style={styles.statusText}>{successState}</Text>
        </View>
      ) : null}

      {step === 'greeting' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Greeting message</Text>
          <Text style={styles.helper}>Napište krátké přání, které spojíme s vaším hlasem a vybranou hudbou.</Text>
          <TextInput
            style={[styles.input, styles.greetingInput]}
            placeholder="Všechno nejlepší, Aničko…"
            placeholderTextColor={colors.textMuted}
            value={greetingText}
            onChangeText={setGreetingText}
            multiline
          />
          <PrimaryButton title="Pokračovat na hlas" onPress={() => setStep('voice')} disabled={!greetingText.trim()} />
        </View>
      ) : null}

      {step === 'voice' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Vyberte způsob hlasového vstupu</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.choice, voiceMethod === 'record' && styles.choiceActive]}
              onPress={() => selectVoiceMethod('record')}
            >
              <Text style={styles.choiceTitle}>Nahrát mikrofonem</Text>
              <Text style={styles.choiceMeta}>Nahrajte nové hlasové přání přímo teď.</Text>
            </Pressable>
            <Pressable
              style={[styles.choice, voiceMethod === 'file' && styles.choiceActive]}
              onPress={() => selectVoiceMethod('file')}
            >
              <Text style={styles.choiceTitle}>Vybrat existující audio</Text>
              <Text style={styles.choiceMeta}>Použijte hlasovku, kterou už máte v telefonu.</Text>
            </Pressable>
          </View>

          {voiceMethod === 'record' ? (
            <PrimaryButton
              title={recording ? 'Zastavit nahrávání' : 'Spustit nahrávání'}
              onPress={recording ? stopRecording : startRecording}
              mode={recording ? 'ghost' : 'primary'}
            />
          ) : null}

          {voiceMethod === 'file' ? <PrimaryButton title="Vybrat audio soubor" onPress={pickAudioFile} mode="ghost" /> : null}

          <Text style={styles.helper}>{selectedVoiceName ? `Vybraný hlas: ${selectedVoiceName}` : 'Zatím není vybraný hlas.'}</Text>

          <PrimaryButton title="Zpět" onPress={() => setStep('greeting')} mode="ghost" />
          <PrimaryButton title="Pokračovat na hudbu" onPress={() => setStep('music')} disabled={!voiceUri} />
        </View>
      ) : null}

      {step === 'music' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Vyberte hudbu z knihovny Melody4U</Text>
          <PrimaryButton title="Načíst knihovnu znovu" onPress={loadLibrary} mode="ghost" />
          <TextInput
            style={styles.input}
            placeholder="Hledat podle názvu"
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
            ListEmptyComponent={!loadingTracks ? <Text style={styles.helper}>Pro tento dotaz nebyly nalezeny skladby.</Text> : null}
          />

          <PrimaryButton title="Zpět" onPress={() => setStep('voice')} mode="ghost" />
          <PrimaryButton title="Pokračovat na kontrolu" onPress={() => setStep('review')} disabled={!selectedTrack} />
        </View>
      ) : null}

      {step === 'review' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Kontrola před renderem</Text>

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>Text přání</Text>
            <Text style={styles.reviewValue}>{greetingText}</Text>
          </View>

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>Hlasový vstup</Text>
            <Text style={styles.reviewValue}>{selectedVoiceName || 'Nevybráno'}</Text>
          </View>

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>Vybraná hudba</Text>
            <Text style={styles.reviewValue}>{selectedTrack?.title || selectedTrack?.key || 'Nevybráno'}</Text>
          </View>

          <PrimaryButton title="Zpět" onPress={() => setStep('music')} mode="ghost" />
          <PrimaryButton
            title={isSubmitting ? 'Renderuji…' : 'Odeslat render'}
            onPress={submitRender}
            disabled={isSubmitting || !selectedTrack || !voiceUri || !greetingText.trim()}
          />
        </View>
      ) : null}

      {step === 'result' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Výsledek je připraven</Text>
          <Text style={styles.helper}>Vaše přání je hotové. Můžete ho hned sdílet.</Text>
          <Text style={styles.link}>{shareLink}</Text>

          <PrimaryButton title="Otevřít v aplikaci" onPress={() => router.push(`/share/${shareId}`)} />
          <PrimaryButton title="Otevřít deep link" onPress={() => Linking.openURL(`melody4u://share/${shareId}`)} mode="ghost" />
          <PrimaryButton title="Sdílet odkaz" onPress={shareResultLink} mode="ghost" />
          <PrimaryButton title="Vytvořit další přání" onPress={resetFlow} mode="ghost" />
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
    backgroundColor: colors.panelAlt,
  },
  greetingInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  list: { maxHeight: 280 },
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
  row: {
    gap: 10,
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.panelAlt,
    gap: 4,
  },
  choiceActive: {
    borderColor: colors.accent,
  },
  choiceTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  choiceMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  reviewBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.panelAlt,
    gap: 4,
  },
  reviewLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewValue: {
    color: colors.text,
    fontSize: 15,
  },
  link: { color: colors.success, fontWeight: '700' },
  status: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  success: {
    borderColor: colors.success,
    backgroundColor: '#1a2f25',
  },
  error: {
    borderColor: colors.danger,
    backgroundColor: '#321824',
  },
  statusText: {
    color: colors.text,
    lineHeight: 20,
  },
});
