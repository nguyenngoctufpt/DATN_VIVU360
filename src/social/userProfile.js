import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Modal, Dimensions, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getRankDetails } from '../data';
import { getUserPosts, mapMongoPostToFeedPost } from '../services/postService';
import { PostCard } from '../components/PostCard';
import { searchFriends, getUserStats, getUser } from '../services/userService';
import { sendFriendRequest, getFriendships } from '../services/friendshipService';
import {
  X,
  MapPin,
  Heart,
  Award,
  MessageCircle,
  CheckCircle,
  User,
  FileText,
  Lock,
  ArrowLeft,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const isSourceVerified = (name) => {
  if (!name) return false;
  const verifiedNames = [
    'Ban truyền thông Vivu360',
    'Tạp chí Phượt Việt',
    'Góc Ẩm Thực Việt'
  ];
  return verifiedNames.includes(name.trim());
};

const getUserAvatarByName = (name) => {
  if (!name) return 'https://i.pravatar.cc/150?img=11';

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const imgIndex = Math.abs(hash % 70) + 1;
  return `https://i.pravatar.cc/150?img=${imgIndex}`;
};

const buildGenericProfile = ({ username, currentUser, isMe }) => {
  const displayName = username ? String(username).replace(/^Bạn đọc\s+/i, '').trim() : 'Thành viên Vivu360';
  const defaultCover = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80';

  if (isMe && currentUser) {
    return {
      name: currentUser.name || displayName,
      avatar: currentUser.avatar || getUserAvatarByName(currentUser.name || currentUser.email || displayName),
      cover: defaultCover,
      bio: currentUser.bio || 'Chưa cập nhật giới thiệu cá nhân.',
      level: currentUser.level || 'Cấp 1',
      levelColor: '#60a5fa',
      trips: Array.isArray(currentUser.checkedIn) ? currentUser.checkedIn.length : 0,
      followers: 0,
      following: 0,
      photos: [],
    };
  }

  return {
    name: displayName,
    avatar: getUserAvatarByName(displayName),
    cover: defaultCover,
    bio: 'Thành viên Vivu360. Dưới đây là các bài viết đã chia sẻ trên bảng tin.',
    level: 'Cấp 1',
    levelColor: '#9ca3af',
    trips: 0,
    followers: 0,
    following: 0,
    photos: [],
  };
};

export function UserProfileModal({ username, targetUid, visible, onClose, isDarkMode, theme, currentUser, onStartDirectChat, ownerId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [accessRestricted, setAccessRestricted] = useState(false);
  const [resolvedProfile, setResolvedProfile] = useState(null);
  const [userStats, setUserStats] = useState({ posts: 0, followers: 0, following: 0 });

  const isMe = useMemo(() => {
    if (!currentUser) return false;
    if (targetUid && ownerId) {
      return String(targetUid).trim() === String(ownerId).trim();
    }
    if (!username) return true;
    const cleanUser = String(username).replace(/^Bạn đọc\s+/i, '').trim().toLowerCase();
    const cleanMeName = String(currentUser.name || '').trim().toLowerCase();
    const cleanMeEmail = String(currentUser.email || '').trim().toLowerCase();
    if (!cleanUser) return true;
    return cleanUser === cleanMeName || cleanUser === cleanMeEmail;
  }, [username, currentUser, targetUid, ownerId]);

  // Load target user's profile and posts when modal opens
  useEffect(() => {
    if (!visible) {
      setUserPosts([]);
      setLoadingPosts(false);
      setAccessRestricted(false);
      setResolvedProfile(null);
      setUserStats({ posts: 0, followers: 0, following: 0 });
      setIsFollowing(false);
      return;
    }

    let active = true;
    setLoadingPosts(true);
    setAccessRestricted(false);

    const loadPosts = async () => {
      let resolvedUid = isMe ? ownerId : (targetUid || null);
      let searchName = username ? String(username).replace(/^Bạn đọc\s+/i, '').trim() : '';

      // If targetUid not provided directly, try search by name
      if (!resolvedUid && !isMe && searchName) {
        try {
          const results = await searchFriends(searchName, ownerId);
          if (Array.isArray(results) && results.length > 0) {
            const matched = results.find(u => u.name.toLowerCase() === searchName.toLowerCase()) || results[0];
            resolvedUid = matched.firebaseUid;
            if (active && matched) {
              setResolvedProfile({
                name: matched.name,
                avatar: matched.avatar || getUserAvatarByName(matched.name),
                bio: matched.bio || 'Thành viên Vivu360.',
                level: matched.level || 'Cấp 1',
                points: matched.points || 0,
                firebaseUid: matched.firebaseUid,
              });
            }
          }
        } catch (_) {}
      }

      if (!resolvedUid && isMe) resolvedUid = ownerId;

      if (resolvedUid && !isMe) {
        getUser(resolvedUid)
          .then(userData => {
            if (active && userData) {
              setResolvedProfile({
                name: userData.name,
                avatar: userData.avatar || getUserAvatarByName(userData.name),
                bio: userData.bio || 'Thành viên Vivu360.',
                level: userData.level || 'Cấp 1',
                points: userData.points || 0,
                firebaseUid: userData.firebaseUid,
              });
            }
          })
          .catch(() => {});
      }

      if (resolvedUid) {
        getUserStats(resolvedUid)
          .then(st => { if (active && st) setUserStats(st); })
          .catch(err => console.log('[UserProfile] Lấy stats thất bại:', err.message));
      }

      const activeOwnerId = ownerId || resolvedUid;

      if (activeOwnerId && resolvedUid && !isMe) {
        getFriendships(activeOwnerId)
          .then(list => {
            if (active && Array.isArray(list)) {
              const hasRelation = list.some(f => f.users.includes(resolvedUid));
              setIsFollowing(hasRelation);
            }
          })
          .catch(() => {});
      }

      if (activeOwnerId && resolvedUid) {
        try {
          const mongoPosts = await getUserPosts(activeOwnerId, resolvedUid);
          if (active && Array.isArray(mongoPosts)) {
            const formatted = mongoPosts.map(mapMongoPostToFeedPost);
            setUserPosts(formatted);
            if (!isMe && formatted.length > 0 && formatted[0].user) {
              setResolvedProfile(prev => ({
                name: formatted[0].user.name || prev?.name || searchName,
                avatar: formatted[0].user.avatar || prev?.avatar || getUserAvatarByName(searchName),
                bio: prev?.bio || 'Thành viên Vivu360.',
                level: formatted[0].user.level || prev?.level || 'Cấp 1',
                points: prev?.points || 0,
                firebaseUid: resolvedUid,
              }));
            }
          }
        } catch (err) {
          if (active) {
            console.log('[UserProfile] Tải bài viết fallback:', err.message);
            setUserPosts([]);
          }
        }
      }
      if (active) setLoadingPosts(false);
    };

    loadPosts();

    const statsTimer = setInterval(() => {
      let resolvedUid = isMe ? ownerId : (targetUid || null);
      if (resolvedUid) {
        getUserStats(resolvedUid)
          .then(st => { if (active && st) setUserStats(st); })
          .catch(() => {});
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(statsTimer);
    };
  }, [visible, username, targetUid, isMe, ownerId]);

  const rank = useMemo(() => {
    return getRankDetails(isMe ? (currentUser.points || 0) : (resolvedProfile?.points || 100));
  }, [isMe, currentUser, resolvedProfile]);

  const profile = useMemo(() => {
    const base = buildGenericProfile({ username, currentUser, isMe });
    if (resolvedProfile && !isMe) {
      return {
        ...base,
        name: resolvedProfile.name || base.name,
        avatar: resolvedProfile.avatar || base.avatar,
        bio: resolvedProfile.bio || base.bio,
        level: resolvedProfile.level || base.level,
      };
    }
    return base;
  }, [username, currentUser, isMe, resolvedProfile]);

  const handleToggleFollow = async () => {
    const targetId = targetUid || resolvedProfile?.firebaseUid;
    if (!ownerId || !targetId || isMe) return;

    if (isFollowing) {
      setIsFollowing(false);
      setUserStats(prev => ({
        ...prev,
        followers: Math.max(0, (prev.followers || 1) - 1),
      }));
    } else {
      setIsFollowing(true);
      setUserStats(prev => ({
        ...prev,
        followers: (prev.followers || 0) + 1,
      }));
      try {
        await sendFriendRequest(ownerId, targetId);
      } catch (err) {
        console.log('[UserProfile] Gửi yêu cầu theo dõi thất bại:', err.message);
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0f0d1a' : '#f8f9ff' }}>
        {/* Full screen top navigation header */}
        <View style={{
          paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 50,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#131124' : '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
          gap: 12,
          zIndex: 10,
        }}>
          <Pressable
            onPress={onClose}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' }}
            hitSlop={10}
          >
            <ArrowLeft size={20} color={isDarkMode ? '#f8fafc' : '#1e1b2e'} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: isDarkMode ? '#f8fafc' : '#1e1b2e', fontSize: 16.5, fontWeight: '900' }} numberOfLines={1}>
              {profile.name}
            </Text>
            <Text style={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: '600' }}>
              Trang cá nhân Vivu360
            </Text>
          </View>
        </View>

        {/* Profile details & Posts scroll view */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Cover image */}
          <View style={{ height: 160, position: 'relative' }}>
            <Image source={{ uri: profile.cover || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80' }} style={{ width: '100%', height: '100%' }} />
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.5)']}
              style={StyleSheet.absoluteFillObject}
            />
          </View>

          {/* Profile Content Body */}
          <View style={{ paddingHorizontal: 16, paddingTop: 0 }}>
            {/* Avatar & Follow row */}
            <View style={styles.avatarRow}>
              <LinearGradient
                colors={rank.colors}
                style={styles.modalAvatarFrame}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.modalAvatarInner, { backgroundColor: theme.card }]}>
                  <Image source={{ uri: profile.avatar || 'https://i.pravatar.cc/150?img=11' }} style={styles.modalAvatarImage} />
                </View>
              </LinearGradient>

              <View style={styles.actionRow}>
                {isMe ? (
                  <LinearGradient
                    colors={isDarkMode ? ['rgba(245, 158, 11, 0.22)', 'rgba(220, 38, 38, 0.18)'] : ['rgba(245, 158, 11, 0.14)', 'rgba(220, 38, 38, 0.08)']}
                    style={styles.myProfileBadgeGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <User size={13} color="#f59e0b" />
                    <Text style={styles.myProfileBadgeText}>Hồ sơ cá nhân của bạn</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Pressable onPress={handleToggleFollow}>
                      <LinearGradient
                        colors={isFollowing ? ['#10b981', '#059669'] : ['#f43f5e', '#e11d48']}
                        style={styles.followBtnGrad}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.followBtnText}>
                          {isFollowing ? '✓ Đang Theo Dõi' : '+ Theo Dõi'}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                    <Pressable
                      style={[styles.msgBtn, { backgroundColor: isDarkMode ? '#1e1b2e' : '#f1f5f9', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
                      onPress={() => {
                        onClose();
                        onStartDirectChat && onStartDirectChat({ name: profile.name, avatar: profile.avatar });
                      }}
                    >
                      <MessageCircle size={17} color={isDarkMode ? '#f8fafc' : '#1e1b2e'} />
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            {/* Name & Badges */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, marginTop: 4 }}>
              <Text style={[styles.profileName, { color: theme.textPrimary, marginBottom: 0 }]}>{profile.name}</Text>
              {isSourceVerified(profile.name) && (
                <CheckCircle size={18} color="#fff" fill="#1877f2" />
              )}
            </View>
            <View style={styles.levelRow}>
              <Award size={14} color={profile.levelColor} />
              <Text style={[styles.levelText, { color: profile.levelColor }]}>{profile.level}</Text>
            </View>

            {/* Stats board */}
            <View style={[styles.statsBoard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)', borderColor: theme.border }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.textPrimary }]}>{userStats.posts !== undefined ? userStats.posts : userPosts.length}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Bài đăng</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.textPrimary }]}>{userStats.followers || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Người theo dõi</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.textPrimary }]}>{userStats.following || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Đang theo dõi</Text>
              </View>
            </View>

            {/* Bio */}
            <Text style={[styles.bioTitle, { color: theme.textPrimary }]}>Tiểu sử</Text>
            <Text style={[styles.bioText, { color: theme.textSecondary }]}>{profile.bio}</Text>

            {/* Photos Check-in Grid */}
            {profile.photos && profile.photos.length > 0 && (
              <>
                <Text style={[styles.bioTitle, { color: theme.textPrimary, marginTop: 14 }]}>Ảnh Check-in</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoGrid}>
                  {profile.photos.map((photoUrl, idx) => (
                    <Image key={idx} source={{ uri: photoUrl }} style={styles.checkinPhoto} />
                  ))}
                </ScrollView>
              </>
            )}

            {/* ── USER POSTS LIST SECTION ───────────────────────────────────── */}
            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} color="#f43f5e" />
                  <Text style={[styles.bioTitle, { color: theme.textPrimary, fontSize: 14, fontWeight: '900' }]}>
                    {isMe ? 'Bài viết của bạn' : `Bài viết của ${profile.name}`}
                  </Text>
                </View>
                {!loadingPosts && (
                  <View style={{ backgroundColor: isDarkMode ? 'rgba(244,63,94,0.15)' : 'rgba(244,63,94,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ color: '#f43f5e', fontSize: 11.5, fontWeight: '800' }}>{userPosts.length} bài viết</Text>
                  </View>
                )}
              </View>

              {/* Loading indicator */}
              {loadingPosts && (
                <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                  <ActivityIndicator size="small" color="#f43f5e" />
                  <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 8, fontWeight: '600' }}>Đang tải bài viết...</Text>
                </View>
              )}

              {/* Access Restricted Note */}
              {!loadingPosts && accessRestricted && (
                <View style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, backgroundColor: isDarkMode ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }}>
                  <Lock size={22} color="#f59e0b" style={{ marginBottom: 6 }} />
                  <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>Nội dung riêng tư</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11.5, textAlign: 'center', marginTop: 4, lineHeight: 17 }}>
                    Kết bạn với {profile.name} để xem được toàn bộ bài viết đã đăng.
                  </Text>
                </View>
              )}

              {/* Empty Posts State */}
              {!loadingPosts && !accessRestricted && userPosts.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 28, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 16 }}>
                  <Text style={{ fontSize: 32, marginBottom: 6 }}>📭</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '700' }}>Chưa có bài viết nào được đăng</Text>
                </View>
              )}

              {/* Posts Cards list */}
              {!loadingPosts && userPosts.map((post, idx) => (
                <PostCard
                  key={post.id || post._id || idx}
                  post={post}
                  theme={theme}
                  isDarkMode={isDarkMode}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -42,
    marginBottom: 12,
  },
  modalAvatarFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  actionRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  myProfileBadgeGrad: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  myProfileBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#f59e0b',
  },
  followBtnGrad: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  followBtnText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
  msgBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileName: { fontSize: 20, fontWeight: '900' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  levelText: { fontSize: 11.5, fontWeight: '800' },

  statsBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginVertical: 14,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '900' },
  statLabel: { fontSize: 9.5, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 22, backgroundColor: 'rgba(148, 163, 184, 0.2)' },

  bioTitle: { fontSize: 12.5, fontWeight: '800' },
  bioText: { fontSize: 12, lineHeight: 18, marginTop: 6, fontWeight: '500' },

  photoGrid: { gap: 8, marginTop: 8 },
  checkinPhoto: { width: 90, height: 90, borderRadius: 12 },
});
