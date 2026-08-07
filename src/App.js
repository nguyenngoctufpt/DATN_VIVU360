import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Animated, ActivityIndicator, LogBox } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Home,
  Globe,
  Scan,
  Map as MapIcon,
  User,
  MessageSquare,
  Newspaper,
} from 'lucide-react-native';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {
  HomeScreen,
  ExploreScreen,
  CameraScreen,
  ProfileScreen,
} from './screens';
import AllDiaDiem from './screens/AllDiaDiem';
import DiaDiemDetails from './screens/DiaDiemDetails';
import { MapScreen, VirtualTourScreen, ProvinceGalleryScreen, TicketDetailScreen, TicketListScreen } from './map';
import { SocialScreen } from './social';
import { ChatScreen } from './chat';
import { EditProfileScreen, MembershipTiersScreen, TravelChallengesScreen } from './settings';
import { LoginScreen, RegisterScreen } from './auth';
import { AITripPlannerScreen } from './screens/ai/AITripPlannerScreen';
import { AIItineraryPreviewScreen } from './screens/ai/AIItineraryPreviewScreen';
import { ReplaceActivityScreen } from './screens/ai/ReplaceActivityScreen';
import { auth } from './auth/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './auth/notificationHelper';
import { loadAppData, saveAppData } from './services/appDataService';
import { syncUser } from './services/userService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

LogBox.ignoreLogs(['@firebase/auth: Auth']);

import {
  banners,
  allCategories,
  getTheme,
} from './data';

