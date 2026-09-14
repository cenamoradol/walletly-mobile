import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Dimensions, Modal, Alert
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell, Zap, ChevronRight, PlusCircle, MinusCircle,
  ShoppingBag, CreditCard, Car, Utensils, Briefcase,
  Home, Heart, Gamepad2, GraduationCap, Coffee,
  Smartphone, Plane, Music, Zap as ZapIcon, Banknote,
  Monitor, Shirt, Dumbbell, Gift, Shield, Palmtree,
  Stethoscope, Tag, Wallet, X, Clock, Trash2, Calendar
} from 'lucide-react-native';
import { DashboardService, DashboardStats } from '../services/dashboard.service';
import { TransactionService } from '../services/transactions.service';
import { useFocusEffect } from '@react-navigation/native';
import { useCurrency } from '../context/CurrencyContext';

const { width } = Dimensions.get('window');

const ICON_MAP: Record<string, any> = {
  shopping_bag: ShoppingBag, car: Car, shopping_cart: ShoppingBag, briefcase: Briefcase,
  home: Home, heart: Heart, gamepad: Gamepad2, graduation_cap: GraduationCap,
  utensils: Utensils, coffee: Coffee, smartphone: Smartphone, plane: Plane,
  music: Music, zap: ZapIcon, banknote: Banknote, monitor: Monitor, credit_card: CreditCard,
  shirt: Shirt, dumbbell: Dumbbell, gift: Gift, shield: Shield, palmtree: Palmtree,
  stethoscope: Stethoscope,
};

export default function DashboardScreen({ navigation }: any) {
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const openDetail = (tx: any) => {
    setSelectedTx(tx);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await TransactionService.delete(id);
            setModalVisible(false);
            fetchStats();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el registro');
          }
        }
      }
    ]);
  };

  const renderTransactionItem = (item: any) => {
    const isIncome = item.type === 'INCOME';
    const catColor = item.category?.color || (isIncome ? '#10B981' : '#F97316');
    const IconComp = ICON_MAP[item.category?.icon || ''] || Tag;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.transactionItem}
        onPress={() => openDetail(item)}
      >
        <View style={styles.transactionLeft}>
          <View style={[styles.iconBox, { backgroundColor: catColor + '25' }]}>
            <IconComp color={catColor} size={22} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.transactionTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.title || 'Sin título'}
            </Text>
            <Text style={styles.transactionCategory}>
              {item.category?.name || 'Varios'} · {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRightInfo}>
          <Text style={[styles.transactionAmount, { color: isIncome ? '#10B981' : '#F43F5E' }]}>
            {isIncome ? '+' : '-'}{formatCurrency(item.amount || 0)}
          </Text>
          <Text style={styles.transactionTypeLabel}>{isIncome ? 'Ingreso' : 'Gasto'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerProfile}>
            <View style={styles.avatarBorder}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }}
                style={styles.avatarImage}
              />
            </View>
            <View>
              <Text style={styles.greetingText}>HOLA DE NUEVO,</Text>
              <Text style={Typography.h3}>{stats?.user?.name || 'Usuario'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell color={Colors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>Saldo Total</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(stats?.totalBalance || 0)}</Text>
            </View>
            <View style={styles.creditsPill}>
              <Zap color={Colors.primary} size={16} fill={Colors.primary} />
              <Text style={styles.creditsText}>12 Créditos AI</Text>
            </View>
          </View>

          <View style={styles.balanceBottom}>
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => navigation.navigate('Wallet')}
            >
              <Text style={styles.manageBtnText}>Gestionar Cartera</Text>
              <ChevronRight color={Colors.white} size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.decorativeGlow} />
        </LinearGradient>

        {/* Quick Actions Bar */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('AddTransaction', { type: 'INCOME' })}
          >
            <PlusCircle color={Colors.income} size={22} />
            <Text style={styles.quickActionText}>Ingreso</Text>
          </TouchableOpacity>
          <View style={styles.quickActionDivider} />
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('AddTransaction', { type: 'EXPENSE' })}
          >
            <MinusCircle color={Colors.expense} size={22} />
            <Text style={styles.quickActionText}>Gasto</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleCap}>ACTIVIDAD RECIENTE</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
            <Text style={styles.seeAll}>Ver Todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentActivityList}>
          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            stats.recentTransactions.map(renderTransactionItem)
          ) : (
            <View style={styles.emptyActivity}>
              <Wallet color={Colors.textSecondary} size={40} opacity={0.3} />
              <Text style={styles.emptyText}>No hay transacciones recientes</Text>
            </View>
          )}
        </View>
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
                      {isIncome ? '+' : '-'}{formatCurrency(selectedTx.amount || 0)}
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
  contentContainer: { padding: Spacing.lg, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40, // Added more space for the notch/status bar
    marginBottom: Spacing.xl
  },
  headerProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBorder: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(27, 47, 192, 0.3)', padding: 2 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 20 },
  greetingText: { color: Colors.textSecondary, fontSize: 12, fontFamily: 'Manrope_600SemiBold', textTransform: 'uppercase', letterSpacing: 1 },
  notificationBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: Colors.glassBorder, justifyContent: 'center', alignItems: 'center' },
  balanceCard: { borderRadius: 32, padding: 24, marginBottom: Spacing.xl, minHeight: 180, justifyContent: 'space-between', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 },
  balanceLabel: { color: 'rgba(219, 234, 254, 0.8)', fontSize: 14, fontFamily: 'Manrope_500Medium' },
  balanceAmount: { color: Colors.white, fontFamily: 'Manrope_800ExtraBold', fontSize: 32, marginTop: 4 },
  creditsPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(27, 47, 192, 0.15)', borderWidth: 1, borderColor: 'rgba(27, 47, 192, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  creditsText: { color: Colors.white, fontFamily: 'Manrope_700Bold', fontSize: 12 },
  balanceBottom: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', zIndex: 2 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  manageBtnText: { color: Colors.white, fontFamily: 'Manrope_700Bold', fontSize: 12 },
  decorativeGlow: { position: 'absolute', right: -40, bottom: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(27, 47, 192, 0.15)', zIndex: 0 },
  quickActionsContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: Spacing.xl },
  quickActionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, gap: 8 },
  quickActionText: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: Colors.text },
  quickActionDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.05)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, paddingHorizontal: 4 },
  sectionTitleCap: { color: Colors.textSecondary, fontSize: 12, fontFamily: 'Manrope_700Bold', letterSpacing: 1 },
  seeAll: { color: Colors.primary, fontSize: 12, fontFamily: 'Manrope_700Bold' },
  recentActivityList: { gap: 8 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 4 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1, marginRight: 8 },
  transactionTitle: { color: Colors.text, fontFamily: 'Manrope_700Bold', fontSize: 14 },
  transactionCategory: { color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 11, marginTop: 2 },
  transactionRightInfo: { alignItems: 'flex-end', minWidth: 80 },
  transactionAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 14 },
  transactionTypeLabel: { color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 10, marginTop: 2 },
  emptyActivity: { paddingVertical: 40, alignItems: 'center', gap: 12 },
  emptyText: { color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 13 },
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
