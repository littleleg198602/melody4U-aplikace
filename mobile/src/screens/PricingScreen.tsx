import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenContainer from '@/components/ScreenContainer';
import { getPlans } from '@/services/api';
import { colors } from '@/theme/colors';

export default function PricingScreen() {
  const router = useRouter();
  const plans = getPlans();

  return (
    <ScreenContainer>
      <Text style={styles.title}>Pricing</Text>
      {plans.map((plan) => (
        <View key={plan.id} style={styles.card}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>{plan.priceLabel}</Text>
          <Text style={styles.planDesc}>{plan.description}</Text>
          {plan.status === 'active' ? (
            <PrimaryButton title="Use this plan" onPress={() => router.push('/create')} />
          ) : (
            <Text style={styles.preparing}>This plan is preparing and not purchasable yet.</Text>
          )}
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  planName: { color: colors.text, fontSize: 18, fontWeight: '700' },
  planPrice: { color: colors.accent, fontWeight: '700' },
  planDesc: { color: colors.textMuted },
  preparing: { color: colors.textMuted, fontStyle: 'italic' },
});
