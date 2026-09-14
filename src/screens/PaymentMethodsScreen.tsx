import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme/theme';
import {
  ArrowLeft, Plus, Edit3, Trash2, X,
  CreditCard, Wallet, Banknote, Building2, Smartphone, Tag,
} from 'lucide-react-native';
import { PaymentsService, PaymentMethod } from '../services/payments.service';
import { useFocusEffect } from '@react-navigation/native';

const ICON_MAP: Record<string, any> = {
  credit_card: CreditCard,
  wallet: Wallet,
  cash: Banknote,
  bank: Building2,
  mobile: Smartphone,
};

const TYPE_OPTIONS = [
  { key: 'cash', label: 'Efectivo', Icon: Banknote },
  { key: 'credit_card', label: 'Tarjeta Crédito', Icon: CreditCard },
  { key: 'debit_card', label: 'Tarjeta Débito', Icon: CreditCard },
  { key: 'bank', label: 'Transferencia', Icon: Building2 },
  { key: 'mobile', label: 'Pago Móvil', Icon: Smartphone },
];

const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F97316', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B',
];

export default function PaymentMethodsScreen({ navigation }: any) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('cash');
  const [allowedType, setAllowedType] = useState('BOTH');

  const loadMethods = async () => {
    try {
      const data = await PaymentsService.getAll();
      setMethods(data);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMethods();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMethods();
  };

  const openCreateModal = () => {
    setEditingMethod(null);
    setName('');
    setSelectedType('cash');
    setAllowedType('BOTH');
    setModalVisible(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setName(method.name);
    setSelectedType(method.type || 'cash');
    setAllowedType(method.allowedType || 'BOTH');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    try {
      if (editingMethod) {
        await PaymentsService.update(editingMethod.id, {
          name: name.trim(),
          type: selectedType,
          allowedType: allowedType,
        });
      } else {
        await PaymentsService.create({
          name: name.trim(),
          type: selectedType,
          allowedType: allowedType,
        });
      }
      setModalVisible(false);
      loadMethods();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el método de pago');
    }
  };

  const handleDelete = (method: PaymentMethod) => {
    Alert.alert(
      'Eliminar',
      `¿Deseas eliminar "${method.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await PaymentsService.remove(method.id);
              loadMethods();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar. Puede estar vinculado a transacciones.');
            }
          },
        },
      ]
    );
  };

  const getIconComponent = (type?: string) => {
    return ICON_MAP[type || ''] || Wallet;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={Typography.h2}>Métodos de Pago</Text>
        <TouchableOpacity onPress={openCreateModal} style={styles.addBtn}>
          <Plus color={Colors.white} size={20} />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <View style={styles.summaryIconBox}>
            <CreditCard color={Colors.primary} size={22} />
          </View>
          <View>
            <Text style={styles.summaryLabel}>MÉTODOS ACTIVOS</Text>
            <Text style={styles.summaryAmount}>{methods.length}</Text>
          </View>
        </View>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>Gestionar</Text>
        </View>
      </View>

      {/* Methods List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {methods.length === 0 ? (
          <View style={styles.emptyState}>
            <Wallet color={Colors.textSecondary} size={48} />
            <Text style={styles.emptyTitle}>Sin métodos de pago</Text>
            <Text style={styles.emptySubtitle}>Agrega tu primer método de pago</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openCreateModal}>
              <Plus color={Colors.white} size={18} />
              <Text style={styles.emptyButtonText}>Nuevo Método</Text>
            </TouchableOpacity>
          </View>
        ) : (
          methods.map((method) => {
            const IconComp = getIconComponent(method.type);
            const typeLabel = TYPE_OPTIONS.find(t => t.key === method.type)?.label || method.type;
            return (
              <TouchableOpacity
                key={method.id}
                style={styles.methodCard}
                onPress={() => openEditModal(method)}
                activeOpacity={0.7}
              >
                <View style={styles.methodLeft}>
                  <View style={styles.methodIcon}>
                    <IconComp color={Colors.primary} size={22} />
                  </View>
                  <View>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodType}>
                      {typeLabel} · {method.allowedType === 'BOTH' ? 'Ambos' : method.allowedType === 'INCOME' ? 'Ingresos' : 'Gastos'}
                    </Text>
                  </View>
                </View>
                <View style={styles.methodRight}>
                  <View style={styles.methodActions}>
                    <TouchableOpacity
                      onPress={() => openEditModal(method)}
                      style={styles.actionBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Edit3 color={Colors.textSecondary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(method)}
                      style={styles.actionBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 color={Colors.expense} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Edit / Create Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOMBRE</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Tarjeta BAC, Efectivo..."
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* Type Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TIPO</Text>
                <View style={styles.typeGrid}>
                  {TYPE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.typeOption,
                        selectedType === opt.key && styles.typeOptionSelected,
                      ]}
                      onPress={() => setSelectedType(opt.key)}
                    >
                      <opt.Icon
                        color={selectedType === opt.key ? Colors.white : Colors.textSecondary}
                        size={20}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          selectedType === opt.key && styles.typeOptionTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Allowed Type Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>USAR PARA</Text>
                <View style={styles.typeGrid}>
                  {[
                    { key: 'BOTH', label: 'Ambos' },
                    { key: 'INCOME', label: 'Solo Ingresos' },
                    { key: 'EXPENSE', label: 'Solo Gastos' },
                  ].map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.allowedTypeOption,
                        allowedType === opt.key && styles.allowedTypeOptionSelected,
                      ]}
                      onPress={() => setAllowedType(opt.key)}
                    >
                      <Text
                        style={[
                          styles.allowedTypeOptionText,
                          allowedType === opt.key && styles.allowedTypeOptionTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>
                  {editingMethod ? 'Guardar Cambios' : 'Crear Método de Pago'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 47, 192, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryAmount: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    color: Colors.white,
  },
  summaryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  summaryBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: '#10B981',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
  },
  emptyButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.white,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 47, 192, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodName: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  methodType: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  methodRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  methodBalance: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.income,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  typeOptionTextSelected: {
    color: Colors.white,
  },
  allowedTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  allowedTypeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  allowedTypeOptionText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  allowedTypeOptionTextSelected: {
    color: Colors.white,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
