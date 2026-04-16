import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenContainer from '@/components/ScreenContainer';
import { fetchLibraryWithCache, getCachedLibrary, submitRenderRequest } from '@/services/api';
import { colors } from '@/theme/colors';
import type { CreateFlowStep, VoiceInputMethod } from '@/types/create';
import type { LibraryTrack } from '@/types/api';

const STEP_ORDER: CreateFlowStep[] = ['voice', 'music', 'finish'];

function getStepIndex(step: CreateFlowStep): number {
  const index = STEP_ORDER.indexOf(step);
  return index >= 0 ? index + 1 : STEP_ORDER.length;
}

export default function CreateScreen() {
  const router = useRouter();

  const [step, setStep] = useState<CreateFlowStep>('voice');
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

  useEffect(() => {
    void prewarmLibrary();
  }, []);

  useEffect(() => {
    if (step === 'music' && tracks.length === 0 && !loadingTracks) {
      void loadLibrary();
    }
  }, [step]);

  async function prewarmLibrary() {
    const cached = await getCachedLibrary();
    if (cached.length > 0) {
      setTracks(cached);
    }
  }

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

  async function loadLibrary() {
    setLoadingTracks(true);
    setErrorState('');

    try {
      const data = await fetchLibraryWithCache();
      if (data.cached.length > 0) {
        setTracks(data.cached);
      }
      setTracks(data.fresh);
      setSuccessState(data.fresh.length ? `Načteno skladeb: ${data.fresh.length}.` : 'Hudební knihovna je momentálně prázdná.');
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
    setStep('voice');
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
      <Text style={styles.title}>Vytvoření přání</Text>
      <Text style={styles.meta}>{step === 'result' ? 'Hotovo' : `Krok ${getStepIndex(step)} z ${STEP_ORDER.length}`}</Text>

      {step !== 'result' ? (
        <View style={styles.stepper}>
          {STEP_ORDER.map((item) => (
            <View key={item} style={[styles.stepPill, item === step && styles.stepPillActive]}>
              <Text style={[styles.stepPillText, item === step && styles.stepPillTextActive]}>{item.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      ) : null}

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

      {step === 'voice' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Krok 1: hlas</Text>
          <Text style={styles.helper}>Vyberte mikrofon nebo hotový audio soubor (XOR logika jako na webu).</Text>

          <View style={styles.row}>
            <Pressable style={[styles.choice, voiceMethod === 'record' && styles.choiceActive]} onPress={() => selectVoiceMethod('record')}>
              <Text style={styles.choiceTitle}>Nahrát mikrofonem</Text>
              <Text style={styles.choiceMeta}>Nahrajte nové hlasové přání přímo teď.</Text>
            </Pressable>

            <Pressable style={[styles.choice, voiceMethod === 'file' && styles.choiceActive]} onPress={() => selectVoiceMethod('file')}>
              <Text style={styles.choiceTitle}>Vybrat existující audio</Text>
              <Text style={styles.choiceMeta}>Použijte hlasovku, kterou už máte v telefonu.</Text>
            </Pressable>
          </View>

          {voiceMethod === 'record' ? (
            <PrimaryButton title={recording ? 'Zastavit nahrávání' : 'Spustit nahrávání'} onPress={recording ? stopRecording : startRecording} mode={recording ? 'ghost' : 'primary'} />
          ) : null}

          {voiceMethod === 'file' ? <PrimaryButton title="Vybrat audio soubor" onPress={pickAudioFile} mode="ghost" /> : null}

          <Text style={styles.helper}>{selectedVoiceName ? `Vybraný hlas: ${selectedVoiceName}` : 'Zatím není vybraný hlas.'}</Text>
          <PrimaryButton title="Pokračovat na hudbu" onPress={() => setStep('music')} disabled={!voiceUri} />
        </View>
      ) : null}

      {step === 'music' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Krok 2: hudba</Text>
          <Text style={styles.helper}>Knihovna je cacheovaná a při otevření se tiše obnovuje na pozadí.</Text>

          <PrimaryButton title="Obnovit knihovnu" onPress={loadLibrary} mode="ghost" />

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

          <PrimaryButton title="Zpět na hlas" onPress={() => setStep('voice')} mode="ghost" />
          <PrimaryButton title="Pokračovat na dokončení" onPress={() => setStep('finish')} disabled={!selectedTrack} />
        </View>
      ) : null}

      {step === 'finish' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Krok 3: dokončení</Text>
          <Text style={styles.helper}>Doplňte text přání, zkontrolujte výběr a spusťte render.</Text>

          <TextInput
            style={[styles.input, styles.greetingInput]}
            placeholder="Všechno nejlepší, Aničko…"
            placeholderTextColor={colors.textMuted}
            value={greetingText}
            onChangeText={setGreetingText}
            multiline
          />

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>Hlas</Text>
            <Text style={styles.reviewValue}>{selectedVoiceName || 'Nevybráno'}</Text>
          </View>

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewLabel}>Hudba</Text>
            <Text style={styles.reviewValue}>{selectedTrack?.title || selectedTrack?.key || 'Nevybráno'}</Text>
          </View>

          <PrimaryButton title="Zpět na hudbu" onPress={() => setStep('music')} mode="ghost" />
          <PrimaryButton title={isSubmitting ? 'Renderuji…' : 'Vyrenderovat přání'} onPress={submitRender} disabled={isSubmitting || !selectedTrack || !voiceUri || !greetingText.trim()} />
        </View>
      ) : null}

      {step === 'result' ? (
        <View style={styles.panel}>
          <Text style={styles.section}>Výsledek / share</Text>
          <Text style={styles.helper}>Přání je hotové, otevřete detail nebo ho ihned sdílejte.</Text>
          <Text style={styles.link}>{shareLink}</Text>

          <PrimaryButton title="Přehrát výsledek" onPress={() => router.push(`/share/${shareId}`)} />
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
  stepper: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  stepPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.panel,
  },
  stepPillActive: {
    borderColor: colors.accent,
    backgroundColor: colors.panelAlt,
  },
  stepPillText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  stepPillTextActive: { color: colors.accent },
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
