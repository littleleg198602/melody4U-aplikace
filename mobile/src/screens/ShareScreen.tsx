import { useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import PrimaryButton from '@/components/PrimaryButton';
import { consumeShare, fetchShareState, getPlayableUrl } from '@/services/api';
import { colors } from '@/theme/colors';

export default function ShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shareId = useMemo(() => String(id || ''), [id]);

  const [status, setStatus] = useState('Loading share state...');
  const [remainingPlays, setRemainingPlays] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    if (!shareId) return;
    void loadShareState();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [shareId]);

  async function loadShareState() {
    try {
      const data = await fetchShareState(shareId);
      setLocked(Boolean(data.locked));
      const left = data.remaining;
      setRemainingPlays(typeof left === 'number' ? left : null);
      setStatus(data.locked ? 'Greeting is locked.' : 'Ready to play.');
    } catch (error) {
      setStatus('Cannot load share state.');
      Alert.alert('Share error', String(error));
    }
  }

  async function consumeAndPlay() {
    setBusy(true);
    try {
      const data = await consumeShare(shareId);
      const playable = getPlayableUrl(data);
      if (!playable) throw new Error('No media URL from backend.');

      if (sound) {
        await sound.unloadAsync();
      }

      const nextSound = new Audio.Sound();
      await nextSound.loadAsync({ uri: playable });
      await nextSound.playAsync();
      setSound(nextSound);

      setLocked(Boolean(data.locked));
      setRemainingPlays(typeof data.remaining === 'number' ? data.remaining : null);
      setStatus('Playing...');
    } catch (error) {
      Alert.alert('Playback failed', String(error));
      setStatus('Playback failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Greeting playback</Text>
      <View style={styles.panel}>
        <Text style={styles.label}>Share ID: {shareId || '-'}</Text>
        <Text style={styles.label}>Status: {status}</Text>
        {remainingPlays !== null ? <Text style={styles.label}>Remaining plays: {remainingPlays}</Text> : null}
        {busy ? <ActivityIndicator color={colors.accent} /> : null}
        <PrimaryButton title="Refresh state" onPress={loadShareState} mode="ghost" />
        <PrimaryButton title="Consume and play" onPress={consumeAndPlay} disabled={locked || busy || !shareId} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  label: { color: colors.textMuted },
});
