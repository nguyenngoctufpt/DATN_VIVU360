import React, { useRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ActivityIndicator, BackHandler, Platform, StatusBar, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft } from 'lucide-react-native';
import Constants from 'expo-constants';
import { globalSharedState } from '../social/socialShared';
import ShareLocationModal from '../components/ShareLocationModal';

export function VietnamTravelWebScreen({ theme, isDarkMode, onBack, onOpenVR, onOpenPlaceDetail, onNavigateToProvince, onNavigateToTab, selectedPlaceName, planSlug = 'ha-noi-nghe-an-ninh-binh-ha-long-ha-noi', ownerId, currentUser }) {
  const webViewRef = useRef(null);
  const [activeLocationId, setActiveLocationId] = useState(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLocationData, setShareLocationData] = useState(null);

  useEffect(() => {
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.alpineApp) {
            window.alpineApp.handleBackButtonClick();
          }
        `);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [onBack]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'openVR') {
        const tourId = data.tourId || 1;
        if (onOpenVR) {
          onOpenVR(tourId);
        }
      } else if (data.type === 'openPlaceDetail') {
        if (onOpenPlaceDetail) {
          onOpenPlaceDetail(data.placeName);
        }
      } else if (data.type === 'goBack') {
        if (onBack) {
          onBack();
        }
      } else if (data.type === 'activeIdChanged') {
        setActiveLocationId(data.activeId);
      } else if (data.type === 'openProvince') {
        if (onNavigateToProvince) {
          onNavigateToProvince(data.provinceName);
        }
      } else if (data.type === 'shareLocation' || data.type === 'sharePlace') {
        setShareLocationData({
          name: data.locationName || data.placeName || data.name || 'Địa điểm du lịch',
          location: data.address || data.viTri || 'Việt Nam',
          description: data.description || data.moTa || '',
        });
        setShareModalVisible(true);
      }
    } catch (err) {
      console.error('Error parsing webview message:', err);
    }
  };

  // Resolve host IP dynamically with multi-IP fallback
  const initialHostIp = useMemo(() => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    }
    // Android emulators connect to the host services through adb reverse.
    // Using the LAN address here is unreliable with Genymotion host-only networking.
    if (Platform.OS === 'android') return '127.0.0.1';
    let host = Constants.expoConfig?.hostUri;
    if (!host && Constants.manifest) {
      host = Constants.manifest.debuggerHost;
    }
    if (!host && Constants.manifest2?.extra?.expoGo) {
      host = Constants.manifest2.extra.expoGo.debuggerHost;
    }
    if (host) {
      const ip = host.split(':')[0];
      if (ip && ip !== '127.0.0.1' && ip !== 'localhost') return ip;
    }
    return '127.0.0.1';
  }, []);

  const [currentHostIp, setCurrentHostIp] = useState(initialHostIp);
  const [ipRetryCount, setIpRetryCount] = useState(0);

  // Loads map from host IP on port 3005 directly with optional slug
  const mapUrl = useMemo(() => {
    let url = `http://${currentHostIp}:3005?view=map&isApp=1&theme=light`;
    if (planSlug) {
      url += `&slug=${planSlug}`;
    }
    if (selectedPlaceName) {
      url += `&search=${encodeURIComponent(selectedPlaceName)}`;
    }
    return url;
  }, [currentHostIp, planSlug, selectedPlaceName]);

  console.log('VietnamTravelWebScreen loading mapUrl:', mapUrl);

  const webViewSource = useMemo(() => ({
    uri: mapUrl
  }), [mapUrl]);
 
  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : (Platform.OS === 'ios' ? 44 : 0)
    }
  ], [theme.background]);

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error on IP:', currentHostIp, nativeEvent);

    if (ipRetryCount === 0) {
      setIpRetryCount(1);
      if (currentHostIp === '127.0.0.1') {
        setCurrentHostIp('10.0.3.2');
      } else if (currentHostIp === '10.0.3.2') {
        setCurrentHostIp('192.168.56.1');
      } else {
        setCurrentHostIp('127.0.0.1');
      }
    } else if (ipRetryCount === 1) {
      setIpRetryCount(2);
      setCurrentHostIp('192.168.56.1');
    }
  };

  return (
    <View style={containerStyle}>
      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={webViewSource}
        style={styles.webview}
        onMessage={handleMessage}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        onConsoleMessage={(event) => {
          const msg = event.nativeEvent.message;
          console.log('WebView Console:', msg);
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFill, styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
        onError={handleWebViewError}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
          Alert.alert(
            'Lỗi HTTP bản đồ',
            `Server trả về mã lỗi HTTP: ${nativeEvent.statusCode}\n\nĐịa chỉ: ${mapUrl}`
          );
        }}
      />
      <ShareLocationModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        locationData={shareLocationData}
        ownerId={ownerId}
        currentUser={currentUser}
        onShareSuccess={() => {
          if (onNavigateToTab) onNavigateToTab('chat');
        }}
        theme={theme}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
