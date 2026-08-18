import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  Crown,
  ShieldCheck,
  UserCheck,
  Plus,
  CheckSquare,
  Square,
  Bell,
  Trash2,
  Filter,
  Briefcase,
  Hotel,
  Ticket,
  Receipt,
  Luggage,
  Sparkles,
} from 'lucide-react-native';
import { createGroupTask, remindGroupTask, updateGroupMemberRoles, updateGroupTask } from '../services/chatService';

const TASK_CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: Briefcase },
  { id: 'stay', label: 'Khách sạn', icon: Hotel },
  { id: 'ticket', label: 'Vé xe / máy bay', icon: Ticket },
  { id: 'receipt', label: 'Giữ hóa đơn', icon: Receipt },
  { id: 'gear', label: 'Chuẩn bị đồ', icon: Luggage },
];

export function GroupTaskTab({ group, currentUser, onGroupUpdated, isDarkMode }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState('');
  const [roleTarget, setRoleTarget] = useState('member');
  const [taskCat, setTaskCat] = useState('Khách sạn');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const membersList = Array.isArray(group?.membersList) ? group.membersList : [];
  const tasks = Array.isArray(group?.tasks) ? group.tasks : [];
  const leaderId = group?.leaderId || group?.ownerId;
  const deputyIds = Array.isArray(group?.deputyIds) ? group.deputyIds : [];

  const currentUserId = currentUser?.id || currentUser?.firebaseUid || currentUser?.email || 'current-user';
  const isLeader = String(currentUserId) === String(leaderId);
  const isDeputy = deputyIds.includes(String(currentUserId));

  // Toggle deputy role
  const handleToggleDeputy = async (memberId) => {
    if (!isLeader) {
      Alert.alert('Thông báo', 'Chỉ Trưởng nhóm mới có quyền bổ nhiệm Phó nhóm');
      return;
    }
    const currentDeputies = new Set(deputyIds);
    if (currentDeputies.has(memberId)) {
      currentDeputies.delete(memberId);
    } else {
      currentDeputies.add(memberId);
    }
    try {
      const updatedGroup = await updateGroupMemberRoles(group.id || group._id, currentUserId, Array.from(currentDeputies));
      if (onGroupUpdated) onGroupUpdated(updatedGroup);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật vai trò');
    }
  };

  // Add Task
  const handleCreateTask = async () => {
    if (!taskTitle.trim() || loading) return;
    setLoading(true);
    try {
      const res = await createGroupTask(group.id || group._id, currentUserId, {
        title: taskTitle.trim(),
        assignedTo: assignedMemberId,
        roleTarget,
        category: taskCat,
      });
      if (onGroupUpdated) {
        onGroupUpdated({ ...group, tasks: res.tasks });
      }
      setTaskTitle('');
      setShowAddModal(false);
    } catch (e) {
      Alert.alert('Lỗi', 'Khái tạo công việc thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (task) => {
    setActionLoading(task.id);
    try {
      const res = await updateGroupTask(group.id || group._id, task.id, currentUserId, {
        completed: !task.completed,
      });
      if (onGroupUpdated) {
        onGroupUpdated({ ...group, tasks: res.tasks });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Remind Task in Group Chat
  const handleRemindTask = async (task) => {
    setActionLoading(`remind_${task.id}`);
    try {
      await remindGroupTask(group.id || group._id, task.id, currentUserId);
      Alert.alert('Thành công', `Đã gửi thông báo nhắc nhở task "${task.title}" vào nhóm chat! 📌`);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể gửi nhắc việc');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'stay') return t.category === 'Khách sạn';
    if (selectedCategory === 'ticket') return t.category === 'Vé xe / máy bay';
    if (selectedCategory === 'receipt') return t.category === 'Giữ hóa đơn';
    if (selectedCategory === 'gear') return t.category === 'Chuẩn bị đồ';
    return true;
  });

  const bgStyle = { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' };
  const textColor = { color: isDarkMode ? '#f8fafc' : '#0f172a' };
  const cardBg = { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' };
  const subTextColor = { color: isDarkMode ? '#94a3b8' : '#64748b' };

  return (
    <ScrollView style={[styles.container, bgStyle]} showsVerticalScrollIndicator={false}>
      {/* 👑 Section: Vai Trò Trong Nhóm */}
      <View style={[styles.sectionCard, cardBg]}>
        <View style={styles.sectionHeaderRow}>
          <Crown size={20} color="#eab308" />
          <Text style={[styles.sectionTitle, textColor]}>Phân Vai Trò Thành Viên</Text>
        </View>

        <View style={styles.memberRoleList}>
          {membersList.map((m) => {
            const mId = String(m.id || m.firebaseUid);
            const isMLeader = mId === String(leaderId);
            const isMDeputy = deputyIds.includes(mId);

            return (
              <View key={mId} style={styles.memberRoleItem}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{(m.name || 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.memberName, textColor]}>{m.name || 'Thành viên'}</Text>
                  <Text style={styles.roleTag}>
                    {isMLeader ? '👑 Trưởng nhóm' : isMDeputy ? '🛡️ Phó nhóm' : '👤 Thành viên'}
                  </Text>
                </View>

                {isLeader && !isMLeader && (
                  <Pressable
                    style={[styles.deputyBtn, isMDeputy && styles.deputyBtnActive]}
                    onPress={() => handleToggleDeputy(mId)}
                  >
                    <ShieldCheck size={14} color={isMDeputy ? '#ffffff' : '#3b82f6'} />
                    <Text style={[styles.deputyBtnText, isMDeputy && { color: '#ffffff' }]}>
                      {isMDeputy ? 'Phó Nhóm' : '+ Phó Nhóm'}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* 📋 Section: Checklist Công Việc */}
      <View style={[styles.sectionCard, cardBg]}>
        <View style={styles.sectionHeaderRow}>
          <CheckSquare size={20} color="#3b82f6" />
          <Text style={[styles.sectionTitle, textColor]}>Checklist & Phân Công</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addBtnText}>Tạo Việc</Text>
          </Pressable>
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {TASK_CATEGORIES.map((c) => {
            const IconComponent = c.icon;
            const active = selectedCategory === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCategory(c.id)}
              >
                <IconComponent size={14} color={active ? '#ffffff' : isDarkMode ? '#94a3b8' : '#64748b'} />
                <Text style={[styles.catPillText, active && { color: '#ffffff' }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Task Items */}
        <View style={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Sparkles size={32} color="#94a3b8" />
              <Text style={[styles.emptyText, subTextColor]}>Chưa có công việc nào trong mục này</Text>
              <Pressable style={styles.quickAddBtn} onPress={() => setShowAddModal(true)}>
                <Text style={styles.quickAddText}>+ Thêm công việc ngay</Text>
              </Pressable>
            </View>
          ) : (
            filteredTasks.map((t) => {
              const assignedUser = membersList.find((m) => String(m.id || m.firebaseUid) === String(t.assignedTo));
              const isChecking = actionLoading === t.id;
              const isReminding = actionLoading === `remind_${t.id}`;

              return (
                <View key={t.id} style={[styles.taskCard, t.completed && styles.taskCompletedCard]}>
                  <Pressable style={styles.checkBtn} onPress={() => handleToggleTask(t)} disabled={isChecking}>
                    {isChecking ? (
                      <ActivityIndicator size="small" color="#3b82f6" />
                    ) : t.completed ? (
                      <CheckSquare size={22} color="#10b981" />
                    ) : (
                      <Square size={22} color="#94a3b8" />
                    )}
                  </Pressable>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskTitle, textColor, t.completed && styles.taskCompletedTitle]}>
                      {t.title}
                    </Text>
                    <View style={styles.taskMetaRow}>
                      <Text style={styles.catBadge}>{t.category || 'Chung'}</Text>
                      {assignedUser && (
                        <Text style={styles.assignedBadge}>👤 @{assignedUser.name}</Text>
                      )}
                    </View>
                  </View>

                  {!t.completed && (
                    <Pressable
                      style={styles.remindBtn}
                      onPress={() => handleRemindTask(t)}
                      disabled={isReminding}
                    >
                      {isReminding ? (
                        <ActivityIndicator size="small" color="#f59e0b" />
                      ) : (
                        <>
                          <Bell size={14} color="#f59e0b" />
                          <Text style={styles.remindBtnText}>Nhắc việc</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Modal Add Task */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setShowAddModal(false)} />
          <View style={[styles.addModalContent, cardBg]}>
            <Text style={[styles.addModalTitle, textColor]}>📌 Tạo Công Việc / Checklist</Text>

            <Text style={[styles.inputLabel, textColor]}>Tên công việc:</Text>
            <TextInput
              style={[styles.modalInput, bgStyle, textColor]}
              placeholder="VD: Đặt vé xe Sa Pa / Giữ hóa đơn ăn tối"
              placeholderTextColor="#94a3b8"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />

            <Text style={[styles.inputLabel, textColor]}>Danh mục:</Text>
            <View style={styles.catSelectRow}>
              {['Khách sạn', 'Vé xe / máy bay', 'Giữ hóa đơn', 'Chuẩn bị đồ'].map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.catSelectPill, taskCat === cat && styles.catSelectActive]}
                  onPress={() => setTaskCat(cat)}
                >
                  <Text style={[styles.catSelectText, taskCat === cat && { color: '#ffffff' }]}>{cat}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.inputLabel, textColor]}>Giao cho thành viên:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberSelectRow}>
              <Pressable
                style={[styles.memberSelectPill, !assignedMemberId && styles.memberSelectActive]}
                onPress={() => setAssignedMemberId('')}
              >
                <Text style={[styles.memberSelectText, !assignedMemberId && { color: '#ffffff' }]}>Cả nhóm</Text>
              </Pressable>
              {membersList.map((m) => {
                const mId = String(m.id || m.firebaseUid);
                const active = assignedMemberId === mId;
                return (
                  <Pressable
                    key={mId}
                    style={[styles.memberSelectPill, active && styles.memberSelectActive]}
                    onPress={() => setAssignedMemberId(mId)}
                  >
                    <Text style={[styles.memberSelectText, active && { color: '#ffffff' }]}>{m.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.submitTaskBtn} onPress={handleCreateTask} disabled={loading}>
                {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitTaskText}>Xác Nhận Tạo</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionCard: { borderRadius: 20, padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },
  memberRoleList: { gap: 10 },
  memberRoleItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#3b82f6', fontWeight: '700' },
  memberName: { fontSize: 14, fontWeight: '600' },
  roleTag: { fontSize: 11, color: '#64748b', marginTop: 2 },
  deputyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 4,
  },
  deputyBtnActive: { backgroundColor: '#3b82f6' },
  deputyBtnText: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
  catScroll: { flexDirection: 'row', marginBottom: 14 },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    marginRight: 8,
    gap: 6,
  },
  catPillActive: { backgroundColor: '#3b82f6' },
  catPillText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  taskList: { gap: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13 },
  quickAddBtn: { marginTop: 4 },
  quickAddText: { color: '#3b82f6', fontWeight: '700', fontSize: 14 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    gap: 12,
  },
  taskCompletedCard: { opacity: 0.6 },
  checkBtn: { padding: 2 },
  taskTitle: { fontSize: 14, fontWeight: '600' },
  taskCompletedTitle: { textDecorationLine: 'line-through', color: '#94a3b8' },
  taskMetaRow: { flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' },
  catBadge: { fontSize: 10, color: '#3b82f6', backgroundColor: '#3b82f615', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  assignedBadge: { fontSize: 10, color: '#10b981', backgroundColor: '#10b98115', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f59e0b15',
    gap: 4,
  },
  remindBtnText: { fontSize: 11, color: '#f59e0b', fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  addModalContent: { width: '100%', borderRadius: 20, padding: 20, elevation: 5 },
  addModalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  modalInput: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  catSelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  catSelectPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(148,163,184,0.15)' },
  catSelectActive: { backgroundColor: '#3b82f6' },
  catSelectText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  memberSelectRow: { flexDirection: 'row', marginBottom: 16 },
  memberSelectPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(148,163,184,0.15)', marginRight: 6 },
  memberSelectActive: { backgroundColor: '#3b82f6' },
  memberSelectText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  cancelText: { color: '#64748b', fontWeight: '600' },
  submitTaskBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  submitTaskText: { color: '#ffffff', fontWeight: '700' },
});
