import { Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { theme } from '@/lib/theme';
import type { AppSettings } from '@/types/forecast';

type SettingsPanelProps = {
  onChange: (patch: Partial<AppSettings>) => void;
  onRecalculateBattery: () => void;
  onSave: () => void;
  settings: AppSettings;
};

type FieldProps = {
  keyboardType?: 'default' | 'decimal-pad';
  label: string;
  onChangeText: (text: string) => void;
  value: string;
};

function Field({ keyboardType = 'default', label, onChangeText, value }: FieldProps) {
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor="#64748B"
        style={{
          borderRadius: 16,
          backgroundColor: '#081224',
          color: theme.colors.text,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
        value={value}
      />
    </View>
  );
}

export function SettingsPanel({
  onChange,
  onRecalculateBattery,
  onSave,
  settings,
}: SettingsPanelProps) {
  return (
    <View
      style={{
        gap: 16,
        padding: 18,
        borderRadius: 24,
        backgroundColor: theme.colors.panel,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text
        selectable
        style={{
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: '700',
        }}
      >
        System Setup
      </Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Field
          keyboardType="decimal-pad"
          label="Solar Array kW"
          onChangeText={(text) => onChange({ solarArrayKw: Number(text) || 0 })}
          value={String(settings.solarArrayKw)}
        />
        <Field
          keyboardType="decimal-pad"
          label="Efficiency Loss %"
          onChangeText={(text) => onChange({ efficiencyLossPercent: Number(text) || 0 })}
          value={String(settings.efficiencyLossPercent)}
        />
      </View>

      <Field
        label="Manual Location"
        onChangeText={(text) => onChange({ manualLocation: text })}
        value={settings.manualLocation}
      />

      <View style={{ gap: 10 }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: '700',
          }}
        >
          Battery Bank
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Field
            keyboardType="decimal-pad"
            label="Qty"
            onChangeText={(text) => onChange({ batteryCount: Number(text) || 0 })}
            value={String(settings.batteryCount)}
          />
          <Field
            keyboardType="decimal-pad"
            label="Volts"
            onChangeText={(text) => onChange({ batteryVolts: Number(text) || 0 })}
            value={String(settings.batteryVolts)}
          />
          <Field
            keyboardType="decimal-pad"
            label="Amp Hours"
            onChangeText={(text) => onChange({ batteryAmpHours: Number(text) || 0 })}
            value={String(settings.batteryAmpHours)}
          />
        </View>
      </View>

      <View
        style={{
          borderRadius: 18,
          backgroundColor: '#081224',
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 14,
          gap: 10,
        }}
      >
        <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
          Calculated Capacity
        </Text>
        <Text
          selectable
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
          }}
        >
          {settings.batteryCapacityKwh.toFixed(1)} kWh
        </Text>
        <PrimaryButton onPress={onRecalculateBattery} text="Recalculate Battery" />
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <PrimaryButton
          onPress={() =>
            onChange({
              temperatureUnit: settings.temperatureUnit === 'fahrenheit' ? 'celsius' : 'fahrenheit',
            })
          }
          style={{ flex: 1 }}
          text={`Units: ${settings.temperatureUnit === 'fahrenheit' ? 'Fahrenheit' : 'Celsius'}`}
        />
        <PrimaryButton onPress={onSave} style={{ flex: 1 }} text="Save Settings" />
      </View>
    </View>
  );
}
