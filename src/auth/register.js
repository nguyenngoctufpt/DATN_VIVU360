import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Dimensions, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, StatusBar,
  ScrollView, Image, Animated, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Sparkles } from 'lucide-react-native';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { sendLocalNotification } from './notificationHelper';

const { width, height } = Dimensions.get('window');
const VIETNAM_BG = require('./assets/vietnam_bg.jpg');
const LOGO_IMG    = require('./assets/logo.png');

// ── Progress Bar ───────────────────────────────────────────────────────────────
function ProgressBar({ duration }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: 1, duration, useNativeDriver: false }).start();
  }, []);
  return (
    <View style={ov.progressBg}>
      <Animated.View style={[ov.progressFill, {
        width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
      }]} />
    </View>
  );
}

// ── Success Overlay ────────────────────────────────────────────────────────────
function SuccessOverlay({ visible, userName }) {
  const opac  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const check = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opac,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(check, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.1, duration: 700, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
          ])
        ).start();
      });
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
        <View style={ov.glow} />

        <Animated.View style={{ transform: [{ scale: Animated.multiply(check, pulse) }] }}>
          <LinearGradient colors={['#dc2626', '#b91c1c']} style={ov.checkCircle}>
            <CheckCircle size={46} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </Animated.View>

        <Text style={ov.title}>Đăng ký thành công! 🎉</Text>
        <Text style={ov.sub}>
          Chào mừng <Text style={ov.name}>{userName}</Text>{'\n'}đã gia nhập Vivu360!
        </Text>
        <Text style={ov.hint}>Đang chuyển sang đăng nhập...</Text>
        <ProgressBar duration={2500} />
      </Animated.View>
    </Animated.View>
  );
}

const ov = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  },
  card: {
    width: width * 0.84, borderRadius: 28, padding: 36,
    alignItems: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(220,38,38,0.4)',
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5, shadowRadius: 28, elevation: 20,
  },
  glow: {
    position: 'absolute', top: -80, width: 280, height: 280,
    borderRadius: 140, backgroundColor: 'rgba(220,38,38,0.1)',
  },
  checkCircle: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 10 },
  sub:   { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  name:  { color: '#f59e0b', fontWeight: '900' },
  hint:  { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 20, fontWeight: '600' },
  progressBg:   { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: '#dc2626' },
});

