import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Heart, Image as ImageIcon, MapPin, MessageCircle, Pencil, Send, Trash2, UserRound, X } from 'lucide-react-native';
import { loadAppData, saveAppData } from '../services/appDataService';
import { deletePost, getUserPosts, mapMongoPostToFeedPost } from '../services/postService';
import { PostCard } from '../components/PostCard';
import { EditPostModal } from '../social/editPostModal';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=68';

export function ProfileFeedScreen({ theme, isDarkMode, userInfo = {}, ownerId, onEditProfile }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postImage, setPostImage] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Edit Post states
  const [editingPost, setEditingPost] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleOpenEdit = (postToEdit) => {
    setEditingPost(postToEdit);
    setEditModalVisible(true);
  };

  const handlePostUpdated = (updatedPost) => {
    const nextPosts = posts.map(p => (p.id === updatedPost.id || p._id === updatedPost._id) ? updatedPost : p);
    setPosts(nextPosts);
    if (ownerId) {
      saveAppData(ownerId, 'social', { posts: nextPosts })
        .catch(err => console.warn('Cập nhật AppData thất bại:', err.message));
    }
  };

  useEffect(() => {
    let active = true;
    if (!ownerId) {
      setPosts([]);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);

    // Lấy bài viết cá nhân từ MongoDB Backend API
    getUserPosts(ownerId, ownerId)
      .then(mongoPosts => {
        if (!active) return;
        if (Array.isArray(mongoPosts) && mongoPosts.length > 0) {
          setPosts(mongoPosts.map(mapMongoPostToFeedPost));
        } else {
          loadAppData(ownerId, 'social').then(saved => {
            if (active) setPosts(Array.isArray(saved?.posts) ? saved.posts : []);
          });
        }
      })
      .catch(error => {
        console.warn('[ProfileFeed] Tải bài viết cá nhân từ MongoDB thất bại, fallback local:', error.message);
        if (active) {
          loadAppData(ownerId, 'social')
            .then(saved => setPosts(Array.isArray(saved?.posts) ? saved.posts : []))
            .catch(() => setPosts([]));
        }
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [ownerId]);

  const myPosts = useMemo(() => posts.filter(post =>
    (post.user?.firebaseUid && post.user.firebaseUid === ownerId) ||
    (!post.user?.firebaseUid && post.user?.name === userInfo.name)
  ), [posts, ownerId, userInfo.name]);

  const handleDeletePost = (targetPostId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài viết này khỏi trang cá nhân và bảng tin?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa bài viết',
          style: 'destructive',
          onPress: async () => {
            const nextPosts = posts.filter(p => p.id !== targetPostId && p._id !== targetPostId);
            setPosts(nextPosts);
            if (ownerId) {
              saveAppData(ownerId, 'social', { posts: nextPosts })
                .catch(err => console.warn('Cập nhật AppData thất bại:', err.message));
              deletePost(ownerId, targetPostId)
                .catch(err => console.warn('Xóa bài viết MongoDB thất bại:', err.message));
            }
          }
        }
      ]
    );
  };

  const publishPost = async () => {
    const content = postContent.trim();
    if (!content) {
      Alert.alert('Thiếu nội dung', 'Hãy nhập nội dung bài viết trước khi đăng.');
      return;
    }
    if (!ownerId || publishing) return;

    const newPost = {
      id: Date.now(),
      title: content.length > 70 ? `${content.slice(0, 70)}...` : content,
      category: 'Khám phá',
      source: userInfo.name,
      time: 'Vừa xong',
      location: postLocation.trim() || 'Việt Nam',
      content,
      image: postImage.trim(),
      likes: 0,
      commentsCount: 0,
      likedByUser: false,
      comments: [],
      user: {
        firebaseUid: ownerId,
        name: userInfo.name,
        avatar: userInfo.avatar,
        level: userInfo.level || 'Cấp 1',
        points: userInfo.points || 0,
      },
    };
    const nextPosts = [newPost, ...posts];

    setPublishing(true);
    try {
      await saveAppData(ownerId, 'social', { posts: nextPosts });
      setPosts(nextPosts);
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
          <Image source={{ uri: userInfo.cover || DEFAULT_COVER }} style={styles.cover} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFillObject} />
          <View style={styles.cameraBadge}><Camera size={16} color="#fff" /></View>
        </View>

        <View style={styles.identityArea}>
          <View style={[styles.avatarFrame, { backgroundColor: theme.card }]}>
            <Image source={{ uri: userInfo.avatar || DEFAULT_AVATAR }} style={styles.avatar} />
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
          <Image source={{ uri: userInfo.avatar || DEFAULT_AVATAR }} style={styles.composerAvatar} />
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
            {!!postImage.trim() && <Image source={{ uri: postImage.trim() }} style={styles.imagePreview} />}
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
      ) : myPosts.map((post, idx) => (
        <PostCard
          key={post.id || post._id || idx}
          post={post}
          theme={theme}
          isDarkMode={isDarkMode}
          onMoreOptions={(targetPost) => {
            Alert.alert(
              'Tùy chọn bài viết',
              `Bài viết của bạn`,
              [
                { text: '✏️ Chỉnh sửa bài viết', onPress: () => handleOpenEdit(targetPost) },
                { text: '🗑️ Xóa bài viết', style: 'destructive', onPress: () => handleDeletePost(targetPost.id || targetPost._id) },
                { text: 'Đóng', style: 'cancel' }
              ]
            );
          }}
        />
      ))}

      <EditPostModal
        visible={editModalVisible}
        post={editingPost}
        onClose={() => setEditModalVisible(false)}
        onPostUpdated={handlePostUpdated}
        ownerId={ownerId}
        isDarkMode={isDarkMode}
        theme={theme}
      />
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
