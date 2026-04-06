import { ActivityIndicator, Pressable, Text, ViewStyle } from 'react-native';

import { theme } from '@/lib/theme';

type PrimaryButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  text: string;
};

export function PrimaryButton({ disabled, loading, onPress, style, text }: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: disabled ? '#334155' : theme.colors.accent,
        opacity: loading ? 0.9 : 1,
        ...style,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#082F49" />
      ) : (
        <Text
          style={{
            color: '#082F49',
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          {text}
        </Text>
      )}
    </Pressable>
  );
}
