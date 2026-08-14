import React, { useEffect, useMemo, useState } from 'react';
import {
  Appearance,
  ActivityIndicator,
  Alert,
  Animated,
  LogBox,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ClipboardList, Globe, Home, Map as MapIcon, User } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './auth/firebaseConfig';
import { LoginScreen, RegisterScreen } from './auth';
import { registerForPushNotificationsAsync } from './auth/notificationHelper';
import { ChatScreen } from './chat';
import { MapScreen, ProvinceGalleryScreen, TicketDetailScreen, TicketListScreen, VirtualTourScreen } from './map';
import AllDiaDiem from './screens/AllDiaDiem';
import DiaDiemDetails from './screens/DiaDiemDetails';
import { AIItineraryPreviewScreen } from './screens/ai/AIItineraryPreviewScreen';
import { AITripPlannerScreen } from './screens/ai/AITripPlannerScreen';
import { ReplaceActivityScreen } from './screens/ai/ReplaceActivityScreen';
import { CameraScreen, ExploreScreen, PackingListScreen, ProfileScreen } from './screens';
import {
  AIRecommendationSettingsScreen,
  BlockedUsersScreen,
  ChangePasswordScreen,
  EditProfileScreen,
  FeedbackScreen,
  HelpCenterScreen,
  LocationAccessScreen,
  LoginDevicesScreen,
  MembershipTiersScreen,
  PrivacySecurityScreen,
  SettingsScreen,
  StaticContentScreen,
  TravelChallengesScreen,
  TravelPreferencesScreen,
} from './settings';
import { SocialScreen } from './social';
import { getTheme } from './data';
import { loadAppData, saveAppData } from './services/appDataService';

import {
  loadPackingList,
  savePackingList,
  getPackingSuggestions,
} from './services/packingListService';
import {
  buildCurrentDeviceSession,
  DEFAULT_USER_SETTINGS,
  getDevicePreferenceSubset,
  loadDevicePreferenceCache,
  loadUserSettings,
  mergeUserSettings,
  persistDevicePreferenceCache,
  registerCurrentDeviceSession,
  resolveIsDarkMode,
  saveUserSettings,
} from './services/settingsService';
import { syncUser } from './services/userService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

LogBox.ignoreLogs(['@firebase/auth: Auth']);

const FULL_SCREEN_ROUTES = new Set([
  'editProfile',
  'settings',
  'changePassword',
  'travelPreferences',
  'aiRecommendationSettings',
  'privacySecurity',
  'locationAccess',
  'blockedUsers',
  'loginDevices',
  'helpCenter',
  'feedback',
  'privacyPolicy',
  'termsOfUse',
  'aboutVivu360',
  'membershipTiers',
  'travelChallenges',
  'virtualTour',
  'provinceGallery',
  'ticketDetail',
  'ticketList',
  'map',
  'social',
  'chat',
  'aiTripPlanner',
  'aiItineraryPreview',
  'replaceActivity',
]);

const HIDE_BOTTOM_NAV_ROUTES = new Set([
  'editProfile',
  'settings',
  'changePassword',
  'travelPreferences',
  'aiRecommendationSettings',
  'privacySecurity',
  'locationAccess',
  'blockedUsers',
  'loginDevices',
  'helpCenter',
  'feedback',
  'privacyPolicy',
  'termsOfUse',
  'aboutVivu360',
  'membershipTiers',
  'travelChallenges',
  'virtualTour',
  'provinceGallery',
  'ticketDetail',
  'ticketList',
  'chat',
  'aiTripPlanner',
  'aiItineraryPreview',
  'replaceActivity',
]);

const SETTINGS_ROUTES = new Set([
  'settings',
  'changePassword',
  'travelPreferences',
  'aiRecommendationSettings',
  'privacySecurity',
  'locationAccess',
  'blockedUsers',
  'loginDevices',
  'helpCenter',
  'feedback',
  'privacyPolicy',
  'termsOfUse',
  'aboutVivu360',
]);

const INITIAL_BOOKED_TICKETS = [
  {
    code: 'VV360-HL4829',
    title: 'Vịnh Hạ Long',
    region: 'Quảng Ninh',
    date: '2026-06-18',
    guests: 2,
    price: '2.500.000đ',
    status: 'Đã xác nhận',
  },
];

