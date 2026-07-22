// Vivu360 Group Chat Tab - Pure Obsidian Messenger Dark Mode
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Send,
  Smile,
  CheckCheck,
  Mic,
  Plus,
  MapPin,
  Compass,
  Navigation,
  ThumbsUp,
  Camera,
  Image as ImageIcon,
  Heart,
  X,
  MessageSquare,
  CornerUpLeft,
} from 'lucide-react-native';
import { sendTypingStatus, getTypingStatus } from '../services/chatService';

const { width } = Dimensions.get('window');

// ─── Shared Location Parser ───────────────────────────────────────────────────

const parseSharedLocation = (text) => {
  if (!text || typeof text !== 'string') return null;
  const isLocationShare = text.includes('CHIA SẺ ĐỊA ĐIỂM') || text.includes('📍') || text.includes('🚩');
  if (!isLocationShare) return null;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let placeName = '';
  let location = '';
  let description = '';

  for (const line of lines) {
    if (line.startsWith('🚩')) {
      placeName = line.replace('🚩', '').trim();
    } else if (line.startsWith('📌')) {
      location = line.replace('📌', '').trim();
    } else if (line.startsWith('📝')) {
      description = line.replace('📝', '').trim();
    }
  }

  if (!placeName) {
    const lower = text.toLowerCase();
    if (lower.includes('tràng an')) placeName = 'Tràng An';
    else if (lower.includes('bái đính')) placeName = 'Chùa Bái Đính';
    else if (lower.includes('hang múa')) placeName = 'Hang Múa';
    else if (lower.includes('ninh bình')) placeName = 'Ninh Bình';
    else if (lower.includes('hạ long')) placeName = 'Hạ Long';
    else if (lower.includes('phú quốc')) placeName = 'Phú Quốc';
    else if (lower.includes('sa pa') || lower.includes('sapa')) placeName = 'Sa Pa';
    else if (lower.includes('hà nội')) placeName = 'Hà Nội';
    else if (lower.includes('nghệ an')) placeName = 'Nghệ An';
  }

  if (!placeName) return null;

  return {
    placeName,
    location: location || placeName,
    description: description || 'Được chia sẻ từ Vivu360',
  };
};

