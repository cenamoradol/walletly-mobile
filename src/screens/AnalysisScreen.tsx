import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme/theme';
import {
  Sparkles,
  PieChart as PieChartIcon, Plus, X, Check, Wallet,
  ShoppingBag, CreditCard, Car, Utensils, Briefcase, Home, Heart,
  Gamepad2, GraduationCap, Coffee, Smartphone, Plane, Music,
  Zap as ZapIcon, Banknote, Monitor, Shirt, Dumbbell, Gift,
  Shield, Palmtree, Stethoscope, Tag, Clock, Building2,
} from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCurrency } from '../context/CurrencyContext';
import { BudgetsService, Budget } from '../services/budgets.service';
import { CategoriesService, Category } from '../services/categories.service';
import api from '../services/api';

const { width } = Dimensions.get('window');

const ICON_MAP: Record<string, any> = {
  shopping_bag: ShoppingBag, credit_card: CreditCard, car: Car, utensils: Utensils,
  briefcase: Briefcase, home: Home, heart: Heart, gamepad: Gamepad2,
  graduation: GraduationCap, coffee: Coffee, smartphone: Smartphone,
  plane: Plane, music: Music, zap: ZapIcon, banknote: Banknote,
  monitor: Monitor, shirt: Shirt, dumbbell: Dumbbell, gift: Gift,
  shield: Shield, palmtree: Palmtree, stethoscope: Stethoscope, tag: Tag,
};

const PM_ICON_MAP: Record<string, any> = {
  cash: Banknote,
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank: Building2,
  mobile: Smartphone,
};

const PM_COLORS: string[] = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#F59E0B'];

interface PaymentMethodSpending {
  id: string;
  name: string;
  type: string;
  expenses: number;
  expenseCount: number;
  income: number;
  incomeCount: number;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function AnalysisScreen() {
  const { formatCurrency } = useCurrency();
  const [activeFilter, setActiveFilter] = useState('Meta Mensual');
  const navigation = useNavigation<any>();
  const now = new Date();

  // Budget state
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth] = useState(now.getMonth() + 1);
  const [currentYear] = useState(now.getFullYear());

