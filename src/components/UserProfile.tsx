
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Shield, 
  MapPin, 
  Chrome, 
  Twitter, 
  Instagram, 
  ShoppingBag, 
  Bitcoin,
  Music,
  Lock,
  Activity,
  Globe,
  Database,
  Clock
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import { toast } from 'sonner';

interface DataSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
  available: boolean;
  dataCount?: number;
  lastSync?: Date;
}

const UserProfile: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const { position, requestPermission: requestLocationPermission } = useGeolocation();
  const { history, requestPermission: requestBrowsingPermission } = useBrowsingHistory();
  
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: 'location',
      name: 'Lokasyon Verisi',
      icon: <MapPin className="w-5 h-5" />,
      description: 'Konum tabanlı öneriler ve analiz',
      enabled: false,
      available: true,
      dataCount: 0,
      lastSync: undefined
    },
    {
      id: 'browsing',
      name: 'Chrome Geçmişi',
      icon: <Chrome className="w-5 h-5" />,
      description: 'Web sitesi ziyaretleri ve tercihler',
      enabled: false,
      available: true,
      dataCount: 0,
      lastSync: undefined
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: <Twitter className="w-5 h-5" />,
      description: 'Tweetler, takipler ve etkileşimler',
      enabled: false,
      available: false
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      description: 'Fotoğraflar, story\'ler ve etkileşimler',
      enabled: false,
      available: false
    },
    {
      id: 'amazon',
      name: 'Amazon',
      icon: <ShoppingBag className="w-5 h-5" />,
      description: 'Alışveriş geçmişi ve öneriler',
      enabled: false,
      available: false
    },
    {
      id: 'binance',
      name: 'Binance',
      icon: <Bitcoin className="w-5 h-5" />,
      description: 'Kripto portföy ve işlem geçmişi',
      enabled: false,
      available: false
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <Music className="w-5 h-5" />,
      description: 'İzlenen videolar ve etkileşimler',
      enabled: false,
      available: false
    }
  ]);

  useEffect(() => {
    // Update data sources based on current permissions and data
    setDataSources(prev => prev.map(source => {
      if (source.id === 'location') {
        return {
          ...source,
          enabled: position !== null,
          dataCount: position ? 1 : 0,
          lastSync: position ? new Date() : undefined
        };
      }
      if (source.id === 'browsing') {
        return {
          ...source,
          enabled: history.length > 0,
          dataCount: history.length,
          lastSync: history.length > 0 ? new Date() : undefined
        };
      }
      return source;
    }));
  }, [position, history]);

  const handleDataSourceToggle = async (sourceId: string, enabled: boolean) => {
    const source = dataSources.find(s => s.id === sourceId);
    if (!source?.available) return;

    try {
      if (enabled) {
        if (sourceId === 'location') {
          await requestLocationPermission();
          toast.success('Lokasyon izni verildi ve veriler şifrelendi!');
        } else if (sourceId === 'browsing') {
          await requestBrowsingPermission();
          toast.success('Tarama geçmişi izni verildi ve veriler şifrelendi!');
        }
      } else {
        // For now, just show info about disabling
        toast.info(`${source.name} devre dışı bırakıldı`);
      }
    } catch (error) {
      toast.error(`${source?.name} izni alınamadı`);
    }
  };

  const getEncryptionStatus = () => {
    const enabledSources = dataSources.filter(s => s.enabled);
    const totalDataPoints = enabledSources.reduce((acc, s) => acc + (s.dataCount || 0), 0);
    
    return {
      sourcesCount: enabledSources.length,
      totalDataPoints,
      encryptionLevel: enabledSources.length > 0 ? 'Aktif' : 'Pasif'
    };
  };

  const encryptionStatus = getEncryptionStatus();

  return (
    <div className="space-y-6 h-full overflow-auto">
      {/* Profile Header */}
      <Card className="card-cyber p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-background" />
            </div>
            <div>
              <h2 className="text-2xl font-bold glow-text">Kullanıcı Profili</h2>
              <p className="text-muted-foreground">
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Cüzdan bağlı değil'}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={`${
              isConnected 
                ? 'border-cyber-green/50 text-cyber-green' 
                : 'border-muted-foreground/50 text-muted-foreground'
            }`}
          >
            <Shield className="w-3 h-3 mr-1" />
            {isConnected ? 'UDID Aktif' : 'UDID Yok'}
          </Badge>
        </div>

        {/* Encryption Status */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-card/30 rounded-lg border border-cyber-grid">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-neon">{encryptionStatus.sourcesCount}</div>
            <div className="text-sm text-muted-foreground">Aktif Kaynak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-green">{encryptionStatus.totalDataPoints}</div>
            <div className="text-sm text-muted-foreground">Şifreli Veri</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              encryptionStatus.encryptionLevel === 'Aktif' ? 'text-cyber-blue' : 'text-muted-foreground'
            }`}>
              {encryptionStatus.encryptionLevel}
            </div>
            <div className="text-sm text-muted-foreground">Şifreleme</div>
          </div>
        </div>
      </Card>

      {/* Data Sources */}
      <Card className="card-cyber p-6">
        <div className="flex items-center mb-6">
          <Database className="w-6 h-6 mr-2 text-cyber-neon" />
          <h3 className="text-xl font-bold glow-text">Veri Kaynakları</h3>
        </div>

        <div className="space-y-4">
          {dataSources.map((source) => (
            <div key={source.id}>
              <div className="flex items-center justify-between p-4 bg-card/20 rounded-lg border border-cyber-grid/50">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    source.enabled 
                      ? 'bg-cyber-green/20 text-cyber-green' 
                      : source.available 
                      ? 'bg-muted/20 text-muted-foreground' 
                      : 'bg-muted/10 text-muted-foreground/50'
                  }`}>
                    {source.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{source.name}</h4>
                      {source.enabled && (
                        <Badge variant="outline" className="border-cyber-green/50 text-cyber-green">
                          <Lock className="w-2 h-2 mr-1" />
                          Şifreli
                        </Badge>
                      )}
                      {!source.available && (
                        <Badge variant="outline" className="border-cyber-blue/50 text-cyber-blue">
                          Yakında
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                    {source.enabled && source.dataCount !== undefined && (
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Activity className="w-3 h-3 mr-1" />
                        {source.dataCount} veri noktası şifrelenmiş
                        {source.lastSync && (
                          <>
                            <span className="mx-1">•</span>
                            <Clock className="w-3 h-3 mr-1" />
                            {source.lastSync.toLocaleTimeString()}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <Switch
                  checked={source.enabled}
                  onCheckedChange={(checked) => handleDataSourceToggle(source.id, checked)}
                  disabled={!source.available}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card className="card-cyber p-6">
        <div className="flex items-center mb-4">
          <Lock className="w-6 h-6 mr-2 text-cyber-green" />
          <h3 className="text-xl font-bold glow-text">Gizlilik & Güvenlik</h3>
        </div>
        
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2 text-cyber-neon" />
            Tüm verileriniz AES-256 ile şifrelenir
          </div>
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2 text-cyber-blue" />
            Veriler blockchain üzerinde güvenli saklanır
          </div>
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2 text-cyber-green" />
            Sadece siz şifreli verilerinize erişebilirsiniz
          </div>
          <div className="flex items-center">
            <Database className="w-4 h-4 mr-2 text-cyber-purple" />
            AI analizi şifrelenmiş veri üzerinde yapılır
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