// ─── Quick replies ────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  '👋 Xin chào nhóm!',
  '📍 Điểm tập trung?',
  '⏰ Mấy giờ xuất phát?',
  '✅ Mình đồng ý',
  '🏨 Ai đặt phòng chưa?',
  '💰 Thanh toán ra sao?',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserAvatarByName = (name) => {
  const safeName = String(name || '');
  if (!safeName) return 'https://i.pravatar.cc/150?img=11';
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `https://i.pravatar.cc/150?img=${Math.abs(hash % 70) + 1}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GroupChatTab({
  selectedGroup,
  chatMessages = [],
  messageText = '',
  setMessageText,
  onSendMessage,
  currentUser,
  ownerId,
  theme,
  isDarkMode,
  onNavigateToMapWithPlace,
}) {
  const scrollViewRef = useRef(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);
  const [reactionsMap, setReactionsMap] = useState({});
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  // Real-time MongoDB typing status & continuous fallback loop
  useEffect(() => {
    if (!selectedGroup?.id) return;
    let isMounted = true;

    const checkRealtimeTyping = async () => {
      const gId = selectedGroup._id || selectedGroup.id;
      const res = await getTypingStatus(gId, ownerId);
      if (!isMounted) return;

      if (res?.isTyping && res?.user) {
        setTypingUser({
          name: res.user.userName,
          avatar: res.user.avatar || getUserAvatarByName(res.user.userName),
        });
      } else {
        setTypingUser(null);
      }
    };

    const interval = setInterval(checkRealtimeTyping, 1800);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedGroup?.id, ownerId]);

  const handleTextChange = (text) => {
    setMessageText(text);
    if (selectedGroup?.id && ownerId) {
      const gId = selectedGroup._id || selectedGroup.id;
      sendTypingStatus(gId, ownerId, currentUser?.name || 'Thành viên', currentUser?.avatar || '', text.trim().length > 0);
    }
  };

  const FAMOUS_SPOTS = [
    { name: 'Tràng An', location: 'Ninh Bình, Việt Nam', desc: 'Quần thể danh thắng di sản thiên nhiên thế giới' },
    { name: 'Chùa Bái Đính', location: 'Ninh Bình, Việt Nam', desc: 'Ngôi chùa lớn nhất Việt Nam sở hữu nhiều kỷ lục' },
    { name: 'Hang Múa', location: 'Ninh Bình, Việt Nam', desc: 'Tuyệt tác ngắm toàn cảnh Tam Cốc từ trên đỉnh núi' },
    { name: 'Vịnh Hạ Long', location: 'Quảng Ninh, Việt Nam', desc: 'Kỳ quan thiên nhiên thế giới với hàng ngàn hòn đảo' },
    { name: 'Phú Quốc', location: 'Kiên Giang, Việt Nam', desc: 'Đảo ngọc với bãi biển cát trắng mịn tuyệt đẹp' },
    { name: 'Sa Pa', location: 'Lào Cai, Việt Nam', desc: 'Thành phố trong sương với đỉnh Fansipan hùng vĩ' },
    { name: 'Đà Lạt', location: 'Lâm Đồng, Việt Nam', desc: 'Thành phố ngàn hoa khí hậu ôn hòa quanh năm' },
    { name: 'Hội An', location: 'Quảng Nam, Việt Nam', desc: 'Phố cổ đèn lồng thơ mộng bên dòng sông Hoài' },
  ];

  const handleQuickReply = (text) => {
    setMessageText(text);
    setShowQuickReplies(false);
  };

  const handleSendQuickText = (text) => {
    if (onSendMessage) {
      setMessageText(text);
      setTimeout(() => onSendMessage(), 60);
    }
  };

  const handleSendLocationSpot = (spot) => {
    setShowLocationModal(false);
    const text = `📢 CHIA SẺ ĐỊA ĐIỂM DU LỊCH 360°\n🚩 ${spot.name}\n📌 ${spot.location}\n📝 ${spot.desc}`;
    if (onSendMessage) {
      setMessageText(text);
      setTimeout(() => onSendMessage(), 60);
    }
  };

  const handleToggleReaction = (msgId, emoji) => {
    setReactionsMap((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? null : emoji,
    }));
    setActiveReactionMsgId(null);
  };

  const handleSendThumbsUp = () => {
    if (onSendMessage) {
      setMessageText('👍');
      setTimeout(() => onSendMessage(), 60);
    }
  };

  const membersLabel = (() => {
    const list = selectedGroup?.membersList || [];
    if (!list.length) return '';
    const names = list.slice(0, 3).map((m) => (m.name || '').split(' ').pop());
    const extra = list.length - names.length;
    return names.join(', ') + (extra > 0 ? ` +${extra}` : '');
  })();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      {/* Dark purple BG — fills entire tab */}
      <View style={styles.root}>

        {/* Sleek Floating Glassmorphic Members Capsule */}
        {membersLabel &&
        !selectedGroup?.isDirect &&
        selectedGroup?.type !== 'direct' &&
        !selectedGroup?.isPrivate &&
        (selectedGroup?.membersList?.length || 0) > 2 ? (
          <View style={styles.memberBarContainer}>
            <View style={styles.memberPill}>
              <View style={styles.avatarStack}>
                {(selectedGroup?.membersList || []).slice(0, 3).map((m, idx) => (
                  <Image
                    key={`m-stack-${idx}`}
                    source={{ uri: m.avatar || getUserAvatarByName(m.name) }}
                    style={[styles.stackAvatar, { marginLeft: idx > 0 ? -7 : 0 }]}
                  />
                ))}
              </View>
              <View style={styles.memberDot} />
              <Text style={styles.memberBarText} numberOfLines={1}>
                {membersLabel} · {selectedGroup?.membersList?.length || 4} thành viên
              </Text>
            </View>
          </View>
        ) : null}

        {/* ── Messages ─────────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.streamContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          {/* Day separator */}
          <View style={styles.dayRow}>
            <View style={styles.dayLine} />
            <View style={styles.dayPill}>
              <Text style={styles.dayText}>Hôm nay</Text>
            </View>
            <View style={styles.dayLine} />
          </View>

          {chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => {
              const isMe =
                String(msg.senderId) === String(ownerId) ||
                msg.senderId === currentUser?.id ||
                msg.sender === currentUser?.username ||
                String(msg.senderId) === String(currentUser?.uid);

              const prevMsg = index > 0 ? chatMessages[index - 1] : null;
              const prevIsMe = prevMsg ? (
                String(prevMsg.senderId) === String(ownerId) ||
                prevMsg.senderId === currentUser?.id ||
                prevMsg.sender === currentUser?.username ||
                String(prevMsg.senderId) === String(currentUser?.uid)
              ) : false;

              const isSameSenderAsPrev = !!(prevMsg && !isMe && !prevIsMe && (
                (prevMsg.senderId && msg.senderId && String(prevMsg.senderId) === String(msg.senderId)) ||
                (prevMsg.senderName && msg.senderName && prevMsg.senderName === msg.senderName) ||
                (prevMsg.sender && msg.sender && prevMsg.sender === msg.sender)
              ));

              const senderName = msg.senderName || msg.sender || 'Thành viên';
              const avatarUri = msg.senderAvatar || getUserAvatarByName(senderName);
              const sharedLoc = parseSharedLocation(msg.text);

              const ownerIdOfGroup = selectedGroup?.ownerId || selectedGroup?.creatorId;
              const isGroupOwner = String(msg.senderId) === String(ownerIdOfGroup);
              const isGroupDeputy = Array.isArray(selectedGroup?.deputyIds) && selectedGroup.deputyIds.includes(String(msg.senderId));
              const isSystemMessage = msg.isSystem || msg.type === 'system' || msg.text?.startsWith('📢') || msg.text?.includes('đã gia nhập') || msg.text?.includes('đã tạo nhóm');

              if (isSystemMessage) {
                return (
                  <View key={`sys-${msg.id || index}`} style={styles.systemRow}>
                    <View style={styles.systemPill}>
                      <Text style={styles.systemText}>{msg.text}</Text>
                    </View>
                  </View>
                );
              }

              if (sharedLoc) {
                return (
                  <View key={`msg-${msg.id || index}`} style={[isMe ? styles.myRow : styles.otherRow, isSameSenderAsPrev && { marginTop: 2 }]}>
                    {!isMe && (
                      isSameSenderAsPrev ? <View style={{ width: 32 }} /> : <Image source={{ uri: avatarUri }} style={styles.otherAvatar} />
                    )}
                    <View style={isMe ? styles.myCol : styles.otherCol}>
                      {!isMe && !isSameSenderAsPrev && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <Text style={styles.otherName}>{senderName}</Text>
                          {isGroupOwner ? (
                            <View style={styles.ownerBadge}>
                              <Text style={styles.ownerBadgeText}>👑 Trưởng nhóm</Text>
                            </View>
                          ) : isGroupDeputy ? (
                            <View style={styles.deputyBadge}>
                              <Text style={styles.deputyBadgeText}>🥈 Phó nhóm</Text>
                            </View>
                          ) : null}
                        </View>
                      )}
                      <Pressable
                        style={styles.locationCardContainer}
                        onPress={() => onNavigateToMapWithPlace && onNavigateToMapWithPlace(sharedLoc.placeName)}
                      >
                        <LinearGradient
                          colors={['#0f172a', '#1e293b', '#0f172a']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.locationCardGradient}
                        >
                          <View style={styles.locationCardHeader}>
                            <MapPin size={14} color="#34d399" />
                            <Text style={styles.locationCardTag}>CHIA SẺ ĐỊA ĐIỂM DU LỊCH 360°</Text>
                          </View>
                          <Text style={styles.locationCardTitle}>{sharedLoc.placeName}</Text>
                          {!!sharedLoc.location && (
                            <Text style={styles.locationCardSub}>📍 Vị trí: {sharedLoc.location}</Text>
                          )}
                          {!!sharedLoc.description && (
                            <Text style={styles.locationCardDesc} numberOfLines={2}>{sharedLoc.description}</Text>
                          )}
                          <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.locationCardBtn}
                          >
                            <Compass size={14} color="#fff" />
                            <Text style={styles.locationCardBtnText}>Khám phá trên bản đồ ➔</Text>
                          </LinearGradient>
                        </LinearGradient>
                      </Pressable>
                      <View style={isMe ? styles.myMeta : null}>
                        <Text style={styles.metaTime}>{msg.time || ''}</Text>
                        {isMe && <CheckCheck size={10} color="rgba(168,85,247,0.8)" />}
                      </View>
                    </View>
                  </View>
                );
              }

              const msgKey = msg.id || index;
              const hasReaction = reactionsMap[msgKey];
              const isShowingReactions = activeReactionMsgId === msgKey;

              if (isMe) {
                return (
                  <View key={`msg-${msgKey}`} style={styles.myRow}>
                    <View style={styles.myCol}>
                      {isShowingReactions && (
                        <View style={[styles.reactionPickerBar, { right: 0 }]}>
                          {['❤️', '😆', '😮', '😢', '😡', '👍'].map((emoji) => (
                            <Pressable
                              key={emoji}
                              style={styles.reactionEmojiBtn}
                              onPress={() => handleToggleReaction(msgKey, emoji)}
                            >
                              <Text style={{ fontSize: 19 }}>{emoji}</Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                      <Pressable
                        onLongPress={() => setActiveReactionMsgId(isShowingReactions ? null : msgKey)}
                        onPress={() => setActiveReactionMsgId(isShowingReactions ? null : msgKey)}
                      >
                        <LinearGradient
                          colors={['#0084ff', '#0099ff']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.bubbleMe}
                        >
                          <Text style={styles.bubbleTextMe}>{msg.text}</Text>
                        </LinearGradient>
                      </Pressable>
                      {hasReaction && (
                        <View style={[styles.msgReactionBadge, { right: 6 }]}>
                          <Text style={{ fontSize: 11 }}>{hasReaction}</Text>
                        </View>
                      )}
                      <View style={styles.myMeta}>
                        <Pressable onPress={() => setReplyToMsg(msg)} style={{ marginRight: 4 }}>
                          <CornerUpLeft size={10} color="rgba(255,255,255,0.4)" />
                        </Pressable>
                        <Text style={styles.metaTime}>{msg.time || ''}</Text>
                        <CheckCheck size={10} color="#0084ff" />
                      </View>
                    </View>
                  </View>
                );
              }

              return (
                <View key={`msg-${msgKey}`} style={[styles.otherRow, isSameSenderAsPrev && { marginTop: -6 }]}>
                  {/* Avatar */}
                  {isSameSenderAsPrev ? (
                    <View style={{ width: 32 }} />
                  ) : (
                    <Image source={{ uri: avatarUri }} style={styles.otherAvatar} />
                  )}

                  <View style={styles.otherCol}>
                    {!isSameSenderAsPrev && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Text style={styles.otherName}>{senderName}</Text>
                        {isGroupOwner ? (
                          <View style={styles.ownerBadge}>
                            <Text style={styles.ownerBadgeText}>👑 Trưởng nhóm</Text>
                          </View>
                        ) : isGroupDeputy ? (
                          <View style={styles.deputyBadge}>
                            <Text style={styles.deputyBadgeText}>🥈 Phó nhóm</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                    {isShowingReactions && (
                      <View style={[styles.reactionPickerBar, { left: 0 }]}>
                        {['❤️', '😆', '😮', '😢', '😡', '👍'].map((emoji) => (
                          <Pressable
                            key={emoji}
                            style={styles.reactionEmojiBtn}
                            onPress={() => handleToggleReaction(msgKey, emoji)}
                          >
                            <Text style={{ fontSize: 19 }}>{emoji}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    <Pressable
                      onLongPress={() => setActiveReactionMsgId(isShowingReactions ? null : msgKey)}
                      onPress={() => setActiveReactionMsgId(isShowingReactions ? null : msgKey)}
                    >
                      <View style={[styles.bubbleOther, isSameSenderAsPrev && { borderTopLeftRadius: 18 }]}>
                        <Text style={styles.bubbleTextOther}>{msg.text}</Text>
                      </View>
                    </Pressable>
                    {hasReaction && (
                      <View style={[styles.msgReactionBadge, { left: 6 }]}>
                        <Text style={{ fontSize: 11 }}>{hasReaction}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.metaTime}>{msg.time || ''}</Text>
                      <Pressable onPress={() => setReplyToMsg(msg)}>
                        <CornerUpLeft size={10} color="#b0b3b8" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>Chưa có tin nhắn nào</Text>
              <Text style={styles.emptyHint}>Hãy bắt đầu trò chuyện cùng nhóm!</Text>
            </View>
          )}

          {/* Typing Indicator Bubble */}
          {typingUser && (
            <View style={styles.typingRowContainer}>
              <Image source={{ uri: typingUser.avatar }} style={styles.typingAvatar} />
              <View style={styles.typingBubbleCard}>
                <Text style={styles.typingTextStr}>{typingUser.name} đang soạn tin nhắn...</Text>
                <View style={styles.dotsWaveRow}>
                  <View style={[styles.waveDot, { backgroundColor: '#0084ff' }]} />
                  <View style={[styles.waveDot, { backgroundColor: '#a855f7' }]} />
                  <View style={[styles.waveDot, { backgroundColor: '#ec4899' }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Messenger Meta Action Sheet (Consolidated under Plus +) ────── */}
        {showQuickReplies && (
          <View style={styles.metaSheetContainer}>
            <View style={styles.metaGrid}>
              <Pressable
                style={styles.metaGridItem}
                onPress={() => {
                  setShowQuickReplies(false);
                  handleSendQuickText('👋 Xin chào mọi người!');
                }}
              >
                <View style={[styles.metaIconBg, { backgroundColor: '#3b82f6' }]}>
                  <Text style={{ fontSize: 14 }}>👋</Text>
                </View>
                <Text style={styles.metaLabel}>Xin chào</Text>
              </Pressable>

              <Pressable
                style={styles.metaGridItem}
                onPress={() => {
                  setShowQuickReplies(false);
                  setShowLocationModal(true);
                }}
              >
                <View style={[styles.metaIconBg, { backgroundColor: '#10b981' }]}>
                  <MapPin size={16} color="#fff" />
                </View>
                <Text style={styles.metaLabel}>Vị trí 360°</Text>
              </Pressable>

              <Pressable
                style={styles.metaGridItem}
                onPress={() => {
                  setShowQuickReplies(false);
                  Alert.alert('Máy ảnh', 'Bật máy ảnh chụp hình nhanh');
                }}
              >
                <View style={[styles.metaIconBg, { backgroundColor: '#0084ff' }]}>
                  <Camera size={16} color="#fff" />
                </View>
                <Text style={styles.metaLabel}>Máy ảnh</Text>
              </Pressable>

              <Pressable
                style={styles.metaGridItem}
                onPress={() => {
                  setShowQuickReplies(false);
                  Alert.alert('Thư viện', 'Mở thư viện ảnh chuyến đi');
                }}
              >
                <View style={[styles.metaIconBg, { backgroundColor: '#a855f7' }]}>
                  <ImageIcon size={16} color="#fff" />
                </View>
                <Text style={styles.metaLabel}>Thư viện ảnh</Text>
              </Pressable>

              <Pressable
                style={styles.metaGridItem}
                onPress={() => {
                  setShowQuickReplies(false);
                  Alert.alert('Ghi âm', 'Bật ghi âm tin nhắn thoại');
                }}
              >
                <View style={[styles.metaIconBg, { backgroundColor: '#f59e0b' }]}>
                  <Mic size={16} color="#fff" />
                </View>
                <Text style={styles.metaLabel}>Ghi âm thoại</Text>
              </Pressable>

              <Pressable
                style={styles.metaGridItem}
                onPress={() => {
                  setShowQuickReplies(false);
                  handleSendQuickText('⏰ Mấy giờ cả nhóm xuất phát nhỉ?');
                }}
              >
                <View style={[styles.metaIconBg, { backgroundColor: '#ec4899' }]}>
                  <Text style={{ fontSize: 14 }}>⏰</Text>
                </View>
                <Text style={styles.metaLabel}>Hẹn giờ</Text>
              </Pressable>
            </View>

            {/* Quick Text Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10, gap: 6, marginTop: 6 }}
            >
              {QUICK_REPLIES.map((qr) => (
                <Pressable key={qr} style={styles.quickChip} onPress={() => handleQuickReply(qr)}>
                  <Text style={styles.quickText}>{qr}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quoted Reply Banner */}
        {replyToMsg && (
          <View style={styles.replyBannerContainer}>
            <View style={styles.replyBarIndicator} />
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.replyBannerTitle}>Đang trả lời {replyToMsg.senderName || 'thành viên'}</Text>
              <Text style={styles.replyBannerText} numberOfLines={1}>{replyToMsg.text}</Text>
            </View>
            <Pressable onPress={() => setReplyToMsg(null)} style={styles.closeReplyBtn}>
              <X size={16} color="#b0b3b8" />
            </Pressable>
          </View>
        )}

        {/* ── Input Bar ─────────────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          {/* Plus / quick replies toggle */}
          <Pressable
            style={styles.inputSideBtn}
            onPress={() => setShowQuickReplies((v) => !v)}
          >
            <LinearGradient
              colors={
                showQuickReplies
                  ? ['#0084ff', '#0099ff']
                  : ['#242526', '#242526']
              }
              style={styles.inputSideGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={18} color={showQuickReplies ? '#fff' : '#0084ff'} />
            </LinearGradient>
          </Pressable>

          {/* Text field */}
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Tin nhắn..."
              placeholderTextColor="#b0b3b8"
              value={messageText}
              onChangeText={handleTextChange}
              style={styles.inputText}
              multiline
              maxLength={1000}
            />
            <Pressable
              style={styles.smileBtn}
              onPress={() => Alert.alert('Emoji', 'Tính năng chọn emoji sắp ra mắt')}
            >
              <Smile size={17} color="#0084ff" />
            </Pressable>
          </View>

          {/* Send / ThumbsUp Like */}
          {messageText.trim().length > 0 ? (
            <Pressable
              style={styles.sendBtn}
              onPress={() => {
                if (selectedGroup?.id && ownerId) {
                  const gId = selectedGroup._id || selectedGroup.id;
                  sendTypingStatus(gId, ownerId, currentUser?.name || '', currentUser?.avatar || '', false);
                }
                onSendMessage();
              }}
            >
              <LinearGradient
                colors={['#0084ff', '#0099ff']}
                style={styles.sendGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Send size={15} color="#fff" />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable style={styles.sendBtn} onPress={handleSendThumbsUp}>
              <View style={styles.thumbsUpBtnInner}>
                <ThumbsUp size={20} color="#0084ff" />
              </View>
            </Pressable>
          )}
        </View>

        {/* Location Picker Modal */}
        <Modal animationType="slide" transparent visible={showLocationModal} onRequestClose={() => setShowLocationModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.locationModalCard}>
              <View style={styles.locationModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={18} color="#10b981" />
                  <Text style={styles.locationModalTitle}>Chia sẻ địa điểm du lịch 360°</Text>
                </View>
                <Pressable onPress={() => setShowLocationModal(false)} style={{ padding: 4 }}>
                  <X size={18} color="#e4e6eb" />
                </Pressable>
              </View>
              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {FAMOUS_SPOTS.map((spot) => (
                  <Pressable
                    key={spot.name}
                    style={styles.spotItemRow}
                    onPress={() => handleSendLocationSpot(spot)}
                  >
                    <View style={styles.spotIconBg}>
                      <Compass size={18} color="#0084ff" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.spotNameText}>{spot.name}</Text>
                      <Text style={styles.spotLocText}>{spot.location}</Text>
                    </View>
                    <View style={styles.spotSendBadge}>
                      <Text style={styles.spotSendText}>Gửi ➔</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Member bar
  memberBarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 27, 51, 0.85)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 8,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#110829',
  },
  memberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  memberBarText: {
    fontSize: 11,
    color: '#c4b5fd',
    fontWeight: '700',
  },

  // Stream
  streamContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 12,
  },

  // Day separator
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(196, 181, 253, 0.1)',
  },
  dayPill: {
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.22)',
  },
  dayText: {
    fontSize: 10,
    color: '#c4b5fd',
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // My messages
  myRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  myCol: {
    maxWidth: width * 0.72,
    alignItems: 'flex-end',
  },
  bubbleMe: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: '#0084ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleTextMe: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  myMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    paddingRight: 2,
  },

  // Other messages
  otherRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    gap: 8,
  },
  otherAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 14,
  },
  otherCol: {
    maxWidth: width * 0.7,
  },
  otherName: {
    fontSize: 11,
    color: '#b0b3b8',
    fontWeight: '600',
    marginBottom: 3,
    marginLeft: 2,
  },
  bubbleOther: {
    backgroundColor: '#242526',
    borderWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleTextOther: {
    color: '#e4e6eb',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },

  // Meta time
  metaTime: {
    fontSize: 9.5,
    color: '#b0b3b8',
    fontWeight: '500',
    marginTop: 3,
    marginLeft: 2,
  },

  // Empty state
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 132, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptySub: {
    fontSize: 12,
    color: '#b0b3b8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 24,
  },

  // Messenger Meta Action Sheet (Compact)
  metaSheetContainer: {
    backgroundColor: '#18191a',
    borderTopWidth: 1,
    borderTopColor: '#242526',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 4,
  },
  metaGridItem: {
    width: (width - 32) / 3,
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#e4e6eb',
  },

  // Quick Action Icon Row (Floating Icons matching screenshot)
  quickIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#18191a',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  quickIconButton: {
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick replies
  quickRow: {
    paddingVertical: 10,
    backgroundColor: '#18191a',
    borderTopWidth: 1,
    borderTopColor: '#242526',
  },
  quickChip: {
    backgroundColor: '#242526',
    borderWidth: 1,
    borderColor: '#3a3b3c',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickText: {
    fontSize: 12.5,
    color: '#e4e6eb',
    fontWeight: '600',
  },

  // Location Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  locationModalCard: {
    backgroundColor: '#18191a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#242526',
  },
  locationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  spotItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242526',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3a3b3c',
  },
  spotIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 132, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  spotLocText: {
    fontSize: 11.5,
    color: '#b0b3b8',
    marginTop: 2,
  },
  spotSendBadge: {
    backgroundColor: '#0084ff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  spotSendText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#242526',
    gap: 8,
  },
  inputSideBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  inputSideGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    flex: 1,
    minHeight: 38,
    maxHeight: 110,
    backgroundColor: '#242526',
    borderRadius: 20,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#e4e6eb',
    fontWeight: '400',
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    maxHeight: 90,
  },
  smileBtn: {
    padding: 6,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sendGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbsUpBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242526',
    borderRadius: 21,
  },

  // Reply Quoted Banner
  replyBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18191a',
    borderTopWidth: 1,
    borderTopColor: '#242526',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  replyBarIndicator: {
    width: 3,
    height: '100%',
    backgroundColor: '#0084ff',
    borderRadius: 2,
  },
  replyBannerTitle: {
    fontSize: 11,
    color: '#0084ff',
    fontWeight: '700',
  },
  replyBannerText: {
    fontSize: 12,
    color: '#b0b3b8',
    marginTop: 1,
  },
  closeReplyBtn: {
    padding: 6,
  },

  // Reaction Popup Bar
  reactionPickerBar: {
    flexDirection: 'row',
    backgroundColor: '#242526',
    borderColor: '#3a3b3c',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    position: 'absolute',
    top: -36,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reactionEmojiBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  msgReactionBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#242526',
    borderWidth: 1,
    borderColor: '#3a3b3c',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
  },

  // Location Card
  locationCardContainer: {
    marginVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  locationCardGradient: {
    padding: 14,
    gap: 6,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationCardTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.8,
  },
  locationCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  locationCardSub: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94a3b8',
  },
  locationCardDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#cbd5e1',
    lineHeight: 16,
    marginTop: 2,
  },
  locationCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 9,
    marginTop: 8,
  },
  locationCardBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
  },
  ownerBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontWeight: '850',
    color: '#fde047',
  },
  deputyBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  deputyBadgeText: {
    fontSize: 9,
    fontWeight: '850',
    color: '#cbd5e1',
  },
  systemRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemPill: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  systemText: {
    fontSize: 11,
    color: '#c4b5fd',
    fontWeight: '600',
  },
  typingRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    gap: 8,
  },
  typingAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  typingBubbleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242526',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
  },
  typingTextStr: {
    fontSize: 11.5,
    color: '#38bdf8',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  dotsWaveRow: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  waveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
