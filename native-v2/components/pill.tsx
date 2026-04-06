import { Text, View } from 'react-native';

import { theme } from '@/lib/theme';

type PillProps = {
  text: string;
};

export function Pill({ text }: PillProps) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.panel,
      }}
    >
      <Text
        selectable
        style={{
          color: theme.colors.subtleText,
          fontSize: 13,
          fontWeight: '700',
        }}
      >
        {text}
      </Text>
    </View>
  );
}
