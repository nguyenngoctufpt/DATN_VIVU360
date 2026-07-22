import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  User,
  Bell,
  BellOff,
  Pin,
  Search,
  Palette,
  Edit3,
  MapPin,
  Image as ImageIcon,
  ShieldAlert,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function DirectChatSettingsModal({
  visible,
  onClose,
  group,
  currentUser,
  ownerId,
  isDarkMode,
  theme,
  onViewProfile,
  onDeleteHistory,
  onBlockUser,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  if (!group) return null;

  // Find partner details
  const partner = (group.membersList || []).find(
    (m) => String(m.firebaseUid || m.id || m.uid) !== String(ownerId)
  ) || {
    name: group.name || 'Người dùng Vivu360',
    avatar: group.image || 'https://i.pravatar.cc/150?img=33',
  };

  const partnerName = partner.name || group.name || 'Người dùng Vivu360';
  const partnerAvatar = partner.avatar || group.image || 'https://i.pravatar.cc/150?img=33';

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chi tiết hội thoại</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#e4e6eb" />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* User Profile Card */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: partnerAvatar }} style={styles.avatar} />
              <View style={styles.onlineDot} />
            </View>

            <Text style={styles.partnerName}>{partnerName}</Text>
            <Text style={styles.onlineStatus}>🟢 Đang hoạt động trên Vivu360</Text>

            {/* Quick Action Grid */}
            <View style={styles.quickGrid}>
              <Pressable
                style={styles.quickTile}
                onPress={() => {
                  if (onViewProfile) onViewProfile(partner);
                  else Alert.alert('Trang cá nhân', `Xem trang cá nhân của ${partnerName}`);
                }}
              >
                <View style={styles.tileIconBg}>
                  <User size={18} color="#0084ff" />
                </View>
                <Text style={styles.tileLabel}>Trang cá nhân</Text>
              </Pressable>

              <Pressable
                style={styles.quickTile}
                onPress={() => setIsMuted(!isMuted)}
              >
                <View style={styles.tileIconBg}>
                  {isMuted ? <BellOff size={18} color="#ef4444" /> : <Bell size={18} color="#0084ff" />}
                </View>
                <Text style={styles.tileLabel}>{isMuted ? 'Mở thông báo' : 'Tắt thông báo'}</Text>
              </Pressable>

              <Pressable
                style={styles.quickTile}
                onPress={() => {
                  setIsPinned(!isPinned);
                  Alert.alert('Ghim hội thoại', isPinned ? 'Đã bỏ ghim hội thoại' : 'Đã ghim hội thoại lên đầu danh sách');
                }}
              >
                <View style={styles.tileIconBg}>
                  <Pin size={18} color={isPinned ? '#f59e0b' : '#0084ff'} />
                </View>
                <Text style={styles.tileLabel}>{isPinned ? 'Bỏ ghim' : 'Ghim chat'}</Text>
              </Pressable>

              <Pressable
                style={styles.quickTile}
                onPress={() => Alert.alert('Tìm kiếm', 'Nhập từ khóa tìm tin nhắn trong cuộc trò chuyện')}
              >
                <View style={styles.tileIconBg}>
                  <Search size={18} color="#0084ff" />
                </View>
                <Text style={styles.tileLabel}>Tìm tin nhắn</Text>
              </Pressable>
            </View>
          </View>

          {/* Section: Tùy chỉnh trò chuyện */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>TÙY CHỈNH HỘI THOẠI</Text>

            <Pressable
              style={styles.rowItem}
              onPress={() => Alert.alert('Chủ đề', 'Tính năng thay đổi màu sắc chủ đề chat sắp ra mắt')}
            >
              <View style={[styles.rowIconBg, { backgroundColor: 'rgba(0, 132, 255, 0.15)' }]}>
                <Palette size={18} color="#0084ff" />
              </View>
              <Text style={styles.rowText}>Đổi màu sắc & Chủ đề</Text>
              <ChevronRight size={16} color="#b0b3b8" />
            </Pressable>

            <Pressable
              style={styles.rowItem}
              onPress={() => Alert.alert('Biệt danh', `Đặt biệt danh cho ${partnerName}`)}
            >
              <View style={[styles.rowIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Edit3 size={18} color="#a855f7" />
              </View>
              <Text style={styles.rowText}>Chỉnh sửa biệt danh</Text>
              <ChevronRight size={16} color="#b0b3b8" />
            </Pressable>
          </View>

          {/* Section: File & Phương tiện đã chia sẻ */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>PHƯƠNG TIỆN VÀ CHIA SẺ</Text>

            <Pressable
              style={styles.rowItem}
              onPress={() => Alert.alert('Hình ảnh', 'Xem lại danh sách hình ảnh đã gửi')}
            >
              <View style={[styles.rowIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <ImageIcon size={18} color="#10b981" />
              </View>
              <Text style={styles.rowText}>Hình ảnh & File đã gửi</Text>
              <ChevronRight size={16} color="#b0b3b8" />
            </Pressable>

            <Pressable
              style={styles.rowItem}
              onPress={() => Alert.alert('Vị trí', 'Xem các địa điểm du lịch 360° đã chia sẻ')}
            >
              <View style={[styles.rowIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <MapPin size={18} color="#f59e0b" />
              </View>
              <Text style={styles.rowText}>Địa điểm du lịch 360° đã gửi</Text>
              <ChevronRight size={16} color="#b0b3b8" />
            </Pressable>
          </View>

          {/* Section: Bảo mật & Riêng tư */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>BẢO MẬT & QUYỀN RIÊNG TƯ</Text>

            <View style={styles.rowItem}>
              <View style={[styles.rowIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Bell size={18} color="#3b82f6" />
              </View>
              <Text style={styles.rowText}>Thông báo cuộc gọi & tin nhắn</Text>
              <Switch
                value={!isMuted}
                onValueChange={(val) => setIsMuted(!val)}
                thumbColor={!isMuted ? '#0084ff' : '#3a3b3c'}
                trackColor={{ false: '#242526', true: 'rgba(0, 132, 255, 0.4)' }}
              />
            </View>

            <Pressable
              style={styles.rowItem}
              onPress={() => {
                Alert.alert(
                  'Chặn người dùng',
                  `Bạn có chắc chắn muốn chặn ${partnerName}?`,
                  [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: 'Chặn',
                      style: 'destructive',
                      onPress: () => {
                        if (onBlockUser) onBlockUser(partner);
                        onClose();
                        Alert.alert('Đã chặn', `Đã chặn ${partnerName}`);
                      },
                    },
                  ]
                );
              }}
            >
              <View style={[styles.rowIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <ShieldAlert size={18} color="#ef4444" />
              </View>
              <Text style={[styles.rowText, { color: '#ef4444' }]}>Chặn {partnerName}</Text>
              <ChevronRight size={16} color="#ef4444" />
            </Pressable>

            <Pressable
              style={styles.rowItem}
              onPress={() => {
                Alert.alert(
                  'Xóa lịch sử nhắn tin',
                  `Lịch sử tin nhắn với ${partnerName} sẽ bị xóa hoàn toàn khỏi thiết bị của bạn.`,
                  [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: 'Xóa trò chuyện',
                      style: 'destructive',
                      onPress: () => {
                        if (onDeleteHistory) onDeleteHistory(group.id);
                        onClose();
                        Alert.alert('Thành công', 'Đã xóa toàn bộ lịch sử tin nhắn.');
                      },
                    },
                  ]
                );
              }}
            >
              <View style={[styles.rowIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Trash2 size={18} color="#ef4444" />
              </View>
              <Text style={[styles.rowText, { color: '#ef4444' }]}>Xóa lịch sử trò chuyện</Text>
              <ChevronRight size={16} color="#ef4444" />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#18191a',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#242526',
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#18191a',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#0084ff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#000000',
  },
  partnerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  onlineStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b0b3b8',
    marginBottom: 20,
  },

  // Quick Tile Grid
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width - 32,
  },
  quickTile: {
    alignItems: 'center',
    width: (width - 48) / 4,
  },
  tileIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#242526',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e4e6eb',
    textAlign: 'center',
  },

  // Section Styles
  section: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b0b3b8',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18191a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#242526',
  },
  rowIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
