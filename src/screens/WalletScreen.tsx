import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing } from '../theme/theme';
import {
  Calendar, ArrowDown, ArrowUp, ShoppingBag, CreditCard, Car,
  Lightbulb, Wallet, Briefcase, Home, Heart, Gamepad2,
  GraduationCap, Utensils, Coffee, Smartphone, Plane, Music,
  Zap, Banknote, Monitor, Shirt, Dumbbell, Gift, Shield, Palmtree,
  Stethoscope, Tag, X, Clock, MapPin, Trash2
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { TransactionService } from '../services/transactions.service';
import { Alert } from 'react-native';
import { useCurrency } from '../context/CurrencyContext';

const { width } = Dimensions.get('window');

const ICON_MAP: Record<string, any> = {
  shopping_bag: ShoppingBag, car: Car, shopping_cart: ShoppingBag, briefcase: Briefcase,
  home: Home, heart: Heart, gamepad: Gamepad2, graduation_cap: GraduationCap,
  utensils: Utensils, coffee: Coffee, smartphone: Smartphone, plane: Plane,
  music: Music, zap: Zap, banknote: Banknote, monitor: Monitor, credit_card: CreditCard,
  shirt: Shirt, dumbbell: Dumbbell, gift: Gift, shield: Shield, palmtree: Palmtree,
  stethoscope: Stethoscope,
};

const FILTERS = ['Todo', 'Esta Semana', 'Este Mes', '3 Meses'];

function getDateRange(filter: string): { startDate?: string; endDate?: string } {
  const now = new Date();
  const end = now.toISOString();
  if (filter === 'Esta Semana') {
    const start = new Date(now); start.setDate(now.getDate() - 7);
    return { startDate: start.toISOString(), endDate: end };
  }
  if (filter === 'Este Mes') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: start.toISOString(), endDate: end };
  }
  if (filter === '3 Meses') {
    const start = new Date(now); start.setMonth(now.getMonth() - 3);
    return { startDate: start.toISOString(), endDate: end };
  }
  return {};
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupByDate(transactions: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  transactions.forEach(t => {
    const label = formatDateLabel(t.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(t);
  });
  return groups;
}

export default function WalletScreen() {
  const { formatCurrency } = useCurrency();
  const [activeFilter, setActiveFilter] = useState('Todo');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTransactions = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await TransactionService.getAll();
      setTransactions(data);
    } catch (e) {
      console.error('Error fetching transactions', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchTransactions(); }, [fetchTransactions]));

  const handleDelete = async (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await TransactionService.delete(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
            setModalVisible(false);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el registro');
          }
        }
      }
    ]);
  };

  const openDetail = (tx: any) => {
    setSelectedTx(tx);
    setModalVisible(true);
  };

  // Compute stats
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;
  const savingsPercent = totalIncome > 0 ? Math.min(100, Math.round((balance / totalIncome) * 100)) : 0;
  const dashArray = `${savingsPercent}, 100`;

  // Filter based on active filter
  const dateRange = getDateRange(activeFilter);
  const filteredTransactions = transactions.filter(t => {
    if (!dateRange.startDate) return true;
    const d = new Date(t.date);
    return d >= new Date(dateRange.startDate!) && d <= new Date(dateRange.endDate!);
  });

  const grouped = groupByDate(filteredTransactions);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTransactions(true)} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MI CARTERA</Text>
        </View>

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>BALANCE TOTAL</Text>
              <Text style={[styles.balanceAmount, { color: balance < 0 ? '#F43F5E' : Colors.white }]}>
                {formatCurrency(balance)}
              </Text>
            </View>
            <View style={styles.chartContainer}>
              <Svg height="64" width="64" viewBox="0 0 36 36">
                <Circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" fill="none" />
                <Circle
                  cx="18" cy="18" r="16"
                  stroke={balance >= 0 ? Colors.primary : '#F43F5E'}
                  strokeWidth="3.8"
                  strokeDasharray={dashArray}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              <Text style={styles.chartText}>{savingsPercent}%</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryItem, styles.summaryIncome]}>
              <View style={styles.summaryLabelRow}>
                <ArrowDown color="#10B981" size={16} />
                <Text style={styles.summaryLabel}>INGRESOS</Text>
              </View>
              <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={[styles.summaryItem, styles.summaryExpense]}>
              <View style={styles.summaryLabelRow}>
                <ArrowUp color="#F43F5E" size={16} />
                <Text style={styles.summaryLabel}>GASTOS</Text>
              </View>
              <Text style={[styles.summaryAmount, { color: '#F43F5E' }]}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transacciones</Text>
          <Text style={styles.countPill}>{filteredTransactions.length} registros</Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction List */}
        <View style={styles.transactionsList}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Wallet color={Colors.textSecondary} size={48} />
              <Text style={styles.emptyTitle}>Sin registros</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'Todo' ? 'Aún no tienes transacciones' : `No hay transacciones para "${activeFilter}"`}
              </Text>
            </View>
          ) : (
            Object.entries(grouped).map(([dateLabel, txs]) => (
              <View key={dateLabel}>
                <Text style={styles.dateLabel}>{dateLabel}</Text>
                {txs.map(t => {
                  const isIncome = t.type === 'INCOME';
                  const catColor = t.category?.color || (isIncome ? '#10B981' : '#F97316');
                  const IconComp = ICON_MAP[t.category?.icon || ''] || Tag;

                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={styles.transactionItem}
                      onPress={() => openDetail(t)}
                      onLongPress={() => handleDelete(t.id)}
                    >
                      <View style={styles.transactionLeft}>
                        <View style={[styles.iconBox, { backgroundColor: catColor + '25' }]}>
                          <IconComp color={catColor} size={22} />
                        </View>
                        <View style={styles.titleContainer}>
                          <Text style={styles.transactionTitle} numberOfLines={1} ellipsizeMode="tail">
                            {t.title || 'Sin título'}
                          </Text>
                          <Text style={styles.transactionCategory}>
                            {t.category?.name || 'Varios'} · {t.paymentMethod?.name || ''}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text style={[styles.transactionAmount, { color: isIncome ? '#10B981' : '#F43F5E' }]}>
                          {isIncome ? '+' : '-'}{formatCurrency(Number(t.amount))}
                        </Text>
                        <Text style={styles.transactionType}>{isIncome ? 'Ingreso' : 'Gasto'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </View>

        {filteredTransactions.length > 0 && (
          <Text style={styles.hint}>Mantén presionado para eliminar</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Transaction Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleDetail}>Detalle de Transacción</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Colors.text} size={24} />
              </TouchableOpacity>
            </View>

            {selectedTx && (() => {
              const isIncome = selectedTx.type === 'INCOME';
              const catColor = selectedTx.category?.color || (isIncome ? '#10B981' : '#F97316');
              const IconComp = ICON_MAP[selectedTx.category?.icon || ''] || Tag;
              
              return (
                <View style={styles.detailContainer}>
                  {/* Amount Circle */}
                  <View style={styles.detailIconWrapper}>
                    <View style={[styles.detailIconBox, { backgroundColor: catColor + '20' }]}>
                      <IconComp color={catColor} size={32} />
                    </View>
                    <Text style={[styles.detailAmount, { color: isIncome ? '#10B981' : '#F43F5E' }]}>
                      {formatCurrency(Number(selectedTx.amount))}
                    </Text>
                    <Text style={styles.detailTypeLabel}>{isIncome ? 'INGRESO' : 'GASTO'}</Text>
                  </View>

                  <View style={styles.detailInfoList}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>TÍTULO</Text>
                      <Text style={styles.detailValue}>{selectedTx.title || 'Sin título'}</Text>
                    </View>

                    {selectedTx.description ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>NOTA</Text>
                        <Text style={styles.detailNoteValue}>{selectedTx.description}</Text>
                      </View>
                    ) : null}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>CATEGORÍA</Text>
                      <View style={styles.detailValueRow}>
                        <Tag color={catColor} size={16} />
                        <Text style={[styles.detailValue, { color: catColor }]}>{selectedTx.category?.name || 'Sin categoría'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>MÉTODO DE PAGO</Text>
                      <View style={styles.detailValueRow}>
                        <CreditCard color={Colors.textSecondary} size={16} />
                        <Text style={styles.detailValue}>{selectedTx.paymentMethod?.name || 'N/A'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>FECHA</Text>
                      <View style={styles.detailValueRow}>
                        <Calendar color={Colors.textSecondary} size={16} />
                        <Text style={styles.detailValue}>
                          {new Date(selectedTx.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>HORA</Text>
                      <View style={styles.detailValueRow}>
                        <Clock color={Colors.textSecondary} size={16} />
                        <Text style={styles.detailValue}>
                          {new Date(selectedTx.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.deleteDetailBtn}
                    onPress={() => handleDelete(selectedTx.id)}
                  >
                    <Trash2 color="#F43F5E" size={20} />
                    <Text style={styles.deleteDetailText}>Eliminar registro</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.md,
  },
  headerTitle: { color: Colors.text, fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.5 },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', marginHorizontal: Spacing.lg,
    borderRadius: 32, padding: 24, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 28,
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  balanceLabel: { color: '#94A3B8', fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  balanceAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 30 },
  chartContainer: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center' },
  chartText: { position: 'absolute', color: Colors.white, fontFamily: 'Manrope_800ExtraBold', fontSize: 10 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryItem: { flex: 1, padding: 14, borderRadius: 18, borderWidth: 1 },
  summaryIncome: { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  summaryExpense: { backgroundColor: 'rgba(244, 63, 94, 0.08)', borderColor: 'rgba(244, 63, 94, 0.2)' },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  summaryLabel: { color: Colors.textSecondary, fontFamily: 'Manrope_700Bold', fontSize: 9, letterSpacing: 1 },
  summaryAmount: { fontFamily: 'Manrope_700Bold', fontSize: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontFamily: 'Manrope_700Bold', fontSize: 16 },
  countPill: { color: Colors.primary, fontFamily: 'Manrope_700Bold', fontSize: 12, backgroundColor: 'rgba(27,47,192,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  filtersContainer: { flexDirection: 'row', paddingLeft: Spacing.lg, marginBottom: 24 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: '#94A3B8', fontFamily: 'Manrope_700Bold', fontSize: 12 },
  filterTextActive: { color: Colors.white },
  transactionsList: { paddingHorizontal: Spacing.lg },
  dateLabel: { color: '#64748B', fontFamily: 'Manrope_700Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, marginTop: 20, paddingHorizontal: 4 },
  transactionItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: 16, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 10,
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  titleContainer: { flex: 1, marginRight: 8 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  transactionTitle: { color: Colors.text, fontFamily: 'Manrope_700Bold', fontSize: 14 },
  transactionCategory: { color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 11, marginTop: 2 },
  transactionRight: { alignItems: 'flex-end', minWidth: 80 },
  transactionAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 14 },
  transactionType: { color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 10, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { color: Colors.text, fontFamily: 'Manrope_700Bold', fontSize: 18 },
  emptySubtitle: { color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 13, textAlign: 'center' },
  hint: { textAlign: 'center', color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 11, marginTop: 8, opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 32, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitleDetail: { color: Colors.text, fontFamily: 'Manrope_700Bold', fontSize: 18 },
  detailContainer: { alignItems: 'center' },
  detailIconWrapper: { alignItems: 'center', marginBottom: 32 },
  detailIconBox: { width: 80, height: 80, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  detailAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 36, marginBottom: 4 },
  detailTypeLabel: { color: Colors.textSecondary, fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 2 },
  detailInfoList: { width: '100%', gap: 20, marginBottom: 40 },
  detailRow: { gap: 6 },
  detailLabel: { color: '#475569', fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 1.5 },
  detailValue: { color: Colors.text, fontFamily: 'Manrope_700Bold', fontSize: 15 },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailNoteValue: { color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 14, lineHeight: 22 },
  deleteDetailBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  deleteDetailText: { color: '#F43F5E', fontFamily: 'Manrope_700Bold', fontSize: 14 },
});
