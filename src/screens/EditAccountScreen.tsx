import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Switch, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Eye,
  Activity,
  ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../theme/theme';
import { AuthService } from '../services/auth.service';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const InputField = ({ label, value, onChangeText, icon, placeholder, keyboardType = 'default' }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <View style={styles.inputIconBg}>
        {React.cloneElement(icon, { size: 18, color: Colors.primary })}
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.3)"
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

const ToggleItem = ({ label, value, onValueChange, icon, color = Colors.primary, isLast = false }: any) => (
  <View style={[styles.toggleItem, isLast && styles.lastItem]}>
    <View style={styles.itemLeft}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {React.cloneElement(icon, { size: 18, color: color })}
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#1e293b', true: Colors.primary }}
      thumbColor={'#fff'}
    />
  </View>
);

export default function EditAccountScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await AuthService.getProfile();
      setUser(data);
      setFirstName(data?.firstName || '');
      setLastName(data?.lastName || '');
      setEmail(data?.email || '');
      setPhone(data?.phoneNumber || '');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      await AuthService.updateProfile({
        firstName,
        lastName,
        email,
        phoneNumber: phone,
      });
      
      Alert.alert('¡Éxito!', 'Tu perfil ha sido actualizado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Cuenta</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={saving}
            style={[styles.saveBtn, saving && { opacity: 0.5 }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Section: Datos Personales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN BÁSICA</Text>
            <View style={styles.glassCard}>
              <InputField 
                label="NOMBRE" 
                value={firstName} 
                onChangeText={setFirstName}
                icon={<User />}
                placeholder="Nombre"
              />
              <InputField 
                label="APELLIDO" 
                value={lastName} 
                onChangeText={setLastName}
                icon={<User />}
                placeholder="Apellido"
              />
              <InputField 
                label="CORREO ELECTRÓNICO" 
                value={email} 
                onChangeText={setEmail}
                icon={<Mail />}
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
              />
              <InputField 
                label="TELÉFONO" 
                value={phone} 
                onChangeText={setPhone}
                icon={<Phone />}
                placeholder="+1 234 567 890"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Section: Seguridad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEGURIDAD</Text>
            <View style={styles.glassCard}>
              <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <View style={styles.itemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                    <Lock size={18} color="#8b5cf6" />
                  </View>
                  <Text style={styles.itemLabel}>Cambiar Contraseña</Text>
                </View>
                <ChevronRight color="rgba(255,255,255,0.3)" size={18} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#021035', // Navy Blue Deep from Stitch
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#021035',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#021035',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Manrope_800ExtraBold',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1.2,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  inputIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(38, 56, 182, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Manrope_500Medium',
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  lastItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemLabel: {
    fontSize: 15,
    fontFamily: 'Manrope_500Medium',
    color: '#fff',
  },
});