export default function App() {
  const [activeNav, setActiveNav] = useState('social');
  const [prevNav, setPrevNav] = useState('social');
  const [directChatGroupId, setDirectChatGroupId] = useState(null);
  const [mapGuideRequest, setMapGuideRequest] = useState(null);
  const [aiPlannerContext, setAiPlannerContext] = useState(null);
  const [aiPreviewContext, setAiPreviewContext] = useState(null);
  const [replaceActivityContext, setReplaceActivityContext] = useState(null);
  const [ticketFlowSource, setTicketFlowSource] = useState('profile');
  const activeNavRef = React.useRef(activeNav);

  useEffect(() => {
    if (activeNavRef.current !== activeNav) {
      const prev = activeNavRef.current;
      setPrevNav(prev);
      activeNavRef.current = activeNav;

      if (prev !== 'ticketList' && prev !== 'ticketDetail') {
        setTicketFlowSource(prev);
      }
    }
  }, [activeNav]);

  const [currentBanner, setCurrentBanner] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

//Lưu chọn địa điểm
  const [selectedDiaDiem, setSelectedDiaDiem] = useState(null);
  // Search & Navigation sync states
  const [exploreTag, setExploreTag] = useState('all');
  const [exploreSearch, setExploreSearch] = useState('');

  // Tour navigation states
  const [selectedTourId, setSelectedTourId] = useState(1);
  const [selectedSpotIdx, setSelectedSpotIdx] = useState(0);

  // Province gallery navigation states
  const [selectedProvinceName, setSelectedProvinceName] = useState('');

  // Ticket selection state
  const [selectedTicketCode, setSelectedTicketCode] = useState(null);

  // Auth navigation states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authRoute, setAuthRoute] = useState('login'); // 'login' | 'register'
  const [dataOwnerId, setDataOwnerId] = useState(null);
  const [appDataLoaded, setAppDataLoaded] = useState(false);

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
    name: 'Bạn',
    email: '',
    avatar: 'https://i.pravatar.cc/150?img=68',
    phone: '',
    bio: 'Thích tìm hiểu lịch sử, danh lam thắng cảnh. Thích trải nghiệm tham quan ảo AR 360 độ trên Vivu360! 🌐🎒',
    level: 'Cấp 1',
    points: 0,
    checkedIn: [],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAppDataLoaded(false);
        setDataOwnerId(user.uid);
        setUserInfo(prev => ({
          ...prev,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
        }));
      } else {
        setDataOwnerId(null);
        setAppDataLoaded(false);
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!dataOwnerId) return;
    let active = true;

    loadAppData(dataOwnerId, 'main')
      .then(saved => {
        if (!active || !saved) return;
        if (saved.userInfo) setUserInfo(saved.userInfo);
        if (Array.isArray(saved.bookedTickets)) setBookedTickets(saved.bookedTickets);
        if (typeof saved.isDarkMode === 'boolean') setIsDarkMode(saved.isDarkMode);
      })
      .catch(error => console.warn('Không thể tải dữ liệu MongoDB:', error.message))
      .finally(() => active && setAppDataLoaded(true));

    return () => { active = false; };
  }, [dataOwnerId]);

  useEffect(() => {
    if (!dataOwnerId || !appDataLoaded) return;
    const timer = setTimeout(() => {
      saveAppData(dataOwnerId, 'main', { userInfo, bookedTickets, isDarkMode })
        .catch(error => console.warn('Không thể lưu dữ liệu MongoDB:', error.message));
    }, 500);
    return () => clearTimeout(timer);
  }, [dataOwnerId, appDataLoaded, userInfo, bookedTickets, isDarkMode]);

  useEffect(() => {
    if (!dataOwnerId || !userInfo.email || !userInfo.name) return;
    const timer = setTimeout(() => {
      syncUser({
        firebaseUid: dataOwnerId,
        email: userInfo.email,
        name: userInfo.name,
        phone: userInfo.phone,
        avatar: userInfo.avatar,
        bio: userInfo.bio,
        points: userInfo.points,
        level: userInfo.level,
        checkedIn: userInfo.checkedIn,
      }).catch(error => console.warn('Không thể đồng bộ người dùng:', error.message));
    }, 500);
    return () => clearTimeout(timer);
  }, [dataOwnerId, userInfo]);

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
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const handleAddPoints = (amount) => {
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

  const handleCheckIn = (placeId, xpAmount) => {
    setUserInfo(prev => {
      const alreadyChecked = prev.checkedIn || [];
      if (alreadyChecked.includes(placeId)) return prev;
      const newPoints = prev.points + xpAmount;
      const newLevelNum = Math.floor(newPoints / 1000) + 1;
      return {
        ...prev,
        points: newPoints,
        level: `Cấp ${newLevelNum}`,
        checkedIn: [...alreadyChecked, placeId]
      };
    });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsLoggedIn(false);
        setAuthRoute('login');
        setActiveNav('social');
        Alert.alert('Đăng xuất', 'Đã đăng xuất tài khoản thành công!');
      })
      .catch(() => {
        Alert.alert('Lỗi', 'Không thể đăng xuất, vui lòng thử lại.');
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

  const handleGlobalNavigation = (tab, payload) => {
    if (tab === 'map' && payload?.placeName) {
      setMapGuideRequest({ ...payload, requestId: payload.requestId || Date.now() });
      setActiveNav('map');
      return;
    }

    if (tab === 'chat' && payload) {
      setDirectChatGroupId(payload || null);
      setActiveNav('chat');
      return;
    }

    if (tab === 'aiTripPlanner') {
      setDirectChatGroupId(payload?.groupId || directChatGroupId || null);
      setAiPlannerContext(payload || null);
      setActiveNav('aiTripPlanner');
      return;
    }

    if (tab === 'aiItineraryPreview') {
      setDirectChatGroupId(payload?.groupId || directChatGroupId || null);
      setAiPreviewContext(payload || null);
      setActiveNav('aiItineraryPreview');
      return;
    }

    if (tab === 'replaceActivity') {
      setDirectChatGroupId(payload?.groupId || directChatGroupId || null);
      setReplaceActivityContext(payload || null);
      setActiveNav('replaceActivity');
      return;
    }

    setActiveNav(tab);
  };

  // Helper render active tab screen
  const renderScreenContent = () => {
    switch (activeNav) {
      case "allDiaDiem":
    return (
        <AllDiaDiem
            theme={theme}
            isDarkMode={isDarkMode}
            onBack={() => setActiveNav("home")}
             onSelectDiaDiem={(item) => {
        setSelectedDiaDiem(item);
        setActiveNav("diaDiemDetail");
    }}
        />
    );
    case "diaDiemDetail":
  return (
    <DiaDiemDetails
      theme={theme}
      isDarkMode={isDarkMode}
      diaDiem={selectedDiaDiem}
      onBack={() => setActiveNav("allDiaDiem")}
    />
  );
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
            onBookSuccess={(newTicket) => {
              setBookedTickets(prev => [newTicket, ...prev]);
            }}
          />
        );
      case 'social':
        return <SocialScreen ownerId={dataOwnerId} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} theme={theme} currentUser={userInfo} onNavigateToTab={(tab, groupId) => { if (tab === 'chat') setDirectChatGroupId(groupId || null); setActiveNav(tab); }} onLogout={handleLogout} />;
      case 'chat':
        return <ChatScreen ownerId={dataOwnerId} isDarkMode={isDarkMode} theme={theme} currentUser={userInfo} onNavigateToTab={handleGlobalNavigation} prevScreen={['aiTripPlanner', 'aiItineraryPreview', 'replaceActivity'].includes(prevNav) ? 'social' : prevNav} initialGroupId={directChatGroupId} />;
      case 'aiTripPlanner':
        return (
          <AITripPlannerScreen
            theme={theme}
            isDarkMode={isDarkMode}
            ownerId={dataOwnerId}
            currentUser={userInfo}
            context={aiPlannerContext}
            onBack={() => setActiveNav('chat')}
            onNavigateToPreview={(payload) => {
              setAiPreviewContext(payload);
              setActiveNav('aiItineraryPreview');
            }}
          />
        );
      case 'aiItineraryPreview':
        return (
          <AIItineraryPreviewScreen
            theme={theme}
            isDarkMode={isDarkMode}
            ownerId={dataOwnerId}
            context={aiPreviewContext}
            onBack={() => setActiveNav(aiPreviewContext?.origin === 'aiTripPlanner' ? 'aiTripPlanner' : 'chat')}
            onOpenReplaceActivity={(payload) => {
              setReplaceActivityContext(payload);
              setActiveNav('replaceActivity');
            }}
            onNavigateToTab={handleGlobalNavigation}
            onUpdateContext={(payload) => setAiPreviewContext(payload)}
          />
        );
      case 'replaceActivity':
        return (
          <ReplaceActivityScreen
            theme={theme}
            ownerId={dataOwnerId}
            context={replaceActivityContext}
            onBack={() => setActiveNav('aiItineraryPreview')}
            onCompleted={(payload) => {
              setAiPreviewContext(payload);
              setActiveNav('aiItineraryPreview');
            }}
          />
        );
      case 'camera':
        return (
          <CameraScreen
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
            onNavigateToTour={(tourId, spotIdx) => {
              setSelectedTourId(tourId);
              setSelectedSpotIdx(spotIdx !== undefined ? spotIdx : 0);
              setActiveNav('virtualTour');
            }}
            onNavigateToTab={(tab) => {
              setActiveNav(tab);
            }}
            onViewTicket={(ticketCode) => {
              setSelectedTicketCode(ticketCode);
              setActiveNav('ticketDetail');
            }}
          />
        );
      case 'map':
        return (
          <MapScreen
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            theme={theme}
            userInfo={userInfo}
            currentUser={userInfo}
            ownerId={dataOwnerId}
            onCheckIn={handleCheckIn}
            selectedPlaceRequest={mapGuideRequest}
            onSelectedPlaceRequestHandled={(requestId) => { if (mapGuideRequest?.requestId === requestId) setMapGuideRequest(null); }}
            onNavigateToTour={(tourId, spotIdx) => {
              setSelectedTourId(tourId);
              setSelectedSpotIdx(spotIdx !== undefined ? spotIdx : 0);
              setActiveNav('virtualTour');
            }}
            onNavigateToProvince={(provName) => {
              setSelectedProvinceName(provName);
              setActiveNav('provinceGallery');
            }}
            onNavigateToTab={(tab, groupId) => {
              if (tab === 'chat' && groupId) setDirectChatGroupId(groupId);
              setActiveNav(tab);
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
            onBack={() => setActiveNav('map')}
            onBookSuccess={(newTicket) => {
              setBookedTickets(prev => [newTicket, ...prev]);
            }}
          />
        );
      case 'provinceGallery':
        return (
          <ProvinceGalleryScreen
            theme={theme}
            isDarkMode={isDarkMode}
            provinceName={selectedProvinceName}
            onBack={() => setActiveNav('map')}
            onNavigateToTour={(tourId, spotIdx) => {
              setSelectedTourId(tourId);
              setSelectedSpotIdx(spotIdx !== undefined ? spotIdx : 0);
              setActiveNav('virtualTour');
            }}
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
            bookedTickets={bookedTickets}
            onEditProfile={() => setActiveNav('editProfile')}
            onViewTicketList={() => setActiveNav('ticketList')}
            onViewTiers={() => setActiveNav('membershipTiers')}
            onViewChallenges={() => setActiveNav('travelChallenges')}
            onLogout={handleLogout}
          />
        );
      case 'ticketList':
        return (
          <TicketListScreen
            theme={theme}
            isDarkMode={isDarkMode}
            bookedTickets={bookedTickets}
            onBack={() => setActiveNav(ticketFlowSource || 'profile')}
            onViewTicket={(ticketCode) => {
              setSelectedTicketCode(ticketCode);
              setActiveNav('ticketDetail');
            }}
          />
        );
      case 'ticketDetail':
        return (
          <TicketDetailScreen
            theme={theme}
            isDarkMode={isDarkMode}
            ticket={bookedTickets.find(t => t.code === selectedTicketCode)}
            onBack={() => setActiveNav('ticketList')}
            onCancelTicket={(ticketCode) => {
              setBookedTickets(prev => prev.filter(t => t.code !== ticketCode));
              setActiveNav('ticketList');
              Alert.alert('Thành công', 'Đã hủy vé điện tử thành công và hoàn trả số tiền (nếu có)!');
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
            onSave={(data) => setUserInfo({ ...userInfo, ...data })}
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
        return <SocialScreen ownerId={dataOwnerId} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} theme={theme} currentUser={userInfo} onNavigateToTab={(tab, groupId) => { if (tab === 'chat') setDirectChatGroupId(groupId || null); setActiveNav(tab); }} onLogout={handleLogout} />;
    }
  };

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#0f0a1c' : theme.background }}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
            setActiveNav('social');
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
      {activeNav === 'editProfile' || activeNav === 'membershipTiers' || activeNav === 'travelChallenges' || activeNav === 'virtualTour' || activeNav === 'provinceGallery' || activeNav === 'ticketDetail' || activeNav === 'ticketList' || activeNav === 'map' || activeNav === 'social' || activeNav === 'chat' || activeNav === 'aiTripPlanner' || activeNav === 'aiItineraryPreview' || activeNav === 'replaceActivity' ? (
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
      {activeNav !== 'editProfile' && activeNav !== 'membershipTiers' && activeNav !== 'travelChallenges' && activeNav !== 'virtualTour' && activeNav !== 'provinceGallery' && activeNav !== 'ticketDetail' && activeNav !== 'ticketList' && activeNav !== 'chat' && activeNav !== 'aiTripPlanner' && activeNav !== 'aiItineraryPreview' && activeNav !== 'replaceActivity' && (
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
            onPress={() => setActiveNav('social')}
          >
            <Home size={20} color={activeNav === 'social' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'social' ? '#3b82f6' : theme.textSecondary }]}>Trang chủ</Text>
            {activeNav === 'social' && <View style={styles.activeDot} />}
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
});
