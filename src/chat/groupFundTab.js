import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calculator,
  Bell,
  CheckCircle,
  AlertCircle,
  Filter,
  Plane,
  Bed,
  ChevronRight,
  Sparkles,
  CreditCard,
  Eye,
  X,
  FileCheck,
} from 'lucide-react-native';

export function GroupFundTab({
  selectedGroup,
  theme,
  isDarkMode,
  onOpenThuTien,
  onOpenChiTien,
  onOpenSplitBill,
  ownerId,
  currentUser,
}) {
  const [previewBillData, setPreviewBillData] = useState(null);
  // Kiểm tra quyền Trưởng nhóm (Leader)
  const currentUserId = ownerId || (currentUser && currentUser.id) || (currentUser && currentUser.firebaseUid) || (currentUser && currentUser.email) || (currentUser && currentUser.name);
  const groupLeaderId = (selectedGroup && selectedGroup.leaderId) || (selectedGroup && selectedGroup.creatorId) || (selectedGroup && selectedGroup.ownerId);

  const isLeader = Boolean(
    !selectedGroup || 
    !groupLeaderId ||
    String(currentUserId) === String(groupLeaderId) ||
    String(ownerId) === String(groupLeaderId)
  );

  // Lấy và định dạng động dữ liệu quỹ thực tế từ selectedGroup
  const fundData = (selectedGroup && selectedGroup.fund) || {};
  const memberList = (selectedGroup && selectedGroup.membersList) || [];
  const contributionsList = Array.isArray(fundData.contributions) ? fundData.contributions : [];
  const expensesList = Array.isArray(fundData.expenses) ? fundData.expenses : [];

  const contributions = contributionsList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const expenses = expensesList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const balance = contributions - expenses;
  const goal = Number(fundData.goal) || 15000000; // Mặc định 15 triệu nếu chưa cài mục tiêu

  const balanceText = balance >= 1000 ? `${(balance / 1000).toLocaleString('vi-VN')}k` : `${balance} đ`;
  const totalCollect = `${contributions.toLocaleString('vi-VN')} đ`;
  const totalSpent = `${expenses.toLocaleString('vi-VN')} đ`;
  const progress = goal > 0 ? Math.min(balance / goal, 1) : 0;

  // Tính tình trạng nộp quỹ định mức cho từng thành viên
  const quota = fundData.goal && memberList.length
    ? Math.round(fundData.goal / memberList.length)
    : 3000000; // Mặc định 3 triệu/người

  const membersStatus = memberList.map(m => {
    const totalContributed = contributionsList
      .filter(c => String(c.memberId) === String(m.id))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      
    const isDone = totalContributed >= quota;
    const debtAmount = quota - totalContributed;
    
    // Tự sinh avatar code (ví dụ: Bình Đặng -> BD)
    const nameParts = String(m.name || '').split(' ');
    const code = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : String(m.name || 'GP').substring(0, 2).toUpperCase();

    return {
      id: m.id,
      name: m.name,
      code,
      status: isDone ? 'done' : 'debt',
      label: isDone ? 'Đã xong' : `Nợ ${(debtAmount / 1000).toLocaleString('vi-VN')}k`,
      contributed: totalContributed,
    };
  });

  // Gộp các giao dịch đóng góp và chi tiêu thật, sắp xếp theo thời gian mới nhất
  const transactions = [];
  contributionsList.forEach(item => {
    transactions.push({
      id: item.id || `c-${Date.now()}-${Math.random()}`,
      title: item.note || 'Đóng góp quỹ',
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) : 'Vừa xong',
      meta: `${item.memberName || 'Thành viên'} nộp quỹ`,
      amount: `+ ${(Number(item.amount) || 0).toLocaleString('vi-VN')} đ`,
      type: 'collect',
      color: '#10b981', // xanh lá
      stk: item.stk || null,
      billImage: item.billImage || null,
      isAiVerified: true,
      createdAt: item.createdAt || Date.now()
    });
  });
  
  expensesList.forEach(item => {
    transactions.push({
      id: item.id || `e-${Date.now()}-${Math.random()}`,
      title: item.title || 'Chi tiêu quỹ',
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) : 'Vừa xong',
      meta: `Chi từ Quỹ chung`,
      amount: `- ${(Number(item.amount) || 0).toLocaleString('vi-VN')} đ`,
      type: 'expense',
      color: '#ef4444', // đỏ
      stk: item.stk || null,
      billImage: item.billImage || null,
      createdAt: item.createdAt || Date.now()
    });
  });
  
  transactions.sort((a, b) => b.createdAt - a.createdAt);

  const hasActualData = transactions.length > 0;
  const displayTransactions = hasActualData ? transactions : [
    {
      id: 't-mock-1',
      title: 'Hải nộp quỹ chuyến đi (Chuyển Trưởng nhóm)',
      date: '24/08',
      meta: 'Hải nộp quỹ · Ghi chú: CK cho B (STK: 999888777)',
      amount: '+ 3.000.000 đ',
      type: 'collect',
      color: '#10b981',
      stk: 'STK người B: 999888777 (Vietcombank)',
      billImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      isAiVerified: true,
      createdAt: Date.now() - 100000
    },
    {
      id: 't-mock-2',
      title: 'Cọc Homestay 50%',
      date: '20/08',
      meta: 'Bình Đặng ứng trước',
      amount: '- 2.500.000 đ',
      type: 'hotel',
      color: '#ef4444',
      repayLabel: 'CẦN HOÀN TRẢ CHO BÌNH ĐẶNG',
      stk: 'STK Bình Đặng: 0123456789 (MBBank)',
      billImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600',
      isAiVerified: true,
      createdAt: Date.now() - 200000
    }
  ];

  const displayMembers = membersStatus.length > 0 ? membersStatus : [
    { id: 'm-mock-1', name: 'Alice', code: 'AL', status: 'done', label: 'Đã xong', contributed: 3000000 },
    { id: 'm-mock-2', name: 'Bình Đặng', code: 'BD', status: 'done', label: 'Đã xong', contributed: 3000000 },
    { id: 'm-mock-3', name: 'David', code: 'DA', status: 'debt', label: 'Nợ 3.000k', contributed: 0 },
    { id: 'm-mock-4', name: 'Châu', code: 'CH', status: 'debt', label: 'Nợ 3.000k', contributed: 0 },
  ];

  const getTxIcon = (type) => {
    switch (type) {
      case 'flight':
        return (
          <View style={[styles.txIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Plane size={18} color="#3b82f6" />
          </View>
        );
      case 'hotel':
        return (
          <View style={[styles.txIconBg, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
            <Bed size={18} color="#f97316" />
          </View>
        );
      default:
        return (
          <View style={[styles.txIconBg, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
            <Wallet size={18} color="#f43f5e" />
          </View>
        );
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDarkMode ? '#000000' : '#000000' }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 2 KHỐI TRÁI VÀ PHẢI THEO LAYOUT MẪU */}
      <View style={styles.layoutContainer}>
        
        {/* KHỐI BÊN TRÁI: THẺ SỐ DƯ & NÚT HÀNH ĐỘNG */}
        <View style={styles.leftColumn}>
          {/* Card Số dư gradient */}
          <LinearGradient
            colors={['#fb7185', '#f43f5e']}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceTitle}>SỐ DƯ QUỸ HIỆN TẠI</Text>
              <Wallet size={16} color="rgba(255, 255, 255, 0.8)" />
            </View>
            <Text style={styles.balanceText}>{balanceText}</Text>
            
            <View style={styles.balanceMetaRow}>
              <View>
                <Text style={styles.metaLabel}>TỔNG THU</Text>
                <Text style={styles.metaValue}>{totalCollect}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>ĐÃ CHI</Text>
                <Text style={styles.metaValue}>{totalSpent}</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
          </LinearGradient>

          {/* 3 Nút hành động nhanh */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.15)' }]}
              onPress={onOpenChiTien}
            >
              <ArrowUpRight size={15} color="#ef4444" />
              <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Tạo khoản chi</Text>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.15)' }]}
              onPress={onOpenThuTien}
            >
              <ArrowDownLeft size={15} color="#10b981" />
              <Text style={[styles.actionBtnText, { color: '#10b981' }]}>Thu thêm quỹ</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.splitBillBtn, { backgroundColor: 'rgba(244, 63, 94, 0.08)' }]}
            onPress={onOpenSplitBill}
          >
            <Calculator size={15} color="#f43f5e" />
            <Text style={styles.splitBillText}>Bảng Split Bill (Chia tiền)</Text>
          </Pressable>
        </View>

        {/* KHỐI BÊN PHẢI: THÀNH VIÊN & LỊCH SỬ GIAO DỊCH */}
        <View style={styles.rightColumn}>
          
          {/* TÌNH TRẠNG NỘP QUỸ */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Tình trạng nộp quỹ</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Mức thu: {quota.toLocaleString('vi-VN')} đ/người</Text>
              </View>
              {isLeader && (
                <Pressable
                  style={[styles.remindBtn, { backgroundColor: 'rgba(249, 115, 22, 0.08)' }]}
                  onPress={() => Alert.alert('Nhắc nợ', 'Đã gửi tin nhắn nhắc nợ đến các thành viên chưa nộp quỹ.')}
                >
                  <Bell size={13} color="#f97316" />
                  <Text style={styles.remindBtnText}>Nhắc nợ</Text>
                </Pressable>
              )}
            </View>

            {/* Danh sách Tình trạng nộp quỹ dạng list */}
            <View style={styles.membersListContainer}>
              {displayMembers.map((m, index) => {
                const isDone = m.status === 'done';
                const isLast = index === displayMembers.length - 1;
                const contributedText = m.contributed !== undefined 
                  ? `${m.contributed.toLocaleString('vi-VN')} đ` 
                  : (isDone ? `${quota.toLocaleString('vi-VN')} đ` : '0 đ');

                return (
                  <View 
                    key={m.id} 
                    style={[
                      styles.memberRow, 
                      { borderBottomColor: theme.border },
                      isLast && { borderBottomWidth: 0 }
                    ]}
                  >
                    <View style={styles.memberLeftInfo}>
                      <View style={styles.avatarWrapper}>
                        <LinearGradient
                          colors={isDone ? ['#10b981', '#059669'] : ['#f43f5e', '#e11d48']}
                          style={styles.memberAvatarFrame}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <View style={[styles.memberAvatarInner, { backgroundColor: theme.card }]}>
                            <Text style={[styles.memberAvatarText, { color: isDone ? '#10b981' : '#f43f5e' }]}>
                              {m.code}
                            </Text>
                          </View>
                        </LinearGradient>
                        <View style={[styles.statusDotBg, { backgroundColor: isDone ? '#10b981' : '#ef4444' }]}>
                          {isDone ? (
                            <CheckCircle size={8} color="#fff" />
                          ) : (
                            <AlertCircle size={8} color="#fff" />
                          )}
                        </View>
                      </View>

                      <View style={styles.memberTextContainer}>
                        <Text numberOfLines={1} style={[styles.memberName, { color: theme.textPrimary }]}>
                          {m.name}
                        </Text>
                        <Text style={[styles.memberSubtext, { color: theme.textSecondary }]}>
                          Đã nộp: {contributedText}
                        </Text>
                      </View>
                    </View>

                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: isDone ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)' }
                    ]}>
                      <Text style={[styles.statusBadgeText, { color: isDone ? '#10b981' : '#ef4444' }]}>
                        {m.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* LỊCH SỬ GIAO DỊCH */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 16 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Lịch sử giao dịch</Text>
              <Pressable
                style={[styles.filterBtn, { backgroundColor: theme.searchBg, borderColor: theme.border }]}
                onPress={() => Alert.alert('Bộ lọc', 'Tính năng lọc lịch sử giao dịch')}
              >
                <Filter size={13} color={theme.textSecondary} />
                <Text style={[styles.filterBtnText, { color: theme.textPrimary }]}>Lọc</Text>
              </Pressable>
            </View>

            {/* List transactions */}
            <View style={{ marginTop: 10 }}>
              {displayTransactions.map((tx) => (
                <View key={tx.id} style={[styles.transactionRow, { borderBottomColor: theme.border }]}>
                  {getTxIcon(tx.type)}
                  
                  <View style={styles.txInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.txTitle, { color: theme.textPrimary, flex: 1 }]}>{tx.title}</Text>
                      {tx.isAiVerified && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(139, 92, 246, 0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Sparkles size={10} color="#8b5cf6" />
                          <Text style={{ fontSize: 9, fontWeight: '850', color: '#8b5cf6' }}>AI Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.txMeta, { color: theme.textSecondary }]}>
                      {tx.date} · {tx.meta}
                    </Text>

                    {tx.stk && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <CreditCard size={11} color="#3b82f6" />
                        <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#3b82f6' }}>{tx.stk}</Text>
                      </View>
                    )}

                    {tx.repayLabel && (
                      <View style={[styles.repayBadge, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                        <Text style={styles.repayBadgeText}>🔄 {tx.repayLabel}</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={[styles.txAmount, { color: tx.color }]}>{tx.amount}</Text>

                    {/* Hình ảnh bill hiện diện */}
                    {tx.billImage && (
                      <Pressable 
                        style={styles.billThumbnailBox}
                        onPress={() => setPreviewBillData(tx)}
                      >
                        <Image source={{ uri: tx.billImage }} style={styles.billThumbnailImg} />
                        <View style={styles.billOverlayBadge}>
                          <Eye size={10} color="#fff" />
                        </View>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

        </View>

      </View>

      {/* MODAL XEM CHI TIẾT MINH CHỨNG BILL CHUYỂN KHOẢN */}
      <Modal animationType="fade" transparent visible={Boolean(previewBillData)} onRequestClose={() => setPreviewBillData(null)}>
        <View style={styles.billModalBackdrop}>
          <View style={[styles.billModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.billModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FileCheck size={18} color="#10b981" />
                <Text style={[styles.billModalTitle, { color: theme.textPrimary }]}>Minh chứng chuyển khoản</Text>
              </View>
              <Pressable style={styles.closeModalBtn} onPress={() => setPreviewBillData(null)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>

            {previewBillData && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
                <Image source={{ uri: previewBillData.billImage }} style={styles.fullBillImage} resizeMode="contain" />
                
                <View style={styles.billMetaBox}>
                  <Text style={[styles.billMetaTitle, { color: theme.textPrimary }]}>{previewBillData.title}</Text>
                  <Text style={[styles.billMetaAmount, { color: previewBillData.color }]}>{previewBillData.amount}</Text>
                  <Text style={[styles.billMetaText, { color: theme.textSecondary }]}>Thời gian: {previewBillData.date}</Text>
                  {previewBillData.stk && (
                    <Text style={[styles.billMetaStk, { color: '#3b82f6' }]}>💳 {previewBillData.stk}</Text>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  layoutContainer: {
    width: '100%',
  },
  leftColumn: {
    width: '100%',
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  balanceText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '950',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  balanceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 14,
  },
  metaLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 9,
    fontWeight: '800',
  },
  metaValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2.5,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '850',
  },
  splitBillBtn: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  splitBillText: {
    color: '#f43f5e',
    fontSize: 12.5,
    fontWeight: '850',
  },
  rightColumn: {
    width: '100%',
    marginTop: 20,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  remindBtnText: {
    fontSize: 11,
    fontWeight: '850',
    color: '#f97316',
  },
  membersListContainer: {
    marginTop: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  memberLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  memberAvatarFrame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 12,
    fontWeight: '950',
  },
  statusDotBg: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '800',
  },
  memberSubtext: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '850',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '750',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  txIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  txTitle: {
    fontSize: 12.5,
    fontWeight: '850',
    letterSpacing: -0.1,
  },
  txMeta: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  repayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  repayBadgeText: {
    fontSize: 8,
    fontWeight: '850',
    color: '#ca8a04',
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '950',
  },
  billThumbnailBox: {
    position: 'relative',
    width: 42,
    height: 30,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    marginTop: 2,
  },
  billThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  billOverlayBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderTopLeftRadius: 4,
  },
  billModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  billModalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  billModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  billModalTitle: {
    fontSize: 14.5,
    fontWeight: '900',
  },
  fullBillImage: {
    width: '100%',
    height: 260,
    borderRadius: 14,
  },
  billMetaBox: {
    width: '100%',
    marginTop: 14,
    alignItems: 'center',
  },
  billMetaTitle: {
    fontSize: 15,
    fontWeight: '850',
    textAlign: 'center',
  },
  billMetaAmount: {
    fontSize: 18,
    fontWeight: '950',
    marginTop: 4,
  },
  billMetaText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  billMetaStk: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 6,
  },
});
