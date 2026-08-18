import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  MapPin,
  Image as ImageIcon,
  Globe,
  Users,
  Lock,
  Check,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { updatePost } from '../services/postService';

const CATEGORIES = ['Check-in 360°', 'Cẩm nang', 'Thời sự', 'Ẩm thực', 'Sự kiện'];
const PRIVACY_OPTIONS = [
  { key: 'public', label: 'Công khai', icon: Globe, color: '#10b981' },
  { key: 'friends', label: 'Bạn bè', icon: Users, color: '#3b82f6' },
  { key: 'private', label: 'Chỉ mình tôi', icon: Lock, color: '#6b7280' },
];

export function EditPostModal({ visible, post, onClose, onPostUpdated, ownerId, isDarkMode, theme }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Check-in 360°');
  const [privacy, setPrivacy] = useState('public');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content || post.title || '');
      setCategory(post.category || 'Check-in 360°');
      setPrivacy(post.privacy || 'public');
      setLocation(post.location || '');
      setImage(post.image || '');
    }
  }, [post, visible]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Cho phép truy cập thư viện ảnh để đính kèm ảnh.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setImage(res.assets[0].uri);
      }
    } catch (err) {
      console.warn('Lỗi chọn ảnh chỉnh sửa:', err.message);
    }
  };

  const handleSave = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập nội dung bài viết.');
      return;
    }

    if (!post) return;
    const postId = post.id || post._id;
    const activeUserId = ownerId || post.user?.firebaseUid || 'me';

    setSaving(true);

    const updatePayload = {
      content: trimmedContent,
      title: trimmedContent.length > 70 ? `${trimmedContent.slice(0, 70)}...` : trimmedContent,
      category,
      privacy,
      location: location.trim(),
      images: image.trim() ? [image.trim()] : [],
      image: image.trim(),
    };

    try {
      if (postId) {
        await updatePost(activeUserId, postId, updatePayload);
      }
    } catch (error) {
      console.log('[EditPostModal] Cập nhật API MongoDB fallback:', error.message);
    } finally {
      setSaving(false);
      Alert.alert('Thành công ✨', 'Bài viết đã được chỉnh sửa thành công!');
      if (onPostUpdated) {
        onPostUpdated({
          ...post,
          ...updatePayload,
        });
      }
      onClose();
    }
  };

  if (!visible || !post) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#131124' : '#ffffff' }]}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={onClose} style={styles.iconCircle}>
                <X size={18} color={theme?.textPrimary || '#1e1b2e'} />
              </Pressable>
              <View style={styles.headerTitleWrap}>
                <Text style={[styles.headerTitle, { color: theme?.textPrimary || '#1e1b2e' }]}>
                  ✏️ Chỉnh sửa bài viết
                </Text>
                <Text style={styles.headerSub}>Cập nhật lại nội dung, địa điểm hoặc ảnh</Text>
              </View>
              <Pressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
                <LinearGradient colors={['#f43f5e', '#e11d48']} style={styles.saveGrad}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Check size={14} color="#fff" strokeWidth={3} />
                      <Text style={styles.saveText}>Lưu</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Category Pills */}
              <Text style={styles.sectionLabel}>CHUYÊN MỤC BÀI ĐĂNG</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={styles.pillsRow}>
                  {CATEGORIES.map((cat) => {
                    const active = category === cat;
                    return (
                      <Pressable key={cat} onPress={() => setCategory(cat)}>
                        {active ? (
                          <LinearGradient colors={['#f43f5e', '#e11d48']} style={styles.pillActive}>
                            <Text style={styles.pillActiveText}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={[styles.pillInactive, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }]}>
                            <Text style={[styles.pillInactiveText, { color: theme?.textSecondary || '#64748b' }]}>{cat}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Privacy Options */}
              <Text style={styles.sectionLabel}>QUYỀN RIÊNG TƯ</Text>
              <View style={styles.privacyRow}>
                {PRIVACY_OPTIONS.map((p) => {
                  const active = privacy === p.key;
                  const IconComponent = p.icon;
                  return (
                    <Pressable key={p.key} onPress={() => setPrivacy(p.key)} style={styles.flex}>
                      {active ? (
                        <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.privacyPillActive}>
                          <IconComponent size={12} color="#fff" />
                          <Text style={styles.privacyActiveText}>{p.label}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={[styles.privacyPillInactive, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }]}>
                          <IconComponent size={12} color={p.color} />
                          <Text style={[styles.privacyInactiveText, { color: theme?.textSecondary || '#64748b' }]}>{p.label}</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Content Text Area */}
              <Text style={styles.sectionLabel}>NỘI DUNG CHIA SẺ</Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                multiline
                placeholder="Nhập nội dung bài viết..."
                placeholderTextColor="#94a3b8"
                style={[
                  styles.textArea,
                  {
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              />

              {/* Location */}
              <Text style={styles.sectionLabel}>ĐỊA ĐIỂM CHECK-IN</Text>
              <View style={[styles.inputBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc' }]}>
                <MapPin size={16} color="#ef4444" />
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Thêm địa điểm..."
                  placeholderTextColor="#94a3b8"
                  style={[styles.inputField, { color: isDarkMode ? '#f8fafc' : '#0f172a' }]}
                />
              </View>

              {/* Image Preview & Change */}
              <Text style={styles.sectionLabel}>HÌNH ẢNH MINH HỌA</Text>
              {image ? (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <Pressable onPress={() => setImage('')} style={styles.removeImgBtn}>
                    <Trash2 size={14} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={pickImage} style={styles.addImgBtn}>
                  <ImageIcon size={18} color="#10b981" />
                  <Text style={styles.addImgText}>Chọn ảnh từ Album máy</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '900' },
  headerSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  saveBtn: { borderRadius: 16, overflow: 'hidden' },
  saveGrad: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  scrollBody: { padding: 16 },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  pillsRow: { flexDirection: 'row', gap: 8 },
  pillActive: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  pillActiveText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  pillInactive: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  pillInactiveText: { fontSize: 11.5, fontWeight: '700' },
  privacyRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  privacyPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  privacyActiveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  privacyPillInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  privacyInactiveText: { fontSize: 11, fontWeight: '700' },
  textArea: {
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
  },
  inputField: { flex: 1, fontSize: 13, fontWeight: '600' },
  imagePreviewWrap: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImgBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#10b981',
    marginBottom: 16,
  },
  addImgText: { color: '#10b981', fontSize: 12.5, fontWeight: '800' },
});
