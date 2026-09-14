import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  PlusCircle, 
  MinusCircle, 
  CreditCard, 
  Car, 
  Utensils, 
  Film, 
  ShoppingCart, 
  ShoppingBag,
  LayoutGrid, 
  Plus, 
  Calendar, 
  Tag, 
  FileText, 
  ChevronUp, 
  CheckCircle2,
  Wallet,
  Briefcase,
  Home,
  Heart,
  Gamepad2,
  GraduationCap,
  Coffee,
  Smartphone,
  Plane,
  Music,
  Zap,
  Banknote,
  Monitor,
  Shirt,
  Dumbbell,
  Gift,
  Shield,
  Palmtree,
  Stethoscope,
  X,
  Building2,
} from 'lucide-react-native';
import { TransactionService } from '../services/transactions.service';
import { CategoriesService, Category } from '../services/categories.service';
import { PaymentsService, PaymentMethod } from '../services/payments.service';
import { useCurrency } from '../context/CurrencyContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Platform } from 'react-native';

const PM_ICON_MAP: Record<string, any> = {
  cash: Banknote,
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank: Building2,
  mobile: Smartphone,
};

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

export default function AddTransactionScreen({ navigation, route }: any) {
  const { currency } = useCurrency();
  const initialType = route.params?.type || 'EXPENSE';
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>(initialType);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPmId, setSelectedPmId] = useState<string | null>(null);
  const [pmsLoading, setPmsLoading] = useState(true);
  const [pmModalVisible, setPmModalVisible] = useState(false);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredCategories = allCategories.filter(c => (c.type || 'EXPENSE') === transactionType);

  const filteredPms = paymentMethods.filter(pm => {
    if (transactionType === 'EXPENSE') {
      return pm.allowedType === 'EXPENSE' || pm.allowedType === 'BOTH';
    } else {
      return pm.allowedType === 'INCOME' || pm.allowedType === 'BOTH';
    }
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const [cats, pms] = await Promise.all([
            CategoriesService.getAll(),
            PaymentsService.getAll(),
          ]);
          
          setAllCategories(cats);
          setPaymentMethods(pms);

          if (!selectedCategory || !cats.find(c => c.id === selectedCategory)) {
            const firstCat = cats.find(c => (c.type || 'EXPENSE') === transactionType);
            if (firstCat) setSelectedCategory(firstCat.id);
          }

          const pmsFiltered = pms.filter(pm => {
            if (transactionType === 'EXPENSE') {
              return pm.allowedType === 'EXPENSE' || pm.allowedType === 'BOTH';
            } else {
              return pm.allowedType === 'INCOME' || pm.allowedType === 'BOTH';
            }
          });

          if (!selectedPmId || !pmsFiltered.find(pm => pm.id === selectedPmId)) {
            if (pmsFiltered.length > 0) {
              setSelectedPmId(pmsFiltered[0].id);
            } else {
              setSelectedPmId(null);
            }
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setCategoriesLoading(false);
          setPmsLoading(false);
        }
      };
      fetchData();
    }, [transactionType])
  );

  const getIconComponent = (iconKey?: string) => {
    return ICON_MAP[iconKey || ''] || Tag;
  };

  const handleConfirmDate = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };

  const hideDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount || '0');
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !title) {
      Alert.alert('Error', 'Por favor ingresa un monto válido y un título');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }
    if (!selectedPmId) {
      if (paymentMethods.length === 0) {
        Alert.alert('Método Requerido', 'Debes crear al menos un método de pago para continuar.', [
          { text: 'Crear ahora', onPress: () => navigation.navigate('PaymentMethods') },
          { text: 'Volver', style: 'cancel' }
        ]);
      } else {
        Alert.alert('Error', 'Por favor selecciona un método de pago');
      }
      return;
    }
    setLoading(true);
    try {
      await TransactionService.create({
        amount: parsedAmount,
        title: title,
        description: note || '',
        type: transactionType,
        categoryId: selectedCategory,
        paymentMethodId: selectedPmId,
        date: date.toISOString(),
      });
      Alert.alert('Éxito', 'Registro confirmado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Registro</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.typeToggleContainer}>
          <TouchableOpacity 
            style={[styles.typeBtn, transactionType === 'INCOME' && styles.typeBtnActiveIncome]} 
            onPress={() => setTransactionType('INCOME')}
          >
            <PlusCircle color={transactionType === 'INCOME' ? Colors.income : Colors.textSecondary} size={20} />
            <Text style={[styles.typeBtnText, transactionType === 'INCOME' && styles.typeBtnTextActive]}>Ingreso</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, transactionType === 'EXPENSE' && styles.typeBtnActiveExpense]} 
            onPress={() => setTransactionType('EXPENSE')}
          >
            <MinusCircle color={transactionType === 'EXPENSE' ? Colors.expense : Colors.textSecondary} size={20} />
            <Text style={[styles.typeBtnText, transactionType === 'EXPENSE' && styles.typeBtnTextActive]}>Gasto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>MONTO DEL REGISTRO</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SELECCIONAR CATEGORÍA</Text>
        </View>

        <View style={styles.categoryGrid}>
          {categoriesLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : filteredCategories.length === 0 ? (
            <Text style={styles.emptyText}>No hay categorías disponibles</Text>
          ) : (
            filteredCategories.map((cat) => {
              const IconComp = getIconComponent(cat.icon);
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.categoryPill, selectedCategory === cat.id && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: (cat.color || '#3B82F6') + '30' }]}>
                    <IconComp color={cat.color || '#3B82F6'} size={24} />
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MÉTODO DE PAGO</Text>
        </View>

        <TouchableOpacity 
          style={styles.selectBtn}
          onPress={() => setPmModalVisible(true)}
        >
          <View style={styles.selectLeft}>
            <View style={styles.selectIconBox}>
              <CreditCard color={Colors.primary} size={20} />
            </View>
            <Text style={styles.selectValue}>
              {filteredPms.find(pm => pm.id === selectedPmId)?.name || (filteredPms.length > 0 ? 'Seleccionar...' : 'Sin métodos válidos')}
            </Text>
          </View>
          <ChevronUp color={Colors.textSecondary} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <View style={styles.formFields}>
          <TouchableOpacity 
            style={styles.fieldGlass}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar color={Colors.textSecondary} size={20} />
            <Text style={styles.fieldText}>
              {(() => {
                const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
              })()}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            date={date}
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
            confirmTextIOS="Confirmar"
            cancelTextIOS="Cancelar"
            locale="es_ES"
            isDarkModeEnabled={true}
            display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
            themeVariant="dark"
          />
          <View style={styles.fieldGlassLarge}>
            <Tag color={Colors.textSecondary} size={20} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Título"
              placeholderTextColor="#64748B"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View style={styles.fieldGlassDescription}>
            <FileText color={Colors.textSecondary} size={20} />
            <TextInput
              style={styles.fieldTextarea}
              placeholder="Nota"
              placeholderTextColor="#475569"
              multiline
              value={note}
              onChangeText={setNote}
            />
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : (
              <>
                <Text style={styles.confirmBtnText}>Confirmar Registro</Text>
                <CheckCircle2 color={Colors.white} size={22} />
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={pmModalVisible} transparent animationType="slide" onRequestClose={() => setPmModalVisible(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setPmModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Método</Text>
              <TouchableOpacity onPress={() => setPmModalVisible(false)}><X color={Colors.text} size={24} /></TouchableOpacity>
            </View>
            <ScrollView>
              {filteredPms.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textSecondary, fontFamily: 'Manrope_500Medium' }}>
                    No hay métodos para este tipo
                  </Text>
                </View>
              ) : (
                filteredPms.map((pm) => {
                  const Icon = PM_ICON_MAP[pm.type] || Wallet;
                  return (
                    <TouchableOpacity 
                      key={pm.id} 
                      style={[styles.selectItem, selectedPmId === pm.id && styles.selectItemActive]} 
                      onPress={() => { setSelectedPmId(pm.id); setPmModalVisible(false); }}
                    >
                      <View style={styles.selectItemLeft}>
                        <View style={styles.selectIconCircle}><Icon color={Colors.primary} size={20} /></View>
                        <Text style={styles.selectItemName}>{pm.name}</Text>
                      </View>
                      {selectedPmId === pm.id && <CheckCircle2 color={Colors.primary} size={20} />}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.md },
  backBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.text, fontFamily: 'Manrope_700Bold', fontSize: 18 },
  scrollView: { flex: 1 },
  typeToggleContainer: { flexDirection: 'row', marginHorizontal: Spacing.lg, padding: 6, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: Spacing.xl },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 30, gap: 8 },
  typeBtnActiveIncome: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  typeBtnActiveExpense: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  typeBtnText: { color: Colors.textSecondary, fontFamily: 'Manrope_700Bold', fontSize: 14 },
  typeBtnTextActive: { color: Colors.white },
  amountSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  amountLabel: { color: Colors.textSecondary, fontFamily: 'Manrope_700Bold', fontSize: 12, letterSpacing: 1, marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { color: Colors.primary, fontFamily: 'Manrope_700Bold', fontSize: 32, marginRight: 4 },
  amountInput: { color: Colors.white, fontFamily: 'Manrope_800ExtraBold', fontSize: 48, minWidth: 100, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { color: Colors.textSecondary, fontFamily: 'Manrope_700Bold', fontSize: 12, letterSpacing: 1 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: 12, marginBottom: Spacing.xl },
  categoryPill: { width: '30%', aspectRatio: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center', padding: 8 },
  categoryPillActive: { backgroundColor: 'rgba(27, 47, 192, 0.3)', borderColor: Colors.primary },
  categoryIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { color: Colors.white, fontFamily: 'Manrope_700Bold', fontSize: 12, textAlign: 'center' },
  formFields: { paddingHorizontal: Spacing.lg, gap: 12 },
  fieldGlass: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: Spacing.md, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: 12 },
  fieldGlassLarge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: 16 },
  fieldGlassDescription: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: 16, minHeight: 80 },
  fieldText: { color: Colors.white, fontFamily: 'Manrope_500Medium', fontSize: 14 },
  fieldInput: { flex: 1, color: Colors.white, fontFamily: 'Manrope_700Bold', fontSize: 16 },
  fieldTextarea: { flex: 1, color: Colors.textSecondary, fontFamily: 'Manrope_500Medium', fontSize: 14 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.05)', marginHorizontal: Spacing.lg, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: Spacing.xl },
  selectLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(27, 47, 192, 0.15)', justifyContent: 'center', alignItems: 'center' },
  selectValue: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: Colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Spacing.xl, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontFamily: 'Manrope_700Bold', fontSize: 20, color: Colors.text },
  selectItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  selectItemActive: { borderColor: Colors.primary, backgroundColor: 'rgba(27, 47, 192, 0.1)' },
  selectItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  selectIconCircle: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(27, 47, 192, 0.15)', justifyContent: 'center', alignItems: 'center' },
  selectItemName: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: Colors.text },
  confirmBtn: { backgroundColor: Colors.primary, flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12 },
  confirmBtnText: { color: Colors.white, fontFamily: 'Manrope_700Bold', fontSize: 16 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', width: '100%', padding: 20 },
});
