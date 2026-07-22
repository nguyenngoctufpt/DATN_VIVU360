import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Animated, ActivityIndicator, LogBox, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Home,
  Globe,
  Scan,
  Map as MapIcon,
  User,
  Newspaper,
  MessageSquare,
  X,
} from 'lucide-react-native';

import {
  HomeScreen,
  ExploreScreen,
  CameraScreen,
  ProfileScreen,
  PlaceDetailScreen,
  AllDiaDiem,
  DiaDiemDetails,
  ProfileFeedScreen,
} from './screens';

import { VietnamTravelWebScreen, VirtualTourScreen, ProvinceGalleryScreen } from './map';
import { SocialScreen, UserProfileModal } from './social';
import { ChatScreen } from './chat';
import { EditProfileScreen, MembershipTiersScreen, TravelChallengesScreen } from './settings';
import { LoginScreen, RegisterScreen } from './auth';
import { auth } from './auth/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendLocalNotification } from './auth/notificationHelper';
import { loadAppData, saveAppData } from './services/appDataService';
import { syncUser, searchFriends } from './services/userService';
import { createChatGroup, getChatGroups, getChatMessages } from './services/chatService';
import Constants from 'expo-constants';

const getHostIp = () => {
  let host = Constants.expoConfig?.hostUri;
  if (!host && Constants.manifest) {
    host = Constants.manifest.debuggerHost;
  }
  if (!host && Constants.manifest2?.extra?.expoGo) {
    host = Constants.manifest2.extra.expoGo.debuggerHost;
  }
  if (host) {
    const ip = host.split(':')[0];
    if (ip) return ip;
  }
  return '192.168.100.101'; // Default fallback IP
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

LogBox.ignoreLogs([
  '@firebase/auth: Auth',
  'Firebase Auth state listener timed out'
]);

import {
  banners,
  allCategories,
  getTheme,
} from './data';

export default function App() {
  const [activeNav, setActiveNav] = useState('home');
  const [prevNav, setPrevNav] = useState('home');
  const activeNavRef = React.useRef(activeNav);

  useEffect(() => {
    if (activeNavRef.current !== activeNav) {
      const prev = activeNavRef.current;
      setPrevNav(prev);
      activeNavRef.current = activeNav;
    }
  }, [activeNav]);

  const [currentBanner, setCurrentBanner] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDiaDiem, setSelectedDiaDiem] = useState(null);

  // Search & Navigation sync states
  const [exploreTag, setExploreTag] = useState('all');
  const [exploreSearch, setExploreSearch] = useState('');

  // Tour navigation states
  const [selectedTourId, setSelectedTourId] = useState(1);
  const [selectedSpotIdx, setSelectedSpotIdx] = useState(0);

  // Province gallery navigation states
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedPlaceName, setSelectedPlaceName] = useState('');

  // Ticket selection state
  const [selectedTicketCode, setSelectedTicketCode] = useState(null);

  // Auth navigation states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authRoute, setAuthRoute] = useState('login'); // 'login' | 'register'
  const [dataOwnerId, setDataOwnerId] = useState(null);
  const [appDataLoaded, setAppDataLoaded] = useState(false);

  // UserProfile modal state
  const [viewingProfileName, setViewingProfileName] = useState(null);

  // Direct Chat states
  const [targetDirectChatGroupId, setTargetDirectChatGroupId] = useState(null);

  const handleStartDirectChat = async (targetUser) => {
    if (!dataOwnerId) {
      Alert.alert('Trò chuyện', 'Bạn cần đăng nhập để nhắn tin.');
      return;
    }
    
    let targetUid = null;
    try {
      const results = await searchFriends(targetUser.name, dataOwnerId);
      if (results && results.length > 0) {
        const found = results.find(u => u.name === targetUser.name) || results[0];
        targetUid = found.firebaseUid || found.id;
      }
    } catch (e) {
      console.warn("Tìm kiếm user chat thất bại:", e.message);
    }

    if (!targetUid) {
      let hash = 0;
      for (let i = 0; i < targetUser.name.length; i++) {
        hash = targetUser.name.charCodeAt(i) + ((hash << 5) - hash);
      }
      targetUid = `mock_uid_${Math.abs(hash)}`;
    }

    try {
      const groupData = await createChatGroup({
        name: targetUser.name,
        avatar: targetUser.avatar || "",
        ownerId: dataOwnerId,
        memberIds: [targetUid],
        isDirect: true
      });
      if (groupData) {
        setTargetDirectChatGroupId(groupData._id || groupData.id);
        setActiveNav('chat');
      }
    } catch (error) {
      console.warn("Tạo nhóm chat direct thất bại, dùng offline fallback:", error.message);
      const mockGroupId = `group_direct_${targetUid}`;
      setTargetDirectChatGroupId(mockGroupId);
      setActiveNav('chat');
    }
  };

  // Booked tickets state
  const [bookedTickets, setBookedTickets] = useState([
    {
      code: 'VV360-HL4829',
      title: 'Vịnh Hạ Long',
      region: 'Quảng Ninh',
      date: '2026-06-18',
      guests: 2,
      price: '2.500.000đ',
      status: 'Đã xác nhận'
    }
  ]);

  // Light/Dark Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode]);

  // Bottom navigation show/hide scroll anim state
  const lastOffsetY = React.useRef(0);
  const isNavVisible = React.useRef(true);
  const translateY = React.useRef(new Animated.Value(0)).current;

  // Top In-App Notification Banner State & Anim
  const [activeBanner, setActiveBanner] = useState(null);
  const bannerTranslateY = React.useRef(new Animated.Value(-140)).current;
  const bannerTimerRef = React.useRef(null);

  const showInAppBanner = (bannerData) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setActiveBanner(bannerData);
    Animated.spring(bannerTranslateY, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    bannerTimerRef.current = setTimeout(() => {
      hideInAppBanner();
    }, 4500);
  };

  const hideInAppBanner = () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    Animated.timing(bannerTranslateY, {
      toValue: -140,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setActiveBanner(null));
  };

  // Track activeNav change to reset bottom nav visibility
  useEffect(() => {
    isNavVisible.current = true;
    Animated.timing(translateY, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [activeNav]);

  const handleScroll = (event) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    const diffY = currentOffsetY - lastOffsetY.current;

    // Minimum scroll movement to change visibility
    if (Math.abs(diffY) > 15) {
      if (diffY > 0 && currentOffsetY > 100) {
        // Scroll down -> Hide bottom bar
        if (isNavVisible.current) {
          isNavVisible.current = false;
          Animated.timing(translateY, {
            toValue: 120, // Slide down completely
            duration: 220,
            useNativeDriver: true,
          }).start();
        }
      } else if (diffY < 0 || currentOffsetY <= 30) {
        // Scroll up or close to top -> Show bottom bar
        if (!isNavVisible.current) {
          isNavVisible.current = true;
          Animated.timing(translateY, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }).start();
        }
      }
      lastOffsetY.current = currentOffsetY;
    }
  };

  // Global User Info State (synchronized across all views)
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Minh',
    email: 'minh.nguyen@vivu360.vn',
    avatar: 'https://i.pravatar.cc/150?img=68',
    phone: '0987654321',
    bio: 'Thích tìm hiểu lịch sử, danh lam thắng cảnh. Thích trải nghiệm tham quan ảo AR 360 độ trên Vivu360! 🌐🎒',
    level: 'Cấp 8',
    points: 8250,
    checkedIn: [1], // Checked-in places log (1 represents Vịnh Hạ Long)
  });

  const syncUserProfile = async (firebaseUser) => {
    const email = firebaseUser.email;
    const name = firebaseUser.displayName || email.split('@')[0];
    setUserInfo(prev => ({
      ...prev,
      name: name,
      email: email,
    }));
    // Sync to MongoDB backend (graceful fail if no backend)
    syncUser({
      firebaseUid: firebaseUser.uid,
      email: email,
      name: name,
    }).catch(e => console.log('[App] Sync user:', e.message));
  };

  useEffect(() => {
    // Force loading spinner to disappear after 3.5 seconds to prevent being stuck forever
    const timer = setTimeout(() => {
      console.log("Firebase Auth state listener timed out. Forcing authLoading to false.");
      setAuthLoading(false);
    }, 3500);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timer);
      if (user) {
        setIsLoggedIn(true);
        setDataOwnerId(user.uid);
        syncUserProfile(user);
      } else {
        setIsLoggedIn(false);
        setDataOwnerId(null);
        setAppDataLoaded(false);
      }
      setAuthLoading(false);
    });
    
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Load cloud app data when user logs in
  useEffect(() => {
    if (!dataOwnerId) return;
    let active = true;
    setAppDataLoaded(false);
    loadAppData(dataOwnerId, 'main')
      .then(saved => {
        if (!active || !saved) return;
        if (saved.userInfo) setUserInfo(prev => ({ ...prev, ...saved.userInfo }));
        if (Array.isArray(saved.bookedTickets)) setBookedTickets(saved.bookedTickets);
        if (typeof saved.isDarkMode === 'boolean') setIsDarkMode(saved.isDarkMode);
      })
      .catch(e => console.log('[App] Load appData:', e.message))
      .finally(() => active && setAppDataLoaded(true));
    return () => { active = false; };
  }, [dataOwnerId]);

  // Auto-save cloud app data when key state changes
  useEffect(() => {
    if (!dataOwnerId || !appDataLoaded) return;
    const timer = setTimeout(() => {
      saveAppData(dataOwnerId, 'main', { userInfo, bookedTickets, isDarkMode })
        .catch(e => console.log('[App] Save appData:', e.message));
    }, 800);
    return () => clearTimeout(timer);
  }, [dataOwnerId, appDataLoaded, userInfo, bookedTickets, isDarkMode]);

  // Global Realtime Chat Notification Engine
  const lastSeenMsgMapRef = React.useRef({});

  useEffect(() => {
    if (!dataOwnerId) return;

    let isMounted = true;
    const checkGlobalNewMessages = async () => {
      try {
        const groups = await getChatGroups(dataOwnerId);
        if (!isMounted || !Array.isArray(groups)) return;

        for (const g of groups) {
          const msgs = await getChatMessages(g.id, dataOwnerId);
          if (!Array.isArray(msgs) || msgs.length === 0) continue;

          const lastMsg = msgs[msgs.length - 1];
          const msgId = String(lastMsg.id || lastMsg._id || lastMsg.createdAt || '');
          const prevLastId = lastSeenMsgMapRef.current[g.id];

          const isFromOtherUser = String(lastMsg.senderId) !== String(dataOwnerId);

          if (prevLastId !== undefined && msgId !== String(prevLastId) && isFromOtherUser) {
            const senderName = lastMsg.senderName || 'Thành viên';
            const chatTitle = g.isDirect 
              ? `💬 Tin nhắn từ ${senderName}` 
              : `💬 ${senderName} (${g.name || 'Nhóm du lịch'})`;
            const contentText = lastMsg.text || lastMsg.content || 'Đã gửi một tin nhắn mới';
            
            sendLocalNotification(
              chatTitle,
              contentText,
              { groupId: g.id, isDirect: !!g.isDirect }
            );

            showInAppBanner({
              title: chatTitle,
              body: contentText,
              avatar: lastMsg.senderAvatar || 'https://i.pravatar.cc/150?img=12',
              groupId: g.id,
            });
          }
          lastSeenMsgMapRef.current[g.id] = msgId;
        }
      } catch (e) {}
    };

    checkGlobalNewMessages();
    const interval = setInterval(checkGlobalNewMessages, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dataOwnerId]);

  useEffect(() => {
    // Đăng ký nhận thông báo đẩy
    registerForPushNotificationsAsync();

    // Lắng nghe khi có thông báo đến trong khi app đang mở
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Nhận thông báo:', notification);
    });

    // Lắng nghe khi người dùng nhấn mở thông báo
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Nhấn mở thông báo:', response);
      if (response?.notification?.request?.content?.data?.groupId) {
        setActiveNav('chat');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const handleAddPoints = async (amount) => {
    setUserInfo(prev => {
      const newPoints = prev.points + amount;
      const newLevelNum = Math.floor(newPoints / 1000) + 1;
      return {
        ...prev,
        points: newPoints,
        level: `Cấp ${newLevelNum}`
      };
    });
  };

  const handleCheckIn = async (placeId, xpAmount) => {
    setUserInfo(prev => {
      const alreadyChecked = prev.checkedIn || [];
      if (alreadyChecked.includes(placeId)) return prev;
      const newPoints = prev.points + xpAmount;
      const newLevelNum = Math.floor(newPoints / 1000) + 1;
      const newCheckedIn = [...alreadyChecked, placeId];
      return {
        ...prev,
        points: newPoints,
        level: `Cấp ${newLevelNum}`,
        checkedIn: newCheckedIn
      };
    });
  };

  // Category list size calculator
  const displayedCategories = useMemo(() => {
    return expandedCategories ? allCategories : allCategories.slice(0, 8);
  }, [expandedCategories]);

  // Update clock widget
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Slide banners loop
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const banner = banners[currentBanner];

  // Helper render active tab screen
  const renderScreenContent = () => {
    switch (activeNav) {
      case 'explore':
        return (
          <ExploreScreen
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
            selectedTag={exploreTag}
            setSelectedTag={setExploreTag}
            searchQuery={exploreSearch}
            setSearchQuery={setExploreSearch}
            onBookSuccess={() => {}}
            onNavigateToTour={() => setActiveNav('map')}
            onNavigateToTab={(tab) => {
              setActiveNav(tab);
            }}
            onAddPoints={handleAddPoints}
          />
        );
      case 'social':
        return (
          <SocialScreen
            ownerId={dataOwnerId}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
            currentUser={userInfo}
            onNavigateToTab={(tab) => setActiveNav(tab)}
            onStartDirectChat={handleStartDirectChat}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            ownerId={dataOwnerId}
            isDarkMode={isDarkMode}
            theme={theme}
            currentUser={userInfo}
            onNavigateToTab={(tab) => setActiveNav(tab)}
            onNavigateToMapWithPlace={(placeName) => {
              setSelectedPlaceName(placeName);
              setActiveNav('map');
            }}
            prevScreen={prevNav}
            targetDirectChatGroupId={targetDirectChatGroupId}
            setTargetDirectChatGroupId={setTargetDirectChatGroupId}
          />
        );
      case 'camera':
        return (
          <CameraScreen
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
            onNavigateToTour={() => setActiveNav('map')}
            onNavigateToTab={(tab) => {
              setActiveNav(tab);
            }}
          />
        );
      case 'map':
        return (
          <VietnamTravelWebScreen
            theme={theme}
            isDarkMode={isDarkMode}
            planSlug="ha-noi-nghe-an-ninh-binh-ha-long-ha-noi"
            selectedPlaceName={selectedPlaceName}
            onBack={() => setActiveNav('home')}
            ownerId={dataOwnerId}
            currentUser={userInfo}
            onOpenVR={(tourId) => {
              setSelectedTourId(tourId);
              setSelectedSpotIdx(0);
              setActiveNav('virtualTour');
            }}
            onOpenPlaceDetail={(placeName) => {
              setSelectedPlaceName(placeName);
              setActiveNav('placeDetail');
            }}
            onNavigateToProvince={(provName) => {
              setSelectedProvinceName(provName);
              setActiveNav('provinceGallery');
            }}
            onNavigateToTab={(tab) => setActiveNav(tab)}
          />
        );

      case 'placeDetail':
        return (
          <PlaceDetailScreen
            placeName={selectedPlaceName}
            theme={theme}
            isDarkMode={isDarkMode}
            onBack={() => setActiveNav('map')}
            ownerId={dataOwnerId}
            currentUser={userInfo}
            onNavigateToTab={(tab) => setActiveNav(tab)}
            onNavigateToTour={() => {
              setActiveNav('map');
            }}
            onSelectSpot={(name) => {
              setSelectedPlaceName(name);
              setActiveNav('map');
            }}
          />
        );
      case 'virtualTour':
        return (
          <VirtualTourScreen
            theme={theme}
            isDarkMode={isDarkMode}
            tourId={selectedTourId}
            startSpotIdx={selectedSpotIdx}
            onBack={() => setActiveNav(prevNav === 'map' ? 'map' : 'home')}
            onBookSuccess={() => {}}
          />
        );
      case 'provinceGallery':
        return (
          <ProvinceGalleryScreen
            theme={theme}
            isDarkMode={isDarkMode}
            provinceName={selectedProvinceName}
            onBack={() => setActiveNav('map')}
            onNavigateToTour={(tourId) => {
              setSelectedTourId(tourId || 1);
              setSelectedSpotIdx(0);
              setActiveNav('virtualTour');
            }}
          />
        );

      case 'allDiaDiem':
        return (
          <AllDiaDiem
            theme={theme}
            isDarkMode={isDarkMode}
            onBack={() => setActiveNav('home')}
            onSelectDiaDiem={(item) => {
              setSelectedDiaDiem(item);
              setActiveNav('diaDiemDetail');
            }}
          />
        );
      case 'diaDiemDetail':
        return (
          <DiaDiemDetails
            theme={theme}
            isDarkMode={isDarkMode}
            diaDiem={selectedDiaDiem}
            onBack={() => setActiveNav('allDiaDiem')}
            ownerId={dataOwnerId}
            currentUser={userInfo}
            onNavigateToTab={(tab) => setActiveNav(tab)}
          />
        );
      case 'profileFeed':
        return (
          <ProfileFeedScreen
            theme={theme}
            isDarkMode={isDarkMode}
            userInfo={userInfo}
            ownerId={dataOwnerId}
            onEditProfile={() => setActiveNav('editProfile')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
            userInfo={userInfo}
            ownerId={dataOwnerId}
            setUserInfo={setUserInfo}
            onEditProfile={() => setActiveNav('editProfile')}
            onViewTiers={() => setActiveNav('membershipTiers')}
            onViewChallenges={() => setActiveNav('travelChallenges')}
            onViewProfileFeed={() => setActiveNav('profileFeed')}
            onNavigateToTab={(tab) => setActiveNav(tab)}
            onLogout={() => {
              signOut(auth)
                .then(() => {
                  setIsLoggedIn(false);
                  setAuthRoute('login');
                  setActiveNav('home');
                  Alert.alert('Đăng xuất', 'Đã đăng xuất tài khoản thành công!');
                })
                .catch((error) => {
                  Alert.alert('Lỗi', 'Không thể đăng xuất, vui lòng thử lại.');
                });
            }}
          />
        );
      case 'editProfile':
        return (
          <EditProfileScreen
            theme={theme}
            isDarkMode={isDarkMode}
            currentUser={userInfo}
            onBack={() => setActiveNav('profile')}
            onSave={async (data) => {
              setUserInfo(prev => ({ ...prev, ...data }));
            }}
          />
        );
      case 'membershipTiers':
        return (
          <MembershipTiersScreen
            theme={theme}
            isDarkMode={isDarkMode}
            userInfo={userInfo}
            onBack={() => setActiveNav('profile')}
          />
        );
      case 'travelChallenges':
        return (
          <TravelChallengesScreen
            theme={theme}
            isDarkMode={isDarkMode}
            userInfo={userInfo}
            onBack={() => setActiveNav('profile')}
            onAddPoints={handleAddPoints}
            onNavigateToTab={(tab) => {
              setActiveNav(tab);
            }}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            currentTime={currentTime}
            banners={banners}
            banner={banner}
            currentBanner={currentBanner}
            setCurrentBanner={setCurrentBanner}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            displayedCategories={displayedCategories}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
            currentUser={userInfo}
            allCategories={allCategories}
            onNavigateToExplore={(tag, search) => {
              setExploreTag(tag === 'all' ? 'Tất cả' : tag);
              setExploreSearch(search || '');
              setActiveNav('explore');
            }}
            onNavigateToTab={(tab) => {
              setActiveNav(tab);
            }}
            onNavigateToTour={(tourId, spotIdx) => {
              setSelectedTourId(tourId);
              setSelectedSpotIdx(spotIdx !== undefined ? spotIdx : 0);
              setActiveNav('virtualTour');
            }}
            onSelectDiaDiem={(item) => {
              setExploreTag('Tất cả');
              setExploreSearch(item.ten || '');
              setActiveNav('explore');
            }}
            onViewAllDiaDiem={() => setActiveNav('allDiaDiem')}
          />
        );
    }
  };

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#0f0a1c' : theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isLoggedIn) {
    if (authRoute === 'login') {
      return (
        <LoginScreen
          theme={theme}
          isDarkMode={isDarkMode}
          onRegisterPress={() => setAuthRoute('register')}
          onLoginSuccess={(user) => {
            setUserInfo({ ...userInfo, ...user });
            setIsLoggedIn(true);
          }}
        />
      );
    } else {
      return (
        <RegisterScreen
          theme={theme}
          isDarkMode={isDarkMode}
          onBackPress={() => setAuthRoute('login')}
          onRegisterSuccess={() => setAuthRoute('login')}
        />
      );
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* FLOATING TOP IN-APP NOTIFICATION BANNER */}
      {activeBanner && (
        <Animated.View
          style={[
            styles.inAppBannerContainer,
            { transform: [{ translateY: bannerTranslateY }] }
          ]}
        >
          <Pressable
            style={[styles.inAppBannerCard, { backgroundColor: isDarkMode ? '#1e1b4b' : '#ffffff', borderColor: '#818cf8' }]}
            onPress={() => {
              if (activeBanner.groupId) {
                setTargetDirectChatGroupId(activeBanner.groupId);
                setActiveNav('chat');
              }
              hideInAppBanner();
            }}
          >
            <Image source={{ uri: activeBanner.avatar }} style={styles.bannerAvatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text numberOfLines={1} style={[styles.bannerTitle, { color: isDarkMode ? '#ffffff' : '#0f172a' }]}>
                  {activeBanner.title}
                </Text>
                <Text style={styles.bannerTime}>Vừa xong</Text>
              </View>
              <Text numberOfLines={2} style={[styles.bannerBody, { color: isDarkMode ? '#cbd5e1' : '#475569' }]}>
                {activeBanner.body}
              </Text>
            </View>
            <Pressable onPress={hideInAppBanner} style={{ padding: 6, marginLeft: 6 }}>
              <X size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
            </Pressable>
          </Pressable>
        </Animated.View>
      )}
      {activeNav === 'editProfile' || activeNav === 'membershipTiers' || activeNav === 'travelChallenges' || activeNav === 'virtualTour' || activeNav === 'provinceGallery' || activeNav === 'allDiaDiem' || activeNav === 'diaDiemDetail' || activeNav === 'profileFeed' || activeNav === 'map' || activeNav === 'social' || activeNav === 'chat' || activeNav === 'explore' || activeNav === 'placeDetail' ? (
        renderScreenContent()
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {renderScreenContent()}
        </ScrollView>
      )}

      {/* FLOATING BOTTOM NAV BAR */}
      {activeNav !== 'editProfile' && activeNav !== 'membershipTiers' && activeNav !== 'travelChallenges' && activeNav !== 'virtualTour' && activeNav !== 'provinceGallery' && activeNav !== 'allDiaDiem' && activeNav !== 'diaDiemDetail' && activeNav !== 'profileFeed' && activeNav !== 'chat' && activeNav !== 'map' && activeNav !== 'placeDetail' && (
        <Animated.View style={[
          styles.bottomNav, 
          { 
            backgroundColor: theme.navBg, 
            borderColor: theme.navBorder,
            transform: [{ translateY }] 
          }
        ]}>
          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 }
            ]}
            onPress={() => setActiveNav('home')}
          >
            <Home size={20} color={activeNav === 'home' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'home' ? '#3b82f6' : theme.textSecondary }]}>Trang chủ</Text>
            {activeNav === 'home' && <View style={styles.activeDot} />}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 }
            ]}
            onPress={() => setActiveNav('explore')}
          >
            <Globe size={20} color={activeNav === 'explore' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'explore' ? '#3b82f6' : theme.textSecondary }]}>Khám phá</Text>
            {activeNav === 'explore' && <View style={styles.activeDot} />}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 }
            ]}
            onPress={() => setActiveNav('map')}
          >
            <MapIcon size={20} color={activeNav === 'map' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'map' ? '#3b82f6' : theme.textSecondary }]}>Bản đồ</Text>
            {activeNav === 'map' && <View style={styles.activeDot} />}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 }
            ]}
            onPress={() => setActiveNav('social')}
          >
            <Newspaper size={20} color={activeNav === 'social' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'social' ? '#3b82f6' : theme.textSecondary }]}>Bảng tin</Text>
            {activeNav === 'social' && <View style={styles.activeDot} />}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 }
            ]}
            onPress={() => setActiveNav('profile')}
          >
            <User size={20} color={activeNav === 'profile' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'profile' ? '#3b82f6' : theme.textSecondary }]}>Cá nhân</Text>
            {activeNav === 'profile' && <View style={styles.activeDot} />}
          </Pressable>

        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Container
  screen: { flex: 1 },
  scrollContent: { paddingBottom: 94 },

  // Bottom Docked Navigation
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    paddingHorizontal: 12,
    zIndex: 9999,
  },
  navItem: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%',
    paddingTop: 8,
  },
  navItemActive: {},
  navText: { fontSize: 9.5, fontWeight: '700', marginTop: 4, letterSpacing: 0.1, textAlign: 'center' },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
    marginTop: 4,
    position: 'absolute',
    bottom: 6,
  },
  // In-App Notification Banner Styles
  inAppBannerContainer: {
    position: 'absolute',
    top: 42,
    left: 14,
    right: 14,
    zIndex: 999999,
  },
  inAppBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  bannerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.2,
    flex: 1,
  },
  bannerTime: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#38bdf8',
    marginLeft: 6,
  },
  bannerBody: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 16,
  },
});
