import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Heart, Image as ImageIcon, MapPin, MessageCircle, Pencil, Send, UserRound, X } from 'lucide-react-native';
import { createPost, getUserPosts } from '../services/postService';
import { getSafeAvatarSource, getSafeCoverSource, getSafeImageSource, hasImageUri } from '../utils/image';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80';

export function ProfileFeedScreen({ theme, isDarkMode, userInfo = {}, ownerId, onEditProfile }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postImage, setPostImage] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let active = true;
    if (!ownerId) {
      setPosts([]);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    getUserPosts(ownerId)
      .then(items => {
        if (active) setPosts((Array.isArray(items) ? items : []).map(post => ({
          ...post,
          id: post._id,
          image: post.images?.[0] || '',
          likes: post.likesCount || 0,
          likedByUser: Boolean(post.likedByMe),
          time: new Date(post.createdAt).toLocaleString('vi-VN'),
          user: post.author || {},
        })));
      })
      .catch(error => {
        if (active) setPosts([]);
        console.warn('Không thể tải bài viết cá nhân:', error.message);
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [ownerId]);

  const myPosts = useMemo(() => posts, [posts]);

  const publishPost = async () => {
    const content = postContent.trim();
    if (!content) {
      Alert.alert('Thiếu nội dung', 'Hãy nhập nội dung bài viết trước khi đăng.');
      return;
    }
    if (!ownerId || publishing) return;

    setPublishing(true);
    try {
      await createPost(ownerId, { content, category: 'Khám phá', location: postLocation.trim() || 'Việt Nam', images: postImage.trim() ? [postImage.trim()] : [] });
      const items = await getUserPosts(ownerId);
      setPosts(items.map(post => ({ ...post, id: post._id, image: post.images?.[0] || '', likes: post.likesCount || 0, likedByUser: Boolean(post.likedByMe), time: new Date(post.createdAt).toLocaleString('vi-VN'), user: post.author || {} })));
      setPostContent('');
      setPostLocation('');
      setPostImage('');
      setComposerOpen(false);
    } catch (error) {
      Alert.alert('Không thể đăng bài', 'Vui lòng kiểm tra kết nối Vivu360_API và thử lại.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.coverWrap}>
          <Image source={getSafeCoverSource(userInfo.cover, DEFAULT_COVER)} style={styles.cover} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFillObject} />
          <View style={styles.cameraBadge}><Camera size={16} color="#fff" /></View>
        </View>

        <View style={styles.identityArea}>
          <View style={[styles.avatarFrame, { backgroundColor: theme.card }]}>
            <Image source={getSafeAvatarSource(userInfo.avatar)} style={styles.avatar} />
          </View>
          <Pressable style={styles.editButton} onPress={onEditProfile}>
            <Pencil size={14} color="#fff" />
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </Pressable>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{userInfo.name || 'Người dùng Vivu360'}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{userInfo.email}</Text>
          {!!userInfo.bio && <Text style={[styles.bio, { color: theme.textPrimary }]}>{userInfo.bio}</Text>}
        </View>
      </View>

      <View style={[styles.composerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.composerTopRow}>
          <Image source={getSafeAvatarSource(userInfo.avatar)} style={styles.composerAvatar} />
          <Pressable
            style={[styles.composerPrompt, { backgroundColor: theme.searchBg, borderColor: theme.border }]}
            onPress={() => setComposerOpen(true)}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Bạn đang nghĩ gì?</Text>
          </Pressable>
        </View>

        {composerOpen && (
          <View style={[styles.composerExpanded, { borderTopColor: theme.border }]}>
            <View style={styles.composerHeading}>
              <Text style={[styles.composerTitle, { color: theme.textPrimary }]}>Tạo bài viết</Text>
              <Pressable onPress={() => setComposerOpen(false)} style={[styles.closeComposer, { backgroundColor: theme.searchBg }]}>
                <X size={16} color={theme.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              value={postContent}
              onChangeText={setPostContent}
              placeholder={`Bạn đang nghĩ gì, ${userInfo.name || 'bạn'}?`}
              placeholderTextColor={theme.textMuted}
              multiline
              autoFocus
              style={[styles.contentInput, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.border }]}
            />
            <View style={[styles.extraInputRow, { borderColor: theme.border }]}>
              <MapPin size={16} color="#3b82f6" />
              <TextInput value={postLocation} onChangeText={setPostLocation} placeholder="Thêm địa điểm" placeholderTextColor={theme.textMuted} style={[styles.extraInput, { color: theme.textPrimary }]} />
            </View>
            <View style={[styles.extraInputRow, { borderColor: theme.border }]}>
              <ImageIcon size={16} color="#10b981" />
              <TextInput value={postImage} onChangeText={setPostImage} placeholder="Dán URL hình ảnh (không bắt buộc)" placeholderTextColor={theme.textMuted} autoCapitalize="none" style={[styles.extraInput, { color: theme.textPrimary }]} />
            </View>
            {hasImageUri(postImage) && <Image source={getSafeImageSource(postImage)} style={styles.imagePreview} />}
            <Pressable style={[styles.publishButton, publishing && { opacity: 0.6 }]} onPress={publishPost} disabled={publishing}>
              <Send size={16} color="#fff" />
              <Text style={styles.publishText}>{publishing ? 'Đang đăng...' : 'Đăng bài'}</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Bài viết của tôi</Text>
        <Text style={[styles.postCount, { color: theme.textSecondary }]}>{myPosts.length} bài viết</Text>
      </View>

      {loading ? (
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Đang tải bài viết...</Text>
      ) : myPosts.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff' }]}>
            <UserRound size={28} color="#3b82f6" />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Chưa có bài viết</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Các bài bạn đăng trên Bảng tin sẽ xuất hiện tại đây.</Text>
        </View>
      ) : myPosts.map(post => (
        <View key={post.id} style={[styles.postCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.postHeader}>
            <Image source={getSafeAvatarSource(userInfo.avatar)} style={styles.postAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.postAuthor, { color: theme.textPrimary }]}>{userInfo.name}</Text>
              <Text style={[styles.postMeta, { color: theme.textSecondary }]}>{post.time || 'Vừa xong'} · Vivu360</Text>
            </View>
          </View>
          {!!post.content && <Text style={[styles.postContent, { color: theme.textPrimary }]}>{post.content}</Text>}
          {!!post.location && (
            <View style={styles.locationRow}><MapPin size={13} color="#3b82f6" /><Text style={styles.locationText}>{post.location}</Text></View>
          )}
          {hasImageUri(post.image) && <Image source={getSafeImageSource(post.image)} style={styles.postImage} />}
          <View style={[styles.postActions, { borderTopColor: theme.border }]}>
            <View style={styles.action}><Heart size={17} color={post.likedByUser ? '#ef4444' : theme.textSecondary} fill={post.likedByUser ? '#ef4444' : 'transparent'} /><Text style={{ color: theme.textSecondary }}>{post.likes || 0}</Text></View>
            <View style={styles.action}><MessageCircle size={17} color={theme.textSecondary} /><Text style={{ color: theme.textSecondary }}>{post.commentsCount || 0}</Text></View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', paddingBottom: 28 },
  profileCard: { borderBottomWidth: 1, paddingBottom: 18 },
  coverWrap: { height: 180, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  cameraBadge: { position: 'absolute', right: 14, bottom: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  identityArea: { paddingHorizontal: 16, paddingTop: 46, position: 'relative' },
  avatarFrame: { position: 'absolute', top: -58, left: 16, width: 102, height: 102, borderRadius: 51, padding: 4 },
  avatar: { width: '100%', height: '100%', borderRadius: 47, borderWidth: 2, borderColor: '#3b82f6' },
  editButton: { position: 'absolute', top: 10, right: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3b82f6', paddingHorizontal: 12, height: 34, borderRadius: 8 },
  editButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  name: { fontSize: 23, fontWeight: '900' },
  email: { fontSize: 12, marginTop: 3 },
  bio: { fontSize: 13, lineHeight: 19, marginTop: 12 },
  composerCard: { margin: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  composerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  composerAvatar: { width: 42, height: 42, borderRadius: 21 },
  composerPrompt: { flex: 1, height: 42, borderRadius: 21, borderWidth: 1, paddingHorizontal: 15, justifyContent: 'center' },
  composerExpanded: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  composerHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  composerTitle: { fontSize: 16, fontWeight: '900' },
  closeComposer: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  contentInput: { minHeight: 105, borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, lineHeight: 20, textAlignVertical: 'top' },
  extraInputRow: { height: 42, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  extraInput: { flex: 1, fontSize: 12, paddingVertical: 0 },
  imagePreview: { width: '100%', height: 180, borderRadius: 12 },
  publishButton: { height: 42, borderRadius: 10, backgroundColor: '#3b82f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  publishText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  sectionHeader: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  postCount: { fontSize: 11, fontWeight: '600' },
  emptyCard: { margin: 16, padding: 28, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  emptyIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginBottom: 5 },
  emptyText: { fontSize: 12, lineHeight: 18, textAlign: 'center', paddingVertical: 16 },
  postCard: { marginHorizontal: 12, marginTop: 12, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  postAvatar: { width: 42, height: 42, borderRadius: 21 },
  postAuthor: { fontSize: 14, fontWeight: '800' },
  postMeta: { fontSize: 10.5, marginTop: 2 },
  postContent: { fontSize: 13.5, lineHeight: 20, paddingHorizontal: 12, paddingBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingBottom: 10 },
  locationText: { color: '#3b82f6', fontSize: 11, fontWeight: '700' },
  postImage: { width: '100%', height: 260 },
  postActions: { height: 44, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});







