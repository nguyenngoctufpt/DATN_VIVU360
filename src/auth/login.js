import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, Globe, Sparkles } from 'lucide-react-native';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { sendLocalNotification } from './notificationHelper';

const { width } = Dimensions.get('window');

export function LoginScreen({ theme, isDarkMode, onRegisterPress, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi ⚠️', 'Vui lòng điền đầy đủ tài khoản và mật khẩu.');
      sendLocalNotification('Lỗi ⚠️', 'Vui lòng điền đầy đủ tài khoản và mật khẩu.');
      return;
    }

    setIsLoading(true);

    // MOCK BYPASS FOR TESTING & OFFLINE GRADUATION PRESENTATION (ONLY FOR TEST EMAILS)
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === 'admin@vivu360.vn' || trimmedEmail === 'test@vivu360.vn') {
      setTimeout(() => {
        setIsLoading(false);
        sendLocalNotification(
          'Đăng nhập thành công (Bypass)! 🎉',
          `Chào mừng ${trimmedEmail === 'admin@vivu360.vn' ? 'Quản trị viên' : 'Hội Viên'} đã đăng nhập Vivu360.`
        );
        if (onLoginSuccess) {
          onLoginSuccess({
            name: trimmedEmail === 'admin@vivu360.vn' ? 'Admin Vivu360' : 'Hội Viên Thử Nghiệm',
            email: email.trim(),
          });
        }
      }, 800);
      return;
    }

    signInWithEmailAndPassword(auth, email.trim(), password.trim())
      .then((userCredential) => {
        setIsLoading(false);
        const user = userCredential.user;
        const displayName = user.displayName || user.email.split('@')[0];
        
        // Gửi thông báo đẩy cục bộ chào mừng
        sendLocalNotification(
          'Đăng nhập thành công! 🎉',
          `Chào mừng ${displayName} đã quay trở lại với Vivu360.`
        );

        if (onLoginSuccess) {
          onLoginSuccess({
            name: displayName,
            email: user.email,
          });
        }
      })
      .catch((error) => {
        setIsLoading(false);



        let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
          errorMessage = 'Email hoặc mật khẩu không chính xác.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Địa chỉ email không hợp lệ.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Hãy thử lại sau.';
        } else {
          errorMessage = error.message;
        }
        Alert.alert('Lỗi đăng nhập ⚠️', errorMessage);
        sendLocalNotification('Lỗi đăng nhập ⚠️', errorMessage);
      });
  };

  const getBorderColor = (fieldName) => {
    if (focusedField === fieldName) return '#3b82f6';
    return theme.border;
  };

  const getIconColor = (fieldName) => {
    if (focusedField === fieldName) return '#3b82f6';
    return theme.textMuted;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000000' : theme.background }]}>
      {/* Travel Background Image */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80' }}
        style={[StyleSheet.absoluteFillObject, isDarkMode && { opacity: 0.18 }]}
        resizeMode="cover"
      />
      {/* Gradient Overlay (Sunset Violet & Purple Tinted) */}
      <LinearGradient
        colors={isDarkMode ? ['rgba(15, 23, 42, 0.65)', 'rgba(0, 0, 0, 0.98)'] : ['rgba(243, 232, 255, 0.45)', 'rgba(243, 232, 255, 0.98)']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Logo & Slogan Header */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                style={styles.logoRing}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.logoInner, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}>
                  <Globe size={42} color="#3b82f6" />
                  <Sparkles size={16} color="#00f2fe" style={styles.logoSparkle} />
                </View>
              </LinearGradient>
              <Text style={[styles.appName, { color: theme.textPrimary }]}>Vivu360</Text>
              <Text style={[styles.appSlogan, { color: isDarkMode ? '#60a5fa' : theme.textSecondary }]}>
                Hành trình ảo, Trải nghiệm thật
              </Text>
            </View>

            {/* Form Credentials Section (Glassmorphic Violet/Purple) */}
            <View style={[styles.glassCard, { backgroundColor: isDarkMode ? 'rgba(24, 24, 27, 0.45)' : 'rgba(255, 255, 255, 0.78)', borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.12)' }]}>
              <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>Chào mừng bạn trở lại</Text>
              <Text style={[styles.subWelcomeText, { color: isDarkMode ? '#cbd5e1' : theme.textSecondary }]}>
                Đăng nhập để tiếp tục tham quan ảo và kết nối cộng đồng du lịch
              </Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.searchBg,
                      borderColor: getBorderColor('email'),
                    },
                  ]}
                >
                  <Mail size={16} color={getIconColor('email')} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={[styles.textInput, { color: theme.textPrimary }]}
                    placeholder="Địa chỉ Email"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.searchBg,
                      borderColor: getBorderColor('password'),
                    },
                  ]}
                >
                  <Lock size={16} color={getIconColor('password')} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    style={[styles.textInput, { color: theme.textPrimary }]}
                    placeholder="Mật khẩu"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    {showPassword ? (
                      <EyeOff size={16} color={theme.textMuted} />
                    ) : (
                      <Eye size={16} color={theme.textMuted} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password Link */}
              <Pressable
                onPress={() => sendLocalNotification('Quên mật khẩu ✉️', 'Hệ thống gửi mã khôi phục đang được kích hoạt.')}
                style={styles.forgotBtn}
              >
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </Pressable>

              {/* Login Button */}
              <Pressable style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
                <LinearGradient
                  colors={['#3b82f6', '#06b6d4']}
                  style={styles.loginGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.loginText}>Đăng nhập</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Demo accounts hint */}
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 11.5, color: isDarkMode ? '#94a3b8' : '#475569', fontWeight: '700', textAlign: 'center', lineHeight: 16 }}>
                  💡 Tài khoản Demo: admin@vivu360.vn hoặc test@vivu360.vn (Mật khẩu: 123456)
                </Text>
              </View>
            </View>

            {/* Social Sign In Option */}
            <View style={styles.socialSection}>
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textMuted }]}>hoặc đăng nhập bằng</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <View style={styles.socialButtonsRow}>
                {/* Google Button */}
                <Pressable
                  style={[styles.socialBtn, { backgroundColor: isDarkMode ? 'rgba(23, 15, 38, 0.45)' : 'rgba(255, 255, 255, 0.55)', borderColor: isDarkMode ? 'rgba(168, 85, 247, 0.16)' : 'rgba(168, 85, 247, 0.08)' }]}
                  onPress={() => sendLocalNotification('Google Auth 🌐', 'Đang kết nối đến tài khoản Google...')}
                >
                  <View style={[styles.googleIcon, { backgroundColor: '#ea4335' }]}>
                    <Text style={styles.googleText}>G</Text>
                  </View>
                  <Text style={[styles.socialBtnText, { color: theme.textPrimary }]}>Google</Text>
                </Pressable>

                {/* Facebook Button */}
                <Pressable
                  style={[styles.socialBtn, { backgroundColor: isDarkMode ? 'rgba(23, 15, 38, 0.45)' : 'rgba(255, 255, 255, 0.55)', borderColor: isDarkMode ? 'rgba(168, 85, 247, 0.16)' : 'rgba(168, 85, 247, 0.08)' }]}
                  onPress={() => sendLocalNotification('Facebook Auth 🌐', 'Đang kết nối đến tài khoản Facebook...')}
                >
                  <View style={[styles.fbIcon, { backgroundColor: '#1877f2' }]}>
                    <Text style={styles.fbText}>f</Text>
                  </View>
                  <Text style={[styles.socialBtnText, { color: theme.textPrimary }]}>Facebook</Text>
                </Pressable>
              </View>
            </View>

            {/* Navigation to Register Screen */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerLabel, { color: theme.textSecondary }]}>Bạn chưa có tài khoản?</Text>
              <Pressable onPress={onRegisterPress} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <Text style={styles.registerLinkText}>Đăng ký ngay</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  logoInner: {
    flex: 1,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoSparkle: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 14,
    letterSpacing: 1.2,
  },
  appSlogan: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.6,
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subWelcomeText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
    width: '100%',
  },
  inputContainer: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '800',
  },
  loginBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  socialSection: {
    width: '100%',
    marginBottom: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    gap: 10,
  },
  dividerLine: {
    height: 1,
    flex: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    marginTop: -1,
  },
  fbIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    marginTop: -2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  registerLinkText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '800',
  },
  bgGlow1: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.6,
  },
  bgGlow2: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.5,
  },
  glassCard: {
    width: '100%',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
});
