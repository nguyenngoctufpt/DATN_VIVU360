import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Camera, Save, User, Mail, Phone, Sparkles, X, Award } from 'lucide-react-native';
import { getRankDetails } from '../data';
import { getSafeAvatarSource } from '../utils/image';

const { width } = Dimensions.get('window');

const presetAvatars = [
  'https://i.pravatar.cc/150?img=68', // Explorer Minh
  'https://i.pravatar.cc/150?img=33', // Backpacker boy
  'https://i.pravatar.cc/150?img=47', // Sunlit traveler girl
  'https://i.pravatar.cc/150?img=12', // Scenic view blogger
  'https://i.pravatar.cc/150?img=26', // Hiking girl
  'https://i.pravatar.cc/150?img=11', // Mountain adventurer
];

export function EditProfileScreen({ theme, isDarkMode, onBack, onSave, currentUser = {} }) {
  const user = currentUser || {};
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '0987654321');
  const [bio, setBio] = useState(
    user.bio ||
      'Thích tìm hiểu lịch sử, danh lam thắng cảnh. Thích trải nghiệm tham quan ảo AR 360 độ trên Vivu360! 🌐🎒'
  );
  const [avatar, setAvatar] = useState(user.avatar || 'https://i.pravatar.cc/150?img=68');
  const [isSaving, setIsSaving] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const rank = getRankDetails(user.points || 0);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống.');
      return;
    }

    setIsSaving(true);

    // Simulate API call saving data
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Thành công', 'Thông tin cá nhân của bạn đã được cập nhật!');
      if (onSave) {
        onSave({ name, email, phone, bio, avatar });
      }
      onBack();
    }, 1200);
  };

  const getBorderColor = (fieldName) => {
    if (focusedField === fieldName) return '#3b82f6';
    return theme.border;
  };

  const getIconColor = (fieldName) => {
    if (focusedField === fieldName) return '#3b82f6';
    return theme.textMuted;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: theme.border },
            ]}
            onPress={() => {
              if (onBack) {
                onBack();
              }
            }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Chỉnh sửa thông tin</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Cover Gradient Banner */}
          <LinearGradient
            colors={isDarkMode ? ['#1e3a8a', '#6b21a8'] : ['#93c5fd', '#c084fc']}
            style={styles.coverBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles size={16} color="rgba(255, 255, 255, 0.4)" style={styles.bannerDecor1} />
            <Sparkles size={24} color="rgba(255, 255, 255, 0.2)" style={styles.bannerDecor2} />
          </LinearGradient>

          {/* Avatar Section with Rank Frame */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={rank.colors}
              style={styles.avatarFrame}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.avatarInnerContainer, { backgroundColor: theme.background }]}>
                <Image source={getSafeAvatarSource(avatar)} style={styles.avatarImage} />
              </View>
            </LinearGradient>
            
            {/* Rank Floating Badge */}
            <View style={[styles.rankBadge, { backgroundColor: rank.borderColor }]}>
              <Award size={10} color="#fff" />
              <Text style={styles.rankBadgeText}>{rank.rankName}</Text>
            </View>
            
            <Text style={[styles.avatarTip, { color: theme.textSecondary }]}>Khung tích điểm xếp hạng: {rank.rankName}</Text>
          </View>

          {/* Preset Travel Avatars selection */}
          <View style={styles.presetsSection}>
            <Text style={[styles.presetsTitle, { color: theme.textPrimary }]}>Chọn nhanh ảnh đại diện du lịch</Text>
            <View style={styles.presetsRow}>
              {presetAvatars.map((url, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setAvatar(url)}
                  style={[
                    styles.presetThumbWrapper,
                    {
                      borderColor: avatar === url ? '#3b82f6' : theme.border,
                      borderWidth: avatar === url ? 3 : 1,
                      shadowColor: '#3b82f6',
                      shadowOpacity: avatar === url ? 0.3 : 0,
                    },
                  ]}
                >
                  <Image source={getSafeAvatarSource(url)} style={styles.presetThumb} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Input Forms */}
          <View style={styles.formSection}>
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Đường dẫn ảnh đại diện (URL)</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('avatarUrl'),
                    shadowOpacity: focusedField === 'avatarUrl' ? 0.1 : 0,
                  },
                ]}
              >
                <Camera size={16} color={getIconColor('avatarUrl')} />
                <TextInput
                  value={avatar}
                  onChangeText={setAvatar}
                  onFocus={() => setFocusedField('avatarUrl')}
                  onBlur={() => setFocusedField(null)}
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  placeholder="Dán liên kết ảnh mới của bạn"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Họ và tên</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('name'),
                    shadowOpacity: focusedField === 'name' ? 0.1 : 0,
                  },
                ]}
              >
                <User size={16} color={getIconColor('name')} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Địa chỉ Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('email'),
                    shadowOpacity: focusedField === 'email' ? 0.1 : 0,
                  },
                ]}
              >
                <Mail size={16} color={getIconColor('email')} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  placeholder="Nhập địa chỉ email"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Số điện thoại</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('phone'),
                    shadowOpacity: focusedField === 'phone' ? 0.1 : 0,
                  },
                ]}
              >
                <Phone size={16} color={getIconColor('phone')} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Tiểu sử bản thân</Text>
              <View
                style={[
                  styles.textareaContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('bio'),
                  },
                ]}
              >
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline={true}
                  numberOfLines={4}
                  onFocus={() => setFocusedField('bio')}
                  onBlur={() => setFocusedField(null)}
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

        {/* Dual Button Footer */}
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <Pressable
            style={[styles.cancelBtn, { backgroundColor: theme.statusBg, borderColor: theme.border }]}
            onPress={onBack}
          >
            <X size={15} color={theme.textPrimary} />
            <Text style={[styles.cancelText, { color: theme.textPrimary }]}>Hủy</Text>
          </Pressable>

          <Pressable style={styles.submitBtn} onPress={handleSave} disabled={isSaving}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1, width: '100%' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 10,
    elevation: 5,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },

  scrollContent: { flex: 1 },

  coverBanner: {
    height: 110,
    width: '100%',
    position: 'relative',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bannerDecor1: { position: 'absolute', top: 15, right: 30 },
  bannerDecor2: { position: 'absolute', bottom: 20, left: 25 },

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  rankBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  avatarTip: { fontSize: 10, fontWeight: '700', marginTop: 12 },

  presetsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  presetsTitle: { fontSize: 11, fontWeight: '800', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  presetThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  formSection: { paddingHorizontal: 20 },
  formGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 11, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  inputContainer: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  textInput: { flex: 1, marginLeft: 12, fontSize: 13, fontWeight: '600', height: '100%' },

  textareaContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    height: 110,
  },
  textarea: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },

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
  cancelText: { fontSize: 14, fontWeight: '800' },
  submitBtn: { flex: 2.2, height: 48, borderRadius: 14, overflow: 'hidden' },
  submitGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});