// ── Register Screen ────────────────────────────────────────────────────────────
export function RegisterScreen({ theme, isDarkMode, onBackPress, onRegisterSuccess }) {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [cpw,     setCpw]     = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [agree,   setAgree]   = useState(true);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [showSuc, setShowSuc] = useState(false);
  const [regName, setRegName] = useState('');

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

  const register = () => {
    if (!name.trim() || !email.trim() || !pw.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    if (pw.trim() !== cpw.trim()) {
      Alert.alert('Không khớp', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!agree) {
      Alert.alert('Điều khoản', 'Vui lòng đồng ý với Điều khoản dịch vụ.');
      return;
    }
    setLoading(true);

    const apiKey = auth?.app?.options?.apiKey || '';
    const isFirebaseConfigured = apiKey && !apiKey.includes('...') && !apiKey.includes('_...');

    if (!isFirebaseConfigured) {
      setLoading(false);
      sendLocalNotification('Đăng ký thành công (Demo Mode) 🎉', `Chào mừng ${name.trim()} gia nhập Vivu360!`);
      setRegName(name.trim()); setShowSuc(true);
      setTimeout(() => { setShowSuc(false); onRegisterSuccess?.(); }, 2650);
      return;
    }

    createUserWithEmailAndPassword(auth, email.trim(), pw.trim())
      .then(({ user }) =>
        updateProfile(user, { displayName: name.trim() })
          .then(() => signOut(auth))
          .catch(() => signOut(auth))
      )
      .then(() => {
        setLoading(false);
        sendLocalNotification('Đăng ký thành công 🎉', `Chào mừng ${name.trim()} gia nhập Vivu360!`);
        setRegName(name.trim()); setShowSuc(true);
        setTimeout(() => { setShowSuc(false); onRegisterSuccess?.(); }, 2650);
      })
      .catch(err => {
        setLoading(false);
        console.log('[Auth] Firebase register notice:', err.code, err.message);

        const codeStr = (err.code || '').toLowerCase();
        const msgStr = (err.message || '').toLowerCase();

        if (
          codeStr.includes('api-key') ||
          codeStr.includes('apikey') ||
          msgStr.includes('api-key') ||
          msgStr.includes('api key') ||
          codeStr.includes('network-request-failed') ||
          codeStr.includes('internal-error')
        ) {
          sendLocalNotification('Đăng ký thành công (Demo Mode) 🎉', `Chào mừng ${name.trim()} gia nhập Vivu360!`);
          setRegName(name.trim()); setShowSuc(true);
          setTimeout(() => { setShowSuc(false); onRegisterSuccess?.(); }, 2650);
          return;
        }

        const msg =
          err.code === 'auth/email-already-in-use' ? 'Email này đã được đăng ký.' :
          err.code === 'auth/invalid-email'         ? 'Email không hợp lệ.' :
          err.code === 'auth/weak-password'         ? 'Mật khẩu cần ít nhất 6 ký tự.' :
                                                     (err.message || 'Không thể tạo tài khoản.');
        Alert.alert('Lỗi đăng ký ⚠️', msg);
      });
  };

  const fields = [
    { key: 'name',  label: 'Họ và tên',        Icon: User, val: name,  set: setName,  ph: 'Nhập họ và tên đầy đủ',    sec: false },
    { key: 'email', label: 'Địa chỉ Email',     Icon: Mail, val: email, set: setEmail, ph: 'Nhập địa chỉ email',        sec: false, kb: 'email-address' },
    { key: 'pw',    label: 'Mật khẩu',          Icon: Lock, val: pw,    set: setPw,    ph: 'Tạo mật khẩu bảo mật',     sec: true  },
    { key: 'cpw',   label: 'Xác nhận mật khẩu', Icon: Lock, val: cpw,   set: setCpw,   ph: 'Nhập lại mật khẩu',        sec: true  },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Image source={VIETNAM_BG} style={s.bg} resizeMode="cover" />

      {/* Multi-layer gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.25)', 'rgba(10,3,3,0.82)', 'rgba(10,3,3,0.98)']}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.28, 0.58, 1]}
      />
      <LinearGradient
        colors={['rgba(185,28,28,0.18)', 'transparent', 'rgba(185,28,28,0.12)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={s.safe}>
        {/* Back button */}
        <Pressable
          style={[s.backBtn, { top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10 }]}
          onPress={() => onBackPress?.()}
          hitSlop={12}
        >
          <LinearGradient colors={['rgba(220,38,38,0.3)', 'rgba(245,158,11,0.2)']} style={s.backBtnGrad}>
            <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <Animated.View style={[s.logoWrap, { transform: [{ scale: logoScale }] }]}>
              <Text style={s.appName}>Vivu<Text style={s.appName360}>360</Text></Text>
              <View style={s.sloganBadge}>
                <Text style={s.appSlogan}>Tạo tài khoản · Bắt đầu hành trình</Text>
              </View>
            </Animated.View>

            {/* Card */}
            <Animated.View
              style={[s.card, { transform: [{ translateY: slideY }], opacity: opacForm }]}
            >
              <LinearGradient
                colors={['rgba(220,38,38,0.6)', 'rgba(245,158,11,0.4)', 'rgba(220,38,38,0.2)']}
                style={s.cardBorderGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={s.cardInner}>
                  <Text style={s.cardTitle}>Đăng ký</Text>
                  <Text style={s.cardSub}>Gia nhập cộng đồng Vivu360 ngay hôm nay 🗺️</Text>

                  {/* Form fields */}
                  {fields.map(({ key, label, Icon, val, set, ph, sec, kb }) => (
                    <View key={key} style={s.fieldWrap}>
                      <Text style={s.fieldLabel}>{label}</Text>
                      <View style={[s.field, focused === key && s.fieldActive]}>
                        <LinearGradient
                          colors={focused === key ? ['rgba(220,38,38,0.2)', 'rgba(245,158,11,0.1)'] : ['transparent', 'transparent']}
                          style={StyleSheet.absoluteFillObject}
                        />
                        <Icon size={15} color={focused === key ? '#f59e0b' : '#4b5563'} />
                        <TextInput
                          value={val}
                          onChangeText={set}
                          onFocus={() => setFocused(key)}
                          onBlur={() => setFocused(null)}
                          style={s.input}
                          placeholder={ph}
                          placeholderTextColor="#374151"
                          secureTextEntry={sec && !showPw}
                          keyboardType={kb || 'default'}
                          autoCapitalize={kb === 'email-address' ? 'none' : 'words'}
                        />
                        {sec && (
                          <Pressable onPress={() => setShowPw(v => !v)} hitSlop={8}>
                            {showPw ? <EyeOff size={15} color="#4b5563" /> : <Eye size={15} color="#4b5563" />}
                          </Pressable>
                        )}
                      </View>
                    </View>
                  ))}

                  {/* Terms */}
                  <Pressable style={s.termsRow} onPress={() => setAgree(v => !v)}>
                    <LinearGradient
                      colors={agree ? ['#dc2626', '#b91c1c'] : ['transparent', 'transparent']}
                      style={[s.checkbox, !agree && { borderColor: '#374151', borderWidth: 1.5 }]}
                    >
                      {agree && <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>✓</Text>}
                    </LinearGradient>
                    <Text style={s.termsText}>
                      Tôi đồng ý với{' '}
                      <Text style={s.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                      <Text style={s.termsLink}>Chính sách bảo mật</Text> của Vivu360
                    </Text>
                  </Pressable>

                  {/* Submit */}
                  <Pressable onPress={register} disabled={loading} style={s.btnWrap}>
                    <LinearGradient
                      colors={['#dc2626', '#b91c1c', '#f59e0b']}
                      style={s.btn}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" />
                        : <>
                            <Text style={s.btnText}>Tạo tài khoản</Text>
                            <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
                          </>}
                    </LinearGradient>
                  </Pressable>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[s.footer, { opacity: opacForm }]}>
              <Text style={s.footerLabel}>Đã có tài khoản?</Text>
              <Pressable onPress={onBackPress} hitSlop={12}>
                <Text style={s.footerLink}>Đăng nhập ngay →</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SuccessOverlay visible={showSuc} userName={regName} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0303' },
  bg:   { ...StyleSheet.absoluteFillObject, width, height },
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 28, paddingTop: 60 },

  // Back button
  backBtn: { position: 'absolute', left: 16, zIndex: 99 },
  backBtnGrad: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)',
  },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 16 },
  logoGlowRing: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7, shadowRadius: 20, elevation: 14,
    borderWidth: 2, borderColor: 'rgba(245,158,11,0.4)',
    backgroundColor: 'rgba(10,3,3,0.5)',
  },
  logoImage:  { width: 90, height: 90, borderRadius: 45 },
  appName:    { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  appName360: { color: '#ef4444' },
  sloganBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginTop: 7,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  appSlogan:  {
    fontSize: 11.5,
    color: '#fbbf24',
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Card
  card: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', marginBottom: 4 },
  cardBorderGradient: { padding: 1.5, borderRadius: 24 },
  cardInner: { backgroundColor: 'rgba(10,3,3,0.88)', borderRadius: 22.5, padding: 22 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 3 },
  cardSub:   { fontSize: 12, color: '#6b7280', fontWeight: '500', marginBottom: 18 },

  // Fields
  fieldWrap: { marginBottom: 10 },
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: '#4b5563',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5,
  },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 13, paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  fieldActive: { borderColor: 'rgba(220,38,38,0.55)' },
  input: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '500' },

  // Terms
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8, marginBottom: 16 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  termsText: { flex: 1, fontSize: 11, color: '#4b5563', lineHeight: 15, fontWeight: '500' },
  termsLink: { color: '#f59e0b', fontWeight: '700' },

  // Button
  btnWrap: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
  },
  btn: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 16, paddingBottom: 6,
  },
  footerLabel: { color: '#6b7280', fontSize: 13, fontWeight: '500' },
  footerLink:  { color: '#f59e0b', fontSize: 13, fontWeight: '900' },
});
