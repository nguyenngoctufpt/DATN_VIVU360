import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { Award, Camera, ChevronLeft, Mail, Phone, Save, Sparkles, User, X } from 'lucide-react-native';
import { auth } from '../auth/firebaseConfig';
import { getRankDetails } from '../data';
import { updateUser } from '../services/userService';
import { getSafeAvatarSource } from '../utils/image';

const presetAvatars = [
  'https://i.pravatar.cc/150?img=68',
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=26',
  'https://i.pravatar.cc/150?img=11',
];

export function EditProfileScreen({ theme, isDarkMode, onBack, onSave, currentUser = {}, ownerId }) {
  const user = currentUser || {};
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || presetAvatars[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const rank = getRankDetails(user.points || 0);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống.');
      return;
    }

    const nextProfile = {
      name: name.trim(),
      email: user.email || '',
      phone: phone.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
    };

    setIsSaving(true);
    try {
      if (ownerId) {
        await updateUser(ownerId, nextProfile);
      }

      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: nextProfile.name,
          photoURL: nextProfile.avatar || undefined,
        });
      }

      if (onSave) {
        onSave(nextProfile);
      }

      Alert.alert('Thành công', 'Thông tin cá nhân của bạn đã được cập nhật.');
      onBack();
    } catch (error) {
      Alert.alert(
        'Cập nhật thất bại',
        error?.response?.data?.message || error?.message || 'Không thể lưu thông tin cá nhân lúc này.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getBorderColor = (fieldName) => (focusedField === fieldName ? '#3b82f6' : theme.border);
  const getIconColor = (fieldName) => (focusedField === fieldName ? '#3b82f6' : theme.textMuted);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: theme.border },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Chỉnh sửa thông tin</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={isDarkMode ? ['#1e3a8a', '#6b21a8'] : ['#93c5fd', '#c084fc']}
            style={styles.coverBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles size={16} color="rgba(255,255,255,0.4)" style={styles.bannerDecor1} />
            <Sparkles size={24} color="rgba(255,255,255,0.2)" style={styles.bannerDecor2} />
          </LinearGradient>

          <View style={styles.avatarSection}>
            <LinearGradient colors={rank.colors} style={styles.avatarFrame} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={[styles.avatarInnerContainer, { backgroundColor: theme.background }]}>
                <Image source={getSafeAvatarSource(avatar)} style={styles.avatarImage} />
              </View>
            </LinearGradient>

            <View style={[styles.rankBadge, { backgroundColor: rank.borderColor }]}>
              <Award size={10} color="#fff" />
              <Text style={styles.rankBadgeText}>{rank.rankName}</Text>
            </View>

            <Text style={[styles.avatarTip, { color: theme.textSecondary }]}>Khung xếp hạng hiện tại: {rank.rankName}</Text>
          </View>

          <View style={styles.presetsSection}>
            <Text style={[styles.presetsTitle, { color: theme.textPrimary }]}>Chọn nhanh ảnh đại diện</Text>
            <View style={styles.presetsRow}>
              {presetAvatars.map((url) => (
                <Pressable
                  key={url}
                  onPress={() => setAvatar(url)}
                  style={[
                    styles.presetThumbWrapper,
                    {
                      borderColor: avatar === url ? '#3b82f6' : theme.border,
                      borderWidth: avatar === url ? 3 : 1,
                    },
                  ]}
                >
                  <Image source={getSafeAvatarSource(url)} style={styles.presetThumb} />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Field
              theme={theme}
              label="Đường dẫn ảnh đại diện"
              value={avatar}
              onChangeText={setAvatar}
              icon={Camera}
              fieldName="avatar"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              getBorderColor={getBorderColor}
              getIconColor={getIconColor}
              autoCapitalize="none"
            />
            <Field
              theme={theme}
              label="Họ và tên"
              value={name}
              onChangeText={setName}
              icon={User}
              fieldName="name"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              getBorderColor={getBorderColor}
              getIconColor={getIconColor}
            />
            <Field
              theme={theme}
              label="Email"
              value={user.email || ''}
              onChangeText={() => {}}
              icon={Mail}
              fieldName="email"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              getBorderColor={getBorderColor}
              getIconColor={getIconColor}
              keyboardType="email-address"
              editable={false}
              valueColor={theme.textMuted}
            />
            <Field
              theme={theme}
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              icon={Phone}
              fieldName="phone"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              getBorderColor={getBorderColor}
              getIconColor={getIconColor}
              keyboardType="phone-pad"
            />

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Tiểu sử bản thân</Text>
              <View style={[styles.textareaContainer, { backgroundColor: theme.searchBg, borderColor: getBorderColor('bio') }]}>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  onFocus={() => setFocusedField('bio')}
                  onBlur={() => setFocusedField('')}
                  style={[styles.textarea, { color: theme.textPrimary }]}
                  placeholder="Giới thiệu đôi nét về bản thân của bạn..."
                  placeholderTextColor={theme.textMuted}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <Pressable style={[styles.cancelBtn, { backgroundColor: theme.statusBg, borderColor: theme.border }]} onPress={onBack}>
            <X size={15} color={theme.textPrimary} />
            <Text style={[styles.cancelText, { color: theme.textPrimary }]}>Hủy</Text>
          </Pressable>

          <Pressable style={styles.submitBtn} onPress={handleSave} disabled={isSaving}>
            <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Save size={15} color="#fff" />
                  <Text style={styles.submitText}>Lưu</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  theme,
  label,
  value,
  onChangeText,
  icon: Icon,
  fieldName,
  focusedField,
  setFocusedField,
  getBorderColor,
  getIconColor,
  editable = true,
  valueColor,
  ...rest
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.searchBg,
            borderColor: getBorderColor(fieldName),
            shadowOpacity: focusedField === fieldName ? 0.1 : 0,
          },
        ]}
      >
        <Icon size={16} color={getIconColor(fieldName)} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField('')}
          style={[styles.textInput, { color: valueColor || theme.textPrimary }]}
          placeholderTextColor={theme.textMuted}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  scrollContent: {
    flex: 1,
  },
  coverBanner: {
    height: 110,
    width: '100%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bannerDecor1: {
    position: 'absolute',
    top: 15,
    right: 30,
  },
  bannerDecor2: {
    position: 'absolute',
    bottom: 20,
    left: 25,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -55,
    marginBottom: 16,
    position: 'relative',
  },
  avatarFrame: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInnerContainer: {
    width: 102,
    height: 102,
    borderRadius: 51,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  rankBadge: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  rankBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  avatarTip: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 12,
  },
  presetsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  presetsTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  presetThumbWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
  },
  presetThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputContainer: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
  },
  textareaContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    height: 110,
  },
  textarea: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '800',
  },
  submitBtn: {
    flex: 2.2,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
