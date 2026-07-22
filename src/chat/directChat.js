import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Phone,
  Video,
  Send,
  Mic,
  Plus,
  Smile,
  Camera,
  CheckCheck,
  Check,
  MapPin,
  Compass,
} from 'lucide-react-native';
import { getChatMessages, sendChatMessage, markMessagesAsRead } from '../services/chatService';

const { width, height } = Dimensions.get('window');

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

// ─── Helpers ────────────────────────────────────────────────────────────────

const getUserAvatarByName = (name) => {
  const safeName = String(name || '');
  if (!safeName) return 'https://i.pravatar.cc/150?img=11';
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `https://i.pravatar.cc/150?img=${Math.abs(hash % 70) + 1}`;
};

const formatMsgTime = (val) => {
  if (!val || val < 10000000000) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  try {
    const d = new Date(val);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
};

const formatDayLabel = (val) => {
  if (!val) return '';
  const d = new Date(val > 10000000000 ? val : Date.now());
  const today = new Date();
  if (isSameDay(d, today)) return 'Hôm nay';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, yesterday)) return 'Hôm qua';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// ─── Quick Replies ───────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  '👋 Xin chào!',
  '😊 Cảm ơn bạn!',
  '✅ Đồng ý rồi',
  '📍 Gặp nhau ở đâu?',
  '⏰ Mấy giờ đi?',
];

// ─── Component ───────────────────────────────────────────────────────────────

