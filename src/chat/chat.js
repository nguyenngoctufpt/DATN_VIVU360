import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, TextInput, Modal, Dimensions, Alert, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadAppData, saveAppData } from '../services/appDataService';
import { getSafeAvatarSource, getSafeImageSource } from '../utils/image';
import {
  X,
  Plus,
  Users,
  Sparkles,
  Send,
  MessageCircle,
  Award,
  Smile,
  Info,
  Paperclip,
  Camera,
  Check,
  CheckCheck,
  ChevronLeft
} from 'lucide-react-native';

import { UserProfileModal } from '../social';

const { width, height } = Dimensions.get('window');

const getUserAvatarByName = (name) => {
  if (!name) return 'https://i.pravatar.cc/150?img=11';

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const imgIndex = Math.abs(hash % 70) + 1;
  return `https://i.pravatar.cc/150?img=${imgIndex}`;
};

const getUserLevelByName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `Cấp ${Math.abs(hash % 12) + 3}`;
};

const getFormattedMsgTime = (msgId) => {
  if (!msgId || msgId < 10000000000) {
    return '10:24';
  }
  try {
    const d = new Date(msgId);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  } catch (e) {
    return 'Vừa xong';
  }
};

const getUserRankColors = (name) => {
  const lvl = getUserLevelByName(name);
  const levelNum = parseInt(lvl.replace(/[^0-9]/g, ''), 10) || 1;
  if (levelNum >= 12) {
    return {
      colors: ['#eab308', '#ca8a04'],
      textColor: '#ffffff',
      iconColor: '#fef08a'
    };
  } else if (levelNum >= 8) {
    return {
      colors: ['#94a3b8', '#475569'],
      textColor: '#ffffff',
      iconColor: '#cbd5e1'
    };
  } else {
    return {
      colors: ['#b45309', '#78350f'],
      textColor: '#ffffff',
      iconColor: '#fed7aa'
    };
  }
};

const getTagColors = (tag, isDarkMode) => {
  const cleanTag = tag.trim().toLowerCase();
  if (cleanTag.includes('sapa') || cleanTag.includes('phượt')) {
    return {
      bg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      border: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.15)',
      text: '#ef4444'
    };
  }
  if (cleanTag.includes('ẩm thực') || cleanTag.includes('khách sạn') || cleanTag.includes('homestay')) {
    return {
      bg: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
      border: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.15)',
      text: '#f59e0b'
    };
  }
  if (cleanTag.includes('đà nẵng') || cleanTag.includes('hội an') || cleanTag.includes('kết bạn') || cleanTag.includes('ghép xe')) {
    return {
      bg: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      border: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)',
      text: '#10b981'
    };
  }
  return {
    bg: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.06)',
    border: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
    text: '#3b82f6'
  };
};

const initialGroups = [];

const SEEDED_GROUP_IDS = new Set([1, 2, 3]);

const sanitizeGroups = (items) => (
  Array.isArray(items)
    ? items.filter((group) => group && !SEEDED_GROUP_IDS.has(Number(group.id)))
    : []
);

