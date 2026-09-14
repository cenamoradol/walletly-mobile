import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { 
  Shield, 
  Check, 
  ArrowLeft, 
  Zap, 
  Star,
  Crown,
  Sparkles,
  Info
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '../theme/theme';
import { PlansService, Plan } from '../services/plans.service';
import { AuthService } from '../services/auth.service';
import { PurchasesService } from '../services/purchases.service';
import { PurchasesPackage } from 'react-native-purchases';

const { width } = Dimensions.get('window');

const STITCH_COLORS = {
  background: '#021035',
  primary: '#2638B6',
  accent: '#1E6BCE',
  textSecondary: '#94A3B8',
  emerald: '#10B981',
  gold: '#F59E0B',
};

export default function PlanManagementScreen({ navigation }: any) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, profileData] = await Promise.all([
        PlansService.getPlans(),
        AuthService.getProfile()
      ]);
      setPlans(plansData);
      setUser(profileData);

      // Initialize Purchases
      if (profileData?.id) {
        await PurchasesService.init(profileData.id);
        const availablePackages = await PurchasesService.getOfferings();
        setOfferings(availablePackages);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los datos de compra');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan: Plan) => {
    const pkg = offerings.find(o => 
      o.product.identifier.toLowerCase().includes(plan.name.toLowerCase())
    );

    if (!pkg) {
      Alert.alert('Próximamente', 'Este plan aún no está disponible para compra en esta plataforma.');
      return;
    }

    setBuying(plan.id);
    try {
      const result = await PurchasesService.purchasePackage(pkg);
      if (result.success) {
        Alert.alert('¡Éxito!', 'Tu plan ha sido actualizado correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        // Note: The backend will be updated via Webhook from RevenueCat
      } else if (result.error && !result.error.userCancelled) {
        Alert.alert('Error', 'Hubo un problema procesando tu compra.');
      }
    } finally {
      setBuying(null);
    }
  };

  const PlanCard = ({ plan, isCurrent }: { plan: Plan, isCurrent: boolean }) => {
    const isPremium = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('gold');
    const isPlus = plan.name.toLowerCase().includes('plus');

    return (
      <View style={styles.planCardContainer}>
        <LinearGradient
          colors={isPremium 
            ? ['rgba(38, 56, 182, 0.2)', 'rgba(2, 16, 53, 0.4)'] 
            : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={[
            styles.planCard,
            isCurrent && styles.activePlanCard
          ]}
        >
          {isCurrent && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>PLAN ACTUAL</Text>
            </View>
          )}

          <View style={styles.planCardHeader}>
            <View style={[
              styles.planIconContainer,
              { backgroundColor: isPremium ? 'rgba(245, 158, 11, 0.1)' : isPlus ? 'rgba(38, 56, 182, 0.1)' : 'rgba(255,255,255,0.05)' }
            ]}>
              {isPremium ? (
                <Crown color={STITCH_COLORS.gold} size={24} />
              ) : isPlus ? (
                <Zap color={STITCH_COLORS.primary} size={24} />
              ) : (
                <Shield color={STITCH_COLORS.textSecondary} size={24} />
              )}
            </View>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                {plan.price === 0 ? 'Gratis' : `$${plan.price}/mes`}
              </Text>
            </View>
          </View>

          <View style={styles.featuresList}>
            <FeatureItem text={`${plan.creditsPerMonth} Créditos IA mensuales`} />
            <FeatureItem text="Análisis de gastos detallado" />
            <FeatureItem text="Categorías personalizadas" />
            {isPlus && <FeatureItem text="Soporte prioritario" />}
            {isPremium && <FeatureItem text="Reportes mensuales avanzados" />}
            {isPremium && <FeatureItem text="Sin anuncios" />}
          </View>

          {!isCurrent && (
            <TouchableOpacity 
              style={[
                styles.actionBtn,
                isPremium ? styles.premiumBtn : styles.standardBtn
              ]}
              onPress={() => handlePurchase(plan)}
              disabled={!!buying}
            >
              {buying === plan.id ? (
                <ActivityIndicator color={isPremium ? STITCH_COLORS.background : '#fff'} />
              ) : (
                <Text style={[
                  styles.actionBtnText,
                  isPremium ? styles.premiumBtnText : styles.standardBtnText
                ]}>
                  Seleccionar Plan
                </Text>
              )}
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  };

  const FeatureItem = ({ text }: { text: string }) => (
    <View style={styles.featureItem}>
      <View style={styles.checkCircle}>
        <Check color={STITCH_COLORS.emerald} size={12} strokeWidth={3} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Plan</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <LinearGradient
            colors={['rgba(38, 56, 182, 0.1)', 'transparent']}
            style={styles.infoCard}
          >
            <Sparkles color={STITCH_COLORS.primary} size={24} />
            <Text style={styles.infoText}>
              Mejora tu plan para desbloquear análisis financieros impulsados por IA y más funciones exclusivas.
            </Text>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Planes Disponibles</Text>

        {plans.map(plan => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            isCurrent={user?.planId === plan.id} 
          />
        ))}

        <View style={styles.footerInfo}>
          <Info color={STITCH_COLORS.textSecondary} size={16} />
          <Text style={styles.footerText}>
            Tu suscripción se renovará automáticamente cada mes. Puedes cancelarla en cualquier momento desde la configuración de tu cuenta.
          </Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: STITCH_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: STITCH_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  infoSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(38, 56, 182, 0.2)',
    gap: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: STITCH_COLORS.textSecondary,
    fontFamily: 'Manrope_500Medium',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  planCardContainer: {
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  activePlanCard: {
    borderColor: 'rgba(38, 56, 182, 0.4)',
    borderWidth: 2,
  },
  activeBadge: {
    position: 'absolute',
    top: 20,
    right: -30,
    backgroundColor: STITCH_COLORS.emerald,
    paddingHorizontal: 40,
    paddingVertical: 5,
    transform: [{ rotate: '45deg' }],
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Manrope_800ExtraBold',
    textAlign: 'center',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    fontSize: 22,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#fff',
  },
  planPrice: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: STITCH_COLORS.textSecondary,
    marginTop: 2,
  },
  featuresList: {
    gap: 14,
    marginBottom: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.7)',
  },
  actionBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  standardBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  premiumBtn: {
    backgroundColor: '#fff',
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
  },
  standardBtnText: {
    color: '#fff',
  },
  premiumBtnText: {
    color: STITCH_COLORS.background,
  },
  footerInfo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: 'rgba(148, 163, 184, 0.5)',
    lineHeight: 18,
  },
});
