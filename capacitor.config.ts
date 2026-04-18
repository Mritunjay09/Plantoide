import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Plantoide',
  webDir: 'dist',
  server: {
    androidScheme: 'https', 
    cleartext: true, 
    allowNavigation: ['plantoide-backend.onrender.com']
  }
};

export default config;