  // Create modal
  const [createVisible, setCreateVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategoryIds, setFormCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  // Payment method spending
  const [pmSpending, setPmSpending] = useState<PaymentMethodSpending[]>([]);
  const [pmTotal, setPmTotal] = useState(0);

  const loadData = async () => {
    try {
      const [budgetData, spendingRes] = await Promise.all([
        BudgetsService.getAll(currentMonth, currentYear),
        api.get('/dashboard/spending-by-method'),
      ]);
      setBudgets(budgetData);
      setPmSpending(spendingRes.data.methods);
      setPmTotal(spendingRes.data.totalExpenses);
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setBudgetsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentMonth, currentYear]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Create budget
  const openCreate = async () => {
    setFormName('');
    setFormAmount('');
    setFormCategoryIds([]);
    try {
      const cats = await CategoriesService.getAll();
      setCategories(cats.filter((c) => c.type === 'EXPENSE'));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    setCreateVisible(true);
  };

  const toggleCategory = (id: string) => {
    setFormCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!formName.trim()) { Alert.alert('Error', 'El nombre es requerido'); return; }
    if (!formAmount || parseFloat(formAmount) <= 0) { Alert.alert('Error', 'El monto debe ser mayor a 0'); return; }
    if (formCategoryIds.length === 0) { Alert.alert('Error', 'Selecciona al menos una categoría'); return; }

    setSaving(true);
    try {
      await BudgetsService.create({
        name: formName.trim(),
        amount: parseFloat(formAmount),
        month: currentMonth,
        year: currentYear,
        categoryIds: formCategoryIds,
      });
      setCreateVisible(false);
      loadData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'No se pudo crear el presupuesto';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const getIconComp = (icon?: string) => ICON_MAP[icon || ''] || Tag;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ANÁLISIS</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 8 }}
        >
          {['Meta Mensual', 'Resumen Trimestral', 'Anual', 'Personalizado'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Budgets Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <PieChartIcon color="#94A3B8" size={16} />
            <Text style={styles.sectionTitle}>PRESUPUESTOS</Text>
          </View>
          <TouchableOpacity onPress={openCreate}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Plus color={Colors.primary} size={16} />
              <Text style={styles.detailLink}>Nuevo</Text>
            </View>
          </TouchableOpacity>
        </View>

        {budgetsLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : budgets.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center', paddingHorizontal: Spacing.lg }}>
            <Tag color={Colors.textSecondary} size={40} />
            <Text style={{ color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 14, marginTop: 12, textAlign: 'center' }}>
              No tienes presupuestos este mes.{'\n'}Crea uno para controlar tus gastos.
            </Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 16 }}
              onPress={openCreate}
            >
              <Plus color={Colors.white} size={18} />
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: Colors.white }}>Nuevo Presupuesto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.budgetsGrid}>
            {budgets.map((budget) => {
              const firstCat = budget.categories[0]?.category;
              const IconComp = getIconComp(firstCat?.icon);
              const color = firstCat?.color || '#3B82F6';
              const warning = budget.percentage >= 90;

              return (
                <TouchableOpacity
                  key={budget.id}
                  style={styles.budgetCircleCard}
                  onPress={() => navigation.navigate('BudgetAnalysis', { budgetId: budget.id })}
                >
                  <View style={styles.circleContainer}>
                    <Svg height="80" width="80" viewBox="0 0 36 36">
                      <Circle
                        cx="18" cy="18" r="16"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="3" fill="none"
                      />
                      <Circle
                        cx="18" cy="18" r="16"
                        stroke={warning ? '#F43F5E' : color}
                        strokeWidth="3.2"
                        strokeDasharray={`${Math.min(budget.percentage, 100)}, 100`}
                        strokeLinecap="round" fill="none"
                        rotation="-90" originX="18" originY="18"
                      />
                    </Svg>
                    <View style={styles.circleContent}>
                      <IconComp color={warning ? '#F43F5E' : color} size={20} />
                      <Text style={styles.percentageText}>{budget.percentage}%</Text>
                    </View>
                  </View>
                  <Text style={[styles.budgetName, warning && { color: '#F43F5E' }]}>{budget.name}</Text>
                  <Text style={[styles.budgetAmount, warning && { color: 'rgba(244, 63, 94, 0.7)' }]}>
                    {warning ? '¡Cuidado!' : `${formatCurrency(budget.spent)} de ${formatCurrency(budget.amount)}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Payment Method Spending */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Wallet color="#94A3B8" size={16} />
            <Text style={styles.sectionTitle}>GASTOS POR MÉTODO DE PAGO</Text>
          </View>
        </View>

        <View style={styles.pmList}>
          {pmSpending.length === 0 ? (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <Text style={{ color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 13 }}>
                No hay gastos registrados este mes.
              </Text>
            </View>
          ) : (
            pmSpending.map((pm, index) => {
              const PmIcon = PM_ICON_MAP[pm.type] || Wallet;
              const pmColor = PM_COLORS[index % PM_COLORS.length];
              const percentage = pmTotal > 0 ? Math.round((pm.expenses / pmTotal) * 100) : 0;

              return (
                <View key={pm.id} style={styles.pmItem}>
                  <View style={styles.pmTop}>
                    <View style={styles.pmInfo}>
                      <View style={[styles.pmIconBox, { backgroundColor: pmColor + '20' }]}>
                        <PmIcon color={pmColor} size={20} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pmName}>{pm.name}</Text>
                        <Text style={styles.pmMeta}>
                          {pm.expenseCount} gasto{pm.expenseCount !== 1 ? 's' : ''} · {percentage}% del total
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.pmAmount}>{formatCurrency(pm.expenses)}</Text>
                      {pm.income > 0 && (
                        <Text style={styles.pmIncome}>+{formatCurrency(pm.income)}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.pmBarBg}>
                    <View style={[styles.pmBar, { width: `${percentage}%`, backgroundColor: pmColor }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Walletly Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightGrain} />
          <View style={styles.insightHeader}>
            <Sparkles color={Colors.primary} size={18} />
            <Text style={styles.insightTitle}>INSIGHT DE WALLETLY</Text>
          </View>
          <Text style={styles.insightText}>
            "Si mantienes tu ritmo de gasto en <Text style={{ color: '#F97316' }}>Comida</Text>, excederás tu presupuesto en 4 días. Te recomendamos usar el reto 'Cena en Casa' para compensar."
          </Text>
          <TouchableOpacity style={styles.insightBtn}>
            <Text style={styles.insightBtnText}>Activar Reto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* =================== CREATE BUDGET MODAL =================== */}
      <Modal visible={createVisible} transparent animationType="slide" onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Presupuesto</Text>
              <TouchableOpacity onPress={() => setCreateVisible(false)}>
                <X color={Colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOMBRE</Text>
                <TextInput
                  style={styles.textInput}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Ej: Comida, Entretenimiento..."
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MONTO LÍMITE</Text>
                <TextInput
                  style={styles.textInput}
                  value={formAmount}
                  onChangeText={setFormAmount}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Category selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CATEGORÍAS ({formCategoryIds.length} seleccionadas)</Text>
                <View style={styles.catGrid}>
                  {categories.map((cat) => {
                    const isSelected = formCategoryIds.includes(cat.id);
                    const CatIcon = getIconComp(cat.icon);
                    const catColor = cat.color || '#3B82F6';

                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.catChip, isSelected && { borderColor: catColor, backgroundColor: catColor + '20' }]}
                        onPress={() => toggleCategory(cat.id)}
                      >
                        <CatIcon color={isSelected ? catColor : Colors.textSecondary} size={16} />
                        <Text style={[styles.catChipText, isSelected && { color: Colors.white }]}>
                          {cat.name}
                        </Text>
                        {isSelected && <Check color={catColor} size={14} />}
                      </TouchableOpacity>
                    );
                  })}
                  {categories.length === 0 && (
                    <Text style={{ color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 13 }}>
                      No tienes categorías de gasto. Créalas primero.
                    </Text>
                  )}
                </View>
              </View>

              {/* Month info */}
              <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Clock color={Colors.textSecondary} size={16} />
                <Text style={{ color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 13 }}>
                  Presupuesto para {MONTH_NAMES[currentMonth - 1]} {currentYear}
                </Text>
              </View>

              {/* Save button */}
              <TouchableOpacity
                style={[styles.createBtn, saving && { opacity: 0.5 }]}
                onPress={handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.createBtnText}>Crear Presupuesto</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper component for the TrendingUp icon
function TrendingUp({ size, color }: { size: number, color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" />
      <Path d="M17 6H23V12" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  levelLabel: {
    color: Colors.primary,
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 2,
  },
  xpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpText: {
    color: Colors.white,
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  leaderboardBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  filterText: {
    color: '#94A3B8',
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  filterTextActive: {
    color: Colors.white,
  },
  streakCard: {
    marginHorizontal: Spacing.lg,
    padding: 24,
    borderRadius: 32,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  streakLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakTitle: {
    color: Colors.white,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
  },
  streakSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    maxWidth: 180,
    lineHeight: 14,
  },
  streakRight: {
    alignItems: 'center',
  },
  streakMultiplierLabel: {
    color: Colors.white,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 10,
    opacity: 0.8,
  },
  streakMultiplierText: {
    color: Colors.white,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 24,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  detailLink: {
    color: Colors.primary,
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  budgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: 12,
    marginBottom: 40,
  },
  budgetCircleCard: {
    width: (width - Spacing.lg * 2 - 12) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 20,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  circleContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentageText: {
    color: Colors.white,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 12,
    marginTop: 2,
  },
  budgetName: {
    color: Colors.white,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    marginBottom: 4,
  },
  budgetAmount: {
    color: '#64748B',
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
  },
  // Payment method spending styles
  pmList: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
    marginBottom: 32,
  },
  pmItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pmTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pmIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pmName: {
    color: Colors.text,
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
  },
  pmMeta: {
    color: Colors.textSecondary,
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    marginTop: 2,
  },
  pmAmount: {
    color: Colors.white,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
  },
  pmIncome: {
    color: '#10B981',
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    marginTop: 2,
  },
  pmBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  pmBar: {
    height: '100%',
    borderRadius: 3,
  },
  insightCard: {
    marginHorizontal: Spacing.lg,
    padding: 24,
    backgroundColor: 'rgba(27, 47, 192, 0.08)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(27, 47, 192, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  insightGrain: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    backgroundColor: Colors.primary,
    opacity: 0.1,
    borderRadius: 50,
    transform: [{ translateX: 50 }, { translateY: -50 }],
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightTitle: {
    color: Colors.primary,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  insightText: {
    color: Colors.text,
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    lineHeight: 20,
  },
  insightBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  insightBtnText: {
    color: Colors.white,
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 28,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    color: Colors.text,
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  catChipText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  createBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
