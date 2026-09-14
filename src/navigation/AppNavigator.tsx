import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Wallet, BarChart2, User } from 'lucide-react-native';
import { Colors } from '../theme/theme';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import WalletScreen from '../screens/WalletScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import BudgetAnalysisScreen from '../screens/BudgetAnalysisScreen';
import EditAccountScreen from '../screens/EditAccountScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import PlanManagementScreen from '../screens/PlanManagementScreen';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#01081a',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 15,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <Home color={color} size={size} />;
          if (route.name === 'Wallet') return <Wallet color={color} size={size} />;
          if (route.name === 'Analysis') return <BarChart2 color={color} size={size} />;
          if (route.name === 'Settings') return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen name="BudgetAnalysis" component={BudgetAnalysisScreen} />
      <Stack.Screen name="EditAccount" component={EditAccountScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="PlanManagement" component={PlanManagementScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ isLoggedIn }: { isLoggedIn: boolean }) {
  return isLoggedIn ? <MainStack /> : <AuthStack />;
}
