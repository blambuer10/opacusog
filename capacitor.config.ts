
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5f4b6c3d3d734321a6721db769037026',
  appName: 'opacus-udid-hub',
  webDir: 'dist',
  server: {
    url: 'https://5f4b6c3d-3d73-4321-a672-1db769037026.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      permissions: {
        location: 'always'
      }
    }
  }
};

export default config;
