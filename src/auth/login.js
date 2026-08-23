import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Dimensions, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, StatusBar,
  ScrollView, Image, Animated, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react-native';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { sendLocalNotification } from './notificationHelper';

const { width, height } = Dimensions.get('window');
const VIETNAM_BG = require('./assets/vietnam_bg.jpg');
const LOGO_IMG    = require('./assets/logo.png');

// ── Welcome Overlay ────────────────────────────────────────────────────────────
function WelcomeOverlay({ visible, displayName }) {
  const opac  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const dot1  = useRef(new Animated.Value(0.3)).current;
  const dot2  = useRef(new Animated.Value(0.3)).current;
  const dot3  = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opac,  { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start(() => {
      const blink = (d, delay) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(d, { toValue: 1,   duration: 380, useNativeDriver: true }),
            Animated.timing(d, { toValue: 0.3, duration: 380, useNativeDriver: true }),
          ])
        ).start();
      blink(dot1, 0); blink(dot2, 190); blink(dot3, 380);
    });
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={[ov.backdrop, { opacity: opac }]}>
      <Animated.View style={[ov.card, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={['#1a0005', '#2d0010', '#1a0005']}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Gold glow */}
        <View style={ov.glow} />
        <Text style={ov.flag}>🇻🇳</Text>
        <Text style={ov.title}>Chào mừng trở lại!</Text>
        <Text style={ov.name}>{displayName}</Text>
        <Text style={ov.sub}>Đang tải hành trình của bạn...</Text>
        <View style={ov.dots}>
          {[dot1, dot2, dot3].map((d, i) => (
            <Animated.View key={i} style={[ov.dot, { opacity: d, transform: [{ scale: d }] }]} />
          ))}
        </View>
        <LinearGradient colors={['rgba(220,38,38,0.15)', 'transparent']} style={ov.divider} />
        <Text style={ov.tagline}>✨ Vivu360 · Khám phá Việt Nam</Text>
      </Animated.View>
    </Animated.View>
  );
}

const ov = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  },
  card: {
    width: width * 0.84, borderRadius: 28, padding: 36,
    alignItems: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5, shadowRadius: 28, elevation: 20,
  },
  glow: {
    position: 'absolute', top: -70, width: 260, height: 260,
    borderRadius: 130, backgroundColor: 'rgba(220,38,38,0.1)',
  },
  flag:    { fontSize: 52, marginBottom: 12 },
  title:   { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 6, letterSpacing: 0.3 },
  name:    { fontSize: 18, fontWeight: '800', color: '#f59e0b', marginBottom: 8 },
  sub:     { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '500', marginBottom: 22 },
  dots:    { flexDirection: 'row', gap: 8, marginBottom: 22 },
  dot:     { width: 9, height: 9, borderRadius: 5, backgroundColor: '#ef4444' },
  divider: { width: '80%', height: 1, marginBottom: 14 },
  tagline: { fontSize: 11, color: 'rgba(245,158,11,0.6)', fontWeight: '700', letterSpacing: 0.4 },
});

