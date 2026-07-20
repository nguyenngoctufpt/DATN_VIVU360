import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, TextInput, Modal, Dimensions, Share, Alert, Platform, StatusBar, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { searchFriends } from '../services/userService';
import { getFriendships, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../services/friendshipService';
import { getFeed, createPost, togglePostLike, addPostComment } from '../services/postService';
import { getSocialNotifications, markSocialNotificationsRead } from '../services/socialNotificationService';
import {
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Users,
  Image as ImageIcon,
  MapPin,
  X,
  Sparkles,
  Send,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  ChevronRight,
  Award,
  Smile,
  Info,
  Paperclip,
  Camera,
  Check,
  CheckCheck,
  Newspaper,
  Search,
  Menu,
  BellRing,
  Compass,
  Map,
  Ticket,
  User
} from 'lucide-react-native';

import { UserProfileModal } from './userProfile';

const getUserRankColors = (name) => {
  const lvl = getUserLevelByName(name);
  const levelNum = parseInt(lvl.replace(/[^0-9]/g, ''), 10) || 1;
  if (levelNum >= 12) {
    return {
      colors: ['#eab308', '#ca8a04'], // Gold
      textColor: '#ffffff',
      iconColor: '#fef08a'
    };
  } else if (levelNum >= 8) {
    return {
      colors: ['#64748b', '#475569'], // Silver
      textColor: '#ffffff',
      iconColor: '#cbd5e1'
    };
  } else {
    return {
      colors: ['#b45309', '#78350f'], // Bronze
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
      text: '#ef4444' // red
    };
  }
  if (cleanTag.includes('ẩm thực') || cleanTag.includes('khách sạn') || cleanTag.includes('homestay')) {
    return {
      bg: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
      border: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.15)',
      text: '#f59e0b' // amber
    };
  }
  if (cleanTag.includes('đà nẵng') || cleanTag.includes('hội an') || cleanTag.includes('kết bạn') || cleanTag.includes('ghép xe')) {
    return {
      bg: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      border: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)',
      text: '#10b981' // emerald
    };
  }
  return {
    bg: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.06)',
    border: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
    text: '#3b82f6' // blue
  };
};

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

const isSourceVerified = (name) => {
  if (!name) return false;
  const verifiedNames = [
    'Ban truyền thông Vivu360',
    'Tạp chí Phượt Việt',
    'Góc Ẩm Thực Việt'
  ];
  return verifiedNames.includes(name.trim());
};

const getCategoryColor = (category, isDarkMode) => {
  const cat = (category || '').trim();
  if (isDarkMode) {
    switch (cat) {
      case 'Thời sự':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#fca5a5' };
      case 'Cẩm nang':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#6ee7b7' };
      case 'Ẩm thực':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#fcd34d' };
      case 'Sự kiện':
        return { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', text: '#c4b5fd' };
      case 'Khám phá':
        return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#93c5fd' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)', text: '#d1d5db' };
    }
  } else {
    switch (cat) {
      case 'Thời sự':
        return { bg: '#fee2e2', border: '#fecaca', text: '#ef4444' };
      case 'Cẩm nang':
        return { bg: '#ecfdf5', border: '#d1fae5', text: '#10b981' };
      case 'Ẩm thực':
        return { bg: '#fffbeb', border: '#fef3c7', text: '#d97706' };
      case 'Sự kiện':
        return { bg: '#faf5ff', border: '#f3e8ff', text: '#8b5cf6' };
      case 'Khám phá':
        return { bg: '#eff6ff', border: '#dbeafe', text: '#3b82f6' };
      default:
        return { bg: '#f3f4f6', border: '#e5e7eb', text: '#6b7280' };
    }
  }
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
    return '10:24';
  }
};

// Mock Data
// Mock Data
const popularCities = [
  {
    id: 1,
    city: 'Hạ Long',
    region: 'Quảng Ninh',
    image: 'https://images.unsplash.com/photo-1524230507669-e297d477b24d?auto=format&fit=crop&w=400&q=80',
    activeFriends: '1.2k bạn đang đi',
    avatars: [
      'https://i.pravatar.cc/150?img=47',
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=33',
      'https://i.pravatar.cc/150?img=26'
    ]
  },
  {
    id: 2,
    city: 'Sa Pa',
    region: 'Lào Cai',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=400&q=80',
    activeFriends: '850 bạn đang đi',
    avatars: [
      'https://i.pravatar.cc/150?img=15',
      'https://i.pravatar.cc/150?img=48',
      'https://i.pravatar.cc/150?img=28'
    ]
  },
  {
    id: 3,
    city: 'Phú Quốc',
    region: 'Kiên Giang',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=400&q=80',
    activeFriends: '1.5k bạn đang đi',
    avatars: [
      'https://i.pravatar.cc/150?img=22',
      'https://i.pravatar.cc/150?img=14',
      'https://i.pravatar.cc/150?img=18',
      'https://i.pravatar.cc/150?img=33'
    ]
  },
  {
    id: 4,
    city: 'Hội An',
    region: 'Quảng Nam',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=400&q=80',
    activeFriends: '920 bạn đang đi',
    avatars: [
      'https://i.pravatar.cc/150?img=47',
      'https://i.pravatar.cc/150?img=26',
      'https://i.pravatar.cc/150?img=12'
    ]
  }
];

const initialPosts = [];

const initialGroups = [];

