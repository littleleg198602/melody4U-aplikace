import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import PrimaryButton from '@/components/PrimaryButton';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Text style={styles.title}>Melody4U</Text>
      <Text style={styles.subtitle}>Voice + music greetings for real emotional moments.</Text>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Start quickly</Text>
        <PrimaryButton title="Create greeting" onPress={() => router.push('/create')} />
        <PrimaryButton title="Pricing" onPress={() => router.push('/pricing')} mode="ghost" />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Sample flow</Text>
        <Text style={styles.body}>1) Record your voice or pick an existing audio file.</Text>
        <Text style={styles.body}>2) Choose music from Melody4U library.</Text>
        <Text style={styles.body}>3) Render, get your share link and send it.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 22 },
  panel: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  body: { color: colors.textMuted },
});