// ── Login Screen ───────────────────────────────────────────────────────────────
export function LoginScreen({ theme, isDarkMode, onRegisterPress, onLoginSuccess }) {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [focused,     setFocused]     = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welName,     setWelName]     = useState('');

  // Entry animations
  const slideY   = useRef(new Animated.Value(80)).current;
  const opacForm = useRef(new Animated.Value(0)).current;
  const logoScale= useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(slideY,   { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacForm, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const login = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    setLoading(true);
    const t = email.trim().toLowerCase();

    // Demo bypass hoặc khi Firebase API key là mẫu (placeholder) chưa cấu hình
    const apiKey = auth?.app?.options?.apiKey || '';
    const isFirebaseConfigured = apiKey && !apiKey.includes('...') && !apiKey.includes('_...');

    if (!isFirebaseConfigured || t === 'admin@vivu360.vn' || t === 'test@vivu360.vn') {
      const n = t === 'admin@vivu360.vn' ? 'Admin Vivu360' : (t === 'test@vivu360.vn' ? 'Hội Viên Demo' : email.trim().split('@')[0]);
      const uid = `user_${email.trim().replace(/[^a-zA-Z0-9]/g, '_')}`;
      setLoading(false);
      sendLocalNotification('Đăng nhập thành công 🎉', `Chào mừng ${n}!`);
      onLoginSuccess?.({ name: n, email: email.trim(), uid });
      return;
    }

    signInWithEmailAndPassword(auth, email.trim(), password.trim())
      .then(({ user }) => {
        setLoading(false);
        const n = user.displayName || user.email.split('@')[0];
        sendLocalNotification('Đăng nhập thành công 🎉', `Chào mừng ${n} quay lại!`);
        onLoginSuccess?.({ name: n, email: user.email, uid: user.uid });
      })
      .catch(err => {
        setLoading(false);
        console.log('[Auth] Firebase login notice:', err.code, err.message);

        const codeStr = (err.code || '').toLowerCase();
        const msgStr = (err.message || '').toLowerCase();

        // Fallback cho chế độ offline / chưa cấu hình Firebase API key thật
        if (
          codeStr.includes('api-key') ||
          codeStr.includes('apikey') ||
          msgStr.includes('api-key') ||
          msgStr.includes('api key') ||
          codeStr.includes('network-request-failed') ||
          codeStr.includes('internal-error')
        ) {
          const fallbackName = email.trim().split('@')[0];
          const fallbackUid = `user_${email.trim().replace(/[^a-zA-Z0-9]/g, '_')}`;
          sendLocalNotification('Đăng nhập thành công (Demo Mode) 🎉', `Chào mừng ${fallbackName}!`);
          onLoginSuccess?.({ name: fallbackName, email: email.trim(), uid: fallbackUid });
          return;
        }

        const msg =
          err.code === 'auth/invalid-credential'   ? 'Email hoặc mật khẩu không đúng.' :
          err.code === 'auth/invalid-email'         ? 'Email không hợp lệ.' :
          err.code === 'auth/user-not-found'        ? 'Tài khoản không tồn tại.' :
          err.code === 'auth/wrong-password'        ? 'Mật khẩu không chính xác.' :
          err.code === 'auth/too-many-requests'     ? 'Tài khoản tạm bị khóa. Thử lại sau.' :
                                                     'Đăng nhập thất bại. Vui lòng thử lại.';
        Alert.alert('Lỗi đăng nhập ⚠️', msg);
      });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Vietnam cultural collage background */}
      <Image source={VIETNAM_BG} style={s.bg} resizeMode="cover" />

      {/* Multi-layer gradient: subtle top, heavy bottom */}
      <LinearGradient
        colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.25)', 'rgba(10,3,3,0.82)', 'rgba(10,3,3,0.98)']}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.28, 0.58, 1]}
      />

      {/* Subtle red vignette */}
      <LinearGradient
        colors={['rgba(185,28,28,0.18)', 'transparent', 'rgba(185,28,28,0.12)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo section */}
            <Animated.View style={[s.logoWrap, { transform: [{ scale: logoScale }] }]}>
              <Text style={s.appName}>Vivu<Text style={s.appName360}>360</Text></Text>
              <View style={s.sloganBadge}>
                <Text style={s.appSlogan}>Hành trình ảo · Trải nghiệm thật</Text>
              </View>
            </Animated.View>

            {/* Glass form card */}
            <Animated.View
              style={[s.card, { transform: [{ translateY: slideY }], opacity: opacForm }]}
            >
              {/* Card gradient border effect */}
              <LinearGradient
                colors={['rgba(220,38,38,0.6)', 'rgba(245,158,11,0.4)', 'rgba(220,38,38,0.2)']}
                style={s.cardBorderGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={s.cardInner}>
                  <Text style={s.cardTitle}>Đăng nhập</Text>
                  <Text style={s.cardSub}>Chào mừng bạn trở lại với Vivu360 ✨</Text>

                  {/* Email */}
                  <View style={[s.field, focused === 'email' && s.fieldActive]}>
                    <LinearGradient
                      colors={focused === 'email' ? ['rgba(220,38,38,0.2)', 'rgba(245,158,11,0.1)'] : ['transparent', 'transparent']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Mail size={16} color={focused === 'email' ? '#f59e0b' : '#6b7280'} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      style={s.input}
                      placeholder="Địa chỉ email"
                      placeholderTextColor="#4b5563"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Password */}
                  <View style={[s.field, focused === 'pw' && s.fieldActive]}>
                    <LinearGradient
                      colors={focused === 'pw' ? ['rgba(220,38,38,0.2)', 'rgba(245,158,11,0.1)'] : ['transparent', 'transparent']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Lock size={16} color={focused === 'pw' ? '#f59e0b' : '#6b7280'} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocused('pw')}
                      onBlur={() => setFocused(null)}
                      style={s.input}
                      placeholder="Mật khẩu"
                      placeholderTextColor="#4b5563"
                      secureTextEntry={!showPw}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowPw(v => !v)} hitSlop={8}>
                      {showPw ? <EyeOff size={16} color="#4b5563" /> : <Eye size={16} color="#4b5563" />}
                    </Pressable>
                  </View>

                  {/* Forgot */}
                  <Pressable
                    style={s.forgotRow}
                    onPress={() => sendLocalNotification('Khôi phục mật khẩu ✉️', 'Đang gửi email khôi phục...')}
                  >
                    <Text style={s.forgotText}>Quên mật khẩu?</Text>
                  </Pressable>

                  {/* Login button */}
                  <Pressable onPress={login} disabled={loading} style={s.btnWrap}>
                    <LinearGradient
                      colors={['#dc2626', '#b91c1c', '#f59e0b']}
                      style={s.btn}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" />
                        : <>
                            <Text style={s.btnText}>Đăng nhập</Text>
                            <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
                          </>}
                    </LinearGradient>
                  </Pressable>

                  {/* Social */}
                  <View style={s.divRow}>
                    <View style={s.divLine} />
                    <Text style={s.divText}>hoặc tiếp tục với</Text>
                    <View style={s.divLine} />
                  </View>

                  <View style={s.socialRow}>
                    {[
                      { label: 'Google', color: '#ea4335', letter: 'G' },
                      { label: 'Facebook', color: '#1877f2', letter: 'f' },
                    ].map(({ label, color, letter }) => (
                      <Pressable
                        key={label}
                        style={s.socialBtn}
                        onPress={() => sendLocalNotification(`${label} Auth`, `Đang kết nối ${label}...`)}
                      >
                        <View style={[s.socialIcon, { backgroundColor: color }]}>
                          <Text style={s.socialLetter}>{letter}</Text>
                        </View>
                        <Text style={s.socialLabel}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Demo hint */}
                  <View style={s.demoBox}>
                    <Text style={s.demoText}>
                      💡 Demo: admin@vivu360.vn · test@vivu360.vn{'\n'}Mật khẩu: 123456
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[s.footer, { opacity: opacForm }]}>
              <Text style={s.footerLabel}>Chưa có tài khoản?</Text>
              <Pressable onPress={onRegisterPress} hitSlop={12}>
                <Text style={s.footerLink}>Đăng ký ngay →</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <WelcomeOverlay visible={showWelcome} displayName={welName} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0303' },
  bg:   { ...StyleSheet.absoluteFillObject, width, height },
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 28, paddingTop: 20 },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: 28, paddingTop: height * 0.06 },
  logoGlowRing: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7, shadowRadius: 22, elevation: 14,
    borderWidth: 2, borderColor: 'rgba(245,158,11,0.4)',
    backgroundColor: 'rgba(10,3,3,0.5)',
  },
  logoImage:   { width: 100, height: 100, borderRadius: 50 },
  appName:     { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  appName360:  { color: '#ef4444' },
  sloganBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginTop: 8,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  appSlogan:   {
    fontSize: 12.5,
    color: '#fbbf24',
    fontWeight: '800',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Card with gradient border
  card: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', marginBottom: 4 },
  cardBorderGradient: { padding: 1.5, borderRadius: 24 },
  cardInner: {
    backgroundColor: 'rgba(10,3,3,0.88)',
    borderRadius: 22.5, padding: 24,
  },
  cardTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  cardSub:   { fontSize: 12, color: '#6b7280', fontWeight: '500', marginBottom: 22 },

  // Input field
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, paddingHorizontal: 14, height: 52,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12, overflow: 'hidden',
  },
  fieldActive: { borderColor: 'rgba(220,38,38,0.6)' },
  input: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },

  // Forgot
  forgotRow: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#f59e0b', fontSize: 12, fontWeight: '700' },

  // Button
  btnWrap: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 10, marginBottom: 20,
  },
  btn: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },

  // Divider
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  divText: { color: '#374151', fontSize: 11, fontWeight: '600' },

  // Social
  socialRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  socialBtn: {
    flex: 1, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  socialIcon:   { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  socialLetter: { color: '#fff', fontWeight: '900', fontSize: 12 },
  socialLabel:  { color: '#9ca3af', fontSize: 13, fontWeight: '600' },

  // Demo
  demoBox: {
    backgroundColor: 'rgba(245,158,11,0.07)',
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  demoText: { color: '#b45309', fontSize: 11, fontWeight: '600', lineHeight: 16, textAlign: 'center' },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 16, paddingBottom: 6,
  },
  footerLabel: { color: '#6b7280', fontSize: 13, fontWeight: '500' },
  footerLink:  { color: '#f59e0b', fontSize: 13, fontWeight: '900' },
});