const INITIAL_USER_INFO = {
  name: 'Bạn',
  email: '',
  avatar: 'https://i.pravatar.cc/150?img=68',
  phone: '',
  bio: 'Thích tìm hiểu lịch sử, danh lam thắng cảnh. Thích trải nghiệm tham quan ảo AR 360 độ trên Vivu360!',
  level: 'Cấp 1',
  points: 0,
  checkedIn: [],
};

export default function App() {
  const [activeNav, setActiveNav] = useState('social');
  const [prevNav, setPrevNav] = useState('social');
  const [settingsReturnNav, setSettingsReturnNav] = useState('social');
  const [directChatGroupId, setDirectChatGroupId] = useState(null);
  const [mapGuideRequest, setMapGuideRequest] = useState(null);
  const [aiPlannerContext, setAiPlannerContext] = useState(null);
  const [aiPreviewContext, setAiPreviewContext] = useState(null);
  const [replaceActivityContext, setReplaceActivityContext] = useState(null);
  const [ticketFlowSource, setTicketFlowSource] = useState('profile');
  const activeNavRef = React.useRef(activeNav);

  const [selectedDiaDiem, setSelectedDiaDiem] = useState(null);
  const [exploreTag, setExploreTag] = useState('all');
  const [exploreSearch, setExploreSearch] = useState('');
  const [selectedTourId, setSelectedTourId] = useState(1);
  const [selectedSpotIdx, setSelectedSpotIdx] = useState(0);
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedTicketCode, setSelectedTicketCode] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authRoute, setAuthRoute] = useState('login');
  const [dataOwnerId, setDataOwnerId] = useState(null);
  const [appDataLoaded, setAppDataLoaded] = useState(false);
  const [packingItems, setPackingItems] = useState([]);
const [packingItemsLoaded, setPackingItemsLoaded] = useState(false);

