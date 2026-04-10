import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  mode?: 'primary' | 'ghost';
};

export default function PrimaryButton({ title, onPress, disabled, mode = 'primary' }: Props) {
  const primary = mode === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, primary ? styles.primary : styles.ghost, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  ghost: { backgroundColor: 'transparent', borderColor: colors.border },
  disabled: { opacity: 0.5 },
  label: { color: colors.text, fontWeight: '700' },
});
