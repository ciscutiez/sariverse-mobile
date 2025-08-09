import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from './nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { colors } = useColorScheme();

  return (
    <View className="space-y-2">
      {label && (
        <Text variant="subhead" color="secondary">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-card px-4 py-3 rounded-lg border ${
          error ? 'border-red-500' : 'border-border'
        }`}
        placeholderTextColor={colors.muted}
        style={[{ color: colors.foreground }, style]}
        {...props}
      />
      {error && <Text className="text-red-500 text-sm">{error}</Text>}
    </View>
  );
}
