import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme/theme';
import {
  ArrowLeft, Plus, Edit3, Trash2, X,
  ShoppingBag, Car, ShoppingCart, Briefcase, Home,
  Heart, Gamepad2, GraduationCap, Utensils, Tag,
  Coffee, Smartphone, Plane, Music, Zap,
  Banknote, Monitor, CreditCard, Shirt, Dumbbell,
  Gift, Shield, Palmtree, Stethoscope,
} from 'lucide-react-native';
import { CategoriesService, Category } from '../services/categories.service';
import { useFocusEffect } from '@react-navigation/native';

const ICON_MAP: Record<string, any> = {
  shopping_bag: ShoppingBag,
  car: Car,
  shopping_cart: ShoppingCart,
  briefcase: Briefcase,
  home: Home,
  heart: Heart,
  gamepad: Gamepad2,
  graduation_cap: GraduationCap,
  utensils: Utensils,
  coffee: Coffee,
  smartphone: Smartphone,
  plane: Plane,
  music: Music,
  zap: Zap,
  banknote: Banknote,
  monitor: Monitor,
  credit_card: CreditCard,
  shirt: Shirt,
  dumbbell: Dumbbell,
  gift: Gift,
  shield: Shield,
  palmtree: Palmtree,
  stethoscope: Stethoscope,
};

const COLOR_OPTIONS = [
  '#F97316', '#EF4444', '#EC4899', '#8B5CF6',
  '#3B82F6', '#06B6D4', '#10B981', '#F59E0B',
];

const ICON_OPTIONS = [
  { key: 'utensils', label: 'Comida', Icon: Utensils },
  { key: 'car', label: 'Transporte', Icon: Car },
  { key: 'shopping_cart', label: 'Compras', Icon: ShoppingCart },
  { key: 'briefcase', label: 'Trabajo', Icon: Briefcase },
  { key: 'home', label: 'Hogar', Icon: Home },
  { key: 'heart', label: 'Salud', Icon: Heart },
  { key: 'gamepad', label: 'Ocio', Icon: Gamepad2 },
  { key: 'graduation_cap', label: 'Educación', Icon: GraduationCap },
  { key: 'shopping_bag', label: 'General', Icon: ShoppingBag },
  { key: 'coffee', label: 'Café', Icon: Coffee },
  { key: 'smartphone', label: 'Tecnología', Icon: Smartphone },
  { key: 'plane', label: 'Viajes', Icon: Plane },
  { key: 'music', label: 'Música', Icon: Music },
  { key: 'zap', label: 'Servicios', Icon: Zap },
  { key: 'banknote', label: 'Extra', Icon: Banknote },
  { key: 'monitor', label: 'Streaming', Icon: Monitor },
  { key: 'credit_card', label: 'Tarjeta', Icon: CreditCard },
  { key: 'shirt', label: 'Ropa', Icon: Shirt },
  { key: 'dumbbell', label: 'Gimnasio', Icon: Dumbbell },
  { key: 'gift', label: 'Regalos', Icon: Gift },
  { key: 'shield', label: 'Seguros', Icon: Shield },
  { key: 'palmtree', label: 'Relax', Icon: Palmtree },
  { key: 'stethoscope', label: 'Salud', Icon: Stethoscope },
];

export default function CategoriesScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [selectedIcon, setSelectedIcon] = useState('utensils');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await CategoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSelectedType(activeTab);
    setSelectedIcon('utensils');
    setSelectedColor(COLOR_OPTIONS[0]);
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedType(category.type || 'EXPENSE');
    setSelectedIcon(category.icon || 'utensils');
    setSelectedColor(category.color || COLOR_OPTIONS[0]);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es requerido');
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await CategoriesService.update(editingCategory.id, {
          name: name.trim(),
          type: selectedType,
          icon: selectedIcon,
          color: selectedColor,
        });
      } else {
        await CategoriesService.create({
          name: name.trim(),
          type: selectedType,
          icon: selectedIcon,
          color: selectedColor,
        });
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de eliminar "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await CategoriesService.remove(category.id);
              fetchCategories();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la categoría');
            }
          },
        },
      ]
    );
  };

  const getIconComponent = (iconKey?: string) => {
    return ICON_MAP[iconKey || ''] || Tag;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const filteredCategories = categories.filter(c => (c.type || 'EXPENSE') === activeTab);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={Typography.h2}>Categorías</Text>
        <TouchableOpacity onPress={openCreateModal} style={styles.addBtn}>
          <Plus color={Colors.white} size={20} />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'EXPENSE' && styles.activeTab]}
          onPress={() => setActiveTab('EXPENSE')}
        >
          <Text style={[styles.tabText, activeTab === 'EXPENSE' && styles.activeTabText]}>Gastos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'INCOME' && styles.activeTab]}
          onPress={() => setActiveTab('INCOME')}
        >
          <Text style={[styles.tabText, activeTab === 'INCOME' && styles.activeTabText]}>Ingresos</Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Tag color={Colors.textSecondary} size={48} />
            <Text style={styles.emptyTitle}>Sin categorías</Text>
            <Text style={styles.emptySubtitle}>Agrega categorías para organizar tus finanzas</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openCreateModal}>
              <Plus color={Colors.white} size={18} />
              <Text style={styles.emptyButtonText}>Nueva Categoría</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredCategories.map((category) => {
            const IconComp = getIconComponent(category.icon);
            const color = category.color || COLOR_OPTIONS[0];
            return (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => openEditModal(category)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: color + '20' }]}>
                    <IconComp color={color} size={22} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    onPress={() => openEditModal(category)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Edit3 color={Colors.textSecondary} size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(category)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 color={Colors.expense} size={18} />
                  </TouchableOpacity>
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
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Colors.text} size={24} />
              </TouchableOpacity>
            </View>

            {/* Type Selector for Modal */}
            <View style={styles.modalTabContainer}>
              <TouchableOpacity
                style={[styles.modalTab, selectedType === 'EXPENSE' && styles.activeModalTab]}
                onPress={() => setSelectedType('EXPENSE')}
              >
                <Text style={[styles.modalTabText, selectedType === 'EXPENSE' && styles.activeModalTabText]}>Gasto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTab, selectedType === 'INCOME' && styles.activeModalTab]}
                onPress={() => setSelectedType('INCOME')}
              >
                <Text style={[styles.modalTabText, selectedType === 'INCOME' && styles.activeModalTabText]}>Ingreso</Text>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOMBRE</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Alimentación"
                placeholderTextColor={Colors.textSecondary}
                autoFocus
              />
            </View>

            {/* Icon Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ÍCONO</Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.iconOption,
                      selectedIcon === option.key && styles.iconOptionSelected,
                    ]}
                    onPress={() => setSelectedIcon(option.key)}
                  >
                    <option.Icon
                      color={selectedIcon === option.key ? Colors.white : Colors.textSecondary}
                      size={22}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>COLOR</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </Text>
              )}
            </TouchableOpacity>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
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
    paddingHorizontal: 40,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginTop: 16,
  },
  emptyButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.white,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A1628',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  iconOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: Colors.white,
    transform: [{ scale: 1.15 }],
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
  modalTabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: 12,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  activeModalTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalTabText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeModalTabText: {
    color: Colors.white,
  },
});
