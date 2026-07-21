import React, { useState, useRef } from 'react';
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
} from 'lucide-react-native';

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

  const handleQuickReply = (text) => {
    setMessageText(text);
    setShowQuickReplies(false);
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

        {/* Members chip bar */}
        {membersLabel ? (
          <View style={styles.memberBar}>
            <View style={styles.memberDot} />
            <Text style={styles.memberBarText} numberOfLines={1}>{membersLabel}</Text>
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

              const senderName = msg.senderName || msg.sender || 'Thành viên';
              const avatarUri = msg.senderAvatar || getUserAvatarByName(senderName);
              const sharedLoc = parseSharedLocation(msg.text);

              if (sharedLoc) {
                return (
                  <View key={`msg-${msg.id || index}`} style={isMe ? styles.myRow : styles.otherRow}>
                    {!isMe && <Image source={{ uri: avatarUri }} style={styles.otherAvatar} />}
                    <View style={isMe ? styles.myCol : styles.otherCol}>
                      {!isMe && <Text style={styles.otherName}>{senderName}</Text>}
                      <Pressable
                        style={styles.locationCardContainer}
                        onPress={() => onNavigateToMapWithPlace && onNavigateToMapWithPlace(sharedLoc.placeName)}
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
                      <View style={isMe ? styles.myMeta : null}>
                        <Text style={styles.metaTime}>{msg.time || ''}</Text>
                        {isMe && <CheckCheck size={10} color="rgba(168,85,247,0.8)" />}
                      </View>
                    </View>
                  </View>
                );
              }

              if (isMe) {
                return (
                  <View key={`msg-${msg.id || index}`} style={styles.myRow}>
                    <View style={styles.myCol}>
                      <LinearGradient
                        colors={['#a855f7', '#7c3aed', '#6d28d9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.bubbleMe}
                      >
                        <Text style={styles.bubbleTextMe}>{msg.text}</Text>
                      </LinearGradient>
                      <View style={styles.myMeta}>
                        <Text style={styles.metaTime}>{msg.time || ''}</Text>
                        <CheckCheck size={10} color="rgba(168,85,247,0.8)" />
                      </View>
                    </View>
                  </View>
                );
              }

              return (
                <View key={`msg-${msg.id || index}`} style={styles.otherRow}>
                  {/* Avatar */}
                  <Image source={{ uri: avatarUri }} style={styles.otherAvatar} />

                  <View style={styles.otherCol}>
                    <Text style={styles.otherName}>{senderName}</Text>
                    <View style={styles.bubbleOther}>
                      <Text style={styles.bubbleTextOther}>{msg.text}</Text>
                    </View>
                    <Text style={styles.metaTime}>{msg.time || ''}</Text>
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
        </ScrollView>

        {/* ── Quick Replies ─────────────────────────────────────────────── */}
        {showQuickReplies && (
          <View style={styles.quickRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
            >
              {QUICK_REPLIES.map((qr) => (
                <Pressable key={qr} style={styles.quickChip} onPress={() => handleQuickReply(qr)}>
                  <Text style={styles.quickText}>{qr}</Text>
                </Pressable>
              ))}
            </ScrollView>
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
                  ? ['#7c3aed', '#a855f7']
                  : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
              }
              style={styles.inputSideGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={18} color={showQuickReplies ? '#fff' : 'rgba(196,181,253,0.7)'} />
            </LinearGradient>
          </Pressable>

          {/* Text field */}
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Message..."
              placeholderTextColor="rgba(196,181,253,0.4)"
              value={messageText}
              onChangeText={setMessageText}
              style={styles.inputText}
              multiline
              maxLength={1000}
            />
            <Pressable
              style={styles.smileBtn}
              onPress={() => Alert.alert('Emoji', 'Tính năng emoji sắp ra mắt')}
            >
              <Smile size={17} color="rgba(196,181,253,0.5)" />
            </Pressable>
          </View>

          {/* Send / Mic */}
          {messageText.trim().length > 0 ? (
            <Pressable style={styles.sendBtn} onPress={onSendMessage}>
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
            <Pressable
              style={styles.sendBtn}
              onPress={() => Alert.alert('Ghi âm', 'Tính năng tin nhắn thoại sắp ra mắt')}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.sendGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Mic size={15} color="rgba(196,181,253,0.6)" />
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#110829',
  },

  // Member bar
  memberBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 85, 247, 0.12)',
    gap: 8,
  },
  memberDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  memberBarText: {
    fontSize: 11,
    color: 'rgba(196, 181, 253, 0.7)',
    fontWeight: '700',
    flex: 1,
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
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomRightRadius: 5,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  bubbleTextMe: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 20,
  },
  myMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingRight: 2,
  },

  // Other messages
  otherRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 8,
  },
  otherAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    marginBottom: 18,
  },
  otherCol: {
    maxWidth: width * 0.65,
  },
  otherName: {
    fontSize: 10.5,
    color: '#c4b5fd',
    fontWeight: '800',
    marginBottom: 4,
    marginLeft: 2,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
  },
  bubbleTextOther: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 20,
  },

  // Meta time
  metaTime: {
    fontSize: 9.5,
    color: 'rgba(196,181,253,0.45)',
    fontWeight: '600',
    marginTop: 3,
    marginLeft: 2,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(196,181,253,0.7)',
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 12,
    color: 'rgba(196,181,253,0.4)',
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
    fontSize: 12,
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
    backgroundColor: 'rgba(17, 8, 41, 0.95)',
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.22)',
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
