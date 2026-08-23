import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  MapPin,
  Send,
  Newspaper,
  CheckCircle,
  Camera,
  Globe,
  Users,
  Lock,
  ArrowLeft,
  Sparkles,
  CloudUpload,
} from 'lucide-react-native';
import { createPost, uploadImage, mapMongoPostToFeedPost } from '../services/postService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  'Check-in 360° 📸',
  'Cẩm nang 🗺️',
  'Thời sự 📰',
  'Ẩm thực 🍜',
  'Sự kiện 🎪',
];

const PRIVACY_OPTIONS = [
  { key: 'public', label: '🌐 Công khai', desc: 'Mọi người trên Vivu360' },
  { key: 'friends', label: '👥 Bạn bè', desc: 'Chỉ bạn bè đã kết bạn' },
  { key: 'private', label: '🔒 Chỉ mình tôi', desc: 'Riêng tư cá nhân' },
];

const LOCATION_SUGGESTIONS = [
  '📍 Sapa, Lào Cai',
  '📍 Vịnh Hạ Long, Quảng Ninh',
  '📍 Phố cổ Hội An',
  '📍 Phú Quốc, Kiên Giang',
  '📍 Đà Nẵng',
  '📍 Hà Nội 360°',
];

const getUserAvatarByName = (name) => {
  if (!name) return 'https://i.pravatar.cc/150?img=11';
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const imgIndex = Math.abs(hash % 70) + 1;
  return `https://i.pravatar.cc/150?img=${imgIndex}`;
};

