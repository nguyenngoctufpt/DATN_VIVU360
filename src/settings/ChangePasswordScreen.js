import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Lock } from 'lucide-react-native';
import { auth } from '../auth/firebaseConfig';
import { getSettingsText } from './constants';
import { SettingsLayout } from './components/SettingsLayout';

export function ChangePasswordScreen({ theme, language, onBack }) {
  const text = getSettingsText(language);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusBanner, setStatusBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const showBanner = (type, message) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 2800);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user?.email) {
      showBanner('error', text.saveError);
      return;
    }
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showBanner('error', language === 'en' ? 'Please fill in all password fields.' : 'Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      showBanner('error', language === 'en' ? 'The new password must contain at least 6 characters.' : 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showBanner('error', language === 'en' ? 'Password confirmation does not match.' : 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showBanner('success', language === 'en' ? 'Password updated successfully.' : 'Mật khẩu đã được cập nhật thành công.');
    } catch (error) {
      const message = error?.code === 'auth/invalid-credential'
        ? (language === 'en' ? 'The current password is incorrect.' : 'Mật khẩu hiện tại không chính xác.')
        : (error?.message || text.saveError);
      showBanner('error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      theme={theme}
      title={text.changePassword}
      subtitle={text.changePasswordDescription}
      onBack={onBack}
      statusBanner={statusBanner}
      footer={(
        <Pressable style={[styles.submitButton, { backgroundColor: '#2563eb', opacity: saving ? 0.7 : 1 }]} onPress={handleSubmit} disabled={saving}>
          <Text style={styles.submitText}>{saving ? text.saving : text.update}</Text>
        </Pressable>
      )}
    >
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <PasswordField
          theme={theme}
          label={language === 'en' ? 'Current password' : 'Mật khẩu hiện tại'}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <PasswordField
          theme={theme}
          label={language === 'en' ? 'New password' : 'Mật khẩu mới'}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <PasswordField
          theme={theme}
          label={language === 'en' ? 'Confirm new password' : 'Xác nhận mật khẩu mới'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          noBorder
        />
      </View>
    </SettingsLayout>
  );
}

function PasswordField({ theme, label, value, onChangeText, noBorder = false }) {
  return (
    <View style={[styles.fieldWrap, !noBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
        <Lock size={16} color="#3b82f6" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry
          autoCapitalize="none"
          style={[styles.input, { color: theme.textPrimary }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  fieldWrap: {
    paddingVertical: 16,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
  inputWrap: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
