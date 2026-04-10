import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = { children: ReactNode };

export default function ScreenContainer({ children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16 },
  card: { gap: 14, paddingBottom: 24 },
});