export function CreatePostModal({
  visible,
  onClose,
  ownerId,
  currentUser,
  isDarkMode,
  theme,
  onPostCreated,
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [privacy, setPrivacy] = useState('public');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [uploadedApiUrl, setUploadedApiUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để đính kèm hình ảnh vào bài viết.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImgUrl(asset.uri);
        setUploadedApiUrl('');

        const activeOwnerId = ownerId || currentUser?.firebaseUid || currentUser?.id || 'me';
        setIsUploading(true);

        try {
          const mime = asset.mimeType || 'image/jpeg';
          const payload = asset.base64
            ? `data:${mime};base64,${asset.base64}`
            : asset.uri;

          const uploadResult = await uploadImage(payload, activeOwnerId, 'posts');
          if (uploadResult && uploadResult.url) {
            setUploadedApiUrl(uploadResult.url);
          }
        } catch (uploadErr) {
          console.log('[CreatePost] Tải ảnh lên API thất bại, sẽ dùng đường dẫn tạm:', uploadErr.message);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thiết bị.');
    }
  };

  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Alert.alert('Nhập nội dung', 'Vui lòng viết đôi dòng chia sẻ trải nghiệm du lịch của bạn trước khi đăng nhé!');
      return;
    }

    const activeOwnerId = ownerId || currentUser?.firebaseUid || currentUser?.id || 'me';

    setIsSubmitting(true);

    const defaultImages = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
    ];
    const finalImg = uploadedApiUrl || imgUrl.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];
    const postTitle = title.trim() || (trimmedContent.length > 40 ? trimmedContent.slice(0, 40) + '...' : 'Bản tin du lịch 360°');
    const postLocation = location.trim() || 'Việt Nam';

    const tempId = Date.now();
    const newPostObj = {
      id: tempId,
      _id: tempId,
      authorId: activeOwnerId,
      title: postTitle,
      category,
      privacy,
      source: 'Bạn đọc ' + (currentUser?.name || 'Vivu360'),
      time: 'Vừa xong',
      location: postLocation,
      content: trimmedContent,
      image: finalImg,
      images: [finalImg],
      likes: 0,
      commentsCount: 0,
      likedByUser: false,
      comments: [],
      user: {
        firebaseUid: activeOwnerId,
        name: currentUser?.name || 'Thành viên Vivu360',
        avatar: currentUser?.avatar || getUserAvatarByName(currentUser?.name),
        level: currentUser?.level || 'Cấp 1',
      },
    };

    // Callback optimistic update to feed
    if (onPostCreated) {
      onPostCreated(newPostObj);
    }

    // Reset Form & Close
    setTitle('');
    setLocation('');
    setImgUrl('');
    setUploadedApiUrl('');
    setContent('');
    setPrivacy('public');
    setIsSubmitting(false);
    onClose();

    // Call API MongoDB in background
    try {
      const createdMongoPost = await createPost(activeOwnerId, {
        content: trimmedContent,
        images: [finalImg],
        location: postLocation,
        category,
        privacy,
      });
      if (createdMongoPost && onPostCreated) {
        const formatted = mapMongoPostToFeedPost(createdMongoPost);
        if (formatted) {
          onPostCreated(formatted);
        }
      }
    } catch (err) {
      console.log('[CreatePost] Sync API MongoDB fallback:', err.message);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.root, { backgroundColor: isDarkMode ? '#0a0914' : '#f8fafc' }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Header Bar */}
          <View style={[
            styles.header,
            {
              backgroundColor: isDarkMode ? '#131124' : '#ffffff',
              borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            }
          ]}>
            <Pressable style={styles.backBtn} onPress={onClose} hitSlop={10}>
              <ArrowLeft size={22} color={theme.textPrimary} />
            </Pressable>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Tạo Bài Viết Mới ✨</Text>
              <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: '600', marginTop: 1 }}>
                Chia sẻ trải nghiệm & cẩm nang du lịch 360°
              </Text>
            </View>

            <Pressable
              style={[styles.submitBtnWrap, (isSubmitting || isUploading) && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isSubmitting || isUploading}
            >
              <LinearGradient
                colors={['#f43f5e', '#e11d48']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitBtnGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Send size={14} color="#ffffff" />
                    <Text style={styles.submitBtnText}>ĐĂNG BÀI</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Main Form Scroll View */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Author Profile Banner */}
            <View style={[
              styles.authorCard,
              {
                backgroundColor: isDarkMode ? '#161426' : '#ffffff',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              }
            ]}>
              <LinearGradient
                colors={['#f43f5e', '#3b82f6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.authorAvatarRing}
              >
                <Image
                  source={{ uri: currentUser?.avatar || getUserAvatarByName(currentUser?.name || 'me') }}
                  style={styles.authorAvatar}
                />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.authorName, { color: theme.textPrimary }]}>
                    {currentUser?.name || 'Thành viên Vivu360'}
                  </Text>
                  <CheckCircle size={15} color="#fff" fill="#3b82f6" />
                </View>
                <Text style={styles.authorTagline}>Tác giả chia sẻ cẩm nang Vivu360 🌟</Text>
              </View>
            </View>

            {/* Privacy Selector */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>🔒 Quyền riêng tư bài viết</Text>
            <View style={styles.privacyRow}>
              {PRIVACY_OPTIONS.map((p) => {
                const isSelected = privacy === p.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => setPrivacy(p.key)}
                    style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={['#3b82f6', '#2563eb']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.privacyOptionActive}
                      >
                        <Text style={styles.privacyLabelActive}>{p.label}</Text>
                        <Text style={styles.privacyDescActive}>{p.desc}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[
                        styles.privacyOptionInactive,
                        {
                          backgroundColor: isDarkMode ? '#161426' : '#ffffff',
                          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                        }
                      ]}>
                        <Text style={[styles.privacyLabelInactive, { color: theme.textPrimary }]}>{p.label}</Text>
                        <Text style={[styles.privacyDescInactive, { color: theme.textMuted }]}>{p.desc}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Category Selector Pills */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>🏷️ Chuyên mục du lịch</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable key={cat} onPress={() => setCategory(cat)} style={{ borderRadius: 14, overflow: 'hidden' }}>
                    {isSelected ? (
                      <LinearGradient
                        colors={['#f43f5e', '#e11d48']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.categoryPillActive}
                      >
                        <Text style={styles.categoryTextActive}>{cat}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[
                        styles.categoryPillInactive,
                        {
                          backgroundColor: isDarkMode ? '#161426' : '#ffffff',
                          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                        }
                      ]}>
                        <Text style={[styles.categoryTextInactive, { color: theme.textSecondary }]}>{cat}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Title Input */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>📍 Tiêu đề bài viết</Text>
            <View style={[
              styles.inputGroup,
              {
                backgroundColor: isDarkMode ? '#161426' : '#ffffff',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
              }
            ]}>
              <Newspaper size={18} color="#3b82f6" />
              <TextInput
                placeholder="Nhập tiêu đề (Ví dụ: Trải nghiệm săn mây Y Tý 3D...)"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                style={[styles.inputField, { color: theme.textPrimary }]}
              />
            </View>

            {/* Content Textarea Input */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
              <Text style={[styles.sectionLabel, { color: theme.textPrimary, marginTop: 0, marginBottom: 0 }]}>✍️ Nội dung chia sẻ</Text>
              <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: '700' }}>{content.length} / 2000 ký tự</Text>
            </View>
            <TextInput
              placeholder="Bạn muốn chia sẻ cẩm nang, góc ảnh check-in hay câu chuyện phượt du lịch gì hôm nay thế?"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={7}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
              style={[
                styles.textareaInput,
                {
                  color: theme.textPrimary,
                  backgroundColor: isDarkMode ? '#161426' : '#ffffff',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                }
              ]}
            />

            {/* Location Input & Suggestions */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>🗺️ Địa điểm check-in</Text>
            <View style={[
              styles.inputGroup,
              {
                backgroundColor: isDarkMode ? '#161426' : '#ffffff',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
              }
            ]}>
              <MapPin size={18} color="#ef4444" />
              <TextInput
                placeholder="Nhập vị trí (VD: Sa Pa, Lào Cai...)"
                placeholderTextColor={theme.textMuted}
                value={location}
                onChangeText={setLocation}
                style={[styles.inputField, { color: theme.textPrimary }]}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8, marginBottom: 18 }}>
              {LOCATION_SUGGESTIONS.map((loc) => (
                <Pressable
                  key={loc}
                  onPress={() => setLocation(loc.replace(/^📍\s*/, ''))}
                  style={[
                    styles.locChip,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    }
                  ]}
                >
                  <Text style={[styles.locChipText, { color: theme.textSecondary }]}>{loc}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Image Upload Box */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>🖼️ Hình ảnh bài viết</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
              <Pressable
                onPress={handlePickImage}
                disabled={isUploading}
                style={[
                  styles.uploadBtn,
                  {
                    backgroundColor: isDarkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
                    borderColor: '#6366f1',
                    opacity: isUploading ? 0.6 : 1,
                  }
                ]}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#6366f1" />
                ) : (
                  <Camera size={20} color="#6366f1" />
                )}
                <Text style={styles.uploadBtnText}>
                  {isUploading ? 'Đang tải ảnh lên máy chủ...' : 'Tải ảnh từ điện thoại'}
                </Text>
              </Pressable>
            </View>

            {/* Preview Image Thumbnail & Status */}
            {imgUrl.length > 0 && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imgUrl }} style={styles.previewImage} />
                <Pressable style={styles.removeImgBtn} onPress={() => { setImgUrl(''); setUploadedApiUrl(''); }}>
                  <X size={14} color="#ffffff" />
                </Pressable>
                {isUploading ? (
                  <View style={styles.uploadBadge}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.uploadBadgeText}>Đang lưu ảnh lên API...</Text>
                  </View>
                ) : uploadedApiUrl ? (
                  <View style={[styles.uploadBadge, { backgroundColor: 'rgba(16,185,129,0.85)' }]}>
                    <CheckCircle size={14} color="#ffffff" />
                    <Text style={styles.uploadBadgeText}>Đã lưu trữ trên API máy chủ</Text>
                  </View>
                ) : null}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 46,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(150,150,150,0.1)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  submitBtnWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
  },
  authorAvatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '900',
  },
  authorTagline: {
    fontSize: 11,
    fontWeight: '800',
    color: '#f59e0b',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 8,
  },
  privacyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  privacyOptionActive: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderRadius: 14,
  },
  privacyLabelActive: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#ffffff',
  },
  privacyDescActive: {
    fontSize: 9.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  privacyOptionInactive: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderRadius: 14,
  },
  privacyLabelInactive: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  privacyDescInactive: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 2,
  },
  categoryScroll: {
    gap: 8,
    marginBottom: 16,
  },
  categoryPillActive: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 14,
  },
  categoryTextActive: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  categoryPillInactive: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 14,
  },
  categoryTextInactive: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
  },
  textareaInput: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    height: 140,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 8,
  },
  locChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  locChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  uploadBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadBtnText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '800',
  },
  previewContainer: {
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    height: 190,
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImgBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  uploadBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
