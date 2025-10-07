import * as Keychain from 'react-native-keychain';

const REFRESH_TOKEN_KEY = 'refresh_token';
const SERVICE_NAME = 'com.aytsuu.mobile'; 

export class KeychainService {
  static async setRefreshToken(token: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(
        REFRESH_TOKEN_KEY, 
        token,             
        {
          service: SERVICE_NAME,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE, // requires unlock
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE, // Android only
        }
      );
      console.log('✅ Refresh token stored securely');
      return true;
    } catch (error) {
      console.error('❌ Error storing refresh token:', error);
      return false;
    }
  }

  /**
   * Retrieve refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
      if (credentials) {
        console.log('✅ Refresh token retrieved successfully');
        return credentials.password;
      }
      console.log('⚠️ No refresh token found');
      return null;
    } catch (error) {
      console.error('❌ Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Remove refresh token
   */
  static async removeRefreshToken(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
      console.log('✅ Refresh token removed successfully');
      return true;
    } catch (error) {
      // console.error('❌ Error removing refresh token:', error);
      return false;
    }
  }

  /**
   * Check if refresh token exists
   */
  static async hasRefreshToken(): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
      const hasToken = !!credentials;
      console.log(hasToken ? '✅ Refresh token exists' : '⚠️ No refresh token found');
      return hasToken;
    } catch (error) {
      // console.error('❌ Error checking refresh token:', error);
      return false;
    }
  }

  static async authenticate(reason: string) {
    try {
      await Keychain.setGenericPassword('app_user', 'device_authentication', {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        authenticationPrompt: {
          title: 'Authentication Required',
          description: reason,
        },
      })

      const result = await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: 'Authentication Required',
          description: reason,
        },
      });

      await Keychain.resetGenericPassword();
      return result !== false;

    } catch (error) {
      return false;
    }
  }
}
