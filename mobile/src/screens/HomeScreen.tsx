import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import PrimaryButton from '@/components/PrimaryButton';
import { colors } from '@/theme/colors';

type DemoSample = {
  id: string;
  title: string;
  subtitle: string;
  url: string;
};

const DEMO_SAMPLES: DemoSample[] = [
  { id: 'mami', title: 'Pro maminku', subtitle: 'Něžné narozeninové přání', url: 'https://melody4u.com/demo/mami.mp3' },
  { id: 'kamarad', title: 'Pro kamaráda', subtitle: 'Lehké a veselé tempo', url: 'https://melody4u.com/demo/kamarad.mp3' },
  { id: 'milacku', title: 'Pro lásku', subtitle: 'Romantická atmosféra', url: 'https://melody4u.com/demo/milacku.mp3' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [loadingSampleId, setLoadingSampleId] = useState('');
  const [playingSampleId, setPlayingSampleId] = useState('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const sections = useMemo(
    () => [
      'Nahraj hlas nebo přidej existující hlasovku',
      'Vyber hudbu z knihovny Melody4U',
      'Vyrenderuj, zaplať a sdílej hotové přání',
    ],
    [],
  );

  useEffect(() => {
    return () => {
      if (sound) {
        void sound.unloadAsync();
      }
    };
  }, [sound]);

  async function toggleSample(sample: DemoSample) {
    if (playingSampleId === sample.id && sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingSampleId('');
      return;
    }

    setLoadingSampleId(sample.id);

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const nextSound = new Audio.Sound();
      await nextSound.loadAsync({ uri: sample.url });
      nextSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setPlayingSampleId('');
          setSound(null);
        }
      });

      await nextSound.playAsync();
      setSound(nextSound);
      setPlayingSampleId(sample.id);
    } finally {
      setLoadingSampleId('');
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Melody4U</Text>
        <Text style={styles.subtitle}>Osobní hudební přání z tvého hlasu. Rychle, jednoduše a s emocí.</Text>
        <PrimaryButton title="Vytvořit přání" onPress={() => router.push('/create')} />
        <PrimaryButton title="Zobrazit ceník" onPress={() => router.push('/pricing')} mode="ghost" />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Jak to funguje</Text>
        {sections.map((item, index) => (
          <View key={item} style={styles.stepRow}>
            <Text style={styles.stepNum}>{index + 1}</Text>
            <Text style={styles.body}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Ukázky přání</Text>
        <Text style={styles.body}>Stejně jako na webu jde o demo sekci – bez zásahu do create flow.</Text>
        {DEMO_SAMPLES.map((sample) => {
          const active = sample.id === playingSampleId;
          const loading = sample.id === loadingSampleId;

          return (
            <Pressable key={sample.id} style={[styles.sampleCard, active && styles.sampleActive]} onPress={() => toggleSample(sample)}>
              <View>
                <Text style={styles.sampleTitle}>{sample.title}</Text>
                <Text style={styles.sampleMeta}>{sample.subtitle}</Text>
              </View>
              {loading ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.sampleAction}>{active ? 'Stop' : 'Přehrát'}</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Proč Melody4U</Text>
        <Text style={styles.body}>• Osobní dárek během pár minut.</Text>
        <Text style={styles.body}>• Jednoduchý flow bez zbytečných kroků.</Text>
        <Text style={styles.body}>• Sdílení hotového výsledku přes odkaz.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Důvěra & legální</Text>
        <Text style={styles.body}>Tvoje data a audio pracují jen pro vytvoření přání. Právní informace navazují na webovou verzi produktu.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  title: { color: colors.text, fontSize: 34, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 23 },
  panel: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: {
    color: colors.text,
    fontWeight: '800',
    minWidth: 22,
    textAlign: 'center',
    backgroundColor: colors.panelAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  body: { color: colors.textMuted, lineHeight: 21 },
  sampleCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.panelAlt,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sampleActive: { borderColor: colors.accent },
  sampleTitle: { color: colors.text, fontWeight: '700', marginBottom: 2 },
  sampleMeta: { color: colors.textMuted, fontSize: 13 },
  sampleAction: { color: colors.accent, fontWeight: '700' },
});
