import React from 'react';
import { SettingItem } from './SettingItem';

export function SettingSelect(props) {
  return <SettingItem {...props} showChevron={props.showChevron !== false} />;
}