export function ChatScreen({ ownerId, isDarkMode, theme, currentUser, onNavigateToTab, prevScreen }) {
  const [groups, setGroups] = useState(initialGroups);
  const [groupsOwnerId, setGroupsOwnerId] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  useEffect(() => {
    if (!ownerId) return;
    let active = true;
    loadAppData(ownerId, 'chat')
      .then(saved => {
        if (active) {
          setGroups(sanitizeGroups(saved?.groups));
        }
      })
      .catch(error => console.warn('Không thể tải nhóm chat:', error.message))
      .finally(() => active && setGroupsOwnerId(ownerId));
    return () => { active = false; };
  }, [ownerId]);

  useEffect(() => {
    if (!ownerId || groupsOwnerId !== ownerId) return;
    const timer = setTimeout(() => {
      saveAppData(ownerId, 'chat', { groups })
        .catch(error => console.warn('Không thể lưu nhóm chat:', error.message));
    }, 500);
    return () => clearTimeout(timer);
  }, [ownerId, groupsOwnerId, groups]);

  // Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTag, setNewGroupTag] = useState('');

  // Active Chat State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // User profile modal state
  const [targetUsername, setTargetUsername] = useState('');
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const messageStreamRef = useRef(null);

  // Scroll to bottom of message stream when chat opens or messages change
  useEffect(() => {
    if (chatModalVisible && messageStreamRef.current) {
      setTimeout(() => {
        messageStreamRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatModalVisible, selectedGroup?.messages?.length]);

  // Submit Group
  const handleSubmitGroup = () => {
    if (!newGroupName.trim()) return;

    const defaultImages = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=300&q=80'
    ];

    const newGroupObj = {
      id: Date.now(),
      name: newGroupName,
      tag: newGroupTag.trim() || 'Du lịch',
      members: 1,
      image: defaultImages[Math.floor(Math.random() * defaultImages.length)],
      lastMessage: 'Hệ thống: Nhóm vừa được khởi tạo bởi bạn',
      messages: []
    };

    setGroups([newGroupObj, ...groups]);
    setNewGroupName('');
    setNewGroupTag('');
    setGroupModalVisible(false);
  };

  // Open Chat Room
  const handleOpenChat = (group) => {
    setSelectedGroup(group);
    setChatModalVisible(true);
  };

  // Send Chat message
  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !selectedGroup) return;

    const newMessage = {
      id: Date.now(),
      user: currentUser.name,
      text: chatInput
    };

    setGroups(prevGroups =>
      prevGroups.map(g => {
        if (g.id === selectedGroup.id) {
          const updatedMessages = [...(g.messages || []), newMessage];
          return {
            ...g,
            lastMessage: `${currentUser.name}: ${chatInput}`,
            messages: updatedMessages
          };
        }
        return g;
      })
    );

    setSelectedGroup(prev => ({
      ...prev,
      lastMessage: `${currentUser.name}: ${chatInput}`,
      messages: [...(prev.messages || []), newMessage]
    }));

    setChatInput('');
  };

  // Open User Profile view modal
  const handleOpenUserProfile = (username) => {
    setTargetUsername(username);
    setProfileModalVisible(true);
  };

  return (
    <View style={styles.tabContainer}>
      {/* HEADER SECTION */}
      <View style={styles.socialHeader}>
        <View style={styles.headerTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable 
              style={[styles.backBtn, { backgroundColor: theme.searchBg }]}
              onPress={() => onNavigateToTab && onNavigateToTab(prevScreen || 'social')}
            >
              <ChevronLeft size={20} color={theme.textPrimary} />
            </Pressable>
            <Text style={[styles.socialTitle, { color: theme.textPrimary }]}>Nhóm trò chuyện</Text>
          </View>
        </View>
        <Text style={[styles.socialSubtitle, { color: theme.textSecondary, marginLeft: 44 }]}>
          Kết nối và trò chuyện cùng bạn đồng hành du lịch
        </Text>
      </View>

      {/* Scrollable Groups Section */}
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.groupsSection}>
          {/* Create Group Quick Action */}
          <Pressable
            style={[styles.createGroupBtnCard, { borderColor: theme.border }]}
            onPress={() => setGroupModalVisible(true)}
          >
            <LinearGradient
              colors={['#06b6d4', '#3b82f6']}
              style={styles.createGroupBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.createGroupBtnText}>Tạo nhóm trò chuyện mới</Text>
            </LinearGradient>
          </Pressable>

          {/* Groups List */}
          {groups.map((group) => (
            <Pressable
              key={group.id}
              style={[styles.groupCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}
              onPress={() => handleOpenChat(group)}
            >
              <Image source={getSafeImageSource(group.image)} style={styles.groupCoverImage} />
              <View style={styles.groupCardInfo}>
                <View style={styles.groupTitleRow}>
                  <Text numberOfLines={1} style={[styles.groupCardName, { color: theme.textPrimary }]}>{group.name}</Text>
                  <View style={[styles.groupMembersCount, { backgroundColor: theme.statusBg, borderColor: theme.border, borderWidth: 0.5 }]}>
                    <Users size={11} color="#3b82f6" />
                    <Text style={[styles.groupMembersText, { color: '#3b82f6' }]}>{group.members} TV</Text>
                  </View>
                </View>

                {/* Styled split tags */}
                <View style={styles.groupTagsContainer}>
                  {group.tag.split(' / ').map((t, idx) => {
                    const tagColors = getTagColors(t, isDarkMode);
                    return (
                      <View 
                        key={idx} 
                        style={[
                          styles.groupTagBadge, 
                          { 
                            backgroundColor: tagColors.bg, 
                            borderColor: tagColors.border 
                          }
                        ]}
                      >
                        <Text style={[styles.groupTagBadgeText, { color: tagColors.text }]}>{t}</Text>
                      </View>
                    );
                  })}
                </View>

                <Text numberOfLines={1} style={[styles.groupCardLastMsg, { color: theme.textSecondary }]}>
                  {group.lastMessage}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODALS SECTION */}
      {/* ======================================================== */}

      {/* MODAL: CREATE GROUP */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={groupModalVisible}
        onRequestClose={() => setGroupModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, height: 360 }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Tạo nhóm trò chuyện</Text>
              <Pressable style={styles.closeModalBtn} onPress={() => setGroupModalVisible(false)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>

            <View style={{ flex: 1, padding: 16 }}>
              {/* Group Name input */}
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Tên nhóm trò chuyện</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6 }]}>
                <MessageCircle size={18} color="#3b82f6" />
                <TextInput
                  placeholder="e.g. Săn mây Y Tý cuối tuần, Tour đảo..."
                  placeholderTextColor={theme.textMuted}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  style={[styles.formTextInput, { color: theme.textPrimary }]}
                />
              </View>

              {/* Group Tag Input */}
              <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 16 }]}>Mục tiêu / Chủ đề</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6 }]}>
                <Sparkles size={18} color="#f59e0b" />
                <TextInput
                  placeholder="e.g. Săn mây / Phượt / Đi chung xe..."
                  placeholderTextColor={theme.textMuted}
                  value={newGroupTag}
                  onChangeText={setNewGroupTag}
                  style={[styles.formTextInput, { color: theme.textPrimary }]}
                />
              </View>
            </View>

            {/* Footer */}
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Pressable style={styles.modalSubmitBtn} onPress={handleSubmitGroup}>
                <LinearGradient
                  colors={['#06b6d4', '#3b82f6']}
                  style={styles.modalSubmitGradient}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.modalSubmitText}>Khởi tạo nhóm</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: ACTIVE CHAT SCREEN */}
      {selectedGroup && (
        <Modal
          animationType="fade"
          transparent={false}
          visible={chatModalVisible}
          onRequestClose={() => setChatModalVisible(false)}
        >
          <View style={[styles.chatRoomContainer, { backgroundColor: theme.background }]}>
            <LinearGradient
              colors={isDarkMode ? ['#0f172a', '#020617'] : ['#f8fafc', '#e2e8f0']}
              style={{ flex: 1 }}
            >
              {/* Header */}
              <View style={[styles.chatHeader, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)', borderBottomColor: theme.border }]}>
                <Pressable style={[styles.backChatBtn, { backgroundColor: theme.searchBg }]} onPress={() => setChatModalVisible(false)}>
                  <X size={18} color={theme.textPrimary} />
                </Pressable>
                <View style={styles.chatHeaderAvatarWrapper}>
                  <Image source={getSafeImageSource(selectedGroup.image)} style={styles.chatHeaderAvatar} />
                  <View style={styles.statusActiveDot} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text numberOfLines={1} style={[styles.chatHeaderName, { color: theme.textPrimary }]}>{selectedGroup.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Text style={styles.chatHeaderMembers}>{selectedGroup.members} thành viên</Text>
                    <Text style={[styles.chatHeaderStatus, { color: '#10b981' }]}>• Đang hoạt động</Text>
                  </View>
                </View>
                <Pressable 
                  style={[styles.chatInfoBtn, { backgroundColor: theme.searchBg }]} 
                  onPress={() => Alert.alert('Thông tin nhóm', `${selectedGroup.name}\nChủ đề: ${selectedGroup.tag}\nThành viên: ${selectedGroup.members}\n\nNhóm cộng đồng Vivu360 là nơi kết nối các phượt thủ và du khách chia sẻ kinh nghiệm du lịch ảo và thực tế.`)}
                >
                  <Info size={16} color={theme.textSecondary} />
                </Pressable>
              </View>

              {/* Message Stream */}
              <ScrollView 
                ref={messageStreamRef} 
                style={styles.messageStream}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <View style={[styles.systemJoinMsg, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.05)', borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)' }]}>
                  <Text style={[styles.systemJoinText, { color: theme.textSecondary }]}>
                    Chào mừng bạn đến với nhóm chat! Nơi trao đổi kinh nghiệm phượt, homestay, ẩm thực du lịch tại Việt Nam. Hãy gửi lời chào nhé! 👋
                  </Text>
                </View>

                {/* Render Group messages */}
                {selectedGroup.messages && selectedGroup.messages.map((msg) => {
                  const isMe = msg.user === currentUser.name;
                  const msgTime = getFormattedMsgTime(msg.id);
                  return (
                    <View key={msg.id} style={[styles.msgWrapper, isMe ? styles.msgWrapperMe : null]}>
                      {isMe ? (
                        <View style={{ alignItems: 'flex-end' }}>
                          <LinearGradient
                            colors={['#06b6d4', '#3b82f6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.msgBubble, styles.msgBubbleMe]}
                          >
                            <Text style={styles.msgTextMe}>
                              {msg.text}
                            </Text>
                          </LinearGradient>
                          <View style={styles.msgMetaMe}>
                            <Text style={[styles.msgTimeTextMe, { color: theme.textMuted }]}>{msgTime}</Text>
                            <CheckCheck size={11} color="#06b6d4" />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.otherMsgRow}>
                          <Pressable onPress={() => { setChatModalVisible(false); handleOpenUserProfile(msg.user); }}>
                            <Image source={getSafeAvatarSource(getUserAvatarByName(msg.user))} style={styles.otherMsgAvatar} />
                          </Pressable>
                          
                          <View style={styles.otherMsgCol}>
                            <View style={styles.otherMsgHeader}>
                              <Pressable onPress={() => { setChatModalVisible(false); handleOpenUserProfile(msg.user); }}>
                                <Text style={[styles.msgUserNameText, { color: theme.textPrimary }]}>{msg.user}</Text>
                              </Pressable>
                              {(() => {
                                const rank = getUserRankColors(msg.user);
                                return (
                                  <LinearGradient
                                    colors={rank.colors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.msgUserRankBadge}
                                  >
                                    <Award size={8} color={rank.iconColor} />
                                    <Text style={[styles.msgUserRankText, { color: rank.textColor }]}>
                                      {getUserLevelByName(msg.user)}
                                    </Text>
                                  </LinearGradient>
                                );
                              })()}
                            </View>
                            
                            {(() => {
                              const rank = getUserRankColors(msg.user);
                              return (
                                <View style={[
                                  styles.msgBubble, 
                                  styles.msgBubbleOther, 
                                  { 
                                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#ffffff', 
                                    borderColor: theme.border,
                                    borderLeftWidth: 3.5,
                                    borderLeftColor: rank.colors[0]
                                  }
                                ]}>
                                  <Text style={[styles.msgTextContent, { color: theme.textPrimary }]}>
                                    {msg.text}
                                  </Text>
                                </View>
                              );
                            })()}
                            <Text style={[styles.msgTimeTextOther, { color: theme.textMuted }]}>{msgTime}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              {/* Quick replies suggestions bar */}
              <View style={[styles.quickSuggestionsWrapper, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', borderTopColor: theme.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScrollContent}>
                  {[
                    'Chào mọi người! 👋',
                    'Đẹp quá cả nhà ơi! 😍',
                    'Có ai ở đây không? 🙋‍♂️',
                    'Kinh nghiệm hữu ích quá! 👍',
                    'Đang có sự kiện gì hot không?',
                    'Đoàn mình đi mấy người thế?',
                    'Xin chào! 🇻🇳'
                  ].map((txt, index) => (
                    <Pressable
                      key={index}
                      style={({ pressed }) => [
                        styles.suggestionChip,
                        { backgroundColor: theme.searchBg, borderColor: theme.border },
                        pressed && { opacity: 0.7 }
                      ]}
                      onPress={() => setChatInput(txt)}
                    >
                      <Text style={[styles.suggestionChipText, { color: theme.textSecondary }]}>{txt}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Input message container */}
              <View style={[styles.chatInputWrapper, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', borderTopColor: theme.border }]}>
                <View style={styles.chatInputInnerRow}>
                  <Pressable 
                    style={[styles.chatInputAttachBtn, { backgroundColor: theme.searchBg }]} 
                    onPress={() => Alert.alert('Đính kèm tệp', 'Tính năng đính kèm tệp và vị trí GPS đang được phát triển.')}
                  >
                    <Paperclip size={16} color={theme.textSecondary} />
                  </Pressable>
                  <Pressable 
                    style={[styles.chatInputAttachBtn, { backgroundColor: theme.searchBg, marginRight: 4 }]} 
                    onPress={() => Alert.alert('Chụp ảnh', 'Tính năng chia sẻ ảnh chụp trực tiếp cần quyền truy cập máy ảnh.')}
                  >
                    <Camera size={16} color={theme.textSecondary} />
                  </Pressable>
                  
                  <View style={{ flex: 1, position: 'relative' }}>
                    <TextInput
                      placeholder="Nhập tin nhắn trò chuyện..."
                      placeholderTextColor={theme.textMuted}
                      value={chatInput}
                      onChangeText={setChatInput}
                      style={[styles.chatInputField, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
                    />
                    <Pressable style={styles.emojiFieldBtn}>
                      <Smile size={16} color={theme.textMuted} />
                    </Pressable>
                  </View>
                  
                  <Pressable style={styles.sendMsgBtn} onPress={handleSendChatMessage}>
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
            </LinearGradient>
          </View>
        </Modal>
      )}

      {/* USER PROFILE MODAL */}
      <UserProfileModal
        username={targetUsername}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        isDarkMode={isDarkMode}
        theme={theme}
        currentUser={currentUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flex: 1, width: '100%' },

  // Header styles
  socialHeader: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 44 },
  socialTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  socialSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 4, lineHeight: 16 },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // GROUPS SCREEN STYLES
  groupsSection: { paddingHorizontal: 16, marginTop: 20 },
  createGroupBtnCard: {
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
  },
  createGroupBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  createGroupBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '800' },

  // Group Card
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1.5,
  },
  groupCoverImage: { width: 68, height: 68, borderRadius: 14 },
  groupCardInfo: { flex: 1 },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  groupCardName: { fontSize: 14.5, fontWeight: '800', flex: 1, letterSpacing: -0.2 },
  groupMembersCount: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  groupMembersText: { fontSize: 9.5, fontWeight: '800' },
  groupCardTag: { fontSize: 10, color: '#3b82f6', fontWeight: '800', marginTop: 3 },
  groupCardLastMsg: { fontSize: 11.5, fontWeight: '500', marginTop: 6, opacity: 0.8 },

  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    width: '100%',
    height: height * 0.7,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 24,
  },
  modalHeader: {
    height: 58,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  modalHeaderTitle: { fontSize: 16, fontWeight: '900' },
  closeModalBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  inputLabel: { fontSize: 12, fontWeight: '800' },
  formInputGroup: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formTextInput: { flex: 1, fontSize: 13, fontWeight: '600', marginLeft: 10 },

  modalFooter: { borderTopWidth: 1, padding: 16 },
  modalSubmitBtn: { height: 46, borderRadius: 12, overflow: 'hidden' },
  modalSubmitGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalSubmitText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Group Card tag badges
  groupTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  groupTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  groupTagBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Chat room screen
  chatRoomContainer: { flex: 1 },
  chatHeader: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  backChatBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  chatHeaderAvatarWrapper: {
    position: 'relative',
    marginLeft: 10,
  },
  chatHeaderAvatar: { width: 38, height: 38, borderRadius: 12 },
  statusActiveDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  chatHeaderName: { fontSize: 14.5, fontWeight: '900', letterSpacing: -0.2 },
  chatHeaderMembers: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  chatHeaderStatus: { fontSize: 10, fontWeight: '800' },
  chatInfoBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },

  messageStream: { flex: 1, padding: 16 },
  systemJoinMsg: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.8,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  systemJoinText: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 16 },

  msgWrapper: { marginBottom: 14, maxWidth: '82%' },
  msgWrapperMe: { alignSelf: 'flex-end' },
  
  // Me bubble details
  msgBubbleMe: { 
    borderRadius: 18, 
    borderBottomRightRadius: 3, 
    paddingHorizontal: 14,
    paddingVertical: 10, 
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  msgTextMe: { color: '#fff', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  msgMetaMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginRight: 4,
    alignSelf: 'flex-end',
  },
  msgTimeTextMe: { fontSize: 9.5, fontWeight: '600' },

  // Other bubble details
  otherMsgRow: {
    flexDirection: 'row',
    gap: 10,
  },
  otherMsgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  otherMsgCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  otherMsgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  msgUserNameText: { fontSize: 11, fontWeight: '800', letterSpacing: -0.1 },
  
  msgUserRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  msgUserRankText: {
    fontSize: 8,
    fontWeight: '800',
  },

  msgBubble: { 
    borderRadius: 18, 
    paddingHorizontal: 14,
    paddingVertical: 10, 
    borderWidth: 0.8,
  },
  msgBubbleOther: { 
    borderBottomLeftRadius: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  msgTextContent: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  msgTimeTextOther: { fontSize: 9.5, fontWeight: '600', marginTop: 4, marginLeft: 4 },

  // Quick suggestions suggestions chips
  quickSuggestionsWrapper: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  suggestionsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 0.8,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Input area styling
  chatInputWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
  },
  chatInputInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInputAttachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
  emojiFieldBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
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
  sendMsgGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});




