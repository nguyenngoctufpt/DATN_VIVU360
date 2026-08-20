import React from 'react';
import { Switch } from 'react-native';
import { SettingItem } from './SettingItem';

export function SettingSwitch({
  theme,
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  loading = false,
  noBorder = false,
}) {
  return (
    <SettingItem
      theme={theme}
      icon={icon}
      title={title}
      description={description}
      showChevron={false}
      loading={loading}
      disabled={disabled}
      noBorder={noBorder}
      rightElement={(
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled || loading}
          trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
          thumbColor="#ffffff"
        />
      )}
    />
  );
}
