import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEYS = {
  apple: 'test_NjytLDiWQbEyyjKHnbCUvCFKbPC', // Replace with your actual Apple key
  google: 'test_NjytLDiWQbEyyjKHnbCUvCFKbPC', // Replace with your actual Google key
};

export const PurchasesService = {
  async init(userId: string) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.apple, appUserID: userId });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.google, appUserID: userId });
    }
  },

  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (e) {
      console.error('Error fetching offerings:', e);
      return [];
    }
  },

  async purchasePackage(pkg: PurchasesPackage) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      // Check if the specific entitlement is active
      if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
        return { success: true, customerInfo };
      }
      return { success: false, customerInfo };
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase error:', e);
      }
      return { success: false, error: e };
    }
  },

  async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (e) {
      console.error('Restore error:', e);
      return null;
    }
  }
};
