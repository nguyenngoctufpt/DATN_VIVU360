import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, TextInput, Modal, Dimensions, Share, Alert, Platform, StatusBar, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadAppData, saveAppData } from '../services/appDataService';
import { searchFriends } from '../services/userService';
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

const travelFriends = [];

const initialPosts = [];

const initialGroups = [];

const SEEDED_POST_IDS = new Set([1, 2, 3]);

const sanitizePosts = (items) => (
  Array.isArray(items)
    ? items.filter((post) => post && !SEEDED_POST_IDS.has(Number(post.id)))
    : []
);

export function SocialScreen({ ownerId, isDarkMode, theme, currentUser, onNavigateToTab, onLogout, onStartDirectChat }) {
  const [posts, setPosts] = useState(initialPosts);
  const [postsOwnerId, setPostsOwnerId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);

  useEffect(() => {
    if (!ownerId) return;
    let active = true;
    loadAppData(ownerId, 'social')
      .then(saved => {
        if (active) {
          setPosts(sanitizePosts(saved?.posts));
        }
      })
      .catch(error => console.warn('Không thể tải bài viết:', error.message))
      .finally(() => active && setPostsOwnerId(ownerId));
    return () => { active = false; };
  }, [ownerId]);

  useEffect(() => {
    if (!ownerId || postsOwnerId !== ownerId) return;
    const timer = setTimeout(() => {
      saveAppData(ownerId, 'social', { posts })
        .catch(error => console.warn('Không thể lưu bài viết:', error.message));
    }, 500);
    return () => clearTimeout(timer);
  }, [ownerId, postsOwnerId, posts]);

  const mockStories = useMemo(() => [], []);

  const notifications = useMemo(() => [], []);

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
  const handleLikePost = (postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likedByUser: !post.likedByUser,
            likes: post.likedByUser ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
  };

  // Submit Post
  const handleSubmitPost = () => {
    if (!newContent.trim()) return;

    const defaultImages = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80'
    ];
    const finalImg = newImgUrl.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];

    const newPostObj = {
      id: Date.now(),
      title: newTitle.trim() || 'Bản tin nóng du lịch từ bạn đọc',
      category: newCategory,
      source: 'Bạn đọc ' + currentUser.name,
      time: 'Vừa xong',
      location: newLocation.trim() || 'Việt Nam',
      content: newContent,
      image: finalImg,
      likes: 0,
      commentsCount: 0,
      likedByUser: false,
      comments: [],
      user: {
        firebaseUid: ownerId,
        name: currentUser.name,
        avatar: currentUser.avatar,
        level: currentUser.level || 'Cấp 8',
        points: currentUser.points || 8250
      }
    };

    setPosts([newPostObj, ...posts]);
    setNewTitle('');
    setNewLocation('');
    setNewImgUrl('');
    setActiveView('feed');
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
  const handleSendComment = () => {
    if (!commentInput.trim() || !selectedPost) return;

    const newComment = {
      id: Date.now(),
      user: currentUser.name,
      text: commentInput
    };

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === selectedPost.id) {
          const updatedComments = [...(p.comments || []), newComment];
          return {
            ...p,
            comments: updatedComments,
            commentsCount: updatedComments.length
          };
        }
        return p;
      })
    );

    setSelectedPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
      commentsCount: (prev.comments || []).length + 1
    }));

    setCommentInput('');
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

  // Story avatar colors — rainbow rings như trong design
  const STORY_RING_COLORS = [
    ['#f43f5e', '#fb923c'],
    ['#a855f7', '#3b82f6'],
    ['#10b981', '#06b6d4'],
    ['#f59e0b', '#ef4444'],
    ['#6366f1', '#ec4899'],
  ];

  // Mock stories từ popularCities
  const storyItems = [
    { id: 'me', isMe: true, name: 'Story của bạn', avatar: currentUser?.avatar },
    ...popularCities.map((c, i) => ({ id: c.id, name: c.city, avatar: c.avatars[0], ring: STORY_RING_COLORS[i % STORY_RING_COLORS.length] })),
  ];

  return (
    <View style={styles.tabContainer}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={[styles.socialHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {/* Top Row: Search icon | Title | Messenger + Plus */}
        <View style={styles.headerTopRow}>
          <Pressable style={[styles.hdrIconBtn, { backgroundColor: theme.searchBg }]}>
            <Search size={18} color={theme.textPrimary} />
          </Pressable>

          <Text style={[styles.socialTitle, { color: theme.textPrimary }]}>Vivu360</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Messenger icon — điều hướng sang tab Chat */}
            <Pressable
              style={[styles.hdrIconBtn, { backgroundColor: theme.searchBg }]}
              onPress={() => onNavigateToTab && onNavigateToTab('chat')}
            >
              <MessageSquare size={18} color={theme.textPrimary} />
              <View style={styles.messengerBadge}>
                <Text style={styles.messengerBadgeText}>3</Text>
              </View>
            </Pressable>

            {/* Nút tạo bài viết mới */}
            <Pressable
              style={[styles.hdrIconBtn, { backgroundColor: '#2563eb' }]}
              onPress={() => setActiveView('createPost')}
            >
              <Plus size={18} color="#fff" />
            </Pressable>
          </View>
        </View>


        {/* Search bar */}
        <View style={[styles.socialSearchContainer, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
          <Search size={14} color={theme.textMuted} />
          <TextInput
            placeholder="Tìm bài viết, bạn bè..."
            placeholderTextColor={theme.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            style={[styles.socialSearchInput, { color: theme.textPrimary }]}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} style={{ padding: 4 }}>
              <X size={13} color={theme.textMuted} />
            </Pressable>
          )}
        </View>

        {/* ── STORIES BAR ─────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
          {storyItems.map((story, idx) => (
            <Pressable
              key={story.id}
              style={styles.storyItem}
              onPress={() => story.isMe ? setActiveView('createPost') : Alert.alert(story.name, 'Story đang được tải...')}
            >
              {story.isMe ? (
                <View style={[styles.storyAvatarWrap, { borderColor: theme.border }]}>
                  <Image
                    source={{ uri: story.avatar || getUserAvatarByName('me') }}
                    style={styles.storyAvatar}
                  />
                  <View style={styles.storyAddBadge}>
                    <LinearGradient colors={['#2563eb', '#3b82f6']} style={styles.storyAddGrad}>
                      <Plus size={9} color="#fff" strokeWidth={3} />
                    </LinearGradient>
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={story.ring || ['#f43f5e', '#fb923c']}
                  style={styles.storyRingGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.storyRingInner, { backgroundColor: theme.card }]}>
                    <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
                  </View>
                </LinearGradient>
              )}
              <Text style={[styles.storyName, { color: theme.textSecondary }]} numberOfLines={1}>
                {story.isMe ? 'Your story' : story.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ── FEED SCROLL ─────────────────────────────────────────────────── */}
      <ScrollView
        style={{ backgroundColor: isDarkMode ? '#0f1117' : '#f0f2f5' }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Friend search results */}
        {searchText.trim().length >= 2 && (
          <View style={[styles.friendSearchResults, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <Text style={[styles.sectionTitleLabel, { color: theme.textPrimary }]}>Bạn bè trên Vivu360</Text>
            {isSearchingFriends ? (
              <ActivityIndicator color="#3b82f6" style={{ marginVertical: 14 }} />
            ) : friendSearchError ? (
              <Text style={[styles.emptyFriendSearch, { color: '#ef4444' }]}>{friendSearchError}</Text>
            ) : friendResults.length > 0 ? friendResults.map(friend => (
              <Pressable
                key={friend.firebaseUid}
                style={[styles.friendSearchItem, { borderTopColor: theme.border }]}
                onPress={() => { setTargetUsername(friend.name); setProfileModalVisible(true); }}
              >
                <Image source={{ uri: friend.avatar || getUserAvatarByName(friend.name) }} style={styles.friendSearchAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.friendSearchName, { color: theme.textPrimary }]}>{friend.name}</Text>
                  <Text style={[styles.friendSearchContact, { color: theme.textSecondary }]} numberOfLines={1}>
                    {friend.email}{friend.phone ? ` · ${friend.phone}` : ''}
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </Pressable>
            )) : (
              <Text style={[styles.emptyFriendSearch, { color: theme.textSecondary }]}>Không tìm thấy người dùng này.</Text>
            )}
          </View>
        )}

        {/* ── CREATE POST TRIGGER ──────────────────────────────────────── */}
        <View style={[styles.createPostCard, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Pressable style={styles.createPostRow} onPress={() => setActiveView('createPost')}>
            <Image source={{ uri: currentUser?.avatar }} style={styles.createPostAvatar} />
            <View style={[styles.createPostInput, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
              <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '500' }}>
                Bạn đang nghĩ gì, {currentUser?.name?.split(' ')[0]}?
              </Text>
            </View>
          </Pressable>
          <View style={[styles.createPostDivider, { backgroundColor: theme.border }]} />
          <View style={styles.createPostActions}>
            <Pressable style={styles.createPostActionBtn} onPress={() => setActiveView('createPost')}>
              <Camera size={16} color="#ef4444" />
              <Text style={[styles.createPostActionText, { color: theme.textSecondary }]}>Trực tiếp</Text>
            </Pressable>
            <Pressable style={styles.createPostActionBtn} onPress={() => setActiveView('createPost')}>
              <ImageIcon size={16} color="#10b981" />
              <Text style={[styles.createPostActionText, { color: theme.textSecondary }]}>Ảnh/Video</Text>
            </Pressable>
            <Pressable style={styles.createPostActionBtn} onPress={() => setActiveView('createPost')}>
              <MapPin size={16} color="#f59e0b" />
              <Text style={[styles.createPostActionText, { color: theme.textSecondary }]}>Check-in</Text>
            </Pressable>
          </View>
        </View>

        {/* ── POST FEED ────────────────────────────────────────────────── */}
        {(() => {
          if (displayListPosts.length === 0) {
            return (
              <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
                <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 14, textAlign: 'center' }}>
                  {posts.length === 0 ? 'Chưa có bài đăng nào. Hãy chia sẻ chuyến đi đầu tiên!' : 'Không tìm thấy bài viết phù hợp.'}
                </Text>
              </View>
            );
          }
          return displayListPosts.map((post) => (
            <View key={post.id} style={[styles.postCard, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>

              {/* ── Post Header ─────────────────────────────────────── */}
              <View style={styles.postHeader}>
                <Pressable onPress={() => handleOpenUserProfile(post.user?.name || post.source)} style={styles.postHeaderLeft}>
                  <LinearGradient
                    colors={getUserRankColors(post.user?.name || post.source).colors}
                    style={styles.postAvatarRing}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={[styles.postAvatarInner, { backgroundColor: theme.card }]}>
                      <Image
                        source={{ uri: post.user?.avatar || getUserAvatarByName(post.user?.name || post.source) }}
                        style={styles.postAvatar}
                      />
                    </View>
                  </LinearGradient>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.postUserName, { color: theme.textPrimary }]}>
                      {post.user?.name || post.source}
                    </Text>
                    <Text style={[styles.postTimeText, { color: theme.textMuted }]}>{post.time}</Text>
                  </View>
                </Pressable>
                <Pressable style={styles.postMenuBtn} onPress={() => Alert.alert('Tùy chọn', `Bài viết của ${post.user?.name || post.source}`, [
                  { text: 'Lưu bài viết' },
                  { text: 'Báo cáo' },
                  { text: 'Đóng', style: 'cancel' }
                ])}>
                  <View style={styles.postMenuDots}>
                    <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
                    <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
                    <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
                  </View>
                </Pressable>
              </View>

              {/* ── Post Content ─────────────────────────────────────── */}
              <Pressable onPress={() => handleOpenComments(post)} style={styles.postBody}>
                <Text style={[styles.postContentText, { color: theme.textPrimary }]} numberOfLines={3}>
                  {post.content || post.title}
                  {(post.content || post.title).length > 120 ? (
                    <Text style={{ color: '#3b82f6', fontWeight: '700' }}> ...xem thêm</Text>
                  ) : null}
                </Text>
              </Pressable>

              {/* ── Post Media ───────────────────────────────────────── */}
              {post.image && (
                <Pressable onPress={() => handleOpenComments(post)} style={styles.postMediaWrap}>
                  <Image source={{ uri: post.image }} style={styles.postMedia} />
                  {/* Play button overlay for video-like feel */}
                  <View style={styles.playOverlay}>
                    <View style={styles.playBtn}>
                      <View style={styles.playTriangle} />
                    </View>
                  </View>
                  {/* Location chip */}
                  {post.location && (
                    <View style={styles.mediaLocationChip}>
                      <MapPin size={9} color="#fff" fill="#ef4444" />
                      <Text style={styles.mediaLocationText}>{post.location}</Text>
                    </View>
                  )}
                </Pressable>
              )}

              {/* ── Reaction counts ──────────────────────────────────── */}
              <View style={[styles.postReactionBar, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                <Pressable style={styles.reactionItem} onPress={() => handleLikePost(post.id)}>
                  <View style={[styles.reactionIconCircle, { backgroundColor: '#ef4444' }]}>
                    <Heart size={10} color="#fff" fill="#fff" />
                  </View>
                  <Text style={[styles.reactionCount, { color: post.likedByUser ? '#ef4444' : theme.textSecondary }]}>{post.likes || 105}</Text>
                </Pressable>
                <Pressable style={styles.reactionItem} onPress={() => handleOpenComments(post)}>
                  <View style={[styles.reactionIconCircle, { backgroundColor: '#3b82f6' }]}>
                    <MessageSquare size={10} color="#fff" />
                  </View>
                  <Text style={[styles.reactionCount, { color: theme.textSecondary }]}>{post.commentsCount || post.comments?.length || 15}</Text>
                </Pressable>
                <Pressable style={styles.reactionItem} onPress={() => handleSharePost(post)}>
                  <View style={[styles.reactionIconCircle, { backgroundColor: '#06b6d4' }]}>
                    <Share2 size={10} color="#fff" />
                  </View>
                  <Text style={[styles.reactionCount, { color: theme.textSecondary }]}>50</Text>
                </Pressable>
              </View>

              {/* ── Action Buttons ────────────────────────────────────── */}
              <View style={styles.postActions}>
                <Pressable style={styles.postActionBtn} onPress={() => handleLikePost(post.id)}>
                  <Heart
                    size={18}
                    color={post.likedByUser ? '#ef4444' : theme.textSecondary}
                    fill={post.likedByUser ? '#ef4444' : 'transparent'}
                  />
                  <Text style={[styles.postActionText, { color: post.likedByUser ? '#ef4444' : theme.textSecondary }]}>Thích</Text>
                </Pressable>
                <Pressable style={styles.postActionBtn} onPress={() => handleOpenComments(post)}>
                  <MessageSquare size={18} color={theme.textSecondary} />
                  <Text style={[styles.postActionText, { color: theme.textSecondary }]}>Bình luận</Text>
                </Pressable>
                <Pressable style={styles.postActionBtn} onPress={() => handleSharePost(post)}>
                  <Share2 size={18} color={theme.textSecondary} />
                  <Text style={[styles.postActionText, { color: theme.textSecondary }]}>Chia sẻ</Text>
                </Pressable>
              </View>

            </View>
          ));
        })()}
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

                {/* Day-by-Day Itinerary (like screen 3 list in mockup) */}
                <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textSecondary, marginLeft: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Lịch trình chi tiết</Text>
                <View style={{ paddingHorizontal: 16, gap: 12, marginBottom: 24 }}>
                  {selectedPost.itinerary?.length ? selectedPost.itinerary.map((it, idx) => (
                    <View key={idx} style={[styles.itineraryDayCard, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
                      <View style={styles.itineraryDayHeader}>
                        <LinearGradient
                          colors={['#3b82f6', '#60a5fa']}
                          style={styles.itineraryDayBadge}
                        >
                          <Text style={styles.itineraryDayBadgeText}>{it.day}</Text>
                        </LinearGradient>
                      </View>
                      <Text style={[styles.itineraryDayText, { color: theme.textPrimary }]}>{it.text}</Text>
                    </View>
                  )) : (
                    <View style={[styles.itineraryDayCard, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
                      <Text style={[styles.itineraryDayText, { color: theme.textSecondary }]}>
                        B?i vi?t n?y ch?a c? l?ch tr?nh chi ti?t.
                      </Text>
                    </View>
                  )}
                </View>

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
        onStartDirectChat={onStartDirectChat}
      />

      {/* Modal Menu Drawer đã được lược bỏ theo yêu cầu */}


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

  // ── Header ──────────────────────────────────────────────────────────────
  socialHeader: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 52,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  hdrIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  socialSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 4, lineHeight: 16 },

  // ── Search ──────────────────────────────────────────────────────────────
  socialSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    borderWidth: 1,
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  socialSearchInput: { flex: 1, fontSize: 13, fontWeight: '500' },

  // ── Stories ─────────────────────────────────────────────────────────────
  storiesRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 64,
  },
  storyAvatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  storyRingGrad: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    padding: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  storyAddBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  storyAddGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyName: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
    maxWidth: 60,
  },

  // ── Create Post trigger ──────────────────────────────────────────────────
  createPostCard: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 8,
    marginBottom: 0,
  },
  createPostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  createPostAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  createPostInput: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  createPostDivider: {
    height: 1,
    marginHorizontal: -16,
    marginBottom: 8,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  createPostActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  createPostActionText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Post Card ────────────────────────────────────────────────────────────
  postCard: {
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAvatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  postUserName: { fontSize: 13.5, fontWeight: '800' },
  postTimeText: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  postMenuBtn: {
    padding: 8,
  },
  postMenuDots: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  postBody: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  postContentText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  postMediaWrap: {
    marginHorizontal: 0,
    marginBottom: 0,
    position: 'relative',
  },
  postMedia: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#1a1a1a',
    marginLeft: 3,
  },
  mediaLocationChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mediaLocationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  postReactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reactionIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  postActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  postActionText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Legacy — giữ lại các icon btn cũ dùng trong modal
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  messengerIconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  messengerBadge: { position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff', paddingHorizontal: 3 },
  messengerBadgeText: { color: '#fff', fontSize: 8.5, fontWeight: '900', textAlign: 'center' },

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
  itineraryDayCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  itineraryDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itineraryDayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itineraryDayBadgeText: {
    color: '#fff',
    fontSize: 9.5,
    fontWeight: '900',
  },
  itineraryDayText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
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
