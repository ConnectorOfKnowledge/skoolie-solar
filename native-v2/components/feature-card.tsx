import { Text, View } from 'react-native';

import { theme } from '@/lib/theme';

type FeatureCardProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function FeatureCard({ eyebrow, title, description }: FeatureCardProps) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.panel,
        borderRadius: 24,
        padding: 18,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text
        selectable
        style={{
          color: theme.colors.accent,
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </Text>
      <Text
        selectable
        style={{
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: '700',
          lineHeight: 26,
        }}
      >
        {title}
      </Text>
      <Text
        selectable
        style={{
          color: theme.colors.subtleText,
          fontSize: 15,
          lineHeight: 22,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