export function DirectChatScreen({
  groupId,
  chatName,
  chatAvatar,
  ownerId,
  currentUser,
  isDarkMode,
  theme,
  visible,
  onClose,
  onNavigateToMapWithPlace,
}) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ─── Load messages ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!visible || !groupId || !ownerId) return;
    let active = true;

    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();

    const load = async () => {
      try {
        const data = await getChatMessages(groupId, ownerId);
        if (active) {
          setMessages(data || []);
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
        }
      } catch (e) {
        console.warn('Lỗi tải tin nhắn:', e.message);
      }
      markMessagesAsRead(groupId, ownerId).catch(() => {});
    };

    load();
    const interval = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(interval);
      fadeAnim.setValue(0);
    };
  }, [visible, groupId, ownerId]);

  // ─── Send ──────────────────────────────────────────────────────────────────

  const handleSend = async (text) => {
    const content = (text || chatInput).trim();
    if (!content || isSending) return;
    setIsSending(true);
    setChatInput('');
    setShowQuickReplies(false);
    try {
      await sendChatMessage(groupId, ownerId, content);
      const data = await getChatMessages(groupId, ownerId);
      setMessages(data || []);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    } catch (e) {
      Alert.alert('Gửi thất bại', e.message);
    } finally {
      setIsSending(false);
    }
  };

  // ─── Derived ───────────────────────────────────────────────────────────────

  const lastMyMsgId = [...messages].reverse().find(
    (m) => String(m.senderId) === String(ownerId)
  )?._id || null;

  const avatarUri = chatAvatar || getUserAvatarByName(chatName || '');
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Group messages by day for day separators
  const renderedMessages = [];
  safeMessages.forEach((msg, idx) => {
    const prevMsg = safeMessages[idx - 1];
    const ts = msg.createdAt || msg.id;
    const prevTs = prevMsg?.createdAt || prevMsg?.id;
    if (!prevMsg || !isSameDay(ts > 10000000000 ? ts : Date.now(), prevTs > 10000000000 ? prevTs : Date.now())) {
      renderedMessages.push({ type: 'day', id: `day-${idx}`, label: formatDayLabel(ts) });
    }
    renderedMessages.push({ type: 'msg', ...msg });
  });

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="#1a0533" />
      <View style={styles.root}>
        {/* Dark gradient BG */}
        <LinearGradient
          colors={['#1a0533', '#110829', '#0d0618']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
        />

        {/* Decorative blobs */}
        <View style={[styles.blob, styles.blobTop]} />
        <View style={[styles.blob, styles.blobMid]} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            {/* Back */}
            <Pressable style={styles.headerBtn} onPress={onClose} hitSlop={8}>
              <ChevronLeft size={22} color="#fff" strokeWidth={2.5} />
            </Pressable>

            {/* Avatar + name */}
            <Pressable style={styles.headerCenter} onPress={() => {}}>
              <View style={styles.headerAvatarWrap}>
                <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
                <View style={styles.onlineDot} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerName} numberOfLines={1}>{chatName || 'Chat riêng'}</Text>
                <Text style={styles.headerSub}>Đang hoạt động</Text>
              </View>
            </Pressable>

            {/* Actions */}
            <View style={styles.headerActions}>
              <Pressable style={styles.headerBtn} onPress={() => Alert.alert('Gọi thoại', 'Tính năng sắp ra mắt')}>
                <Phone size={18} color="#c4b5fd" strokeWidth={2} />
              </Pressable>
              <Pressable style={styles.headerBtn} onPress={() => Alert.alert('Gọi video', 'Tính năng sắp ra mắt')}>
                <Video size={18} color="#c4b5fd" strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* ── Messages ───────────────────────────────────────────────────── */}
          <ScrollView
            ref={scrollRef}
            style={styles.stream}
            contentContainerStyle={styles.streamContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            {renderedMessages.map((item) => {
              if (item.type === 'day') {
                return (
                  <View key={item.id} style={styles.dayRow}>
                    <View style={styles.dayLine} />
                    <View style={styles.dayPill}>
                      <Text style={styles.dayText}>{item.label}</Text>
                    </View>
                    <View style={styles.dayLine} />
                  </View>
                );
              }

              const isMe = String(item.senderId) === String(ownerId);
              const msgTime = formatMsgTime(item.createdAt || item.id);
              const isRead = Array.isArray(item.readBy) && item.readBy.filter((id) => id !== ownerId).length > 0;
              const isLastMine = String(item._id || item.id) === String(lastMyMsgId);
              const content = item.content || item.text || '';
              const sharedLoc = parseSharedLocation(content);

              if (sharedLoc) {
                return (
                  <View key={item._id || item.id} style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
                    {!isMe && (
                      <Image source={{ uri: item.sender?.avatar || avatarUri }} style={styles.otherAvatar} />
                    )}
                    <View style={[styles.msgCol, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                      <Pressable
                        style={styles.locationCardContainer}
                        onPress={() => {
                          onClose();
                          if (onNavigateToMapWithPlace) onNavigateToMapWithPlace(sharedLoc.placeName);
                        }}
                      >
                        <LinearGradient
                          colors={['#0f172a', '#1e293b']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.locationCardGradient}
                        >
                          <View style={styles.locationCardHeader}>
                            <MapPin size={14} color="#34d399" />
                            <Text style={styles.locationCardTag}>CHIA SẺ ĐỊA ĐIỂM DU LỊCH</Text>
                          </View>
                          <Text style={styles.locationCardTitle}>{sharedLoc.placeName}</Text>
                          {!!sharedLoc.location && (
                            <Text style={styles.locationCardSub}>📍 {sharedLoc.location}</Text>
                          )}
                          {!!sharedLoc.description && (
                            <Text style={styles.locationCardDesc} numberOfLines={2}>{sharedLoc.description}</Text>
                          )}
                          <View style={styles.locationCardBtn}>
                            <Compass size={14} color="#10b981" />
                            <Text style={styles.locationCardBtnText}>Khám phá trên bản đồ ➔</Text>
                          </View>
                        </LinearGradient>
                      </Pressable>
                      <View style={[styles.msgMeta, isMe ? { flexDirection: 'row-reverse' } : {}]}>
                        <Text style={styles.msgTime}>{msgTime}</Text>
                        {isMe && (
                          <CheckCheck
                            size={11}
                            color={isRead ? '#a855f7' : 'rgba(255,255,255,0.4)'}
                            style={{ marginLeft: isMe ? 0 : 4, marginRight: isMe ? 4 : 0 }}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                );
              }

              return (
                <View
                  key={item._id || item.id}
                  style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}
                >
                  {/* Other avatar */}
                  {!isMe && (
                    <Image source={{ uri: item.sender?.avatar || avatarUri }} style={styles.otherAvatar} />
                  )}

                  <View style={[styles.msgCol, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                    {/* Bubble */}
                    {isMe ? (
                      <LinearGradient
                        colors={['#a855f7', '#7c3aed', '#6d28d9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.bubble, styles.bubbleMe]}
                      >
                        <Text style={styles.bubbleTextMe}>{content}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.bubble, styles.bubbleOther]}>
                        <Text style={styles.bubbleTextOther}>{content}</Text>
                      </View>
                    )}

                    {/* Meta */}
                    <View style={[styles.msgMeta, isMe ? { flexDirection: 'row-reverse' } : {}]}>
                      <Text style={styles.msgTime}>{msgTime}</Text>
                      {isMe && (
                        <CheckCheck
                          size={11}
                          color={isRead ? '#a855f7' : 'rgba(255,255,255,0.4)'}
                          style={{ marginLeft: isMe ? 0 : 4, marginRight: isMe ? 4 : 0 }}
                        />
                      )}
                      {isMe && isRead && isLastMine && (
                        <Text style={styles.seenLabel}>Đã xem</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Empty state */}
            {safeMessages.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyAvatar}>
                  <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
                </View>
                <Text style={styles.emptyName}>{chatName}</Text>
                <Text style={styles.emptyHint}>Bắt đầu trò chuyện ngay nhé! 👋</Text>
              </View>
            )}
          </ScrollView>

          {/* ── Quick Replies ──────────────────────────────────────────────── */}
          {showQuickReplies && (
            <View style={styles.quickRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
                {QUICK_REPLIES.map((qr) => (
                  <Pressable key={qr} style={styles.quickChip} onPress={() => handleSend(qr)}>
                    <Text style={styles.quickText}>{qr}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Input Bar ─────────────────────────────────────────────────── */}
          <View style={styles.inputBar}>
            {/* Plus button */}
            <Pressable
              style={styles.inputSideBtn}
              onPress={() => setShowQuickReplies((v) => !v)}
            >
              <LinearGradient
                colors={showQuickReplies ? ['#7c3aed', '#a855f7'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.06)']}
                style={styles.inputSideGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Plus size={18} color={showQuickReplies ? '#fff' : 'rgba(255,255,255,0.7)'} />
              </LinearGradient>
            </Pressable>

            {/* Text input */}
            <View style={styles.inputBox}>
              <TextInput
                ref={inputRef}
                placeholder="Message..."
                placeholderTextColor="rgba(196,181,253,0.45)"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={() => handleSend()}
                returnKeyType="send"
                multiline
                style={styles.inputText}
              />
              <Pressable style={styles.smileBtn} onPress={() => {}}>
                <Smile size={17} color="rgba(196,181,253,0.55)" />
              </Pressable>
            </View>

            {/* Send / Mic */}
            {chatInput.trim().length > 0 ? (
              <Pressable
                style={[styles.sendBtn, isSending && { opacity: 0.5 }]}
                onPress={() => handleSend()}
                disabled={isSending}
              >
                <LinearGradient
                  colors={['#a855f7', '#7c3aed']}
                  style={styles.sendGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Send size={15} color="#fff" />
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable style={styles.sendBtn} onPress={() => Alert.alert('Ghi âm', 'Tính năng tin nhắn thoại sắp ra mắt')}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                  style={styles.sendGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Mic size={15} color="rgba(196,181,253,0.7)" />
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a0533',
  },

  // Decorative blobs
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  blobTop: {
    width: 260,
    height: 260,
    backgroundColor: '#7c3aed',
    top: -80,
    right: -60,
  },
  blobMid: {
    width: 180,
    height: 180,
    backgroundColor: '#a855f7',
    top: height * 0.35,
    left: -70,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 0) + 12,
    paddingBottom: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(26, 5, 51, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 85, 247, 0.15)',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerAvatarWrap: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#1a0533',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
    maxWidth: width * 0.38,
  },
  headerSub: {
    fontSize: 10.5,
    color: '#86efac',
    fontWeight: '700',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // ── Stream ───────────────────────────────────────────────────────────────────
  stream: { flex: 1 },
  streamContent: {
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 16,
  },

  // Day separator
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(196, 181, 253, 0.12)',
  },
  dayPill: {
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  dayText: {
    fontSize: 10,
    color: '#c4b5fd',
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Message row
  msgRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgCol: { maxWidth: width * 0.72 },

  otherAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    marginBottom: 18,
  },

  // Bubbles
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  bubbleMe: {
    borderBottomRightRadius: 5,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.18)',
    borderBottomLeftRadius: 5,
  },
  bubbleTextMe: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 20,
  },
  bubbleTextOther: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 20,
  },

  // Meta
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  msgTime: {
    fontSize: 9.5,
    color: 'rgba(196,181,253,0.5)',
    fontWeight: '600',
  },
  seenLabel: {
    fontSize: 9,
    color: '#a855f7',
    fontWeight: '800',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: height * 0.12,
    paddingBottom: 24,
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#7c3aed',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 14,
  },
  emptyName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 13,
    color: 'rgba(196,181,253,0.6)',
    fontWeight: '500',
  },

  // Quick replies
  quickRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.12)',
  },
  quickChip: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickText: {
    fontSize: 12.5,
    color: '#c4b5fd',
    fontWeight: '700',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: 'rgba(26, 5, 51, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.12)',
    gap: 8,
  },
  inputSideBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  inputSideGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 13.5,
    color: '#fff',
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100,
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  locationCardBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#34d399',
  },
});
