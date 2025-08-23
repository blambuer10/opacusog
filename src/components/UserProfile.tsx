
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  Globe,
  Twitter,
  Instagram,
  ShoppingCart,
  Bitcoin,
  Music,
  Shield,
  Clock,
  Activity,
  Settings
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import { UserDataPermission } from '@/types/user-data';
import { toast } from 'sonner';

const UserProfile: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const { hasPermission: hasLocationPermission, requestPermission: requestLocationPermission } = useGeolocation();
  const { hasPermission: hasChromePermission, requestChromePermission } = useBrowsingHistory();
  
  const [permissions, setPermissions] = useState<UserDataPermission[]>([
    {
      id: 'location',
      name: 'Konum Verisi',
      description: 'Mevcut ve geçmiş konum bilgileriniz',
      enabled: false,
      icon: 'MapPin'
    },
    {
      id: 'chrome',
      name: 'Chrome Geçmişi',
      description: 'Web tarama geçmişiniz ve favorileriniz',
      enabled: false,
      icon: 'Globe'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      description: 'Tweet geçmişiniz ve etkileşimleriniz',
      enabled: false,
      icon: 'Twitter',
      comingSoon: true
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Post geçmişiniz ve etkileşimleriniz',
      enabled: false,
      icon: 'Instagram',
      comingSoon: true
    },
    {
      id: 'amazon',
      name: 'Amazon',
      description: 'Alışveriş geçmişiniz ve tercihleriniz',
      enabled: false,
      icon: 'ShoppingCart',
      comingSoon: true
    },
    {
      id: 'binance',
      name: 'Binance',
      description: 'Trading geçmişiniz ve portföyünüz',
      enabled: false,
      icon: 'Bitcoin',
      comingSoon: true
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'İzleme geçmişiniz ve etkileşimleriniz',
      enabled: false,
      icon: 'Music',
      comingSoon: true
    }
  ]);

  useEffect(() => {
    setPermissions(prev => prev.map(p => ({
      ...p,
      enabled: p.id === 'location' ? hasLocationPermission : 
               p.id === 'chrome' ? hasChromePermission : p.enabled
    })));
  }, [hasLocationPermission, hasChromePermission]);

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    if (enabled) {
      let success = false;
      
      switch (permissionId) {
        case 'location':
          success = await requestLocationPermission();
          break;
        case 'chrome':
          success = await requestChromePermission();
          break;
        default:
          toast.info(`${permissions.find(p => p.id === permissionId)?.name} yakında gelecek!`);
          return;
      }
      
      if (success) {
        setPermissions(prev => prev.map(p => 
          p.id === permissionId ? { ...p, enabled: true } : p
        ));
      }
    } else {
      setPermissions(prev => prev.map(p => 
        p.id === permissionId ? { ...p, enabled: false } : p
      ));
      toast.info(`${permissions.find(p => p.id === permissionId)?.name} izni kaldırıldı`);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      MapPin: <MapPin className="w-5 h-5" />,
      Globe: <Globe className="w-5 h-5" />,
      Twitter: <Twitter className="w-5 h-5" />,
      Instagram: <Instagram className="w-5 h-5" />,
      ShoppingCart: <ShoppingCart className="w-5 h-5" />,
      Bitcoin: <Bitcoin className="w-5 h-5" />,
      Music: <Music className="w-5 h-5" />
    };
    return icons[iconName] || <Activity className="w-5 h-5" />;
  };

  if (!isConnected) {
    return (
      <Card className="card-cyber p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">Profil Ayarları</h3>
        <p className="text-muted-foreground">Cüzdanınızı bağlayın ve UDID oluşturun</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-cyber p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <User className="w-6 h-6 mr-2 text-cyber-neon" />
            <h2 className="text-2xl font-bold glow-text">AI Agent Profili</h2>
          </div>
          <Badge variant="outline" className="border-cyber-green/50 text-cyber-green">
            <Shield className="w-3 h-3 mr-1" />
            Güvenli
          </Badge>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-sm text-muted-foreground">Cüzdan Adresi</Label>
            <p className="font-mono text-sm bg-muted/50 p-2 rounded border">
              {address}
            </p>
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground">AI Agent Durumu</Label>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 bg-cyber-green rounded-full mr-2 animate-pulse"></div>
              <span className="text-cyber-green">Aktif - Verilerinizi öğreniyor</span>
            </div>
          </div>
        </div>

        <Separator className="border-cyber-grid my-6" />

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Veri İzinleri
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            AI Agent'ınızın hangi verilerinize erişebileceğini kontrol edin. 
            Tüm veriler şifrelenir ve UDID'nize bağlanır.
          </p>

          <div className="space-y-4">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-4 rounded-lg border border-cyber-grid/50 bg-card/30">
                <div className="flex items-center space-x-3">
                  <div className="text-cyber-neon">
                    {getIcon(permission.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Label className="font-medium">{permission.name}</Label>
                      {permission.comingSoon && (
                        <Badge variant="outline" className="ml-2 text-xs border-cyber-purple/50 text-cyber-purple">
                          Yakında
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
                
                <Switch
                  checked={permission.enabled}
                  onCheckedChange={(enabled) => handlePermissionToggle(permission.id, enabled)}
                  disabled={permission.comingSoon}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-cyber-neon/5 border border-cyber-neon/20">
          <div className="flex items-center text-cyber-neon mb-2">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Mobil Uygulama</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Bu platform yakında Android APK olarak indirilebilir olacak. 
            Bir kez UDID oluşturduktan sonra mobil cihazınızdan da aynı UDID ile giriş yapabileceksiniz.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