const handleGetPackingSuggestions = async () => {
  if (!dataOwnerId) {
    throw new Error('Chưa xác định được người dùng');
  }

  return getPackingSuggestions(
    dataOwnerId,
    packingItems.map(item => item.title)
  );
};

  const [bookedTickets, setBookedTickets] = useState([
    {
      code: 'VV360-HL4829',
      title: 'Vịnh Hạ Long',
      region: 'Quảng Ninh',
      date: '2026-06-18',
      guests: 2,
      price: '2.500.000đ',
      status: 'Đã xác nhận',
    },
  ]);

  const [systemColorScheme, setSystemColorScheme] = useState(Appearance.getColorScheme() || 'dark');
  const [userSettings, setUserSettings] = useState(DEFAULT_USER_SETTINGS);
  const settingsRef = React.useRef(DEFAULT_USER_SETTINGS);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const isDarkMode = useMemo(
    () => resolveIsDarkMode(userSettings.theme, systemColorScheme),
    [userSettings.theme, systemColorScheme]
  );

  useEffect(() => {
  let cancelled = false;

  const fetchPackingList = async () => {
    if (!dataOwnerId) {
      setPackingItems([]);
      setPackingItemsLoaded(false);
      return;
    }

    try {
      setPackingItemsLoaded(false);

      const items = await loadPackingList(dataOwnerId);

      if (!cancelled) {
        setPackingItems(Array.isArray(items) ? items : []);
        setPackingItemsLoaded(true);
      }
    } catch (error) {
      console.warn('Không thể tải Packing List:', error);

      if (!cancelled) {
        setPackingItems([]);
        setPackingItemsLoaded(true);
      }
    }
  };

  fetchPackingList();

  return () => {
    cancelled = true;
  };
}, [dataOwnerId]);
// ===== PACKING LIST: AUTO SAVE =====
useEffect(() => {
  if (!dataOwnerId || !packingItemsLoaded) {
    return;
  }

  const timer = setTimeout(() => {
    savePackingList(dataOwnerId, packingItems).catch(error => {
      console.warn('Không thể lưu Packing List:', error);
    });
  }, 500);

  return () => clearTimeout(timer);
}, [dataOwnerId, packingItems, packingItemsLoaded]);

  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode]);

  const [userInfo, setUserInfo] = useState({
    name: 'Bạn',
    email: '',
    avatar: 'https://i.pravatar.cc/150?img=68',
    phone: '',
    bio: 'Thích tìm hiểu lịch sử, danh lam thắng cảnh. Thích trải nghiệm tham quan ảo AR 360 độ trên Vivu360!',
    level: 'Cấp 1',
    points: 0,
    checkedIn: [],
  });

  const lastOffsetY = React.useRef(0);
  const isNavVisible = React.useRef(true);
  const translateY = React.useRef(new Animated.Value(0)).current;

  const blockedUserIds = useMemo(
    () => (userSettings.blockedUsers || []).map((item) => item.firebaseUid),
    [userSettings.blockedUsers]
  );
  const navigationLabels = userSettings.language === 'en'
    ? { home: 'Home', explore: 'Explore', map: 'Map', profile: 'Profile' }
    : { home: 'Trang chủ', explore: 'Khám phá', map: 'Bản đồ', profile: 'Cá nhân' };

  const resetAuthenticatedState = () => {
    const nextSettings = mergeUserSettings(
      DEFAULT_USER_SETTINGS,
      getDevicePreferenceSubset(settingsRef.current)
    );

    settingsRef.current = nextSettings;
    setUserSettings(nextSettings);
    setCurrentDeviceId('');
    setUserInfo(INITIAL_USER_INFO);
    setBookedTickets(INITIAL_BOOKED_TICKETS);
    setDirectChatGroupId(null);
    setMapGuideRequest(null);
    setAiPlannerContext(null);
    setAiPreviewContext(null);
    setReplaceActivityContext(null);
    setSelectedDiaDiem(null);
    setExploreTag('all');
    setExploreSearch('');
    setSelectedTourId(1);
    setSelectedSpotIdx(0);
    setSelectedProvinceName('');
    setSelectedTicketCode(null);
    setTicketFlowSource('profile');
    setPrevNav('social');
    setSettingsReturnNav('social');
    setActiveNav('social');
  };

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

  useEffect(() => {
    isNavVisible.current = true;
    Animated.timing(translateY, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [activeNav, translateY]);

  useEffect(() => {
    settingsRef.current = userSettings;
  }, [userSettings]);

  useEffect(() => {
    let active = true;
    const appearanceSubscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || 'dark');
    });

    loadDevicePreferenceCache()
      .then((cached) => {
        if (!active) return;
        const next = mergeUserSettings(DEFAULT_USER_SETTINGS, cached);
        settingsRef.current = next;
        setUserSettings(next);
      })
      .catch(() => undefined);

    return () => {
      active = false;
      appearanceSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setAppDataLoaded(false);
        setDataOwnerId(user.uid);
        setUserInfo((prev) => ({
          ...prev,
          name: user.displayName || user.email?.split('@')[0] || prev.name,
          email: user.email || prev.email,
        }));
      } else {
        setDataOwnerId(null);
        setAppDataLoaded(false);
        setIsLoggedIn(false);
        resetAuthenticatedState();
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!dataOwnerId) return undefined;
    let active = true;

    (async () => {
      try {
        const remoteSettings = await loadUserSettings(dataOwnerId);
        const deviceSession = await buildCurrentDeviceSession();
        if (!active) return;

        setCurrentDeviceId(deviceSession.deviceId);
        const nextSettings = registerCurrentDeviceSession(
          mergeUserSettings(settingsRef.current, remoteSettings),
          deviceSession
        );
        settingsRef.current = nextSettings;
        setUserSettings(nextSettings);

        await saveUserSettings(dataOwnerId, nextSettings).catch((error) => {
          console.warn('Không thể đồng bộ cài đặt:', error.message);
        });
      } catch (error) {
        console.warn('Không thể tải cài đặt người dùng:', error.message);
      }
    })();

    return () => {
      active = false;
    };
  }, [dataOwnerId]);

  useEffect(() => {
    if (!dataOwnerId) return undefined;
    let active = true;

    loadAppData(dataOwnerId, 'main')
      .then((saved) => {
        if (!active || !saved) return;
        if (saved.userInfo) setUserInfo(saved.userInfo);
        if (Array.isArray(saved.bookedTickets)) setBookedTickets(saved.bookedTickets);
      })
      .catch((error) => console.warn('Không thể tải dữ liệu MongoDB:', error.message))
      .finally(() => active && setAppDataLoaded(true));

    return () => {
      active = false;
    };
  }, [dataOwnerId]);

  useEffect(() => {
    if (!dataOwnerId || !appDataLoaded) return undefined;
    const timer = setTimeout(() => {
      saveAppData(dataOwnerId, 'main', { userInfo, bookedTickets })
        .catch((error) => console.warn('Không thể lưu dữ liệu MongoDB:', error.message));
    }, 500);
    return () => clearTimeout(timer);
  }, [dataOwnerId, appDataLoaded, userInfo, bookedTickets]);

  useEffect(() => {
    if (!dataOwnerId || !userInfo.email || !userInfo.name) return undefined;
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
      }).catch((error) => console.warn('Không thể đồng bộ người dùng:', error.message));
    }, 500);
    return () => clearTimeout(timer);
  }, [dataOwnerId, userInfo]);

  useEffect(() => {
    if (settingsRef.current.notificationsEnabled !== false) {
      registerForPushNotificationsAsync().catch(() => undefined);
    }

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Nhận thông báo:', notification);
    });
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Nhấn mở thông báo:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const handleScroll = (event) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    const diffY = currentOffsetY - lastOffsetY.current;

    if (Math.abs(diffY) > 15) {
      if (diffY > 0 && currentOffsetY > 100) {
        if (isNavVisible.current) {
          isNavVisible.current = false;
          Animated.timing(translateY, {
            toValue: 120,
            duration: 220,
            useNativeDriver: true,
          }).start();
        }
      } else if (diffY < 0 || currentOffsetY <= 30) {
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

  const updateAppSettings = async (patch) => {
    const nextSettings = mergeUserSettings(settingsRef.current, patch);
    settingsRef.current = nextSettings;
    setUserSettings(nextSettings);
    await persistDevicePreferenceCache(nextSettings);

    let syncError = null;
    if (dataOwnerId) {
      try {
        await saveUserSettings(dataOwnerId, nextSettings);
      } catch (error) {
        console.warn('Không thể lưu cài đặt người dùng:', error.message);
        syncError = error;
      }
    }

    return { settings: nextSettings, syncError };
  };

  const setIsDarkMode = (valueOrUpdater) => {
    const nextValue = typeof valueOrUpdater === 'function' ? valueOrUpdater(isDarkMode) : valueOrUpdater;
    updateAppSettings({ theme: nextValue ? 'dark' : 'light' }).catch(() => undefined);
  };

  const handleAddPoints = (amount) => {
    setUserInfo((prev) => {
      const newPoints = prev.points + amount;
      const newLevelNum = Math.floor(newPoints / 1000) + 1;
      return {
        ...prev,
        points: newPoints,
        level: `Cấp ${newLevelNum}`,
      };
    });
  };

  const handleCheckIn = (placeId, xpAmount) => {
    setUserInfo((prev) => {
      const alreadyChecked = prev.checkedIn || [];
      if (alreadyChecked.includes(placeId)) return prev;
      const newPoints = prev.points + xpAmount;
      const newLevelNum = Math.floor(newPoints / 1000) + 1;
      return {
        ...prev,
        points: newPoints,
        level: `Cấp ${newLevelNum}`,
        checkedIn: [...alreadyChecked, placeId],
      };
    });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsLoggedIn(false);
        setAuthRoute('login');
        resetAuthenticatedState();
        Alert.alert('Đăng xuất', 'Đã đăng xuất tài khoản thành công!');
      })
      .catch(() => {
        Alert.alert('Lỗi', 'Không thể đăng xuất, vui lòng thử lại.');
      });
  };

  const handleGlobalNavigation = (tab, payload) => {
    if (tab === 'settings') {
      const sourceRoute = activeNavRef.current;
      if (!SETTINGS_ROUTES.has(sourceRoute)) {
        setSettingsReturnNav(sourceRoute === 'home' ? 'social' : sourceRoute);
      }
      setActiveNav('settings');
      return;
    }

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

  const renderSocialScreen = () => (
    <SocialScreen
      ownerId={dataOwnerId}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      theme={theme}
      currentUser={userInfo}
      onNavigateToTab={handleGlobalNavigation}
      onLogout={handleLogout}
      language={userSettings.language}
      blockedUserIds={blockedUserIds}
    />
  );

  const renderScreenContent = () => {
    switch (activeNav) {
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
              setBookedTickets((prev) => [newTicket, ...prev]);
            }}
          />
        );
        case 'packing':
  return (
    <PackingListScreen
      theme={theme}
      packingItems={packingItems}
      setPackingItems={setPackingItems}
      onGetSuggestions={handleGetPackingSuggestions}
    />
  );
      case 'social':
        return renderSocialScreen();
      case 'chat':
        return (
          <ChatScreen
            ownerId={dataOwnerId}
            isDarkMode={isDarkMode}
            theme={theme}
            currentUser={userInfo}
            onNavigateToTab={handleGlobalNavigation}
            prevScreen={['aiTripPlanner', 'aiItineraryPreview', 'replaceActivity'].includes(prevNav) ? 'social' : prevNav}
            initialGroupId={directChatGroupId}
          />
        );
      case 'aiTripPlanner':
        return (
          <AITripPlannerScreen
            theme={theme}
            isDarkMode={isDarkMode}
            ownerId={dataOwnerId}
            currentUser={userInfo}
            context={aiPlannerContext}
            userSettings={userSettings}
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
            onNavigateToTab={handleGlobalNavigation}
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
            locationSharingEnabled={userSettings.locationSharing}
            onSelectedPlaceRequestHandled={(requestId) => {
              if (mapGuideRequest?.requestId === requestId) setMapGuideRequest(null);
            }}
            onNavigateToTour={(tourId, spotIdx) => {
              setSelectedTourId(tourId);
              setSelectedSpotIdx(spotIdx !== undefined ? spotIdx : 0);
              setActiveNav('virtualTour');
            }}
            onNavigateToProvince={(provName) => {
              setSelectedProvinceName(provName);
              setActiveNav('provinceGallery');
            }}
            onNavigateToTab={handleGlobalNavigation}
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
              setBookedTickets((prev) => [newTicket, ...prev]);
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
            ticket={bookedTickets.find((item) => item.code === selectedTicketCode)}
            onBack={() => setActiveNav('ticketList')}
            onCancelTicket={(ticketCode) => {
              setBookedTickets((prev) => prev.filter((item) => item.code !== ticketCode));
              setActiveNav('ticketList');
              Alert.alert('Thành công', 'Đã hủy vé điện tử thành công và hoàn trả số tiền (nếu có)!');
            }}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            theme={theme}
            language={userSettings.language}
            settings={userSettings}
            onBack={() => setActiveNav(settingsReturnNav || 'social')}
            onNavigate={(route) => setActiveNav(route)}
            onUpdateSettings={updateAppSettings}
            onLogout={handleLogout}
          />
        );
      case 'editProfile':
        return (
          <EditProfileScreen
            theme={theme}
            isDarkMode={isDarkMode}
            currentUser={userInfo}
            ownerId={dataOwnerId}
            onBack={() => setActiveNav(prevNav === 'settings' ? 'settings' : 'profile')}
            onSave={(data) => setUserInfo((prev) => ({ ...prev, ...data }))}
          />
        );
      case 'changePassword':
        return (
          <ChangePasswordScreen
            theme={theme}
            language={userSettings.language}
            onBack={() => setActiveNav('settings')}
          />
        );
      case 'travelPreferences':
        return (
          <TravelPreferencesScreen
            theme={theme}
            language={userSettings.language}
            settings={userSettings}
            onBack={() => setActiveNav('settings')}
            onUpdateSettings={updateAppSettings}
          />
        );
      case 'aiRecommendationSettings':
        return (
          <AIRecommendationSettingsScreen
            theme={theme}
            language={userSettings.language}
            settings={userSettings}
            onBack={() => setActiveNav('settings')}
            onUpdateSettings={updateAppSettings}
          />
        );
      case 'privacySecurity':
        return (
          <PrivacySecurityScreen
            theme={theme}
            language={userSettings.language}
            settings={userSettings}
            onBack={() => setActiveNav('settings')}
            onUpdateSettings={updateAppSettings}
          />
        );
      case 'locationAccess':
        return (
          <LocationAccessScreen
            theme={theme}
            language={userSettings.language}
            settings={userSettings}
            onBack={() => setActiveNav('settings')}
            onUpdateSettings={updateAppSettings}
          />
        );
      case 'blockedUsers':
        return (
          <BlockedUsersScreen
            theme={theme}
            language={userSettings.language}
            ownerId={dataOwnerId}
            settings={userSettings}
            onBack={() => setActiveNav('settings')}
            onUpdateSettings={updateAppSettings}
          />
        );
      case 'loginDevices':
        return (
          <LoginDevicesScreen
            theme={theme}
            language={userSettings.language}
            settings={userSettings}
            currentDeviceId={currentDeviceId}
            onBack={() => setActiveNav('settings')}
            onUpdateSettings={updateAppSettings}
          />
        );
      case 'helpCenter':
        return (
          <HelpCenterScreen
            theme={theme}
            language={userSettings.language}
            onBack={() => setActiveNav('settings')}
            onNavigate={(route) => setActiveNav(route)}
          />
        );
      case 'feedback':
        return (
          <FeedbackScreen
            theme={theme}
            language={userSettings.language}
            ownerId={dataOwnerId}
            onBack={() => setActiveNav('settings')}
          />
        );
      case 'privacyPolicy':
        return (
          <StaticContentScreen
            theme={theme}
            language={userSettings.language}
            articleKey="privacyPolicy"
            onBack={() => setActiveNav('settings')}
          />
        );
      case 'termsOfUse':
        return (
          <StaticContentScreen
            theme={theme}
            language={userSettings.language}
            articleKey="termsOfUse"
            onBack={() => setActiveNav('settings')}
          />
        );
      case 'aboutVivu360':
        return (
          <StaticContentScreen
            theme={theme}
            language={userSettings.language}
            articleKey="about"
            onBack={() => setActiveNav('settings')}
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
            onNavigateToTab={handleGlobalNavigation}
          />
        );
      case 'home':
      default:
        return renderSocialScreen();
    }
  };

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
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
            setUserInfo((prev) => ({ ...prev, ...user }));
            setActiveNav('social');
            setIsLoggedIn(true);
          }}
        />
      );
    }

    return (
      <RegisterScreen
        theme={theme}
        isDarkMode={isDarkMode}
        onBackPress={() => setAuthRoute('login')}
        onRegisterSuccess={() => setAuthRoute('login')}
      />
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {FULL_SCREEN_ROUTES.has(activeNav) ? (
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

      {!HIDE_BOTTOM_NAV_ROUTES.has(activeNav) && (
        <Animated.View
          style={[
            styles.bottomNav,
            {
              backgroundColor: theme.navBg,
              borderColor: theme.navBorder,
              transform: [{ translateY }],
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 },
            ]}
            onPress={() => setActiveNav('social')}
          >
            <Home size={20} color={activeNav === 'social' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'social' ? '#3b82f6' : theme.textSecondary }]}>
              {navigationLabels.home}
            </Text>
            {activeNav === 'social' && <View style={styles.activeDot} />}
          </Pressable>

          <Pressable
  style={({ pressed }) => [
    styles.navItem,
    pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 },
  ]}
  onPress={() => setActiveNav('packing')}
>
  <ClipboardList
    size={20}
    color={activeNav === 'packing' ? '#3b82f6' : theme.textSecondary}
  />

  <Text
    style={[
      styles.navText,
      {
        color:
          activeNav === 'packing'
            ? '#3b82f6'
            : theme.textSecondary,
      },
    ]}
  >
    Đồ dùng
  </Text>

  {activeNav === 'packing' && <View style={styles.activeDot} />}
</Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 },
            ]}
            onPress={() => setActiveNav('map')}
          >
            <MapIcon size={20} color={activeNav === 'map' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'map' ? '#3b82f6' : theme.textSecondary }]}>
              {navigationLabels.map}
            </Text>
            {activeNav === 'map' && <View style={styles.activeDot} />}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.95 },
            ]}
            onPress={() => setActiveNav('profile')}
          >
            <User size={20} color={activeNav === 'profile' ? '#3b82f6' : theme.textSecondary} />
            <Text style={[styles.navText, { color: activeNav === 'profile' ? '#3b82f6' : theme.textSecondary }]}>
              {navigationLabels.profile}
            </Text>
            {activeNav === 'profile' && <View style={styles.activeDot} />}
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 94,
  },
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
  navText: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
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