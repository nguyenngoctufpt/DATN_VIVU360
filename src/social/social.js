import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, TextInput, Modal, Dimensions, Share, Alert, Platform, StatusBar, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { loadAppData, saveAppData } from '../services/appDataService';
import { createPost, deletePost, updatePost, getFeed, togglePostLike, addPostComment, mapMongoPostToFeedPost } from '../services/postService';
import { searchFriends } from '../services/userService';
import { getFriendships, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../services/friendshipService';
import { getSocialNotifications, markSocialNotificationsRead } from '../services/socialNotificationService';
import { getOrCreateDirectChat } from '../services/chatService';
import { uploadPostImage } from '../services/postService';
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
  User,
  MoreHorizontal,
  Play,
  Bookmark,
  Repeat,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
} from 'lucide-react-native';

import { UserProfileModal } from './userProfile';
import { CreatePostModal } from './createPost';
import { EditPostModal } from './editPostModal';
import { PostCard } from '../components/PostCard';

function getUserLevelByName(name) {
  if (!name) return 'Cấp 1';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `Cấp ${Math.abs(hash % 12) + 3}`;
}

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

const SEEDED_POST_IDS = new Set();

const sanitizePosts = (items) => (
  Array.isArray(items) ? items.filter(Boolean) : []
);

