import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Colors, Spacing } from '../theme/theme';
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Trash2,
  ShoppingBag, CreditCard, Car, Utensils, Briefcase, Home, Heart,
  Gamepad2, GraduationCap, Coffee, Smartphone, Plane, Music,
  Zap as ZapIcon, Banknote, Monitor, Shirt, Dumbbell, Gift,
  Shield, Palmtree, Stethoscope, Tag, Calendar, Clock,
} from 'lucide-react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { useCurrency } from '../context/CurrencyContext';
import { BudgetsService, BudgetDetail } from '../services/budgets.service';

const ICON_MAP: Record<string, any> = {
  shopping_bag: ShoppingBag, credit_card: CreditCard, car: Car, utensils: Utensils,
  briefcase: Briefcase, home: Home, heart: Heart, gamepad: Gamepad2,
  graduation: GraduationCap, coffee: Coffee, smartphone: Smartphone,
  plane: Plane, music: Music, zap: ZapIcon, banknote: Banknote,
  monitor: Monitor, shirt: Shirt, dumbbell: Dumbbell, gift: Gift,
  shield: Shield, palmtree: Palmtree, stethoscope: Stethoscope, tag: Tag,
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function BudgetAnalysisScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { formatCurrency } = useCurrency();
  const budgetId = route.params?.budgetId;

  const [detail, setDetail] = useState<BudgetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDetail = async () => {
    if (!budgetId) {
      setLoading(false);
      return;
    }
    try {
      const data = await BudgetsService.getOne(budgetId);
      setDetail(data);
    } catch (error) {
      console.error('Error loading budget detail:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [budgetId]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDetail();
  };

  const handleDelete = () => {
    if (!detail) return;
    Alert.alert('Eliminar Presupuesto', `¿Eliminar "${detail.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await BudgetsService.remove(detail.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const getIconComp = (icon?: string) => ICON_MAP[icon || ''] || Tag;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Tag color={Colors.textSecondary} size={48} />
        <Text style={{ color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 14, marginTop: 16 }}>
          Presupuesto no encontrado
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary, fontFamily: 'Manrope_700Bold', fontSize: 14 }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Collect all transactions from all category breakdowns
  const allTransactions = detail.categoryBreakdown
    .flatMap((cb) => cb.transactions.map((t) => ({ ...t, _catName: cb.category.name, _catIcon: cb.category.icon, _catColor: cb.category.color })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color={Colors.white} size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ANÁLISIS PRESUPUESTO</Text>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <Trash2 color="#F43F5E" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Main Budget Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View>
              <Text style={styles.monthLabel}>{detail.name} · {MONTH_NAMES[detail.month - 1]} {detail.year}</Text>
              <Text style={styles.mainAmount}>{formatCurrency(detail.spent)}</Text>
              <Text style={styles.totalLimit}>Gastado de {formatCurrency(detail.amount)}</Text>
            </View>
            <View style={styles.mainChartContainer}>
              <Svg height="100" width="100" viewBox="0 0 36 36">
                <Circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
                <Circle
                  cx="18" cy="18" r="16"
                  stroke={detail.percentage >= 90 ? '#F43F5E' : Colors.primary}
                  strokeWidth="3.2"
                  strokeDasharray={`${Math.min(detail.percentage, 100)}, 100`}
                  strokeLinecap="round" fill="none"
                  rotation="-90" originX="18" originY="18"
                />
              </Svg>
              <Text style={styles.mainPercentageText}>{detail.percentage}%</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <View style={styles.comparisonLabelRow}>
                {detail.comparison.changeDiff <= 0 ? (
                  <TrendingDown color="#10B981" size={14} />
                ) : (
                  <TrendingUp color="#F43F5E" size={14} />
                )}
                <Text style={styles.comparisonLabel}>VS MES ANTERIOR</Text>
              </View>
              <Text style={[styles.comparisonValue, { color: detail.comparison.changeDiff <= 0 ? '#10B981' : '#F43F5E' }]}>
                {detail.comparison.changePercent >= 0 ? '+' : ''}{detail.comparison.changePercent}% ({formatCurrency(Math.abs(detail.comparison.changeDiff))})
              </Text>
            </View>
            <View style={styles.comparisonItem}>
              <View style={styles.comparisonLabelRow}>
                <Calendar color={Colors.textSecondary} size={14} />
                <Text style={styles.comparisonLabel}>MES ANTERIOR</Text>
              </View>
              <Text style={[styles.comparisonValue, { color: Colors.textSecondary }]}>
                {formatCurrency(detail.comparison.prevSpent)}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DESGLOSE POR CATEGORÍA</Text>
          <Text style={styles.filterLink}>{detail.categories.length} categorías</Text>
        </View>

        <View style={styles.categoryList}>
          {detail.categoryBreakdown.map((cb) => {
            const CatIcon = getIconComp(cb.category.icon);
            const catColor = cb.category.color || '#3B82F6';
            const catPct = detail.amount > 0 ? Math.round((cb.spent / detail.amount) * 100) : 0;
            const isCritical = catPct >= 90;

            return (
              <View key={cb.category.id} style={styles.categoryItem}>
                <View style={styles.categoryTop}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.iconBox, { backgroundColor: catColor + '20' }]}>
                      <CatIcon color={catColor} size={20} />
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{cb.category.name}</Text>
                      <Text style={styles.categoryStatus}>
                        {cb.transactions.length} transaccion{cb.transactions.length !== 1 ? 'es' : ''} · {catPct}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.amountInfo}>
                    <Text style={styles.spentAmount}>{formatCurrency(cb.spent)}</Text>
                  </View>
                </View>

                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${Math.min(catPct, 100)}%`, backgroundColor: isCritical ? '#F43F5E' : catColor },
                    ]}
                  />
                </View>

                {isCritical && (
                  <View style={styles.warningBox}>
                    <AlertTriangle color="#F43F5E" size={14} />
                    <Text style={styles.warningText}>¡Esta categoría consume mucho del presupuesto!</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* All Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TRANSACCIONES</Text>
          <Text style={styles.filterLink}>{allTransactions.length} registros</Text>
        </View>

        <View style={styles.transactionsList}>
          {allTransactions.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 13 }}>
                No hay transacciones en este presupuesto aún.
              </Text>
            </View>
          ) : (
            allTransactions.map((tx) => {
              const TxIcon = getIconComp(tx._catIcon);
              const txColor = tx._catColor || '#3B82F6';

              return (
                <View key={tx.id} style={styles.transactionItem}>
                  <View style={styles.txLeft}>
                    <View style={[styles.txIconBox, { backgroundColor: txColor + '20' }]}>
                      <TxIcon color={txColor} size={18} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txTitle} numberOfLines={1}>{tx.title || tx.description || tx._catName}</Text>
                      <Text style={styles.txCategory}>{tx._catName} · {formatDate(tx.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={styles.txAmount}>-{formatCurrency(tx.amount)}</Text>
                    <Text style={styles.txTime}>{formatTime(tx.date)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  mainCard: {
    marginHorizontal: Spacing.lg,
    marginTop: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthLabel: {
    color: '#94A3B8',
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    marginBottom: 4,
  },
  mainAmount: {
    color: Colors.white,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 32,
    marginBottom: 4,
  },
  totalLimit: {
    color: Colors.textSecondary,
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
  },
  mainChartContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPercentageText: {
    position: 'absolute',
    color: Colors.white,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 24,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonItem: {
    flex: 1,
  },
  comparisonLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  comparisonLabel: {
    color: '#64748B',
    fontFamily: 'Manrope_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
  },
  comparisonValue: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  filterLink: {
    color: Colors.primary,
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  categoryList: {
    paddingHorizontal: Spacing.lg,
    gap: 16,
    marginBottom: 32,
  },
  categoryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    color: Colors.text,
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
  },
  categoryStatus: {
    color: Colors.textSecondary,
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    marginTop: 2,
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    color: Colors.white,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.15)',
  },
  warningText: {
    color: '#F43F5E',
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
  },
  // Transactions
  transactionsList: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
    marginBottom: 40,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
    marginRight: 8,
  },
  txTitle: {
    color: Colors.text,
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
  },
  txCategory: {
    color: Colors.textSecondary,
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  txAmount: {
    color: '#F43F5E',
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
  },
  txTime: {
    color: Colors.textSecondary,
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    marginTop: 2,
  },
});
