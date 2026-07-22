import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, User, Mail, Phone, Lock, Eye, EyeOff, CircleCheck } from 'lucide-react-native';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { sendLocalNotification } from './notificationHelper';

const { width } = Dimensions.get('window');

export function RegisterScreen({ theme, isDarkMode, onBackPress, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Lỗi ⚠️', 'Vui lòng nhập đầy đủ các thông tin đăng ký.');
      sendLocalNotification('Lỗi ⚠️', 'Vui lòng nhập đầy đủ các thông tin đăng ký.');
      return;
    }
    
    if (password.trim() !== confirmPassword.trim()) {
      Alert.alert('Lỗi ⚠️', 'Mật khẩu xác nhận không khớp.');
      sendLocalNotification('Lỗi ⚠️', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Lỗi ⚠️', 'Vui lòng đồng ý với Điều khoản dịch vụ của Vivu360.');
      sendLocalNotification('Lỗi ⚠️', 'Vui lòng đồng ý với Điều khoản dịch vụ của Vivu360.');
      return;
    }

    setIsLoading(true);

    createUserWithEmailAndPassword(auth, email.trim(), password.trim())
      .then((userCredential) => {
        // Cập nhật tên hiển thị của người dùng sau khi đăng ký thành công
        updateProfile(userCredential.user, {
          displayName: name.trim()
        })
        .then(() => {
          signOut(auth)
            .then(() => {
              setIsLoading(false);
              Alert.alert('Đăng ký thành công! 🎉', `Chào mừng ${name.trim()} trở thành hội viên Vivu360. Vui lòng đăng nhập lại.`);
              sendLocalNotification(
                'Đăng ký thành công! 🎉',
                `Chào mừng ${name.trim()} trở thành hội viên Vivu360.`
              );
              if (onRegisterSuccess) {
                onRegisterSuccess();
              }
            })
            .catch((err) => {
              console.warn('Lỗi đăng xuất sau đăng ký:', err);
              setIsLoading(false);
              if (onRegisterSuccess) {
                onRegisterSuccess();
              }
            });
        })
        .catch((err) => {
          console.warn('Lỗi cập nhật profile:', err);
          signOut(auth)
            .then(() => {
              setIsLoading(false);
              Alert.alert('Đăng ký thành công! 🎉', `Chào mừng ${name.trim()} trở thành hội viên Vivu360. Vui lòng đăng nhập lại.`);
              sendLocalNotification(
                'Đăng ký thành công! 🎉',
                `Chào mừng ${name.trim()} trở thành hội viên Vivu360.`
              );
              if (onRegisterSuccess) {
                onRegisterSuccess();
              }
            })
            .catch(() => {
              setIsLoading(false);
              if (onRegisterSuccess) {
                onRegisterSuccess();
              }
            });
        });
      })
      .catch((error) => {
        setIsLoading(false);



        let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Địa chỉ email này đã được đăng ký sử dụng.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Địa chỉ email không hợp lệ.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        } else {
          errorMessage = error.message;
        }
        Alert.alert('Lỗi đăng ký ⚠️', errorMessage);
        sendLocalNotification('Lỗi đăng ký ⚠️', errorMessage);
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
        {/* Header Back Button (Transparent/Glass style) */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? 'rgba(24, 24, 27, 0.85)' : 'rgba(243, 232, 255, 0.85)', borderBottomColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }]}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' },
            ]}
            onPress={() => {
              if (onBackPress) {
                onBackPress();
              }
            }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Đăng ký tài khoản</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContent}>
            {/* Form Credentials Section (Glassmorphic Violet/Purple) */}
            <View style={[styles.glassCard, { backgroundColor: isDarkMode ? 'rgba(24, 24, 27, 0.45)' : 'rgba(255, 255, 255, 0.78)', borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.12)' }]}>
              {/* Greeting */}
              <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>Trở thành Hội Viên Vivu360</Text>
              <Text style={[styles.subWelcomeText, { color: theme.textSecondary }]}>
                Khởi hành chuyến phiêu lưu du ngoạn VR 360°, tích lũy điểm và khám phá danh lam thắng cảnh ngay hôm nay
              </Text>

            {/* Name Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Họ và tên</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('name'),
                    shadowOpacity: focusedField === 'name' ? 0.1 : 0,
                  },
                ]}
              >
                <User size={16} color={getIconColor('name')} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  placeholder="Nhập họ và tên đầy đủ"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Địa chỉ Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('email'),
                    shadowOpacity: focusedField === 'email' ? 0.1 : 0,
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
                  placeholder="Nhập địa chỉ email"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Mật khẩu</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('password'),
                    shadowOpacity: focusedField === 'password' ? 0.1 : 0,
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
                  placeholder="Tạo mật khẩu bảo mật"
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

            {/* Confirm Password Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Nhập lại mật khẩu</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.searchBg,
                    borderColor: getBorderColor('confirmPassword'),
                    shadowOpacity: focusedField === 'confirmPassword' ? 0.1 : 0,
                  },
                ]}
              >
                <Lock size={16} color={getIconColor('confirmPassword')} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  placeholder="Xác nhận lại mật khẩu"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Terms of Service Checkbox Toggle */}
            <Pressable style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
              <View style={[styles.checkbox, { borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : theme.border }]}>
                {agreeTerms && <View style={[styles.checkboxInner, { backgroundColor: '#3b82f6' }]} />}
              </View>
              <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                Tôi đồng ý với các <Text style={styles.linkAccent}>Điều khoản sử dụng</Text> và{' '}
                <Text style={styles.linkAccent}>Chính sách bảo mật</Text> của Vivu360.
              </Text>
            </Pressable>

            {/* Register Action Button */}
            <Pressable style={styles.registerBtn} onPress={handleRegister} disabled={isLoading}>
              <LinearGradient
                colors={['#3b82f6', '#06b6d4']}
                style={styles.registerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.registerBtnText}>Đăng ký tài khoản</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Back to Login */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerLabel, { color: theme.textSecondary }]}>Bạn đã có tài khoản?</Text>
            <Pressable onPress={onBackPress} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <Text style={styles.loginLinkText}>Đăng nhập ngay</Text>
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
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 10,
    elevation: 5,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },

  scrollContent: { flex: 1 },
  innerContent: {
    padding: 24,
    width: '100%',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  subWelcomeText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
    paddingHorizontal: 10,
    marginBottom: 26,
  },
  formGroup: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
    marginBottom: 24,
    paddingRight: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2.5,
  },
  termsText: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    flex: 1,
  },
  linkAccent: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  registerBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  registerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 12,
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  loginLinkText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '800',
  },
  bgGlow1: {
    position: 'absolute',
    top: 30,
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
    marginBottom: 10,
  },
});
