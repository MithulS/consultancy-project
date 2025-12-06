// PWA utilities for installation and updates
export const PWA = {
  /**
   * Check if app is installed as PWA
   */
  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  },

  /**
   * Check if app can be installed
   */
  canInstall() {
    return 'BeforeInstallPromptEvent' in window;
  },

  /**
   * Prompt user to install PWA
   */
  async install(deferredPrompt) {
    if (!deferredPrompt) {
      console.warn('No install prompt available');
      return { outcome: 'dismissed', platform: null };
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user's response
    const choiceResult = await deferredPrompt.userChoice;
    console.log(`User ${choiceResult.outcome} the install prompt`);
    
    return choiceResult;
  },

  /**
   * Check for service worker updates
   */
  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return true;
      }
    }
    return false;
  },

  /**
   * Unregister service worker
   */
  async unregister() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        return true;
      }
    }
    return false;
  },

  /**
   * Request push notification permission
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  },

  /**
   * Show local notification
   */
  async showNotification(title, options = {}) {
    const permission = await this.requestNotificationPermission();
    
    if (permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          ...options
        });
      } else {
        new Notification(title, {
          icon: '/icon-192.svg',
          ...options
        });
      }
    }
  },

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'YOUR_VAPID_PUBLIC_KEY'
        )
      });
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  },

  /**
   * Convert VAPID key
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  /**
   * Get network status
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * Listen to network changes
   */
  onNetworkChange(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },

  /**
   * Get device info
   */
  getDeviceInfo() {
    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      isStandalone: this.isInstalled(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      hasNotifications: 'Notification' in window
    };
  }
};

export default PWA;
