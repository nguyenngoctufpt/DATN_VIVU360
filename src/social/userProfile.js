import React, { useState, useMemo } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Modal, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getRankDetails } from '../data';
import {
  X,
  MapPin,
  Users,
  Heart,
  Award,
  Globe,
  Sparkles,
  MessageCircle,
  CheckCircle,
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
  const displayName = username || 'Thành viên Vivu360';
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
      followers: '0',
      following: 0,
      photos: [],
    };
  }

  return {
    name: displayName,
    avatar: getUserAvatarByName(displayName),
    cover: defaultCover,
    bio: 'Thành viên Vivu360. Hồ sơ sẽ hiển thị đầy đủ hơn khi người dùng cập nhật thông tin.',
    level: 'Cấp 1',
    levelColor: '#9ca3af',
    trips: 0,
    followers: '0',
    following: 0,
    photos: [],
  };
};

export function UserProfileModal({ username, visible, onClose, isDarkMode, theme, currentUser, onStartDirectChat }) {
  const [isFollowing, setIsFollowing] = useState(false);

  const rank = useMemo(() => {
    const isMe = !!(currentUser && username === currentUser.name);
    return getRankDetails(isMe ? (currentUser.points || 0) : 100);
  }, [username, currentUser]);

  const profile = useMemo(() => {
    const isMe = !!(currentUser && username === currentUser.name);
    return buildGenericProfile({ username, currentUser, isMe });
  }, [username, currentUser]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header images */}
          <View style={styles.headerArea}>
            <Image source={{ uri: profile.cover }} style={styles.coverImage} />
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.4)']}
              style={styles.coverGradient}
            />

            {/* Back Button */}
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#fff" />
            </Pressable>
          </View>

          {/* Profile details */}
          <View style={styles.contentArea}>
            {/* Avatar & Follow row */}
            <View style={styles.avatarRow}>
              <LinearGradient
                colors={rank.colors}
                style={styles.modalAvatarFrame}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.modalAvatarInner, { backgroundColor: theme.card }]}>
                  <Image source={{ uri: profile.avatar }} style={styles.modalAvatarImage} />
                </View>
              </LinearGradient>
              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.followBtn, isFollowing ? styles.followBtnActive : null]}
                  onPress={() => setIsFollowing(!isFollowing)}
                >
                  <Text style={styles.followBtnText}>
                    {isFollowing ? 'Đang Theo Dõi' : 'Theo Dõi'}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.msgBtn}
                  onPress={() => {
                    if (username === currentUser?.name) {
                      Alert.alert('Trò chuyện', 'Bạn không thể tự nhắn tin cho chính mình!');
                      return;
                    }
                    onClose();
                    onStartDirectChat && onStartDirectChat({ name: profile.name, avatar: profile.avatar });
                  }}
                >
                  <MessageCircle size={18} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Name & Title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
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
            <View style={[styles.statsBoard, { backgroundColor: theme.statusBg }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.textPrimary }]}>{profile.trips}</Text>
                <Text style={styles.statLabel}>Chuyến đi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.textPrimary }]}>{profile.followers}</Text>
                <Text style={styles.statLabel}>Người theo dõi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.textPrimary }]}>{profile.following}</Text>
                <Text style={styles.statLabel}>Đang theo dõi</Text>
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
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  card: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 24,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  headerArea: { height: 120, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  coverGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  contentArea: { padding: 18, paddingTop: 0 },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -40,
    marginBottom: 12,
  },
  modalAvatarFrame: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalAvatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  followBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  followBtnActive: {
    backgroundColor: '#10b981',
  },
  followBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  msgBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileName: { fontSize: 18, fontWeight: '900' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  levelText: { fontSize: 11, fontWeight: '800' },

  statsBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 14,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '800' },
  statLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(148, 163, 184, 0.2)' },

  bioTitle: { fontSize: 12, fontWeight: '800' },
  bioText: { fontSize: 11, lineHeight: 16, marginTop: 6, fontWeight: '500' },

  photoGrid: { gap: 8, marginTop: 8 },
  checkinPhoto: { width: 90, height: 90, borderRadius: 12 },
});
