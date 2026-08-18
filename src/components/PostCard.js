import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  MessageSquare,
  Repeat,
  Bookmark,
  MapPin,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Award,
  Play,
  Trash2,
} from 'lucide-react-native';

const getUserLevelByName = (name) => {
  if (!name) return 'Cấp 1';
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `Cấp ${Math.abs(hash % 12) + 3}`;
};

const getUserRankColors = (name) => {
  const lvl = getUserLevelByName(name);
  const levelNum = parseInt(lvl.replace(/[^0-9]/g, ''), 10) || 1;
  if (levelNum >= 12) {
    return { colors: ['#eab308', '#ca8a04'], iconColor: '#fff', textColor: '#fff' };
  }
  if (levelNum >= 8) {
    return { colors: ['#a855f7', '#7e22ce'], iconColor: '#fff', textColor: '#fff' };
  }
  if (levelNum >= 4) {
    return { colors: ['#3b82f6', '#1d4ed8'], iconColor: '#fff', textColor: '#fff' };
  }
  return { colors: ['#10b981', '#047857'], iconColor: '#fff', textColor: '#fff' };
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

export function PostCard({
  post,
  theme = {},
  isDarkMode = true,
  onOpenProfile,
  onLike,
  onComment,
  onShare,
  onBookmark,
  isBookmarked = false,
  onMoreOptions,
  onDelete,
}) {
  if (!post) return null;

  const textPrimary = theme.textPrimary || (isDarkMode ? '#f8fafc' : '#0f172a');
  const textSecondary = theme.textSecondary || (isDarkMode ? '#94a3b8' : '#64748b');
  const textMuted = theme.textMuted || (isDarkMode ? '#64748b' : '#94a3b8');

  const authorName = post.user?.name || post.source || 'Thành viên Vivu360';
  const authorAvatar = post.user?.avatar || getUserAvatarByName(authorName);
  const authorUid = post.user?.firebaseUid || post.authorId;
  const rank = getUserRankColors(authorName);
  const userLevel = getUserLevelByName(authorName);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? '#131124' : '#ffffff',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        },
      ]}
    >
      {/* ── Author Row & Meta Header ───────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.authorTouch}
          onPress={() => onOpenProfile && onOpenProfile(authorName, authorUid)}
        >
          <LinearGradient
            colors={['#f43f5e', '#3b82f6']}
            style={styles.avatarRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image source={{ uri: authorAvatar }} style={styles.avatarImage} />
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text numberOfLines={1} style={[styles.authorNameText, { color: textPrimary }]}>
                {authorName}
              </Text>

              {/* Rank badge */}
              <LinearGradient
                colors={rank.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rankBadge}
              >
                <Award size={8} color={rank.iconColor} />
                <Text style={[styles.rankText, { color: rank.textColor }]}>{userLevel}</Text>
              </LinearGradient>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Text style={[styles.metaTimeText, { color: textMuted }]}>
                {post.time || 'Vừa xong'}
              </Text>
              <Text style={{ color: textMuted, fontSize: 10.5 }}>·</Text>

              {/* Privacy Badge */}
              <View style={[
                styles.privacyBadge,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
              ]}>
                {post.privacy === 'private' ? (
                  <>
                    <Lock size={9} color={textMuted} />
                    <Text style={[styles.privacyText, { color: textMuted }]}>Chỉ mình tôi</Text>
                  </>
                ) : post.privacy === 'friends' ? (
                  <>
                    <Users size={9} color="#3b82f6" />
                    <Text style={[styles.privacyText, { color: '#3b82f6' }]}>Bạn bè</Text>
                  </>
                ) : (
                  <>
                    <Globe size={9} color="#10b981" />
                    <Text style={[styles.privacyText, { color: '#10b981' }]}>Công khai</Text>
                  </>
                )}
              </View>

              {/* Category Badge */}
              {post.category && (
                <Text style={styles.categoryBadgeText}>
                  {post.category}
                </Text>
              )}
            </View>
          </View>
        </Pressable>

        {onDelete ? (
          <Pressable
            style={styles.moreBtn}
            onPress={() => onDelete(post.id || post._id)}
            hitSlop={10}
          >
            <Trash2 size={16} color="#ef4444" />
          </Pressable>
        ) : onMoreOptions ? (
          <Pressable
            style={styles.moreBtn}
            onPress={() => onMoreOptions(post)}
            hitSlop={10}
          >
            <MoreHorizontal size={20} color={textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* ── Post Content Text ─────────────────────────────────── */}
      {Boolean(post.content || post.title) && (
        <Pressable onPress={() => onComment && onComment(post)} style={styles.postBody}>
          <Text style={[styles.postContentText, { color: textPrimary }]} numberOfLines={4}>
            {post.content || post.title || ''}
          </Text>
        </Pressable>
      )}

      {/* ── Post Media ───────────────────────────────────────── */}
      {post.image && (
        <Pressable onPress={() => onComment && onComment(post)} style={styles.postMediaWrap}>
          <Image source={{ uri: post.image }} style={styles.postMedia} />
          {(post.isVideo || post.isVideoPost || post.type === 'video' || String(post.image).toLowerCase().includes('video')) && (
            <View style={styles.playOverlay}>
              <View style={styles.playCircleBtn}>
                <Play size={22} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
              </View>
            </View>
          )}

          {post.location && (
            <View style={styles.mediaLocationChip}>
              <MapPin size={9} color="#fff" fill="#ef4444" />
              <Text style={styles.mediaLocationText}>{post.location}</Text>
            </View>
          )}
        </Pressable>
      )}

      {/* ── Reaction Action Bar ──────────────── */}
      <View style={styles.actionBar}>
        <View style={styles.actionLeftRow}>
          <Pressable style={styles.reactionItem} onPress={() => onLike && onLike(post.id || post._id)} hitSlop={6}>
            <Heart
              size={17}
              color={post.likedByUser ? '#ef4444' : textSecondary}
              fill={post.likedByUser ? '#ef4444' : 'transparent'}
            />
            <Text style={[styles.reactionCount, { color: post.likedByUser ? '#ef4444' : textSecondary }]}>
              {typeof post.likes === 'number' ? post.likes : (post.likesCount || 0)}
            </Text>
          </Pressable>

          <Pressable style={styles.reactionItem} onPress={() => onComment && onComment(post)} hitSlop={6}>
            <MessageSquare size={17} color={textSecondary} />
            <Text style={[styles.reactionCount, { color: textSecondary }]}>
              {post.commentsCount || (Array.isArray(post.comments) ? post.comments.length : 0)}
            </Text>
          </Pressable>

          <Pressable style={styles.reactionItem} onPress={() => onShare && onShare(post)} hitSlop={6}>
            <Repeat size={17} color={textSecondary} />
            <Text style={[styles.reactionCount, { color: textSecondary }]}>
              {post.sharesCount || 0}
            </Text>
          </Pressable>
        </View>

        {onBookmark && (
          <Pressable style={styles.reactionItem} onPress={() => onBookmark(post.id || post._id)} hitSlop={6}>
            <Bookmark
              size={18}
              color={isBookmarked ? '#f59e0b' : textSecondary}
              fill={isBookmarked ? '#f59e0b' : 'transparent'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  authorNameText: {
    fontSize: 14,
    fontWeight: '800',
  },
  rankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rankText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  metaTimeText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  privacyText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  categoryBadgeText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 2,
  },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBody: {
    marginBottom: 10,
  },
  postContentText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  postMediaWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
    height: 220,
  },
  postMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244,63,94,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaLocationChip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mediaLocationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 2,
  },
  actionLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  reactionCount: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
