import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { 
  User,
  Shield,
  Star,
  LayoutGrid,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight, 
  Pencil,
  ArrowRight,
  Coins,
  Check,
  X,
  UserCog,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../theme/theme';
import { AuthService } from '../services/auth.service';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from '../context/CurrencyContext';

const { width, height } = Dimensions.get('window');

const STITCH_COLORS = {
  background: '#021035',
  primary: '#2638B6',
  accent: '#1E6BCE',
  textSecondary: '#94A3B8',
  danger: '#F43F5E',
  emerald: '#10B981',
};

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const { currency, setCurrencyByCode } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const data = await AuthService.getProfile();
      setUser(data);
    } catch (error) {
      console.error(error);
      setUser({
        firstName: 'Christian',
        lastName: 'Developer',
        email: 'chris.dev@walletly.ia',
        availableCredits: 8.5
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  const handleSelectCurrency = async (code: CurrencyCode) => {
    await setCurrencyByCode(code);
    setCurrencyModalVisible(false);
  };

  const SettingsRow = ({ 
    icon, 
    label, 
    value, 
    onPress, 
    isLast = false, 
    badge,
    color = '#fff'
  }: any) => (
    <TouchableOpacity 
      style={[styles.settingsRow, isLast && styles.lastRow]} 
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconCircle}>
          {React.cloneElement(icon, { size: 18, color: color })}
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.rowLabel}>{label}</Text>
          {value && <Text style={styles.rowValue}>{value}</Text>}
        </View>
      </View>
      <View style={styles.rowRight}>
        {badge && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <ChevronRight color="rgba(255,255,255,0.2)" size={18} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={STITCH_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <View style={styles.avatarGradient}>
                <Text style={styles.avatarInitial}>{user?.firstName?.[0] || 'U'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.pencilBtn}>
              <Pencil color="#fff" size={14} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {user?.firstName || 'Usuario'} {user?.lastName || ''}
          </Text>
          
          <View style={styles.activePlanBadge}>
            <Text style={styles.activePlanText}>PLAN {user?.plan?.name?.toUpperCase() || 'FREE'} ACTIVO</Text>
          </View>
        </View>

        {/* Featured Plan Card */}
        <View style={styles.planCardContainer}>
          <LinearGradient
            colors={['#0A194E', '#061033']}
            style={styles.planCard}
          >
            <View style={styles.planRow}>
              <View>
                <View style={styles.planLabel}>
                  <Text style={styles.planLabelText}>PLAN ACTUAL</Text>
                </View>
                <Text style={styles.planTitle}>Plan {user?.plan?.name || 'Gratis'}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.gestionarBtn}
                onPress={() => navigation.navigate('PlanManagement')}
              >
                <UserCog color="#fff" size={16} />
                <Text style={styles.gestionarBtnText}>Gestionar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.billingSection}>
              <Text style={styles.billingText}>
                Próxima facturación: {(() => {
                  const date = new Date(user?.lastCreditRefresh || user?.createdAt || new Date());
                  date.setMonth(date.getMonth() + 1);
                  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  return `${date.getDate()} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
                })()} • ${user?.plan?.price || 0}/mes
              </Text>
              
              <View style={styles.creditsSection}>
                <Text style={styles.creditsLabel}>
                  Créditos restantes: <Text style={styles.creditsBold}>{user?.availableCredits || 0}/{user?.plan?.creditsPerMonth || 0}</Text>
                </Text>
                <View style={styles.creditBarContainer}>
                  <View style={[
                    styles.creditBarFill, 
                    { width: `${Math.min(100, ((user?.availableCredits || 0) / (user?.plan?.creditsPerMonth || 1)) * 100)}%` }
                  ]} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Settings List */}
        <View style={styles.listContainer}>
          <SettingsRow 
            icon={<User />} 
            label="Editar Cuenta" 
            onPress={() => navigation.navigate('EditAccount')}
          />
          <SettingsRow 
            icon={<Star />} 
            label="Plan Activo" 
            badge={user?.plan?.name || 'FREE'} 
            color={STITCH_COLORS.emerald}
            onPress={() => navigation.navigate('PlanManagement')}
          />
          <SettingsRow 
            icon={<Coins />} 
            label="Moneda" 
            value={`${currency.name} (${currency.code})`}
            onPress={() => setCurrencyModalVisible(true)}
            color={STITCH_COLORS.accent}
          />
          <SettingsRow 
            icon={<LayoutGrid />} 
            label="Categorías" 
            onPress={() => navigation.navigate('Categories')}
          />
          <SettingsRow 
            icon={<CreditCard />} 
            label="Métodos de Pago" 
            onPress={() => navigation.navigate('PaymentMethods')}
          />
          <SettingsRow 
            icon={<HelpCircle />} 
            label="Soporte y Ayuda" 
            isLast={true}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Cerrar Sesión', style: 'destructive', onPress: handleLogout }
          ])}
        >
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0 • Walletly IA</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Moneda</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)} style={styles.closeBtn}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={SUPPORTED_CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.currencyItem} 
                  onPress={() => handleSelectCurrency(item.code)}
                >
                  <View style={styles.currencyInfo}>
                    <View style={styles.symbolCircle}>
                      <Text style={styles.currencySymbolText}>{item.symbol}</Text>
                    </View>
                    <View>
                      <Text style={styles.currencyNameText}>{item.name}</Text>
                      <Text style={styles.currencyCodeText}>{item.code}</Text>
                    </View>
                  </View>
                  {currency.code === item.code && (
                    <Check color={STITCH_COLORS.emerald} size={20} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.currencyList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: STITCH_COLORS.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: STITCH_COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(38, 56, 182, 0.4)',
    padding: 3,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
  },
  pencilBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: STITCH_COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: STITCH_COLORS.background,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
    marginBottom: 8,
  },
  activePlanBadge: {
    backgroundColor: 'rgba(38, 56, 182, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activePlanText: {
    color: STITCH_COLORS.emerald,
    fontSize: 10,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: 1,
  },
  planCardContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  planCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  planLabel: {
    backgroundColor: 'rgba(38, 56, 182, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  planLabelText: {
    color: '#3B82F6',
    fontSize: 10,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: 1,
  },
  planTitle: {
    fontSize: 32,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#fff',
  },
  gestionarBtn: {
    backgroundColor: STITCH_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginTop: 10,
  },
  gestionarBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
  billingSection: {
    marginTop: 0,
  },
  billingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Manrope_500Medium',
    marginBottom: 16,
  },
  creditsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creditsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Manrope_500Medium',
  },
  creditsBold: {
    color: '#fff',
    fontFamily: 'Manrope_700Bold',
  },
  creditBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    maxWidth: 120,
  },
  creditBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  labelContainer: {
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
    color: '#fff',
  },
  rowValue: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: STITCH_COLORS.textSecondary,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(38, 56, 182, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  badgeText: {
    color: STITCH_COLORS.primary,
    fontSize: 10,
    fontFamily: 'Manrope_800ExtraBold',
  },
  logoutBtn: {
    marginTop: 40,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: STITCH_COLORS.danger,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: 'rgba(255,255,255,0.2)',
    marginTop: 40,
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: STITCH_COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
  },
  closeBtn: {
    padding: 4,
  },
  currencyList: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 12,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  currencySymbolText: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
  },
  currencyNameText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#fff',
  },
  currencyCodeText: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: STITCH_COLORS.textSecondary,
    marginTop: 2,
  },
});