export function SocialScreen({ ownerId, isDarkMode, theme, currentUser, onNavigateToTab, onLogout }) {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [friendships, setFriendships] = useState([]);
  const [socialNotifications, setSocialNotifications] = useState([]);
  const [friendActionId, setFriendActionId] = useState(null);

  const normalizeFeed = feed => feed.map(post => ({
    ...post, id: post._id, image: post.images?.[0] || '', likes: post.likesCount || 0,
    likedByUser: Boolean(post.likedByMe), time: new Date(post.createdAt).toLocaleString('vi-VN'),
    title: post.category || 'Hành trình mới', user: post.author || {},
    comments: (post.comments || []).map(comment => ({ id: comment._id, user: comment.author?.name || 'Thành viên Vivu360', avatar: comment.author?.avatar, text: comment.text, createdAt: comment.createdAt })),
  }));

  const refreshSocialData = async () => {
    if (!ownerId) return;
    const [feed, relations, notifications] = await Promise.all([getFeed(ownerId), getFriendships(ownerId), getSocialNotifications(ownerId)]);
    setPosts(normalizeFeed(feed));
    setFriendships(Array.isArray(relations) ? relations : []);
    setSocialNotifications(Array.isArray(notifications) ? notifications : []);
  };

  useEffect(() => {
    if (!ownerId) return;
    let active = true;
    Promise.all([getFeed(ownerId), getFriendships(ownerId), getSocialNotifications(ownerId)])
      .then(([feed, relations, notifications]) => {
        if (active) {
          setPosts(normalizeFeed(feed));
          setFriendships(Array.isArray(relations) ? relations : []);
          setSocialNotifications(Array.isArray(notifications) ? notifications : []);
        }
      })
      .catch(error => console.warn('Không thể tải bảng tin:', error.message));
    return () => { active = false; };
  }, [ownerId]);

  const mockStories = useMemo(() => [], []);

  const incomingRequests = useMemo(
    () => friendships.filter(item => item.status === 'pending' && item.direction === 'incoming'),
    [friendships]
  );
  const acceptedFriends = useMemo(
    () => friendships.filter(item => item.status === 'accepted' && item.friend).map(item => item.friend),
    [friendships]
  );

  useEffect(() => {
    if (!ownerId) return undefined;
    const timer = setInterval(() => refreshSocialData().catch(error => console.warn('Không thể tự làm mới bảng tin:', error.message)), 15000);
    return () => clearInterval(timer);
  }, [ownerId]);

  // View states within social tab: 'feed' | 'createPost'
  const [activeView, setActiveView] = useState('feed');

  const slideAnim = useRef(new Animated.Value(height)).current;
  const [isComposerRendered, setIsComposerRendered] = useState(false);

  useEffect(() => {
    if (activeView === 'createPost') {
      setIsComposerRendered(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        setIsComposerRendered(false);
      });
    }
  }, [activeView]);
  
  // Interactive Comments & Profile States
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  
  const [targetUsername, setTargetUsername] = useState('');
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [shareAlertVisible, setShareAlertVisible] = useState(false);
  
  // Create News Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Thời sự');
  const [newContent, setNewContent] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('');

  const [searchText, setSearchText] = useState('');
  const [friendResults, setFriendResults] = useState([]);
  const [isSearchingFriends, setIsSearchingFriends] = useState(false);
  const [friendSearchError, setFriendSearchError] = useState('');

  const relationFor = userId => friendships.find(item => item.users?.includes(userId));

  const handleFriendAction = async (action, targetId) => {
    setFriendActionId(targetId);
    try {
      if (action === 'send') await sendFriendRequest(ownerId, targetId);
      if (action === 'accept') await acceptFriendRequest(ownerId, targetId);
      if (action === 'reject') await rejectFriendRequest(ownerId, targetId);
      await refreshSocialData();
    } catch (error) {
      Alert.alert('Kết bạn', error.response?.data?.message || 'Không thể thực hiện. Vui lòng thử lại.');
    } finally {
      setFriendActionId(null);
    }
  };

  useEffect(() => {
    const query = searchText.trim();
    if (query.length < 2) {
      setFriendResults([]);
      setIsSearchingFriends(false);
      setFriendSearchError('');
      return;
    }

    let active = true;
    setIsSearchingFriends(true);
    setFriendSearchError('');
    const timer = setTimeout(() => {
      searchFriends(query, ownerId)
        .then(users => active && setFriendResults(Array.isArray(users) ? users : []))
        .catch(error => {
          if (active) {
            setFriendResults([]);
            setFriendSearchError(
              error.response
                ? 'Máy chủ không thể xử lý tìm kiếm. Vui lòng thử lại.'
                : 'Không thể kết nối Vivu360_API. Hãy kiểm tra API đang chạy ở cổng 3000.'
            );
            console.warn('Khong the tim ban be:', error.message);
          }
        })
        .finally(() => active && setIsSearchingFriends(false));
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchText, ownerId]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(post => post.category === selectedCategory);
    }
    if (searchText.trim().length > 0) {
      const query = searchText.toLowerCase().trim();
      result = result.filter(post => 
        post.location.toLowerCase().includes(query) ||
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.user?.name && post.user.name.toLowerCase().includes(query))
      );
    }
    return result;
  }, [posts, selectedCategory, searchText]);

  const featuredPost = null;

  const displayListPosts = useMemo(() => {
    return filteredPosts;
  }, [filteredPosts]);

  // Likes toggle handler
  const handleLikePost = async (postId) => {
    try {
      const result = await togglePostLike(ownerId, postId);
      setPosts(items => items.map(post => post.id === postId ? { ...post, likedByUser: result.likedByMe, likes: result.likesCount } : post));
    } catch (error) {
      Alert.alert('Bài viết', 'Không thể cập nhật lượt thích.');
    }
  };

  // Submit Post
  const handleSubmitPost = async () => {
    if (!newContent.trim()) return;

    const defaultImages = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80'
    ];
    const finalImg = newImgUrl.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];

    try {
      await createPost(ownerId, { content: newContent, category: newCategory, location: newLocation.trim() || 'Việt Nam', images: [finalImg] });
      await refreshSocialData();
      setNewTitle('');
      setNewContent('');
      setNewLocation('');
      setNewImgUrl('');
      setActiveView('feed');
    } catch (error) {
      Alert.alert('Đăng bài', 'Không thể đăng bài. Vui lòng thử lại.');
    }
  };

  // Open User Profile view modal
  const handleOpenUserProfile = (username) => {
    setTargetUsername(username);
    setProfileModalVisible(true);
  };

  // Open Comments modal
  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  // Submit dynamic comment
  const handleSendComment = async () => {
    if (!commentInput.trim() || !selectedPost) return;
    const text = commentInput.trim();
    try {
      const saved = await addPostComment(ownerId, selectedPost.id, text);
      const newComment = { id: saved._id, user: saved.author?.name || currentUser.name, avatar: saved.author?.avatar, text: saved.text, createdAt: saved.createdAt };
      setPosts(items => items.map(post => post.id === selectedPost.id ? { ...post, comments: [...(post.comments || []), newComment], commentsCount: (post.comments || []).length + 1 } : post));
      setSelectedPost(post => ({ ...post, comments: [...(post.comments || []), newComment], commentsCount: (post.comments || []).length + 1 }));
      setCommentInput('');
    } catch (error) {
      Alert.alert('Bình luận', 'Không thể gửi bình luận. Vui lòng thử lại.');
    }
  };

  // Native Post Sharing handler
  const handleSharePost = async (post) => {
    try {
      const result = await Share.share({
        message: `Khám phá check-in của ${post.user.name} tại ${post.location || 'Việt Nam'} trên Vivu360:\n\n"${post.content}"\n\nTải ngay ứng dụng Vivu360 để cùng trải nghiệm du lịch ảo 360 độ nhé! 🇻🇳✨`,
      });
      if (result.action === Share.sharedAction) {
        setShareAlertVisible(true);
        setTimeout(() => {
          setShareAlertVisible(false);
        }, 2000);
      }
    } catch (error) {
      console.log('Sharing error: ', error);
    }
  };

  return (
    <View style={styles.tabContainer}>
      {/* HEADER SECTION */}
      <View style={styles.socialHeader}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.socialTitle, { color: theme.textPrimary }]}>Vivu360</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.messengerIconBtn, { backgroundColor: theme.searchBg }]}
              onPress={() => setMenuVisible(true)}
            >
              <Menu size={22} color={theme.textPrimary} />
            </Pressable>
            <Pressable 
              style={({ pressed }) => [styles.messengerIconBtn, { backgroundColor: theme.searchBg }, pressed && { opacity: 0.7 }]}
              onPress={() => {
                setNotificationVisible(true);
                refreshSocialData()
                  .then(() => markSocialNotificationsRead(ownerId))
                  .then(() => setSocialNotifications(items => items.map(item => ({ ...item, read: true }))))
                  .catch(error => console.warn('Không thể làm mới thông báo:', error.message));
              }}
            >
              <BellRing size={22} color={theme.textPrimary} />
              {(incomingRequests.length > 0 || socialNotifications.some(item => !item.read)) && <View style={styles.messengerBadge} />}
            </Pressable>
          </View>
        </View>
        <Text style={[styles.socialSubtitle, { color: theme.textSecondary }]}>
          Mạng xã hội chia sẻ hành trình du lịch Vivu360
        </Text>

        {/* Sleek Search Input */}
        <View style={[styles.socialSearchContainer, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
          <Search size={16} color={theme.textSecondary} />
          <TextInput
            placeholder="Tìm bài viết, email hoặc số điện thoại bạn bè..."
            placeholderTextColor={theme.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            style={[styles.socialSearchInput, { color: theme.textPrimary }]}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} style={{ padding: 6 }}>
              <X size={14} color={theme.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Category horizontal tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
        >
          {['Tất cả', 'Khám phá', 'Cẩm nang', 'Ẩm thực', 'Sự kiện'].map((cat) => {
            const isActive = selectedCategory === cat;
            const catColors = isActive 
              ? { bg: '#3b82f6', text: '#ffffff', border: '#3b82f6' }
              : getCategoryColor(cat === 'Tất cả' ? 'Khác' : cat, isDarkMode);
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryTabBtn,
                  {
                    backgroundColor: catColors.bg,
                    borderColor: catColors.border,
                  },
                  isActive && styles.categoryTabBtnActive
                ]}
              >
                <Text style={[
                  styles.categoryTabBtnText,
                  {
                    color: catColors.text
                  }
                ]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Scrollable Feed Section */}
      <ScrollView 
        style={{ backgroundColor: isDarkMode ? '#121212' : '#f8fafc' }}
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
      >
        {searchText.trim().length >= 2 && (
          <View style={[styles.friendSearchResults, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <Text style={[styles.sectionTitleLabel, { color: theme.textPrimary }]}>Bạn bè trên Vivu360</Text>
            {isSearchingFriends ? (
              <ActivityIndicator color="#3b82f6" style={{ marginVertical: 14 }} />
            ) : friendSearchError ? (
              <Text style={[styles.emptyFriendSearch, { color: '#ef4444' }]}>{friendSearchError}</Text>
            ) : friendResults.length > 0 ? friendResults.map(friend => {
              const relation = relationFor(friend.firebaseUid);
              const isBusy = friendActionId === friend.firebaseUid;
              return (
              <View key={friend.firebaseUid} style={[styles.friendSearchItem, { borderTopColor: theme.border }]}>
                <Image source={{ uri: friend.avatar || getUserAvatarByName(friend.name) }} style={styles.friendSearchAvatar} />
                <Pressable style={{ flex: 1 }} onPress={() => {
                  setTargetUsername(friend.name);
                  setProfileModalVisible(true);
                }}>
                  <Text style={[styles.friendSearchName, { color: theme.textPrimary }]}>{friend.name}</Text>
                  <Text style={[styles.friendSearchContact, { color: theme.textSecondary }]} numberOfLines={1}>
                    {friend.email}{friend.phone ? ` · ${friend.phone}` : ''}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={Boolean(relation) || isBusy}
                  onPress={() => handleFriendAction('send', friend.firebaseUid)}
                  style={[styles.friendActionButton, relation?.status === 'accepted' && styles.friendAcceptedButton]}
                >
                  {isBusy ? <ActivityIndicator size="small" color="#fff" /> : (
                    <Text style={styles.friendActionButtonText}>
                      {relation?.status === 'accepted' ? 'Bạn bè' : relation?.status === 'pending' ? 'Đã gửi' : 'Kết bạn'}
                    </Text>
                  )}
                </Pressable>
              </View>
            );}) : (
              <Text style={[styles.emptyFriendSearch, { color: theme.textSecondary }]}>Không tìm thấy bạn bè bằng email hoặc số điện thoại này.</Text>
            )}
          </View>
        )}

        {/* TRAVEL WITH FRIENDS ROW */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingVertical: 14, borderBottomWidth: 1 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleLabel, { color: theme.textPrimary }]}>Bạn đồng hành đồng bộ</Text>
            <Pressable>
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#3b82f6' }}>Xem hết</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginTop: 12 }}>
            <Pressable style={styles.addFriendCircle} onPress={() => Alert.alert('Tính năng', 'Tìm bạn đồng hành qua mã QR quét vị trí!')}>
              <Plus size={20} color={theme.textSecondary} />
            </Pressable>
            {acceptedFriends.length > 0 ? acceptedFriends.map((friend) => (
              <Pressable key={friend.firebaseUid} style={styles.friendAvatarCheck} onPress={() => handleOpenUserProfile(friend.name)}>
                <View style={styles.friendAvatarWrap}>
                  <Image source={{ uri: friend.avatar || getUserAvatarByName(friend.name) }} style={styles.friendAvatarCircle} />
                </View>
                <Text style={[styles.friendNameMin, { color: theme.textPrimary }]} numberOfLines={1}>{friend.name.split(' ')[1] || friend.name}</Text>
              </Pressable>
            )) : (
              <View style={{ justifyContent: "center", paddingHorizontal: 12, maxWidth: 260 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 11.5, fontWeight: "600", lineHeight: 17 }}>
                  Chưa có bạn đồng hành nào được đồng bộ. Hãy tìm bạn bằng email hoặc số điện thoại.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.feedSection}>
            {/* Quick Create Post Card */}
            <Pressable
              style={[styles.createPostTriggerCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setActiveView('createPost')}
            >
              <View style={styles.triggerTopRow}>
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={styles.triggerAvatar}
                />
                <View style={[styles.triggerInputContainer, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12.5, fontWeight: '500' }}>
                    Bạn vừa đi đâu về thế, {currentUser.name}? Chia sẻ chuyến đi nhé!
                  </Text>
                </View>
              </View>
              <View style={[styles.triggerDivider, { backgroundColor: theme.border }]} />
              <View style={styles.triggerBottomRow}>
                <Pressable style={styles.triggerActionItem} onPress={() => setActiveView('createPost')}>
                  <Camera size={15} color="#ef4444" />
                  <Text style={[styles.triggerActionText, { color: theme.textSecondary }]}>Trực tiếp</Text>
                </Pressable>
                <Pressable style={styles.triggerActionItem} onPress={() => setActiveView('createPost')}>
                  <ImageIcon size={15} color="#10b981" />
                  <Text style={[styles.triggerActionText, { color: theme.textSecondary }]}>Ảnh/video</Text>
                </Pressable>
                <Pressable style={styles.triggerActionItem} onPress={() => setActiveView('createPost')}>
                  <Smile size={15} color="#f59e0b" />
                  <Text style={[styles.triggerActionText, { color: theme.textSecondary }]}>Cảm xúc</Text>
                </Pressable>
              </View>
            </Pressable>

            {/* TRIP FEED LISTINGS */}
            {(() => {
              const listToRender = displayListPosts;
              if (listToRender.length === 0) {
                const emptyMessage = posts.length === 0 && !searchText.trim() && selectedCategory === 'Tất cả'
                  ? 'Chưa có bài đăng nào. Hãy tạo bài đăng đầu tiên của bạn.'
                  : 'Không tìm thấy chuyến đi tương ứng.';
                return (
                  <View style={{ alignItems: "center", paddingVertical: 60, paddingHorizontal: 24 }}>
                    <Text style={{ color: theme.textSecondary, fontWeight: "700", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                      {emptyMessage}
                    </Text>
                  </View>
                );
              }
              return listToRender.map((post) => (
                <View key={post.id} style={[styles.tripPostCard, { backgroundColor: theme.card, borderColor: theme.border, overflow: 'hidden' }]}>
                  {/* Large cover image pressable to open details */}
                  <Pressable style={styles.tripCoverPressable} onPress={() => handleOpenComments(post)}>
                    <Image source={{ uri: post.image }} style={styles.tripCoverImage} />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.15)', 'transparent', 'rgba(0,0,0,0.85)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    
                    {/* Floating location tag */}
                    <View style={styles.tripLocationFloatBadge}>
                      <MapPin size={10} color="#fff" fill="#ef4444" style={{ marginRight: 2 }} />
                      <Text style={styles.tripLocationFloatText}>{post.location}</Text>
                    </View>

                    {/* Floating category tag */}
                    <View style={[
                      styles.tripCategoryFloatBadge, 
                      { 
                        backgroundColor: getCategoryColor(post.category, isDarkMode).bg, 
                        borderColor: getCategoryColor(post.category, isDarkMode).border 
                      }
                    ]}>
                      <Text style={[
                        styles.tripCategoryFloatText, 
                        { color: getCategoryColor(post.category, isDarkMode).text }
                      ]}>
                        {post.category}
                      </Text>
                    </View>

                    {/* Overlay Title & Duration */}
                    <View style={styles.tripOverlayContent}>
                      <Text style={styles.tripDurationText}>🕒 {post.duration || '3 ngày 2 đêm'}</Text>
                      <Text style={styles.tripOverlayTitle} numberOfLines={2}>{post.title}</Text>
                    </View>
                  </Pressable>

                  {/* Trip Card Footer */}
                  <View style={styles.tripCardFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {/* Companion avatars list */}
                      <View style={styles.avatarGroupContainer}>
                        {(post.companions || []).map((cAvatar, idx) => (
                          <Image key={idx} source={{ uri: cAvatar }} style={[styles.tripCompanionAvatar, { marginLeft: idx > 0 ? -12 : 0 }]} />
                        ))}
                      </View>
                      <Pressable style={styles.addCompanionMiniBtn} onPress={() => Alert.alert('Bạn đồng hành', 'Thêm bạn đồng hành chia sẻ nhật ký này!')}>
                        <Plus size={10} color={theme.textSecondary} />
                      </Pressable>
                    </View>

                    {/* Actions panel */}
                    <View style={styles.tripCardActions}>
                      <Pressable style={styles.tripActionIconBtn} onPress={() => handleLikePost(post.id)}>
                        <Heart size={16} color={post.likedByUser ? '#ef4444' : theme.textSecondary} fill={post.likedByUser ? '#ef4444' : 'transparent'} />
                        <Text style={[styles.tripActionText, { color: post.likedByUser ? '#ef4444' : theme.textSecondary }]}>
                          {post.likes}
                        </Text>
                      </Pressable>
                      <Pressable style={styles.tripActionIconBtn} onPress={() => handleOpenComments(post)}>
                        <MessageSquare size={16} color={theme.textSecondary} />
                        <Text style={[styles.tripActionText, { color: theme.textSecondary }]}>
                          {post.comments?.length || post.commentsCount}
                        </Text>
                      </Pressable>
                      <Pressable style={styles.tripActionIconBtn} onPress={() => handleSharePost(post)}>
                        <Share2 size={16} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Excerpt author name */}
                  <View style={{ paddingHorizontal: 14, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Image source={{ uri: post.user?.avatar || getUserAvatarByName(post.source) }} style={styles.authorAvatarMini} />
                    <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600' }}>
                      Nhật ký của <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{post.user?.name || post.source}</Text> • {post.time}
                    </Text>
                  </View>
                </View>
              ));
            })()}
          </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODALS SECTION */}
      {/* ======================================================== */}

      {/* Modal 1 (Create Post Modal) deleted. Composers are now rendered as dedicated screen view. */}


      {/* MODAL 4: INTERACTIVE TRIP DETAILS & COMMENTS */}
      {selectedPost && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={commentModalVisible}
          onRequestClose={() => setCommentModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.tripDetailModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              
              {/* Header Cover Photo */}
              <View style={styles.tripDetailCoverWrapper}>
                <Image source={{ uri: selectedPost.image }} style={styles.tripDetailCoverImage} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.85)']}
                  style={StyleSheet.absoluteFillObject}
                />
                
                {/* Close Button */}
                <Pressable style={styles.tripDetailCloseBtn} onPress={() => setCommentModalVisible(false)}>
                  <X size={18} color="#fff" />
                </Pressable>

                {/* Floating location info */}
                <View style={styles.tripDetailHeaderContent}>
                  <Text style={styles.tripDetailCategoryBadge}>{selectedPost.category}</Text>
                  <Text style={styles.tripDetailTitleText}>{selectedPost.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <MapPin size={14} color="#ef4444" fill="#ef4444" style={{ marginRight: 2 }} />
                    <Text style={styles.tripDetailLocationText}>{selectedPost.location} • 🕒 {selectedPost.duration || '3 ngày 2 đêm'}</Text>
                  </View>
                </View>
              </View>

              {/* Scrollable details */}
              <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Author Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  <Image source={{ uri: selectedPost.user?.avatar || getUserAvatarByName(selectedPost.source) }} style={styles.postAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.postUserName, { color: theme.textPrimary }]}>{selectedPost.user?.name || selectedPost.source}</Text>
                    <Text style={{ fontSize: 10.5, color: theme.textMuted }}>{selectedPost.time} • Tác giả ký sự</Text>
                  </View>
                  <View style={styles.tripDetailCompanionGroup}>
                    {(selectedPost.companions || []).map((cAv, idx) => (
                      <Image key={idx} source={{ uri: cAv }} style={[styles.detailCompanionAvatarCircle, { marginLeft: idx > 0 ? -8 : 0 }]} />
                    ))}
                  </View>
                </View>

                {/* Main Excerpt text */}
                <View style={{ padding: 16 }}>
                  <Text style={[styles.tripDetailDescription, { color: theme.textPrimary }]}>
                    {selectedPost.content}
                  </Text>
                </View>

                {/* Photo Carousel (Scroll deck of secondary images like screen 3 in mockup) */}
                <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textSecondary, marginLeft: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bộ ảnh hành trình</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 20 }}>
                  {((selectedPost.images && selectedPost.images.length ? selectedPost.images : [selectedPost.image].filter(Boolean))).map((imgUrl, index) => (
                    <Image key={index} source={{ uri: imgUrl }} style={styles.itineraryCarouselImage} />
                  ))}
                </ScrollView>

                {/* Comments section title */}
                <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 16, marginBottom: 16 }} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textSecondary, marginLeft: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ý kiến bạn đọc ({selectedPost.comments ? selectedPost.comments.length : 0})</Text>
                
                {/* Comments list stream */}
                <View style={{ paddingHorizontal: 16, gap: 12 }}>
                  {selectedPost.comments && selectedPost.comments.length === 0 ? (
                    <Text style={{ color: theme.textSecondary, fontSize: 12.5, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 }}>
                      Chưa có ý kiến nào. Hãy là người đầu tiên! 💬
                    </Text>
                  ) : (
                    selectedPost.comments && selectedPost.comments.map((comment) => (
                      <View key={comment.id} style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable onPress={() => { setCommentModalVisible(false); handleOpenUserProfile(comment.user); }}>
                          <Image
                            source={{
                              uri: comment.user === currentUser.name ? currentUser.avatar : getUserAvatarByName(comment.user)
                            }}
                            style={styles.authorAvatarMini}
                          />
                        </Pressable>
                        <View style={{ flex: 1, backgroundColor: theme.searchBg, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: theme.border }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Pressable onPress={() => { setCommentModalVisible(false); handleOpenUserProfile(comment.user); }}>
                              <Text style={[styles.postUserName, { color: theme.textPrimary, fontSize: 11.5 }]}>{comment.user}</Text>
                            </Pressable>
                            {isSourceVerified(comment.user) && (
                              <CheckCircle size={10} color="#fff" fill="#1877f2" />
                            )}
                          </View>
                          <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '500', lineHeight: 15 }}>
                            {comment.text}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>

              {/* Input Message box */}
              <View style={[styles.chatInputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <TextInput
                  placeholder="Viết ý kiến chia sẻ..."
                  placeholderTextColor={theme.textMuted}
                  value={commentInput}
                  onChangeText={setCommentInput}
                  style={[styles.chatInputField, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
                />
                <Pressable style={styles.sendMsgBtn} onPress={handleSendComment}>
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
          </View>
        </Modal>
      )}

      {/* USER PROFILE MODAL INJECTION */}
      <UserProfileModal
        username={targetUsername}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        isDarkMode={isDarkMode}
        theme={theme}
        currentUser={currentUser}
      />

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuDismissArea} onPress={() => setMenuVisible(false)} />
          <View style={[styles.sideMenu, { backgroundColor: theme.card, borderLeftColor: theme.border }]}>
            <View style={[styles.sideMenuHeader, { borderBottomColor: theme.border }]}>
              <Image source={{ uri: currentUser.avatar }} style={styles.sideMenuAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sideMenuName, { color: theme.textPrimary }]} numberOfLines={1}>{currentUser.name}</Text>
                <Text style={[styles.sideMenuEmail, { color: theme.textSecondary }]} numberOfLines={1}>{currentUser.email}</Text>
              </View>
              <Pressable onPress={() => setMenuVisible(false)} style={styles.sideMenuClose}>
                <X size={19} color={theme.textSecondary} />
              </Pressable>
            </View>

            {[
              { key: 'social', label: 'Trang chủ', Icon: Newspaper },
              { key: 'explore', label: 'Khám phá', Icon: Compass },
              { key: 'map', label: 'Bản đồ du lịch', Icon: Map },
              { key: 'chat', label: 'Tin nhắn', Icon: MessageCircle },
              { key: 'ticketList', label: 'Vé & chuyến đi', Icon: Ticket },
              { key: 'profile', label: 'Trang cá nhân', Icon: User },
            ].map(item => {
              const Icon = item.Icon;
              return (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [styles.sideMenuItem, pressed && { backgroundColor: theme.searchBg }]}
                  onPress={() => {
                    setMenuVisible(false);
                    if (item.key !== 'social' && onNavigateToTab) onNavigateToTab(item.key);
                  }}
                >
                  <View style={[styles.sideMenuIcon, { backgroundColor: theme.searchBg }]}><Icon size={19} color="#3b82f6" /></View>
                  <Text style={[styles.sideMenuLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                  <ChevronRight size={17} color={theme.textMuted} />
                </Pressable>
              );
            })}

            <Pressable
              style={({ pressed }) => [
                styles.sideMenuItem,
                {
                  marginTop: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.24)',
                  backgroundColor: pressed ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                }
              ]}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  'Đăng xuất tài khoản',
                  'Bạn có muốn đăng xuất tài khoản không?',
                  [
                    { text: 'Không', style: 'cancel' },
                    {
                      text: 'Có',
                      style: 'destructive',
                      onPress: () => onLogout && onLogout(),
                    },
                  ]
                );
              }}
            >
              <View style={[styles.sideMenuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}><X size={19} color="#ef4444" /></View>
              <Text style={[styles.sideMenuLabel, { color: '#ef4444' }]}>Đăng xuất tài khoản</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={notificationVisible} transparent animationType="fade" onRequestClose={() => setNotificationVisible(false)}>
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuDismissArea} onPress={() => setNotificationVisible(false)} />
          <View style={[styles.sideMenu, { backgroundColor: theme.card, borderLeftColor: theme.border }]}>
            <View style={[styles.sideMenuHeader, { borderBottomColor: theme.border }]}>
              <View style={[styles.sideMenuIcon, { backgroundColor: theme.searchBg }]}><BellRing size={19} color="#3b82f6" /></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sideMenuName, { color: theme.textPrimary }]}>Thông báo</Text>
                <Text style={[styles.sideMenuEmail, { color: theme.textSecondary }]} numberOfLines={2}>
                  Chỉ hiển thị thông báo thật từ hoạt động tài khoản của bạn
                </Text>
              </View>
              <Pressable onPress={() => setNotificationVisible(false)} style={styles.sideMenuClose}>
                <X size={19} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
              {incomingRequests.map(item => {
                return (
                  <View
                    key={item._id}
                    style={[styles.notificationItem, { borderBottomColor: theme.border }]}
                  >
                    <Image source={{ uri: item.friend?.avatar || getUserAvatarByName(item.friend?.name) }} style={styles.friendSearchAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.notificationTitle, { color: theme.textPrimary }]}>{item.friend?.name || 'Một thành viên'}</Text>
                      <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>đã gửi cho bạn lời mời kết bạn.</Text>
                      <View style={styles.requestActions}>
                        <Pressable disabled={friendActionId === item._id} onPress={() => handleFriendAction('accept', item._id)} style={styles.acceptRequestButton}>
                          <Text style={styles.requestButtonText}>Đồng ý</Text>
                        </Pressable>
                        <Pressable disabled={friendActionId === item._id} onPress={() => handleFriendAction('reject', item._id)} style={[styles.rejectRequestButton, { borderColor: theme.border }]}>
                          <Text style={[styles.rejectRequestText, { color: theme.textPrimary }]}>Từ chối</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
              {socialNotifications.map(item => {
                const isLike = item.type === 'post_like';
                return (
                  <Pressable key={item._id} style={({ pressed }) => [styles.notificationItem, { borderBottomColor: theme.border }, pressed && { backgroundColor: theme.searchBg }]}
                    onPress={() => {
                      const post = posts.find(postItem => postItem.id === item.postId);
                      if (post) { setNotificationVisible(false); handleOpenComments(post); }
                    }}>
                    <Image source={{ uri: item.actor?.avatar || getUserAvatarByName(item.actor?.name) }} style={styles.friendSearchAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.notificationTitle, { color: theme.textPrimary }]}>{item.actor?.name || 'Một thành viên'}</Text>
                      <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                        {isLike ? 'đã thích bài viết của bạn.' : `đã bình luận: “${item.message}”`}
                      </Text>
                      <Text style={[styles.notificationTime, { color: theme.textMuted }]}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
                    </View>
                    {isLike ? <Heart size={18} color="#ef4444" fill="#ef4444" /> : <MessageSquare size={18} color="#3b82f6" />}
                  </Pressable>
                );
              })}
              {incomingRequests.length === 0 && socialNotifications.length === 0 && (
                <View style={{ paddingHorizontal: 18, paddingVertical: 28 }}>
                  <Text style={[styles.notificationTitle, { color: theme.textPrimary }]}>Chưa có thông báo nào</Text>
                  <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                    Khi có lời mời kết bạn, lượt thích hoặc bình luận mới, chúng sẽ hiển thị ở đây.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* TOAST SHARING FEEDBACK ALERT */}
      {shareAlertVisible && (
        <View style={styles.toastContainer}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.toastGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <CheckCircle size={16} color="#fff" />
            <Text style={styles.toastText}>Đã chia sẻ bài viết thành công!</Text>
          </LinearGradient>
        </View>
      )}

      {/* CREATE POST SCREEN ANIMATED OVERLAY */}
      {isComposerRendered && (
        <Animated.View style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateY: slideAnim }],
            zIndex: 9999,
            backgroundColor: isDarkMode ? '#121212' : '#f0f2f5',
          }
        ]}>
          {/* Navigation Header */}
          <View style={[styles.chatHeader, { backgroundColor: theme.card, borderBottomColor: theme.border, height: Platform.OS === 'android' ? 68 + (StatusBar.currentHeight || 24) : 88, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 40, alignItems: 'center' }]}>
            <Pressable style={styles.backChatBtn} onPress={() => setActiveView('feed')}>
              <X size={20} color={theme.textPrimary} />
            </Pressable>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.chatHeaderName, { color: theme.textPrimary }]}>Tạo bài viết mới</Text>
              <Text style={{ fontSize: 10.5, color: theme.textMuted, fontWeight: '600' }}>Bảng tin du lịch Vivu360</Text>
            </View>
            <Pressable 
              style={({ pressed }) => [
                {
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 12,
                  backgroundColor: '#3b82f6',
                  opacity: pressed ? 0.7 : 1
                }
              ]}
              onPress={handleSubmitPost}
            >
              <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '800' }}>Đăng bài</Text>
            </Pressable>
          </View>

          {/* Scroll Content Form */}
          <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
            {/* User Identity info */}
            <View style={[styles.modalUserRow, { marginBottom: 20 }]}>
              <Image source={{ uri: currentUser.avatar }} style={styles.postAvatar} />
              <View>
                <Text style={[styles.postUserName, { color: theme.textPrimary }]}>{currentUser.name}</Text>
                <Text style={[styles.postTimeText, { color: theme.textMuted }]}>Người đóng góp tin bài</Text>
              </View>
            </View>

            {/* Title Text Input */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6, fontWeight: '700' }]}>
              Tiêu đề bài viết
            </Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginBottom: 16 }]}>
              <Newspaper size={18} color="#3b82f6" />
              <TextInput
                placeholder="Nhập tiêu đề (e.g. Festival Hoa Đà Lạt 2026...)"
                placeholderTextColor={theme.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
                style={[styles.formTextInput, { color: theme.textPrimary }]}
              />
            </View>

            {/* Category Selector Pill Row */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 8, fontWeight: '700' }]}>
              Chuyên mục bài viết
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {['Thời sự', 'Cẩm nang', 'Ẩm thực', 'Sự kiện', 'Khám phá'].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setNewCategory(cat)}
                  style={[
                    styles.categorySelectorPill,
                    newCategory === cat ? styles.categorySelectorPillActive : null,
                    { 
                      borderColor: newCategory === cat ? '#3b82f6' : theme.border,
                      backgroundColor: newCategory === cat ? 'rgba(59, 130, 246, 0.12)' : theme.searchBg
                    }
                  ]}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    fontWeight: '700', 
                    color: newCategory === cat ? '#3b82f6' : theme.textSecondary 
                  }}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Content Text Input */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6, fontWeight: '700' }]}>
              Nội dung chi tiết
            </Text>
            <TextInput
              placeholder="Bạn đang muốn chia sẻ tin tức hay cẩm nang du lịch gì hôm nay thế?"
              placeholderTextColor={theme.textMuted}
              multiline={true}
              numberOfLines={8}
              value={newContent}
              onChangeText={setNewContent}
              style={[
                styles.modalCaptionInput, 
                { 
                  color: theme.textPrimary, 
                  backgroundColor: theme.searchBg, 
                  borderColor: theme.searchBorder, 
                  borderWidth: 1, 
                  borderRadius: 14, 
                  padding: 14, 
                  height: 150,
                  textAlignVertical: 'top',
                  fontSize: 13.5,
                  lineHeight: 20,
                  marginBottom: 20
                }
              ]}
            />

            {/* Location Input */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6, fontWeight: '700' }]}>
              Địa điểm liên quan
            </Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginBottom: 16 }]}>
              <MapPin size={18} color="#3b82f6" />
              <TextInput
                placeholder="Check-in vị trí (e.g. Sapa, Lào Cai...)"
                placeholderTextColor={theme.textMuted}
                value={newLocation}
                onChangeText={setNewLocation}
                style={[styles.formTextInput, { color: theme.textPrimary }]}
              />
            </View>

            {/* Image URL Input */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6, fontWeight: '700' }]}>
              Link ảnh bài viết (tùy chọn)
            </Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginBottom: 30 }]}>
              <ImageIcon size={18} color="#10b981" />
              <TextInput
                placeholder="Dán link hình ảnh minh họa bài viết..."
                placeholderTextColor={theme.textMuted}
                value={newImgUrl}
                onChangeText={setNewImgUrl}
                style={[styles.formTextInput, { color: theme.textPrimary }]}
              />
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flex: 1, width: '100%' },

  // Header styles
  socialHeader: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 44 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  messengerIconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  menuOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.55)' },
  menuDismissArea: { flex: 1 },
  sideMenu: { width: '82%', maxWidth: 340, height: '100%', borderLeftWidth: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 48, paddingHorizontal: 14 },
  sideMenuHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 10, borderBottomWidth: 1 },
  sideMenuAvatar: { width: 48, height: 48, borderRadius: 24 },
  sideMenuName: { fontSize: 15, fontWeight: '900' },
  sideMenuEmail: { fontSize: 10.5, marginTop: 2 },
  sideMenuClose: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  sideMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 58, paddingHorizontal: 8, borderRadius: 12 },
  sideMenuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sideMenuLabel: { flex: 1, fontSize: 13, fontWeight: '800' },
  notificationItem: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  notificationIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notificationTitle: { fontSize: 12.5, fontWeight: '800' },
  notificationMessage: { fontSize: 11, lineHeight: 16, marginTop: 4, fontWeight: '500' },
  notificationTime: { fontSize: 10, marginTop: 6, fontWeight: '600' },
  messengerBadge: { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#fff' },
  socialTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  socialSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 4, lineHeight: 16, marginLeft: 4 },

  // Tab Toggle Buttons
  tabBarContainer: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    padding: 3,
    marginTop: 18,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabBtnActive: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBtnActiveGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  // 1. FEED SCREEN STYLES
  feedSection: { paddingHorizontal: 16, marginTop: 20 },
  createPostTriggerCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  triggerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  triggerAvatar: { width: 38, height: 38, borderRadius: 19 },
  triggerInputContainer: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  triggerDivider: {
    height: 1,
    marginVertical: 12,
  },
  triggerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  triggerActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  triggerActionText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Post Card styles
  postCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  postCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postAvatar: { width: 42, height: 42, borderRadius: 21 },
  postHeaderInfo: { flex: 1 },
  postUserName: { fontSize: 13.5, fontWeight: '800', letterSpacing: -0.2 },
  
  postUserRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postUserRankText: {
    fontSize: 8.5,
    fontWeight: '800',
  },

  postTimeText: { fontSize: 10.5, fontWeight: '500', marginTop: 3 },
  postLocationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  postLocationText: { fontSize: 10, fontWeight: '800' },
  postCaption: { fontSize: 13, lineHeight: 19, marginVertical: 14, fontWeight: '500', letterSpacing: -0.1 },
  postImgContainer: { height: 210, borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  postImage: { width: '100%', height: '100%' },

  postActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8 },
  actionBtnText: { fontSize: 11.5, fontWeight: '800' },

  // 2. GROUPS SCREEN STYLES
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
  enterGroupArrow: { width: 24, height: '100%', alignItems: 'center', justifyContent: 'center' },

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

  modalUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  modalCaptionInput: {
    height: 100,
    fontSize: 14,
    fontWeight: '500',
    textAlignVertical: 'top',
    padding: 0,
    marginBottom: 16,
  },
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

  // Horizontal aligner container for Comments & Active Modal Input
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    gap: 10,
  },

  // Toast feedback styles
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 99,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  // News page style enhancements
  categoriesBarContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  categoriesBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabBtnActive: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  featuredNewsCard: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 18,
    borderWidth: 1,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  featuredBadgeContainer: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredMetaText: {
    color: '#cbd5e1',
    fontSize: 10.5,
    fontWeight: '600',
  },
  newsHeadline: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 8,
  },
  newsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  newsMetaText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  newsExcerpt: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  categorySelectorPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  categorySelectorPillActive: {
    borderColor: '#3b82f6',
  },
  // Search input on social header
  socialSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  socialSearchInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 8,
    paddingVertical: 0,
  },
  friendSearchResults: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  friendSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  friendSearchAvatar: { width: 42, height: 42, borderRadius: 21 },
  friendActionButton: {
    minWidth: 72,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAcceptedButton: { backgroundColor: '#10b981' },
  friendActionButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  requestActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  acceptRequestButton: { backgroundColor: '#3b82f6', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 8 },
  rejectRequestButton: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 8 },
  requestButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  rejectRequestText: { fontSize: 11, fontWeight: '800' },
  friendSearchName: { fontSize: 13, fontWeight: '800', marginBottom: 3 },
  friendSearchContact: { fontSize: 11, fontWeight: '500' },
  emptyFriendSearch: { fontSize: 12, paddingVertical: 14, lineHeight: 18 },

  // Custom Sections
  sectionContainer: {
    paddingVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sectionTitleLabel: {
    fontSize: 14.5,
    fontWeight: '850',
    letterSpacing: -0.2,
  },

  // Popular Cities
  popularCityCard: {
    width: 140,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  popularCityImage: {
    width: '100%',
    height: '100%',
  },
  popularCityContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  popularCityTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
  popularCitySub: {
    color: '#cbd5e1',
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },
  popularCityAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  avatarGroupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGroupItem: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.2,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  activeFriendsCountText: {
    color: '#93c5fd',
    fontSize: 8,
    fontWeight: '800',
  },

  // Companion friends row
  addFriendCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarCheck: {
    alignItems: 'center',
    width: 50,
  },
  friendAvatarWrap: {
    position: 'relative',
  },
  friendAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  friendOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  friendNameMin: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },

  // Custom Trip Cards
  tripPostCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  tripCoverPressable: {
    height: 220,
    position: 'relative',
  },
  tripCoverImage: {
    width: '100%',
    height: '100%',
  },
  tripLocationFloatBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripLocationFloatText: {
    color: '#fff',
    fontSize: 9.5,
    fontWeight: '800',
  },
  tripOverlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  tripDurationText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  tripOverlayTitle: {
    color: '#fff',
    fontSize: 15.5,
    fontWeight: '900',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 3,
  },
  tripCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  tripCompanionAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  addCompanionMiniBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tripActionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tripActionText: {
    fontSize: 11,
    fontWeight: '850',
  },
  authorAvatarMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },

  // Upgraded Trip Details Modal
  tripDetailModalCard: {
    width: '100%',
    height: height * 0.86,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  tripDetailCoverWrapper: {
    height: 220,
    position: 'relative',
  },
  tripDetailCoverImage: {
    width: '100%',
    height: '100%',
  },
  tripDetailCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripDetailHeaderContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  tripDetailCategoryBadge: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: 9,
    fontWeight: '950',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  tripDetailTitleText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
  tripDetailLocationText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  tripDetailCompanionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCompanionAvatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  tripDetailDescription: {
    fontSize: 13.5,
    lineHeight: 22,
    fontWeight: '500',
  },
  itineraryCarouselImage: {
    width: 140,
    height: 95,
    borderRadius: 12,
  },
  tripCategoryFloatBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  tripCategoryFloatText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
