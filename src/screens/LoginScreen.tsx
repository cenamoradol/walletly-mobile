import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '../theme/theme';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Ingresa correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      const data = await AuthService.login(email, password);
      if (data.access_token) {
        await login(data.access_token);
      } else {
        Alert.alert('Error', 'No se recibió el token de acceso');
      }
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Credenciales inválidas o error de conexión';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <LinearGradient 
        colors={['#041a55', '#021035', '#01081a']} 
        style={styles.background}
      >
        <View style={styles.inner}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <LinearGradient 
                colors={[Colors.primary, '#1E6BCE']} 
                style={styles.logoGradient}
              >
                <LogIn color="#FFF" size={32} />
              </LinearGradient>
            </View>
            <Text style={styles.logoText}>Walletly <Text style={{ color: Colors.primary }}>IA</Text></Text>
            <Text style={styles.subtitle}>Tu asistente financiero inteligente</Text>
          </View>

          {/* Form Card */}
          <View style={styles.glassCard}>
            <View style={styles.titleRow}>
              <Text style={styles.formTitle}>Bienvenido</Text>
              <Text style={styles.formSubtitle}>Inicia sesión para continuar</Text>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Mail color={email ? Colors.primary : 'rgba(255,255,255,0.3)'} size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Lock color={password ? Colors.primary : 'rgba(255,255,255,0.3)'} size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff color="rgba(255,255,255,0.3)" size={20} />
                ) : (
                  <Eye color="rgba(255,255,255,0.3)" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && { opacity: 0.8 }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient 
                colors={[Colors.primary, '#1E6BCE']} 
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.noAccountText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 2,
    marginBottom: 16,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#FFF',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    marginTop: 8,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // backdropFilter: 'blur(16px)', // Note: backdropFilter is not directly supported in standard RN, use translucent bg
  },
  titleRow: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: 'rgba(255,255,255,0.4)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Manrope_500Medium',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
  },
  loginBtn: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  noAccountText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
});
