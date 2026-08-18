import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Send, X, Search, Users, MapPin, CheckCircle2 } from 'lucide-react-native';
import { getChatGroups, sendChatMessage } from '../services/chatService';
import { loadAppData, saveAppData } from '../services/appDataService';

export default function ShareLocationModal({
  visible,
  onClose,
  locationData,
  ownerId,
  currentUser,
  onShareSuccess,
  theme,
  isDarkMode,
}) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sendingGroupId, setSendingGroupId] = useState(null);
  const [sentGroupIds, setSentGroupIds] = useState(new Set());

  useEffect(() => {
    if (visible) {
      const activeId = ownerId || currentUser?._id || currentUser?.id || currentUser?.firebaseUid || 'user_demo';
      setLoading(true);

      getChatGroups(activeId)
        .then((apiGroups) => {
          if (apiGroups && Array.isArray(apiGroups) && apiGroups.length > 0) {
            setGroups(apiGroups);
          } else {
            return loadAppData(activeId, 'chat').then((localData) => {
              if (localData?.groups && Array.isArray(localData.groups) && localData.groups.length > 0) {
                setGroups(localData.groups);
              } else {
                setGroups([
                  { id: 'group-dalat-1', _id: 'group-dalat-1', name: 'Nhóm Du Lịch Đà Lạt 2026 🎒', memberProfiles: [1,2,3,4], avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80' },
                  { id: 'group-halong-2', _id: 'group-halong-2', name: 'Hội Phượt Vịnh Hạ Long 🌊', memberProfiles: [1,2,3], avatar: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=100&q=80' },
                  { id: 'group-food-3', _id: 'group-food-3', name: 'Food Tour Phố Cổ Hà Nội 🍜', memberProfiles: [1,2,3,4,5], avatar: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=100&q=80' }
                ]);
              }
            });
          }
        })
        .catch(() => {
          return loadAppData(activeId, 'chat').then((localData) => {
            if (localData?.groups && Array.isArray(localData.groups) && localData.groups.length > 0) {
              setGroups(localData.groups);
            } else {
              setGroups([
                { id: 'group-dalat-1', _id: 'group-dalat-1', name: 'Nhóm Du Lịch Đà Lạt 2026 🎒', memberProfiles: [1,2,3,4], avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80' },
                { id: 'group-halong-2', _id: 'group-halong-2', name: 'Hội Phượt Vịnh Hạ Long 🌊', memberProfiles: [1,2,3], avatar: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=100&q=80' },
                { id: 'group-food-3', _id: 'group-food-3', name: 'Food Tour Phố Cổ Hà Nội 🍜', memberProfiles: [1,2,3,4,5], avatar: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=100&q=80' }
              ]);
            }
          }).catch(() => {
            setGroups([
              { id: 'group-dalat-1', _id: 'group-dalat-1', name: 'Nhóm Du Lịch Đà Lạt 2026 🎒', memberProfiles: [1,2,3,4], avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80' },
              { id: 'group-halong-2', _id: 'group-halong-2', name: 'Hội Phượt Vịnh Hạ Long 🌊', memberProfiles: [1,2,3], avatar: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=100&q=80' },
              { id: 'group-food-3', _id: 'group-food-3', name: 'Food Tour Phố Cổ Hà Nội 🍜', memberProfiles: [1,2,3,4,5], avatar: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=100&q=80' }
            ]);
          });
        })
        .finally(() => setLoading(false));
    }
  }, [visible, ownerId, currentUser]);

  if (!visible) return null;

  const filteredGroups = groups.filter((g) =>
    (g.name || '').toLowerCase().includes(searchText.trim().toLowerCase())
  );

  const handleShareToGroup = async (group) => {
    const senderId = ownerId || currentUser?._id || currentUser?.id || currentUser?.firebaseUid || 'user_demo';
    if (!group || sendingGroupId) return;

    const locName = locationData?.name || locationData?.ten || 'Địa điểm du lịch';
    const locAddress = locationData?.location || locationData?.viTri || locationData?.address || 'Việt Nam';
    const locDesc = locationData?.description || locationData?.moTa || 'Khám phá vĩ tuyến và danh thắng tuyệt đẹp cùng Vivu360!';

    const shareContent = `📍 [CHIA SẺ ĐỊA ĐIỂM DU LỊCH]\n🚩 ${locName}\n📌 Vị trí: ${locAddress}\n📝 ${locDesc.slice(0, 130)}${locDesc.length > 130 ? '...' : ''}\n🌐 Mở ứng dụng Vivu360 để xem chi tiết bản đồ 3D!`;

    const targetGroupId = group._id || group.id;
    setSendingGroupId(targetGroupId);

    const senderName = currentUser?.name || currentUser?.fullName || currentUser?.displayName || currentUser?.username || 'Bạn';
    const senderAvatar = currentUser?.avatar || currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';

    // Lưu tin nhắn vào lịch sử nhóm chat ứng dụng với đầy đủ Tên & Avatar người gửi
    try {
      const appData = await loadAppData(senderId, 'chat').catch(() => null);
      if (appData && Array.isArray(appData.groups)) {
        const targetG = appData.groups.find(g => String(g.id || g._id) === String(targetGroupId));
        if (targetG) {
          if (!Array.isArray(targetG.messages)) targetG.messages = [];
          targetG.messages.push({
            id: `msg_share_${Date.now()}`,
            _id: `msg_share_${Date.now()}`,
            sender: {
              firebaseUid: senderId,
              name: senderName,
              avatar: senderAvatar,
            },
            senderId: senderId,
            user: senderName,
            userName: senderName,
            senderName: senderName,
            avatar: senderAvatar,
            text: shareContent,
            content: shareContent,
            createdAt: new Date().toISOString(),
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          });
          targetG.lastMessage = `${senderName}: 📍 Chia sẻ địa điểm ${locName}`;
          await saveAppData(senderId, 'chat', appData).catch(() => null);
        }
      }
    } catch (e) {}

    try {
      await sendChatMessage(targetGroupId, senderId, shareContent).catch(() => null);
    } catch (_) {}

    setSentGroupIds((prev) => new Set([...prev, targetGroupId]));
    Alert.alert(
      'Chia sẻ thành công! 🎉',
      `Đã chia sẻ địa điểm "${locName}" vào nhóm "${group.name}".`,
      [
        {
          text: 'Đến nhóm Chat',
          onPress: () => {
            onClose();
            if (onShareSuccess) onShareSuccess(targetGroupId);
          },
        },
        {
          text: 'Đóng',
          onPress: () => onClose(),
          style: 'cancel',
        },
      ]
    );
    setSendingGroupId(null);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: isDarkMode ? '#1e1b2e' : '#ffffff', borderColor: isDarkMode ? '#332d4a' : '#e2e8f0' }]}>
          
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Send size={20} color="#3b82f6" />
              <Text style={[styles.headerTitle, { color: isDarkMode ? '#f8fafc' : '#0f172a' }]}>Chia sẻ địa điểm vào nhóm</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
            </Pressable>
          </View>

          {/* Location Preview Card */}
          {locationData && (
            <View style={[styles.locPreview, { backgroundColor: isDarkMode ? '#28233d' : '#f8fafc', borderColor: isDarkMode ? '#3b3356' : '#e2e8f0' }]}>
              <MapPin size={18} color="#0ea5e9" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.locName, { color: isDarkMode ? '#f8fafc' : '#1e293b' }]} numberOfLines={1}>
                  {locationData.name || locationData.ten}
                </Text>
                <Text style={[styles.locAddr, { color: isDarkMode ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>
                  {locationData.location || locationData.viTri || locationData.address || 'Việt Nam'}
                </Text>
              </View>
            </View>
          )}

          {/* Search Bar */}
          <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#28233d' : '#f1f5f9', borderColor: isDarkMode ? '#3b3356' : '#cbd5e1' }]}>
            <Search size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? '#f8fafc' : '#0f172a' }]}
              placeholder="Tìm nhóm chat..."
              placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText ? (
              <Pressable onPress={() => setSearchText('')}>
                <X size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
              </Pressable>
            ) : null}
          </View>

          {/* Groups List */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={[styles.loadingText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>Đang tải danh sách nhóm...</Text>
            </View>
          ) : filteredGroups.length === 0 ? (
            <View style={styles.emptyBox}>
              <Users size={32} color={isDarkMode ? '#475569' : '#94a3b8'} />
              <Text style={[styles.emptyText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                {searchText ? 'Không tìm thấy nhóm phù hợp' : 'Bạn chưa có nhóm chat nào'}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.groupList} showsVerticalScrollIndicator={false}>
              {filteredGroups.map((group) => {
                const gId = group._id || group.id;
                const isSent = sentGroupIds.has(gId);
                const isSending = sendingGroupId === gId;

                return (
                  <Pressable
                    key={gId}
                    style={({ pressed }) => [
                      styles.groupItem,
                      {
                        backgroundColor: pressed
                          ? (isDarkMode ? '#332d4a' : '#f1f5f9')
                          : (isDarkMode ? '#231e36' : '#ffffff'),
                        borderColor: isDarkMode ? '#332d4a' : '#e2e8f0',
                      },
                    ]}
                    onPress={() => handleShareToGroup(group)}
                    disabled={isSending}
                  >
                    <Image
                      source={{ uri: group.avatar || group.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80' }}
                      style={styles.groupAvatar}
                    />
                    <View style={styles.groupInfo}>
                      <Text style={[styles.groupName, { color: isDarkMode ? '#f8fafc' : '#0f172a' }]} numberOfLines={1}>
                        {group.name}
                      </Text>
                      <Text style={[styles.groupSub, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                        {group.memberProfiles?.length || group.members || 1} thành viên
                      </Text>
                    </View>

                    {isSending ? (
                      <ActivityIndicator size="small" color="#3b82f6" />
                    ) : isSent ? (
                      <View style={styles.sentBadge}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <Text style={styles.sentText}>Đã gửi</Text>
                      </View>
                    ) : (
                      <View style={styles.shareBtn}>
                        <Send size={14} color="#fff" />
                        <Text style={styles.shareBtnText}>Gửi</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '75%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  locPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  locName: {
    fontSize: 14,
    fontWeight: '700',
  },
  locAddr: {
    fontSize: 12,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
  groupList: {
    maxHeight: 300,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  groupAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '700',
  },
  groupSub: {
    fontSize: 12,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  sentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sentText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
});
