import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, TextInput, Alert, Modal, ScrollView, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CheckCircle, Edit, Heart, Image as ImageIcon, MapPin, MessageCircle, MoreVertical, Pencil, Send, Trash2, UserRound, X } from 'lucide-react-native';
import { addPostComment, createPost, deleteComment, deletePost, editComment, editPost, getUserPosts, togglePostLike } from '../services/postService';
import { getSafeAvatarSource, getSafeCoverSource, getSafeImageSource, hasImageUri } from '../utils/image';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80';
const normalizeComments = (comments) => (
  Array.isArray(comments) ? comments : []
);
const getSafeComments = (comments) => {
  return Array.isArray(comments) ? comments : [];
};

const { width, height } = Dimensions.get('window');

export function ProfileFeedScreen({ theme, isDarkMode, userInfo = {}, ownerId, onEditProfile }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postImage, setPostImage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [friendships, setFriendships] = useState([]);
  const [targetUsername, setTargetUsername] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const menuButtonRef = useRef(null);
  const [editingPost, setEditingPost] = useState(null);
  const [commentMenuVisible, setCommentMenuVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

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
          title: post.title || post.category || 'Hành trình mới',
          comments: normalizeComments(post.comments).map(comment => ({
            id: comment._id,
            user: comment.author?.name || 'Thành viên Vivu360',
            avatar: comment.author?.avatar,
            text: comment.text,
            createdAt: comment.createdAt,
            authorId: comment.author?.firebaseUid,
          })),
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
      if (editingPost) {
        const updated = await editPost(ownerId, editingPost.id, {
          content,
          location: postLocation.trim() || 'Việt Nam',
          images: postImage.trim() ? [postImage.trim()] : [],
        });
        
        setPosts(prev =>
          prev.map(post => post.id === selectedPost.id ? { ...post, ...updated, comments: getSafeComments(post.comments) } : post)
        );
        setEditingPost(null);
        setPostContent('');
        setPostLocation('');
        setPostImage('');
        setComposerOpen(false);

        const updatedPost = { ...editingPost, ...updated };
        setSelectedPost(prev => {
          if (!prev) return prev;
          return { ...prev, ...updatedPost, comments: getSafeComments(prev.comments) };
        });

        setCommentModalVisible(true);
      } else {
        await createPost(ownerId, {
          content,
          location: postLocation.trim() || 'Việt Nam',
          images: postImage.trim() ? [postImage.trim()] : [],
        });

        const items = await getUserPosts(ownerId);
        setPosts(items.map(post => ({
          ...post,
          id: post._id,
          image: post.images?.[0] || '',
          likes: post.likesCount || 0,
          likedByUser: Boolean(post.likedByMe),
          time: new Date(post.createdAt).toLocaleString('vi-VN'),
          user: post.author || {},
          comments: normalizeComments(post.comments).map(comment => ({
            id: comment._id,
            user: comment.author?.name || 'Thành viên Vivu360',
            avatar: comment.author?.avatar,
            text: comment.text,
            createdAt: comment.createdAt,
            authorId: comment.author?.firebaseUid
          })),
        })));
        setPostContent('');
        setPostLocation('');
        setPostImage('');
        setComposerOpen(false);
      }
    } catch (error) {
      Alert.alert('Không thể đăng bài', 'Vui lòng kiểm tra kết nối Vivu360_API và thử lại.');
      console.error(error);
    } finally {
      setPublishing(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const result = await togglePostLike(ownerId, postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likedByUser: result.likedByMe, likes: result.likesCount } : p));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          likedByUser: result.likedByMe,
          likes: result.likesCount,
        }));
      }
    } catch (error) {
      Alert.alert('Bài viết', 'Không thể cập nhật lượt thích.');
    }
  };

  const handleSendComment = async () => {
    if (!commentInput.trim() || !selectedPost) return;
    const text = commentInput.trim();
    try {
      const saved = await addPostComment(ownerId, selectedPost.id, text);
      const newComment = {
        id: saved._id,
        user: saved.author?.name || userInfo.name,
        avatar: saved.author?.avatar,
        text: saved.text,
        createdAt: saved.createdAt,
        authorId: saved.author?.firebaseUid || ownerId
      };
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments: [...getSafeComments(p.comments), newComment] } : p));
      setSelectedPost(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          comments: [
            ...getSafeComments(prev.comments),
            newComment,
          ],
        };
      });
      setCommentInput('');
    } catch (error) {
      Alert.alert('Bình luận', 'Không thể gửi bình luận. Vui lòng thử lại.');
    }
  };

  const handleEditComment = () => {
    if (!selectedComment) return;

    setEditingCommentId(selectedComment.id);
    setEditCommentText(selectedComment.text || '');
    setCommentMenuVisible(false);
  };

  const handleSaveEditedComment = async () => {
    const text = editCommentText.trim();

    if (!text || !selectedPost || !editingCommentId) {
      return;
    }

    try {
      const updated = await editComment(
        ownerId,
        selectedPost.id,
        editingCommentId,
        text
      );

      const updateComments = (comments) => {
        const safeComments = getSafeComments(comments);

        return safeComments.map(comment =>
          comment.id === editingCommentId
            ? {
                ...comment,
                text: updated?.text ?? text,
              }
            : comment
        );
      };

      setPosts(prev =>
        prev.map(post =>
          post.id === selectedPost.id
            ? {
                ...post,
                comments: updateComments(post.comments),
              }
            : post
        )
      );

      setSelectedPost(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          comments: updateComments(prev.comments),
        };
      });

      setEditingCommentId(null);
      setEditCommentText('');
      setSelectedComment(null);
    } catch (error) {
      console.warn(
        'Không thể sửa bình luận:',
        error
      );

      Alert.alert(
        'Lỗi',
        error.response?.data?.message ||
          'Không thể sửa bình luận. Vui lòng thử lại.'
      );
    }
  };

  const handleDeleteComment = () => {
    if (!selectedComment || !selectedPost) return;

    Alert.alert(
      'Xóa bình luận',
      'Bạn có chắc muốn xóa bình luận này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(
                ownerId,
                selectedPost.id,
                selectedComment.id
              );

              setPosts(prev =>
                prev.map(post => {
                  if (post.id !== selectedPost.id) {
                    return post;
                  }

                  const safeComments = getSafeComments(post.comments);

                  const updatedComments = safeComments.filter(
                    comment => comment.id !== selectedComment.id
                  );

                  return {
                    ...post,
                    comments: updatedComments,
                    commentsCount: updatedComments.length,
                  };
                })
              );

              setSelectedPost(prev => {
                if (!prev) return prev;

                const safeComments = getSafeComments(prev.comments);

                const updatedComments = safeComments.filter(
                  comment => comment.id !== selectedComment.id
                );

                return {
                  ...prev,
                  comments: updatedComments,
                  commentsCount: updatedComments.length,
                };
              });

              setCommentMenuVisible(false);
              setSelectedComment(null);
            } catch (error) {
              console.warn(
                'Không thể xóa bình luận:',
                error
              );

              Alert.alert(
                'Lỗi',
                error.response?.data?.message ||
                  'Không thể xóa bình luận. Vui lòng thử lại.'
              );
            }
          },
        },
      ]
    );
  };

  const openCommentMenu = (comment) => {
    setSelectedComment(comment);
    setCommentMenuVisible(true);
  };

  const handleEditPost = () => {
    if (!selectedPost) return;
    setCommentModalVisible(false);
    setEditingPost(selectedPost);
    setPostContent(selectedPost.content || '');
    setPostLocation(selectedPost.location || '');
    setPostImage(selectedPost.image || '');
    setComposerOpen(true);
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Xóa bài viết',
      'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(ownerId, selectedPost.id);
              setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
              setCommentModalVisible(false);
              setSelectedPost(null);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bài viết. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const handleOpenUserProfile = (user) => {
    const username = typeof user === 'string' ? user : user?.name;
    const matchedFriend = friendships.find(item => item.friend?.name === username)?.friend;
    setTargetUsername(username || 'Thành viên Vivu360');
    setTargetUserId((typeof user === 'object' && user?.firebaseUid) || matchedFriend?.firebaseUid || '');
    setProfileModalVisible(true);
  };

  const openDropdown = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (x !== undefined && y !== undefined) {
          const top = pageY + height + 4;
          const { width: screenWidth } = Dimensions.get('window');
          const right = screenWidth - pageX - width + 4;

          setDropdownPosition({ top, right });
          setDropdownVisible(true);
          return;
        }
        fallbackDropdownPosition();
      });
    } else {
      fallbackDropdownPosition();
    }
  };

  const fallbackDropdownPosition = () => {
    setDropdownPosition({ top: 200, right: 20 });
    setDropdownVisible(true);
  };

  const getUserAvatarByName = (name) => {
    if (!name) return 'https://i.pravatar.cc/150?img=11';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const imgIndex = Math.abs(hash % 70) + 1;
    return `https://i.pravatar.cc/150?img=${imgIndex}`;
  };

  const isSourceVerified = (name) => {
    if (!name) return false;
    const verifiedNames = [
      'Ban truyền thông Vivu360',
      'Tạp chí Phượt Việt',
      'Góc Ẩm Thực Việt'
    ];
    return verifiedNames.includes(name.trim());
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
              <Pressable
                onPress={() => {
                  setComposerOpen(false);
                  setEditingPost(null);
                  setPostContent('');
                  setPostLocation('');
                  setPostImage('');
                }}
                style={[styles.closeComposer, { backgroundColor: theme.searchBg }]}
              >
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
        <Text style={[styles.postCount, { color: theme.textSecondary }]}>{myPosts.length === 0} bài viết</Text>
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
        <Pressable
          key={post.id}
          onPress={() => {
            setSelectedPost(post);
            setCommentModalVisible(true);
          }}
          style={[styles.postCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
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
            <Pressable style={styles.action} onPress={() => handleLikePost(post.id)}>
              <Heart
                size={17}
                color={post.likedByUser ? '#ef4444' : theme.textSecondary}
                fill={post.likedByUser ? '#ef4444' : 'transparent'}
              />
              <Text style={{ color: theme.textSecondary }}>{post.likes || 0}</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={() => { setSelectedPost(post); setCommentModalVisible(true) }}>
              <MessageCircle size={17} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary }}>{getSafeComments(post.comments).length}</Text>
            </Pressable>
          </View>
        </Pressable>
      ))}

      {/* MODAL CHI TIẾT BÀI VIẾT */}
      {selectedPost && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={commentModalVisible}
          onRequestClose={() => setCommentModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.tripDetailModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              
              {/* Header Cover Photo */}
              <View style={styles.tripDetailCoverWrapper}>
                <Image source={getSafeImageSource(selectedPost.image)} style={styles.tripDetailCoverImage} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.85)']}
                  style={StyleSheet.absoluteFillObject}
                />
                
                {/* Close Button */}
                <Pressable style={styles.tripDetailCloseBtn} onPress={() => setCommentModalVisible(false)}>
                  <X size={18} color="#fff" />
                </Pressable>

                {/* Floating location info */}
                <View style={styles.tripDetailHeaderContent}>
                  <Text style={styles.tripDetailCategoryBadge}>{selectedPost.category}</Text>
                  <Text style={styles.tripDetailTitleText}>{selectedPost.title || selectedPost.category || 'Bài viết'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <MapPin size={14} color="#ef4444" fill="#ef4444" style={{ marginRight: 2 }} />
                    <Text style={styles.tripDetailLocationText}>{selectedPost.location} • 🕒 {selectedPost.duration || '3 ngày 2 đêm'}</Text>
                  </View>
                </View>
              </View>

              {/* Scrollable details */}
              <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Author Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  <Image source={getSafeAvatarSource(selectedPost.user?.avatar || getUserAvatarByName(selectedPost.source))} style={styles.postAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.postUserName, { color: theme.textPrimary }]}>{selectedPost.user?.name || selectedPost.source}</Text>
                    <Text style={{ fontSize: 10.5, color: theme.textMuted }}>{selectedPost.time} • Tác giả ký sự</Text>
                  </View>

                  <View ref={menuButtonRef} style={{ padding: 8 }}>
                    <Pressable onPress={openDropdown}>
                      <MoreVertical size={20} color={theme.textSecondary} />
                    </Pressable>
                  </View>

                  <View style={styles.tripDetailCompanionGroup}>
                    {(selectedPost.companions || []).map((cAv, idx) => (
                      <Image key={idx} source={getSafeAvatarSource(cAv)} style={[styles.detailCompanionAvatarCircle, { marginLeft: idx > 0 ? -8 : 0 }]} />
                    ))}
                  </View>
                </View>

                {/* Main Excerpt text */}
                <View style={{ padding: 16 }}>
                  <Text style={[styles.tripDetailDescription, { color: theme.textPrimary }]}>
                    {selectedPost.content}
                  </Text>
                </View>

                {/* Photo Carousel (Scroll deck of secondary images like screen 3 in mockup) */}
                <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textSecondary, marginLeft: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bộ ảnh hành trình</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 20 }}>
                  {((selectedPost.images && selectedPost.images.length ? selectedPost.images : [selectedPost.image].filter(hasImageUri))).map((imgUrl, index) => (
                    <Image key={index} source={getSafeImageSource(imgUrl)} style={styles.itineraryCarouselImage} />
                  ))}
                </ScrollView>

                {/* Comments section title */}
                <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 16, marginBottom: 16 }} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textSecondary, marginLeft: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ý kiến bạn đọc ({normalizeComments(selectedPost.comments).length})</Text>
                
                {/* Comments list stream */}
                <View style={{ paddingHorizontal: 16, gap: 12 }}>
                  {normalizeComments(selectedPost.comments).length === 0 ? (
                    <Text style={{ color: theme.textSecondary, fontSize: 12.5, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 }}>
                      Chưa có ý kiến nào. Hãy là người đầu tiên! 💬
                    </Text>
                  ) : (
                    getSafeComments(selectedPost.comments).map((comment) => {
                      return (
                        <View key={comment.id} style={{ flexDirection: 'row', gap: 10 }}>
                          <Pressable onPress={() => { setCommentModalVisible(false); handleOpenUserProfile(comment.user); }}>
                            <Image
                              source={getSafeAvatarSource(comment.user === userInfo.name ? userInfo.avatar : getUserAvatarByName(comment.user))}
                              style={styles.authorAvatarMini}
                            />
                          </Pressable>
                          <View style={{ flex: 1, backgroundColor: theme.searchBg, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: theme.border }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Pressable onPress={() => { setCommentModalVisible(false); handleOpenUserProfile(comment.user); }}>
                                  <Text style={[styles.postUserName, { color: theme.textPrimary, fontSize: 11.5 }]}>{comment.user}</Text>
                                </Pressable>
                                {isSourceVerified(comment.user) && (
                                  <CheckCircle size={10} color="#fff" fill="#1877f2" />
                                )}
                              </View>

                              {comment.authorId === ownerId && (
                                <Pressable
                                  onPress={() => openCommentMenu(comment)}
                                  style={{ padding: 4 }}
                                >
                                  <MoreVertical size={14} color={theme.textSecondary} />
                                </Pressable>
                              )}
                            </View>
                            <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '500', lineHeight: 15 }}>
                              {comment.text}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </ScrollView>

              {/* Input Message box */}
              <View style={[styles.chatInputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <TextInput
                  placeholder="Viết ý kiến chia sẻ..."
                  placeholderTextColor={theme.textMuted}
                  value={commentInput}
                  onChangeText={setCommentInput}
                  style={[styles.chatInputField, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
                />
                <Pressable style={styles.sendMsgBtn} onPress={handleSendComment}>
                  <LinearGradient
                    colors={['#06b6d4', '#3b82f6']}
                    style={styles.sendMsgGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Send size={14} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MENU BÌNH LUẬN */}
      <Modal
        visible={commentMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCommentMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCommentMenuVisible(false)}>
          <View style={styles.commentMenuBackdrop}>
            <View
              style={[
                styles.commentMenuCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Pressable style={styles.commentMenuItem} onPress={handleEditComment}>
                <Edit size={18} color={theme.textPrimary} />

                <Text style={[styles.commentMenuItemText, { color: theme.textPrimary }]}>
                  Sửa bình luận
                </Text>
              </Pressable>

              <View style={[styles.commentMenuDivider,{ backgroundColor: theme.border }]} />

              <Pressable style={styles.commentMenuItem} onPress={handleDeleteComment}>
                <Trash2 size={18} color="#ef4444" />

                <Text style={[styles.commentMenuItemText, { color: '#ef4444' }]}>
                  Xóa bình luận
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL CHỈNH SỬA BÌNH LUẬN */}
      <Modal
        visible={!!editingCommentId}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingCommentId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.editCommentModal, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.editCommentHeader}>
              <Text style={[styles.editCommentTitle, { color: theme.textPrimary }]}>Sửa bình luận</Text>
              <Pressable onPress={() => setEditingCommentId(null)}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              style={[styles.editCommentInput, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.border }]}
              value={editCommentText}
              onChangeText={setEditCommentText}
              placeholder="Nhập nội dung mới..."
              placeholderTextColor={theme.textMuted}
              multiline
            />
            <View style={styles.editCommentActions}>
              <Pressable
                style={[styles.editCommentCancelBtn, { borderColor: theme.border }]}
                onPress={() => setEditingCommentId(null)}
              >
                <Text style={[styles.editCommentCancelText, { color: theme.textSecondary }]}>Hủy</Text>
              </Pressable>
              <Pressable
                style={styles.editCommentSaveBtn}
                onPress={handleSaveEditedComment}
              >
                <Text style={styles.editCommentSaveText}>Lưu</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={dropdownVisible} transparent animationType="fade" onRequestClose={() => setDropdownVisible(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setDropdownVisible(false)}>
          <View
            style={[
              styles.dropdownMenu,
              {
                position: 'absolute',
                top: dropdownPosition.top,
                right: dropdownPosition.right,
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Pressable
              style={styles.dropdownItem}
              onPress={() => {
                setDropdownVisible(false);
                handleEditPost();
              }}
            >
              <Edit size={16} color={theme.textPrimary} />
              <Text style={[styles.dropdownItemText, { color: theme.textPrimary }]}>Chỉnh sửa bài viết</Text>
            </Pressable>
            <Pressable
              style={[styles.dropdownItem, { borderTopWidth: 1, borderTopColor: theme.border }]}
              onPress={() => {
                setDropdownVisible(false);
                handleDeletePost();
              }}
            >
              <Trash2 size={16} color="#ef4444" />
              <Text style={[styles.dropdownItemText, { color: '#ef4444' }]}>Xóa bài viết</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  tripDetailModalCard: {
    width: '100%',
    height: height * 0.86,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  tripDetailCoverWrapper: {
    height: 220,
    position: 'relative',
  },
  tripDetailCoverImage: {
    width: '100%',
    height: '100%',
  },
  tripDetailCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripDetailHeaderContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  tripDetailCategoryBadge: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: 9,
    fontWeight: '950',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  tripDetailTitleText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
  tripDetailLocationText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  tripDetailDescription: {
    fontSize: 13.5,
    lineHeight: 22,
    fontWeight: '500',
  },
  itineraryCarouselImage: {
    width: 140,
    height: 95,
    borderRadius: 12,
  },

  // ----- Input comment -----
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInputField: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 40,
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  sendMsgBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendMsgGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ----- Avatar & Author -----
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  postUserName: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  authorAvatarMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },

  // ----- Dropdown Menu -----
  dropdownMenu: {
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  postAvatar: { width: 42, height: 42, borderRadius: 12 },
  postUserName: { fontSize: 13.5, fontWeight: '800', letterSpacing: -0.2 },

  // ----- Comments -----
  commentMenuBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  commentMenuCard: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 8,
  },
  commentMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  commentMenuItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentMenuDivider: {
    height: 1,
    marginHorizontal: 12,
  },
  editCommentModal: {
    width: '90%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
  },
  editCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editCommentTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  editCommentInput: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  editCommentCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  editCommentCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editCommentSaveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  editCommentSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});