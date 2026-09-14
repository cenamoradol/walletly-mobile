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
  ScrollView,
  Dimensions
} from 'react-native';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Chrome, Apple } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '../theme/theme';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    try {
      const names = name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');
      
      const data = await AuthService.register({
        firstName,
        lastName,
        email,
        password
      });
      
      Alert.alert('Éxito', 'Cuenta creada correctamente. ¡Bienvenido!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.';
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            {/* Header / Back */}
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backBtn}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>

            <View style={styles.titleSection}>
              <Text style={styles.titleText}>Crear Cuenta</Text>
              <Text style={styles.subtitleText}>Únete a Walletly IA y mejora tu salud financiera</Text>
            </View>

            {/* Form Card */}
            <View style={styles.glassCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <User color={name ? Colors.primary : 'rgba(255,255,255,0.3)'} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={name}
                  onChangeText={setName}
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Mail color={email ? Colors.primary : 'rgba(255,255,255,0.3)'} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
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
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
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

              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Lock color={confirmPassword ? Colors.primary : 'rgba(255,255,255,0.3)'} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity 
                style={[styles.registerBtn, loading && { opacity: 0.8 }]} 
                onPress={handleRegister}
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
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o registrate con</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Chrome color="#fff" size={20} />
                  <Text style={styles.socialBtnText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Apple color="#fff" size={20} fill="#fff" />
                  <Text style={styles.socialBtnText}>Apple</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.alreadyAccountText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  titleSection: {
    marginBottom: 30,
  },
  titleText: {
    fontSize: 28,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
  registerBtn: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    marginHorizontal: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialBtn: {
    flex: 0.48,
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  alreadyAccountText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
});