export function SocialScreen({ ownerId, isDarkMode, theme, currentUser, onNavigateToTab, onLogout, onStartDirectChat }) {
  const [posts, setPosts] = useState([]);
  const [postsOwnerId, setPostsOwnerId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [mongoFriends, setMongoFriends] = useState([]);

  useEffect(() => {
    if (!ownerId) return;
    searchFriends('', ownerId)
      .then(users => {
        if (Array.isArray(users) && users.length > 0) {
          setMongoFriends(users);
        }
      })
      .catch(err => console.log('[Social] Tải bạn bè MongoDB:', err.message));
  }, [ownerId]);

  // ── Feed Loading State ─────────────────────────────────────────────
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set());

  const handleToggleBookmark = (postId) => {
    setBookmarkedPostIds((prev) => {
      const next = new Set(prev);
      const strId = String(postId);
      if (next.has(strId)) {
        next.delete(strId);
        Alert.alert('Đã bỏ lưu', 'Đã xóa bài viết khỏi bộ sưu tập.');
      } else {
        next.add(strId);
        Alert.alert('Đã lưu bài viết 🔖', 'Bài viết đã được lưu vào bộ sưu tập cá nhân!');
      }
      return next;
    });
  };

  const targetUserId = ownerId || currentUser?.firebaseUid || currentUser?.id || 'me';

  // ── Load feed từ MongoDB (bao gồm bài của bạn bè và người theo dõi) ─────────
  const fetchFeed = useCallback(async (showRefreshing = false) => {
    if (!targetUserId) return;
    if (showRefreshing) setIsRefreshing(true);
    else setIsFeedLoading(prev => posts.length === 0 ? true : prev);

    try {
      const mongoPosts = await getFeed(targetUserId);
      if (Array.isArray(mongoPosts)) {
        const formatted = mongoPosts.map(mapMongoPostToFeedPost).filter(Boolean);
        setPosts(prevPosts => {
          if (showRefreshing) return formatted;
          const serverIds = new Set(formatted.map(p => String(p._id || p.id)));
          const pendingLocal = prevPosts.filter(p => {
            const isNumericId = typeof (p.id) === 'number';
            const isVeryRecent = isNumericId && (Date.now() - p.id < 30000);
            return isVeryRecent && !serverIds.has(String(p._id || p.id));
          });
          return [...pendingLocal, ...formatted];
        });
        setPostsOwnerId(targetUserId);
      }
    } catch (error) {
      if (error?.message !== 'Network Error') {
        console.log('[Social] Tải feed fallback local:', error.message);
      }
      try {
        const saved = await loadAppData(targetUserId, 'social');
        if (saved?.posts) setPosts(sanitizePosts(saved.posts));
      } catch (_) { }
    } finally {
      setIsRefreshing(false);
      setIsFeedLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (!targetUserId) return;
    let active = true;
    let intervalId;

    const run = async () => {
      if (!active) return;
      await fetchFeed(false);
    };

    run();
    intervalId = setInterval(run, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [targetUserId, fetchFeed]);

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

  // View states within social tab: 'feed'
  const [activeView, setActiveView] = useState('feed');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Edit Post states & handlers
  const [postBeingEdited, setPostBeingEdited] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleOpenEditPost = (targetPost) => {
    setPostBeingEdited(targetPost);
    setEditModalVisible(true);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) =>
        (p.id === updatedPost.id || p._id === updatedPost._id) ? updatedPost : p
      )
    );
  };

  // ── Find Friends Overlay Anim ──────────────────────────────────────────
  const findFriendsSlideAnim = useRef(new Animated.Value(height)).current;
  const [isFindFriendsRendered, setIsFindFriendsRendered] = useState(false);

  // Find Friends — dedicated search state
  const [ffQuery, setFfQuery] = useState('');
  const [ffResults, setFfResults] = useState([]);
  const [ffLoading, setFfLoading] = useState(false);
  const [ffError, setFfError] = useState('');
  const [ffPendingIds, setFfPendingIds] = useState(new Set()); // IDs đang gửi request
  const [ffAcceptedIds, setFfAcceptedIds] = useState(new Set()); // IDs đã kết bạn



  // Find Friends overlay animation
  useEffect(() => {
    if (activeView === 'findFriends') {
      setIsFindFriendsRendered(true);
      Animated.timing(findFriendsSlideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(findFriendsSlideAnim, {
        toValue: height,
        duration: 280,
        useNativeDriver: true,
      }).start(() => setIsFindFriendsRendered(false));
    }
  }, [activeView]);

  // Search in Find Friends screen
  useEffect(() => {
    const query = ffQuery.trim();
    if (!isFindFriendsRendered) return;
    if (query.length === 0) {
      // Load gợi ý (mọi người dùng)
      setFfLoading(true);
      setFfError('');
      searchFriends('', ownerId)
        .then(users => {
          setFfResults(Array.isArray(users) ? users : []);
          // Khởi tạo trạng thái accepted/pending từ friendship data
          const accepted = new Set();
          const pending = new Set();
          (Array.isArray(users) ? users : []).forEach(u => {
            if (u.friendship?.status === 'accepted') accepted.add(u.firebaseUid);
            if (u.friendship?.status === 'pending') pending.add(u.firebaseUid);
          });
          setFfAcceptedIds(accepted);
          setFfPendingIds(pending);
        })
        .catch(e => setFfError('Không thể tải danh sách người dùng.'))
        .finally(() => setFfLoading(false));
      return;
    }
    if (query.length < 2) return;
    let active = true;
    setFfLoading(true);
    setFfError('');
    const timer = setTimeout(() => {
      searchFriends(query, ownerId)
        .then(users => {
          if (!active) return;
          setFfResults(Array.isArray(users) ? users : []);
          const accepted = new Set(ffAcceptedIds);
          const pending = new Set(ffPendingIds);
          (Array.isArray(users) ? users : []).forEach(u => {
            if (u.friendship?.status === 'accepted') accepted.add(u.firebaseUid);
            if (u.friendship?.status === 'pending') pending.add(u.firebaseUid);
          });
          setFfAcceptedIds(accepted);
          setFfPendingIds(pending);
        })
        .catch(e => { if (active) setFfError('Lỗi tìm kiếm. Vui lòng thử lại.'); })
        .finally(() => { if (active) setFfLoading(false); });
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [ffQuery, isFindFriendsRendered, ownerId]);

  // Interactive Comments & Profile States
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  const [targetUsername, setTargetUsername] = useState('');
  const [targetUserUid, setTargetUserUid] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [shareAlertVisible, setShareAlertVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Thời sự');
  const [newContent, setNewContent] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [selectedPostImage, setSelectedPostImage] = useState(null);
  const [isUploadingPostImage, setIsUploadingPostImage] = useState(false);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để tải ảnh bài viết.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewImgUrl(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Lỗi chọn ảnh bài viết:', e.message);
    }
  };

  const [searchText, setSearchText] = useState('');
  const [friendResults, setFriendResults] = useState([]);
  const [isSearchingFriends, setIsSearchingFriends] = useState(false);
  const [friendSearchError, setFriendSearchError] = useState('');

  // Handler gửi lời mời / Theo dõi người dùng
  const handleSendFriendRequest = useCallback(async (targetUser) => {
    if (!ownerId || !targetUser?.firebaseUid) return;
    const targetId = targetUser.firebaseUid;

    // Optimistic update — Theo dõi ngay lập tức
    setFfAcceptedIds(prev => new Set([...prev, targetId]));

    try {
      const { sendFriendRequest } = require('../services/friendshipService');
      await sendFriendRequest(ownerId, targetId);
    } catch (err) {
      // Rollback nếu lỗi
      setFfAcceptedIds(prev => { const s = new Set(prev); s.delete(targetId); return s; });
      Alert.alert('Lỗi', 'Không thể theo dõi người dùng này. Vui lòng thử lại.');
      console.log('[FindFriends] Theo dõi thất bại:', err.message);
    }
  }, [ownerId]);

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

  const normalizeCategory = (cat) => {
    const c = String(cat || '').toLowerCase().trim();
    if (c.includes('khám phá') || c.includes('check-in') || c.includes('360')) return 'Khám phá';
    if (c.includes('cẩm nang') || c.includes('kinh nghiệm') || c.includes('mẹo')) return 'Cẩm nang';
    if (c.includes('ẩm thực') || c.includes('ăn uống') || c.includes('quán')) return 'Ẩm thực';
    if (c.includes('sự kiện') || c.includes('lễ hội')) return 'Sự kiện';
    if (c.includes('thời sự') || c.includes('tin tức')) return 'Thời sự';
    return 'Khám phá';
  };

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(post => {
        const normCat = normalizeCategory(post.category);
        const rawCat = (post.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        return normCat === selectedCategory || rawCat.includes(selCat);
      });
    }
    if (searchText.trim().length > 0) {
      const query = searchText.toLowerCase().trim();
      result = result.filter(post =>
        (post.location || '').toLowerCase().includes(query) ||
        (post.title || '').toLowerCase().includes(query) ||
        (post.content || '').toLowerCase().includes(query) ||
        (post.category || '').toLowerCase().includes(query) ||
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
        if (post.id === postId || post._id === postId) {
          const newLiked = !post.likedByUser;
          return {
            ...post,
            likedByUser: newLiked,
            likes: newLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 0) - 1)
          };
        }
        return post;
      })
    );

    if (ownerId) {
      togglePostLike(ownerId, postId)
        .catch(err => console.warn('[Social] Đồng bộ like MongoDB thất bại:', err.message));
    }
  };
  // Delete Post handler
  const handleDeletePost = (targetPostId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài viết này khỏi bảng tin không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa bài viết',
          style: 'destructive',
          onPress: async () => {
            const updatedPosts = posts.filter(p => p.id !== targetPostId && p._id !== targetPostId);
            setPosts(updatedPosts);
            if (ownerId) {
              saveAppData(ownerId, 'social', { posts: updatedPosts })
                .catch(err => console.warn('[Social] Cập nhật AppData sau xóa bài thất bại:', err.message));
              deletePost(ownerId, targetPostId)
                .catch(err => console.warn('[Social] Xóa bài viết từ MongoDB thất bại:', err.message));
            }
          }
        }
      ]
    );
  };

  const handlePickPostImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập ảnh', 'Vui lòng cho phép Vivu360 truy cập thư viện ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setSelectedPostImage(result.assets[0]);
        setNewImgUrl('');
      }
    } catch (error) {
      console.warn('Không thể chọn ảnh:', error);
      Alert.alert('Ảnh bài viết', 'Không thể mở thư viện ảnh.');
    }
  };

  const handleSubmitPost = async () => {
    if (!newContent.trim()) {
      Alert.alert('Đăng bài', 'Vui lòng nhập nội dung bài viết.');
      return;
    }
    try {
      setIsUploadingPostImage(true);
      let finalImg = '';
      if (selectedPostImage) {
        finalImg = await uploadPostImage(ownerId, selectedPostImage);
      }
      await createPost(ownerId, {
        content: newContent.trim(),
        category: newCategory,
        location: newLocation.trim() || 'Việt Nam',
        images: finalImg ? [finalImg] : [],
      });
      fetchFeed(true);
      setNewTitle('');
      setNewContent('');
      setNewLocation('');
      setNewImgUrl('');
      setSelectedPostImage(null);
      setActiveView('feed');
    } catch (error) {
      Alert.alert('Đăng bài thất bại', error.response?.data?.message || error.message || 'Không thể đăng bài. Vui lòng thử lại.');
    } finally {
      setIsUploadingPostImage(false);
    }
  };

  // Open User Profile view modal
  const handleOpenUserProfile = (username, userUid = null) => {
    setTargetUserUid(userUid || null);
    setTargetUsername(username || '');
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

    const textToSend = commentInput.trim();
    const targetId = selectedPost.id || selectedPost._id;

    const newComment = {
      id: Date.now(),
      user: currentUser.name,
      text: textToSend
    };

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === targetId || p._id === targetId) {
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

    if (ownerId) {
      addPostComment(ownerId, targetId, textToSend)
        .catch(err => console.warn('[Social] Đồng bộ bình luận MongoDB thất bại:', err.message));
    }

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

  // Real MongoDB friends story items
  const storyItems = useMemo(() => {
    const list = [
      { id: 'me', isMe: true, name: 'Story của bạn', avatar: currentUser?.avatar || getUserAvatarByName('me') }
    ];

    if (mongoFriends.length > 0) {
      mongoFriends.forEach((f, i) => {
        list.push({
          id: f.firebaseUid || f.id || i,
          name: f.name,
          avatar: f.avatar || getUserAvatarByName(f.name),
          ring: STORY_RING_COLORS[i % STORY_RING_COLORS.length],
          userUid: f.firebaseUid,
        });
      });
    } else {
      popularCities.forEach((c, i) => {
        list.push({
          id: c.id,
          name: c.city,
          avatar: c.avatars[0],
          ring: STORY_RING_COLORS[i % STORY_RING_COLORS.length],
        });
      });
    }

    return list;
  }, [mongoFriends, currentUser]);

  return (
    <View style={styles.tabContainer}>

      {/* ── HEADER (Vivu360 Social Feed Header) ─────────────────────────────────── */}
      <View style={[styles.socialHeader, { backgroundColor: isDarkMode ? '#12101d' : '#fcf4ef', borderBottomWidth: 0, paddingBottom: 10 }]}>
        {/* Top Row: Title "Bảng tin Vivu360" on left | Action Buttons on right */}
        <View style={styles.headerTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={20} color="#f43f5e" />
            <Text style={[styles.socialTitle, { color: isDarkMode ? '#f8fafc' : '#1e1b2e', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }]}>Bảng tin Vivu360</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Icon Notifications */}
            <Pressable
              style={[styles.hdrIconBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', position: 'relative' }]}
              onPress={() => Alert.alert('Thông báo', 'Bạn có 3 thông báo tương tác mới!')}
            >
              <Send size={17} color={isDarkMode ? '#f8fafc' : '#1e1b2e'} style={{ transform: [{ rotate: '-25deg' }] }} />
              <View style={[styles.messengerBadge, { backgroundColor: '#f43f5e' }]}>
                <Text style={styles.messengerBadgeText}>3</Text>
              </View>
            </Pressable>

            {/* Nút Tìm kiếm bạn bè */}
            <Pressable
              style={[styles.hdrIconBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
              onPress={() => { setFfQuery(''); setActiveView('findFriends'); }}
            >
              <Users size={17} color={isDarkMode ? '#f8fafc' : '#1e1b2e'} />
            </Pressable>

            {/* Icon Chat Messenger */}
            <Pressable
              style={[styles.hdrIconBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
              onPress={() => onNavigateToTab && onNavigateToTab('chat')}
            >
              <MessageSquare size={17} color={isDarkMode ? '#f8fafc' : '#1e1b2e'} />
            </Pressable>

            {/* Nút Đăng Bài (+ ) */}
            <Pressable
              style={[styles.squarePlusBtn, { backgroundColor: '#f43f5e', borderColor: '#f43f5e' }]}
              onPress={() => setIsCreatePostModalOpen(true)}
            >
              <Plus size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* ── Search Bar Input ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
            borderRadius: 14,
            paddingHorizontal: 12,
            height: 40,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          }}>
            <Search size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
            <TextInput
              placeholder="Tìm kiếm địa điểm, bài viết, trải nghiệm..."
              placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
              value={searchText}
              onChangeText={setSearchText}
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 13,
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#1e1b2e',
                paddingVertical: 0,
              }}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')}>
                <X size={15} color={isDarkMode ? '#94a3b8' : '#64748b'} />
              </Pressable>
            )}
          </View>
        </View>


      </View>

      {/* ── FEED SCROLL STREAM ───────────────────────────────────────────── */}
      <ScrollView
        style={{ backgroundColor: isDarkMode ? '#12101d' : '#fcf4ef' }}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchFeed(true)}
            tintColor={isDarkMode ? '#f43f5e' : '#e11d48'}
            colors={['#f43f5e', '#3b82f6']}
            title="Kéo xuống để làm mới..."
            titleColor={isDarkMode ? '#94a3b8' : '#64748b'}
          />
        }
      >
        {/* Quick Post Creation Composer Card */}
        <View style={{
          marginHorizontal: 16,
          marginTop: 4,
          marginBottom: 14,
          backgroundColor: isDarkMode ? '#1e1a2e' : '#ffffff',
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          shadowColor: isDarkMode ? '#000' : '#d6c4b8',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={{ uri: currentUser?.avatar || getUserAvatarByName('me') }}
              style={{ width: 38, height: 38, borderRadius: 19 }}
            />
            <Pressable
              style={{
                flex: 1,
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 9,
              }}
              onPress={() => setIsCreatePostModalOpen(true)}
            >
              <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12.5, fontWeight: '500' }}>
                {currentUser?.name ? `Bạn đang đi đâu, ${currentUser.name.split(' ').pop()}? Chia sẻ ngay...` : 'Bạn đang đi đâu? Chia sẻ trải nghiệm...'}
              </Text>
            </Pressable>
          </View>

          <View style={{ height: 1, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', marginVertical: 10 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              onPress={() => setIsCreatePostModalOpen(true)}
            >
              <ImageIcon size={16} color="#10b981" />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: isDarkMode ? '#cbd5e1' : '#475569' }}>Hình ảnh</Text>
            </Pressable>

            <View style={{ width: 1, height: 14, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              onPress={() => setIsCreatePostModalOpen(true)}
            >
              <MapPin size={16} color="#f43f5e" />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: isDarkMode ? '#cbd5e1' : '#475569' }}>Check-in</Text>
            </Pressable>

            <View style={{ width: 1, height: 14, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              onPress={() => setIsCreatePostModalOpen(true)}
            >
              <Sparkles size={16} color="#8b5cf6" />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: isDarkMode ? '#cbd5e1' : '#475569' }}>Cảm nghĩ</Text>
            </Pressable>
          </View>
        </View>
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
                onPress={() => handleOpenUserProfile(friend.name, friend.firebaseUid)}
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
          return displayListPosts.map((post, postIdx) => (
            <PostCard
              key={post.id || post._id || postIdx}
              post={post}
              theme={theme}
              isDarkMode={isDarkMode}
              onOpenProfile={handleOpenUserProfile}
              onLike={handleLikePost}
              onComment={handleOpenComments}
              onShare={handleSharePost}
              onBookmark={handleToggleBookmark}
              isBookmarked={bookmarkedPostIds.has(String(post.id || post._id))}
              onMoreOptions={(targetPost) => {
                const isOwner =
                  (targetPost.user?.firebaseUid && targetPost.user.firebaseUid === ownerId) ||
                  targetPost.user?.name === currentUser?.name ||
                  targetPost.source === 'Bạn đọc ' + currentUser?.name ||
                  targetPost.source === currentUser?.name;

                const menuOptions = [];
                if (isOwner) {
                  menuOptions.push({
                    text: '✏️ Chỉnh sửa bài viết',
                    onPress: () => handleOpenEditPost(targetPost)
                  });
                  menuOptions.push({
                    text: '🗑️ Xóa bài viết',
                    style: 'destructive',
                    onPress: () => handleDeletePost(targetPost.id || targetPost._id)
                  });
                }
                menuOptions.push(
                  { text: '🔖 Lưu bài viết', onPress: () => handleToggleBookmark(targetPost.id || targetPost._id) },
                  { text: '🚩 Báo cáo', onPress: () => Alert.alert('Thông báo', 'Đã gửi báo cáo bài viết.') },
                  { text: 'Đóng', style: 'cancel' }
                );

                Alert.alert(
                  'Tùy chọn bài viết',
                  `Bài viết của ${targetPost.user?.name || targetPost.source}`,
                  menuOptions
                );
              }}
            />
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
                  <Pressable
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}
                    onPress={() => {
                      setCommentModalVisible(false);
                      handleOpenUserProfile(selectedPost.user?.name || selectedPost.source, selectedPost.user?.firebaseUid || selectedPost.authorId);
                    }}
                  >
                    <Image source={{ uri: selectedPost.user?.avatar || getUserAvatarByName(selectedPost.source) }} style={styles.postAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.postUserName, { color: theme.textPrimary }]}>{selectedPost.user?.name || selectedPost.source}</Text>
                      <Text style={{ fontSize: 10.5, color: theme.textMuted }}>{selectedPost.time} • Tác giả ký sự</Text>
                    </View>
                  </Pressable>
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
                        Bài viết này chưa có lịch trình chi tiết.
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

      {/* STANDALONE CREATE POST MODAL */}
      <CreatePostModal
        visible={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        ownerId={ownerId}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        theme={theme}
        onPostCreated={(newPost) => {
          setPosts(prev => [newPost, ...prev]);
          setShareAlertVisible(true);
          setTimeout(() => setShareAlertVisible(false), 3000);
        }}
      />

      {/* USER PROFILE MODAL INJECTION */}
      <UserProfileModal
        username={targetUsername}
        targetUid={targetUserUid}
        visible={profileModalVisible}
        onClose={() => { setProfileModalVisible(false); setTargetUserUid(null); }}
        isDarkMode={isDarkMode}
        theme={theme}
        currentUser={currentUser}
        onStartDirectChat={onStartDirectChat}
        ownerId={ownerId}
      />

      {/* EDIT POST MODAL */}
      <EditPostModal
        visible={editModalVisible}
        post={postBeingEdited}
        onClose={() => setEditModalVisible(false)}
        onPostUpdated={handlePostUpdated}
        ownerId={ownerId}
        isDarkMode={isDarkMode}
        theme={theme}
      />

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

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FIND FRIENDS OVERLAY — slide-up animated full screen              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isFindFriendsRendered && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: isDarkMode ? '#0f0d1a' : '#f8f9ff',
              zIndex: 200,
              transform: [{ translateY: findFriendsSlideAnim }],
            },
          ]}
        >
          {/* ── Top Bar ── */}
          <View
            style={{
              paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 54,
              paddingHorizontal: 16,
              paddingBottom: 12,
              backgroundColor: isDarkMode ? '#0f0d1a' : '#f8f9ff',
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Pressable
                onPress={() => { setFfQuery(''); setFfResults([]); setActiveView('feed'); }}
                style={{
                  width: 38, height: 38, borderRadius: 19,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} color={isDarkMode ? '#f8fafc' : '#1e1b2e'} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDarkMode ? '#f8fafc' : '#1e1b2e', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 }}>
                  👥 Tìm Bạn Bè
                </Text>
                <Text style={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: '600', marginTop: 1 }}>
                  Kết nối với du khách trên Vivu360
                </Text>
              </View>
            </View>

            {/* Search bar */}
            <View
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: isDarkMode ? '#1a1728' : '#ffffff',
                borderRadius: 18, paddingHorizontal: 14, height: 46,
                borderWidth: 1.5,
                borderColor: ffQuery.length > 0
                  ? '#f43f5e'
                  : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                shadowColor: ffQuery.length > 0 ? '#f43f5e' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: ffQuery.length > 0 ? 0.15 : 0.04,
                shadowRadius: 6,
                elevation: ffQuery.length > 0 ? 3 : 1,
              }}
            >
              <Search size={17} color={ffQuery.length > 0 ? '#f43f5e' : (isDarkMode ? '#64748b' : '#94a3b8')} />
              <TextInput
                value={ffQuery}
                onChangeText={setFfQuery}
                placeholder="Tìm theo tên, email, số điện thoại..."
                placeholderTextColor={isDarkMode ? '#475569' : '#94a3b8'}
                autoCapitalize="none"
                autoCorrect={false}
                style={{ flex: 1, color: isDarkMode ? '#f8fafc' : '#1e1b2e', fontSize: 13.5, fontWeight: '600' }}
              />
              {ffQuery.length > 0 && (
                <Pressable onPress={() => setFfQuery('')} hitSlop={8}>
                  <X size={15} color={isDarkMode ? '#64748b' : '#94a3b8'} />
                </Pressable>
              )}
            </View>
          </View>

          {/* ── Result List ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Section label */}
            <Text style={{ color: isDarkMode ? '#475569' : '#94a3b8', fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
              {ffQuery.trim().length === 0 ? '🌐 Thành viên Vivu360' : `🔍 Kết quả cho "${ffQuery}"`}
            </Text>

            {/* Loading */}
            {ffLoading && (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <ActivityIndicator size="large" color="#f43f5e" />
                <Text style={{ color: isDarkMode ? '#64748b' : '#94a3b8', marginTop: 10, fontSize: 12.5, fontWeight: '600' }}>
                  Đang tìm kiếm...
                </Text>
              </View>
            )}

            {/* Error */}
            {!ffLoading && ffError.length > 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 34, marginBottom: 10 }}>⚠️</Text>
                <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13, textAlign: 'center' }}>{ffError}</Text>
                <Pressable
                  onPress={() => setFfQuery(q => q + ' ')}
                  style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden' }}
                >
                  <LinearGradient colors={['#f43f5e', '#e11d48']} style={{ paddingHorizontal: 20, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <RefreshCw size={13} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '800' }}>Thử lại</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}

            {/* Empty state */}
            {!ffLoading && ffError.length === 0 && ffResults.length === 0 && ffQuery.trim().length >= 2 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 36, marginBottom: 10 }}>🔍</Text>
                <Text style={{ color: isDarkMode ? '#f8fafc' : '#1e1b2e', fontWeight: '800', fontSize: 14 }}>Không tìm thấy</Text>
                <Text style={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                  Thử tìm bằng tên hoặc email khác
                </Text>
              </View>
            )}

            {/* User cards */}
            {!ffLoading && ffResults.map((user) => {
              const isMe = user.firebaseUid === ownerId;
              if (isMe) return null;

              const isAccepted = ffAcceptedIds.has(user.firebaseUid);
              const isPending = ffPendingIds.has(user.firebaseUid);
              const isIncoming = !isAccepted && !isPending && user.friendship?.status === 'pending' && user.friendship?.direction === 'incoming';

              return (
                <View
                  key={user.firebaseUid}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: isDarkMode ? '#1a1728' : '#ffffff',
                    borderRadius: 20, padding: 14, marginBottom: 10,
                    borderWidth: 1,
                    borderColor: isAccepted
                      ? 'rgba(16,185,129,0.25)'
                      : (isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  {/* Avatar */}
                  <Pressable
                    onPress={() => handleOpenUserProfile(user.name, user.firebaseUid)}
                    style={{ position: 'relative' }}
                  >
                    <LinearGradient
                      colors={isAccepted ? ['#10b981', '#059669'] : ['#f43f5e', '#3b82f6']}
                      style={{ width: 54, height: 54, borderRadius: 27, padding: 2, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Image
                        source={{ uri: user.avatar || `https://i.pravatar.cc/150?u=${user.firebaseUid}` }}
                        style={{ width: 50, height: 50, borderRadius: 25 }}
                      />
                    </LinearGradient>
                    {isAccepted && (
                      <View style={{ position: 'absolute', bottom: 0, right: 0, width: 17, height: 17, borderRadius: 8.5, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: isDarkMode ? '#1a1728' : '#fff' }}>
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>

                                     {user.bio ? (
                        <Text style={{ color: isDarkMode ? '#475569' : '#cbd5e1', fontSize: 10.5, fontWeight: '500' }} numberOfLines={1}>
                          • {user.bio}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Action Button */}
                  <View style={{ gap: 6, alignItems: 'center' }}>
                    {isAccepted ? (
                      <Pressable
                        onPress={() => handleOpenUserProfile(user.name, user.firebaseUid)}
                        style={{
                          width: 40, height: 40, borderRadius: 20,
                          backgroundColor: 'rgba(16,185,129,0.12)',
                          borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.3)',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <UserCheck size={17} color="#10b981" />
                      </Pressable>
                    ) : isPending ? (
                      <View
                        style={{
                          width: 40, height: 40, borderRadius: 20,
                          backgroundColor: 'rgba(245,158,11,0.10)',
                          borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.3)',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Clock size={17} color="#f59e0b" />
                      </View>
                    ) : isIncoming ? (
                      <Pressable
                        onPress={() => handleSendFriendRequest(user)}
                        style={{ borderRadius: 14, overflow: 'hidden' }}
                      >
                        <LinearGradient
                          colors={['#3b82f6', '#6366f1']}
                          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}
                        >
                          <UserCheck size={17} color="#fff" />
                        </LinearGradient>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => handleSendFriendRequest(user)}
                        style={{ borderRadius: 14, overflow: 'hidden' }}
                      >
                        <LinearGradient
                          colors={['#f43f5e', '#e11d48']}
                          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <UserPlus size={17} color="#fff" />
                        </LinearGradient>
                      </Pressable>
                    )}

                    {/* Nhắn tin */}
                    <Pressable
                      onPress={() => {
                        setActiveView('feed');
                        onStartDirectChat && onStartDirectChat({ name: user.name, avatar: user.avatar });
                      }}
                      style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <MessageCircle size={17} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {/* Footer hint */}
            {!ffLoading && ffResults.length > 0 && (
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <Text style={{ color: isDarkMode ? '#334155' : '#cbd5e1', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
                  Tìm thấy {ffResults.filter(u => u.firebaseUid !== ownerId).length} người dùng
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

    </View>
  );
}me.textSecondary,
      marginBottom: 6,
      fontWeight: '700',
    },
  ]}
>
  Ảnh bài viết (tùy chọn)
</Text>

{/* Nút chọn ảnh */}
<Pressable
  onPress={handlePickPostImage}
  style={[
    styles.formInputGroup,
    {
      backgroundColor: theme.searchBg,
      borderColor: theme.searchBorder,
      marginBottom: selectedPostImage ? 12 : 30,
    },
  ]}
>
  <ImageIcon size={18} color="#10b981" />

  <Text
    style={[
      styles.formTextInput,
      {
        color: selectedPostImage
          ? theme.textPrimary
          : theme.textMuted,
      },
    ]}
  >
    {selectedPostImage
      ? 'Đã chọn ảnh - Nhấn để chọn ảnh khác'
      : 'Chọn ảnh từ thư viện điện thoại...'}
  </Text>
</Pressable>

{/* Xem trước ảnh đã chọn */}
{selectedPostImage && (
  <View
    style={{
      position: 'relative',
      marginBottom: 30,
    }}
  >
    <Image
      source={{ uri: selectedPostImage.uri }}
      style={{
        width: '100%',
        height: 220,
        borderRadius: 14,
        backgroundColor: theme.searchBg,
      }}
      resizeMode="cover"
    />

    {/* Nút X để bỏ ảnh */}
    <Pressable
      onPress={() => setSelectedPostImage(null)}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <X size={18} color="#ffffff" />
    </Pressable>
  </View>
)}
>>>>>>> origin/truong-update
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
  squarePlusBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
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
    position: 'relative',
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
  storySmallDotBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#fff',
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
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
    maxWidth: 64,
  },

  // ── Create Post trigger ──────────────────────────────────────────────────
  createPostCard: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    paddingBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  postUserName: { fontSize: 14.5, fontWeight: '800' },
  postTimeText: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  postMenuBtn: {
    padding: 6,
  },
  postBody: {
    marginBottom: 12,
  },
  postContentText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  postMediaWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  postMedia: {
    width: '100%',
    height: 230,
    borderRadius: 18,
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
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  playCircleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  mediaLocationChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mediaLocationText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  postReactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 2,
    gap: 10,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  reactionIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionCount: {
    fontSize: 12.5,
    fontWeight: '800',
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
