import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  Switch,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Users,
  UserPlus,
  UserMinus,
  Crown,
  ShieldCheck,
  Bell,
  Pin,
  Search,
  Camera,
  Pencil,
  MapPin,
  LogOut,
  Trash2,
  ChevronRight,
  Sparkles,
  Check,
  Share2,
  ShieldAlert,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const getUserAvatarByName = (name) => {
  const safeName = String(name || '');
  if (!safeName) return 'https://i.pravatar.cc/150?img=11';
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `https://i.pravatar.cc/150?img=${Math.abs(hash % 70) + 1}`;
};

export function GroupSettingsModal({
  visible,
  onClose,
  group,
  currentUser,
  ownerId,
  isDarkMode,
  theme,
  onRenameGroup,
  onAddMember,
  onRemoveMember,
  onToggleDeputy,
  onLeaveGroup,
  onDisbandGroup,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState(group?.name || '');
  const [memberFilterText, setMemberFilterText] = useState('');
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);
  const [newMemberText, setNewMemberText] = useState('');
  const [isAddingLoading, setIsAddingLoading] = useState(false);

  if (!group) return null;

  const currentUserId = ownerId || currentUser?.id;
  const groupOwnerId = group.leaderId || group.creatorId || group.ownerId;
  const isOwner = String(currentUserId) === String(groupOwnerId);
  const isDeputy = Array.isArray(group.deputyIds) && group.deputyIds.includes(String(currentUserId));
  const canManageMembers = isOwner || isDeputy;

  const membersList = group.membersList || [];
  const filteredMembers = membersList.filter((m) =>
    String(m.name || '').toLowerCase().includes(memberFilterText.toLowerCase()) ||
    String(m.email || '').toLowerCase().includes(memberFilterText.toLowerCase())
  );

  const handleSaveGroupName = () => {
    if (!groupNameInput.trim()) {
      Alert.alert('Thông báo', 'Tên nhóm không được để trống.');
      return;
    }
    if (onRenameGroup) {
      onRenameGroup(group.id, groupNameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleAddMemberSubmit = async () => {
    if (!newMemberText.trim()) return;
    setIsAddingLoading(true);
    try {
      if (onAddMember) {
        await onAddMember(group.id, newMemberText.trim());
      }
      setNewMemberText('');
      setShowAddMemberInput(false);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể thêm thành viên này.');
    } finally {
      setIsAddingLoading(false);
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
      <View style={[styles.root, { backgroundColor: isDarkMode ? '#000000' : '#f8fafc' }]}>
        {/* Header */}
        <LinearGradient
          colors={isDarkMode ? ['#000000', '#0f0f14'] : ['#ffffff', '#f1f5f9']}
          style={[styles.header, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }]}
        >
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <X size={22} color={isDarkMode ? '#fff' : '#0f172a'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#0f172a' }]}>Cài Đặt Nhóm Chat</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* A. Group Banner & Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: isDarkMode ? '#111116' : '#ffffff', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }]}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={['#8b5cf6', '#3b82f6']}
                style={styles.avatarRing}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image
                  source={{ uri: group.image || getUserAvatarByName(group.name) }}
                  style={styles.groupAvatar}
                />
              </LinearGradient>
              {canManageMembers && (
                <Pressable
                  style={styles.editAvatarBadge}
                  onPress={() => Alert.alert('Đổi ảnh nhóm', 'Tính năng chọn ảnh từ thư viện sắp ra mắt!')}
                >
                  <Camera size={12} color="#fff" />
                </Pressable>
              )}
            </View>

            {/* Group Name & Edit */}
            {isEditingName ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={[styles.editNameInput, { color: isDarkMode ? '#fff' : '#0f172a', borderColor: isDarkMode ? '#8b5cf6' : '#3b82f6' }]}
                  value={groupNameInput}
                  onChangeText={setGroupNameInput}
                  autoFocus
                />
                <Pressable style={styles.saveNameBtn} onPress={handleSaveGroupName}>
                  <Check size={16} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <Text style={[styles.groupNameText, { color: isDarkMode ? '#fff' : '#0f172a' }]}>{group.name}</Text>
                {canManageMembers && (
                  <Pressable onPress={() => { setGroupNameInput(group.name); setIsEditingName(true); }}>
                    <Pencil size={15} color="#8b5cf6" />
                  </Pressable>
                )}
              </View>
            )}

            <Text style={[styles.groupSubText, { color: isDarkMode ? 'rgba(196,181,253,0.7)' : '#64748b' }]}>
              {membersList.length} thành viên · Tạo bởi {isOwner ? 'Bạn' : 'Trưởng nhóm'}
            </Text>

            {/* B. Quick Action Grid */}
            <View style={styles.quickActionGrid}>
              <Pressable
                style={[styles.quickActionBtn, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.15)' : '#f1f5f9' }]}
                onPress={() => setShowAddMemberInput(!showAddMemberInput)}
              >
                <UserPlus size={18} color="#8b5cf6" />
                <Text style={[styles.quickActionText, { color: isDarkMode ? '#c4b5fd' : '#475569' }]}>Thêm người</Text>
              </Pressable>

              <Pressable
                style={[styles.quickActionBtn, { backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : '#f1f5f9' }]}
                onPress={() => setIsMuted(!isMuted)}
              >
                <Bell size={18} color={isMuted ? '#ef4444' : '#3b82f6'} />
                <Text style={[styles.quickActionText, { color: isDarkMode ? '#c4b5fd' : '#475569' }]}>
                  {isMuted ? 'Đã tắt thông báo' : 'Thông báo'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.quickActionBtn, { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.15)' : '#f1f5f9' }]}
                onPress={() => setIsPinned(!isPinned)}
              >
                <Pin size={18} color={isPinned ? '#10b981' : '#64748b'} />
                <Text style={[styles.quickActionText, { color: isDarkMode ? '#c4b5fd' : '#475569' }]}>
                  {isPinned ? 'Đã ghim' : 'Ghim nhóm'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.quickActionBtn, { backgroundColor: isDarkMode ? 'rgba(245,158,11,0.15)' : '#f1f5f9' }]}
                onPress={() => Alert.alert('Chia sẻ nhóm', 'Đã sao chép liên kết mời tham gia nhóm!')}
              >
                <Share2 size={18} color="#f59e0b" />
                <Text style={[styles.quickActionText, { color: isDarkMode ? '#c4b5fd' : '#475569' }]}>Chia sẻ</Text>
              </Pressable>
            </View>
          </View>

          {/* C. Add Member Input Box */}
          {showAddMemberInput && (
            <View style={[styles.addMemberCard, { backgroundColor: isDarkMode ? '#111116' : '#ffffff', borderColor: '#8b5cf6' }]}>
              <Text style={[styles.cardSectionTitle, { color: isDarkMode ? '#fff' : '#0f172a' }]}>Thêm thành viên mới</Text>
              <View style={styles.addInputRow}>
                <TextInput
                  style={[styles.addMemberInput, { color: isDarkMode ? '#fff' : '#0f172a', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f8fafc' }]}
                  placeholder="Nhập tên, email hoặc số điện thoại..."
                  placeholderTextColor={isDarkMode ? 'rgba(196,181,253,0.4)' : '#94a3b8'}
                  value={newMemberText}
                  onChangeText={setNewMemberText}
                />
                <Pressable style={styles.addMemberSubmitBtn} onPress={handleAddMemberSubmit} disabled={isAddingLoading}>
                  {isAddingLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.addMemberSubmitText}>Thêm</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* D. Members List Section */}
          <View style={[styles.sectionCard, { backgroundColor: isDarkMode ? '#111116' : '#ffffff', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Users size={16} color="#8b5cf6" />
                <Text style={[styles.cardSectionTitle, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
                  Thành viên nhóm ({membersList.length})
                </Text>
              </View>
            </View>

            {/* Member Search Bar */}
            <View style={[styles.searchBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }]}>
              <Search size={14} color={isDarkMode ? 'rgba(196,181,253,0.5)' : '#94a3b8'} />
              <TextInput
                style={[styles.searchInput, { color: isDarkMode ? '#fff' : '#0f172a' }]}
                placeholder="Tìm thành viên trong nhóm..."
                placeholderTextColor={isDarkMode ? 'rgba(196,181,253,0.4)' : '#94a3b8'}
                value={memberFilterText}
                onChangeText={setMemberFilterText}
              />
            </View>

            {/* Members Items */}
            {filteredMembers.map((member) => {
              const mId = String(member.firebaseUid || member.id);
              const isMemOwner = String(mId) === String(groupOwnerId);
              const isMemDeputy = Array.isArray(group.deputyIds) && group.deputyIds.includes(mId);

              return (
                <View key={mId} style={[styles.memberItemRow, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }]}>
                  <Image source={{ uri: member.avatar || getUserAvatarByName(member.name) }} style={styles.memberAvatar} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.memberNameText, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
                        {member.name} {mId === String(currentUserId) ? '(Bạn)' : ''}
                      </Text>
                      {isMemOwner ? (
                        <View style={styles.ownerBadge}>
                          <Crown size={10} color="#fde047" />
                          <Text style={styles.ownerBadgeText}>Trưởng nhóm</Text>
                        </View>
                      ) : isMemDeputy ? (
                        <View style={styles.deputyBadge}>
                          <ShieldCheck size={10} color="#cbd5e1" />
                          <Text style={styles.deputyBadgeText}>Phó nhóm</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.memberMetaText, { color: isDarkMode ? 'rgba(196,181,253,0.6)' : '#94a3b8' }]}>
                      {member.email || 'Thành viên Vivu360'}
                    </Text>
                  </View>

                  {/* Actions for Leaders */}
                  {canManageMembers && mId !== String(currentUserId) && !isMemOwner && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {isOwner && (
                        <Pressable
                          style={styles.roleToggleBtn}
                          onPress={() => onToggleDeputy && onToggleDeputy(group.id, mId)}
                        >
                          <ShieldCheck size={14} color={isMemDeputy ? '#f59e0b' : '#10b981'} />
                        </Pressable>
                      )}
                      <Pressable
                        style={styles.kickMemberBtn}
                        onPress={() => {
                          Alert.alert('Khai trừ thành viên', `Bạn có chắc muốn xóa ${member.name} khỏi nhóm?`, [
                            { text: 'Hủy', style: 'cancel' },
                            { text: 'Xóa', style: 'destructive', onPress: () => onRemoveMember && onRemoveMember(group.id, mId) },
                          ]);
                        }}
                      >
                        <UserMinus size={14} color="#ef4444" />
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* E. Group Utilities & Settings Options */}
          <View style={[styles.sectionCard, { backgroundColor: isDarkMode ? '#111116' : '#ffffff', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }]}>
            <Text style={[styles.cardSectionTitle, { color: isDarkMode ? '#fff' : '#0f172a', marginBottom: 12 }]}>Tùy chọn nhóm</Text>

            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: isDarkMode ? '#fff' : '#0f172a' }]}>Tắt thông báo nhóm</Text>
              <Switch value={isMuted} onValueChange={setIsMuted} trackColor={{ false: '#767577', true: '#8b5cf6' }} />
            </View>

            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: isDarkMode ? '#fff' : '#0f172a' }]}>Ghim nhóm lên đầu danh sách</Text>
              <Switch value={isPinned} onValueChange={setIsPinned} trackColor={{ false: '#767577', true: '#10b981' }} />
            </View>
          </View>

          {/* F. Danger Zone (Leave or Disband Group) */}
          <View style={styles.dangerZone}>
            <Pressable
              style={styles.leaveGroupBtn}
              onPress={() => {
                Alert.alert('Rời khỏi nhóm', 'Bạn có chắc chắn muốn rời khỏi nhóm trò chuyện này không?', [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Rời nhóm', style: 'destructive', onPress: () => { onClose(); onLeaveGroup && onLeaveGroup(group.id); } },
                ]);
              }}
            >
              <LogOut size={16} color="#ef4444" />
              <Text style={styles.leaveGroupText}>Rời khỏi nhóm</Text>
            </Pressable>

            {isOwner && (
              <Pressable
                style={styles.disbandGroupBtn}
                onPress={() => {
                  Alert.alert('Giải tán nhóm', 'Thao tác này sẽ xóa vĩnh viễn nhóm chat và toàn bộ dữ liệu lịch trình du lịch!', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Giải tán nhóm', style: 'destructive', onPress: () => { onClose(); onDisbandGroup && onDisbandGroup(group.id); } },
                  ]);
                }}
              >
                <Trash2 size={16} color="#dc2626" />
                <Text style={styles.disbandGroupText}>Giải tán nhóm vĩnh viễn</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8b5cf6',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupNameText: {
    fontSize: 18,
    fontWeight: '900',
  },
  groupSubText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  editNameInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 180,
  },
  saveNameBtn: {
    backgroundColor: '#8b5cf6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 4,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '800',
  },
  addMemberCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  addMemberInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addMemberSubmitBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberSubmitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
  },
  memberItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  memberNameText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  memberMetaText: {
    fontSize: 11,
    marginTop: 1,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontWeight: '850',
    color: '#fde047',
  },
  deputyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  deputyBadgeText: {
    fontSize: 9,
    fontWeight: '850',
    color: '#cbd5e1',
  },
  roleToggleBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
  },
  kickMemberBtn: {
    padding: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  dangerZone: {
    gap: 10,
    marginTop: 10,
  },
  leaveGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 14,
  },
  leaveGroupText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '800',
  },
  disbandGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderColor: '#dc2626',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 14,
  },
  disbandGroupText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '900',
  },
});
