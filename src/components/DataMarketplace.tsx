
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingBag, 
  Tag, 
  Clock, 
  DollarSign, 
  Lock,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';

interface MarketplaceListing {
  id: string;
  collection: string;
  tokenId: string;
  seller: string;
  saleType: 'Transfer' | 'Rent';
  currency: string;
  price: string;
  rentDuration?: number;
  rentPermissions?: string;
  active: boolean;
  tags: string[];
  metadata?: {
    title: string;
    description: string;
    dataType: string;
    encryptionLevel: string;
    size: string;
  };
}

const DataMarketplace: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  useEffect(() => {
    loadMarketplaceListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, searchQuery, saleTypeFilter, tagFilter, priceRange]);

  const loadMarketplaceListings = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - replace with actual contract calls
      const mockListings: MarketplaceListing[] = [
        {
          id: '1',
          collection: '0x1953cc8d4edf5c2a1a26b89d4c45edc01e3d3a3d',
          tokenId: '1',
          seller: '0x742d35Cc6634C0532925a3b8D438067DC012345',
          saleType: 'Transfer',
          currency: '0x0000000000000000000000000000000000000000',
          price: '0.1',
          active: true,
          tags: ['location', 'personal', 'geo'],
          metadata: {
            title: 'Konum Verisi - İstanbul',
            description: 'AES-256 ile şifrelenmiş lokasyon verisi',
            dataType: 'Lokasyon',
            encryptionLevel: 'AES-256-GCM',
            size: '2.5KB'
          }
        },
        {
          id: '2',
          collection: '0x1953cc8d4edf5c2a1a26b89d4c45edc01e3d3a3d',
          tokenId: '2',
          seller: '0x742d35Cc6634C0532925a3b8D438067DC567890',
          saleType: 'Rent',
          currency: '0x0000000000000000000000000000000000000000',
          price: '0.05',
          rentDuration: 86400, // 1 day
          rentPermissions: 'read-only',
          active: true,
          tags: ['browsing', 'web', 'analytics'],
          metadata: {
            title: 'Tarama Geçmişi Analizi',
            description: 'Web sitesi ziyaret verisi ve tercihler',
            dataType: 'Web Geçmişi',
            encryptionLevel: 'AES-256-GCM',
            size: '15.2KB'
          }
        },
        {
          id: '3',
          collection: '0x1953cc8d4edf5c2a1a26b89d4c45edc01e3d3a3d',
          tokenId: '3',
          seller: '0x742d35Cc6634C0532925a3b8D438067DC111222',
          saleType: 'Transfer',
          currency: '0x0000000000000000000000000000000000000000',
          price: '0.3',
          active: true,
          tags: ['social', 'instagram', 'content'],
          metadata: {
            title: 'Instagram Etkileşim Verisi',
            description: 'Sosyal medya aktivitesi ve tercihler',
            dataType: 'Sosyal Medya',
            encryptionLevel: 'AES-256-GCM',
            size: '8.7KB'
          }
        }
      ];
      
      setListings(mockListings);
    } catch (error) {
      console.error('Error loading marketplace listings:', error);
      toast.error('Pazar verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(listing => 
        listing.metadata?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.metadata?.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sale type filter
    if (saleTypeFilter !== 'all') {
      filtered = filtered.filter(listing => 
        saleTypeFilter === 'transfer' ? listing.saleType === 'Transfer' : listing.saleType === 'Rent'
      );
    }

    // Tag filter
    if (tagFilter !== 'all') {
      filtered = filtered.filter(listing => listing.tags.includes(tagFilter));
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(listing => {
        const price = parseFloat(listing.price);
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredListings(filtered);
  };

  const handlePurchase = async (listing: MarketplaceListing) => {
    if (!isConnected) {
      toast.error('Cüzdanınızı bağlayın');
      return;
    }

    try {
      setLoading(true);
      const value = listing.currency === '0x0000000000000000000000000000000000000000' ? listing.price : undefined;
      
      await web3Service.buyListing(listing.id, value);
      toast.success(`${listing.metadata?.title} başarıyla satın alındı!`);
      
      // Reload listings
      loadMarketplaceListings();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Satın alma işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat`;
    return `${Math.floor(seconds / 86400)} gün`;
  };

  const getAllTags = (): string[] => {
    const allTags = listings.flatMap(listing => listing.tags);
    return [...new Set(allTags)];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-cyber p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold glow-text flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2 text-cyber-purple" />
              Veri Pazarı
            </h2>
            <p className="text-muted-foreground">Şifrelenmiş veri iNFT'lerini keşfedin ve satın alın</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="border-cyber-grid"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Veri ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-cyber pl-10"
            />
          </div>
          
          <Select value={saleTypeFilter} onValueChange={setSaleTypeFilter}>
            <SelectTrigger className="input-cyber">
              <SelectValue placeholder="Satış Tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="transfer">Satış</SelectItem>
              <SelectItem value="rent">Kiralama</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="input-cyber">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {getAllTags().map(tag => (
                <SelectItem key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Min fiyat"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="input-cyber"
            />
            <Input
              placeholder="Max fiyat"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="input-cyber"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-card/30 rounded-lg border border-cyber-grid">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-neon">{filteredListings.length}</div>
            <div className="text-sm text-muted-foreground">Aktif İlan</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-green">
              {filteredListings.filter(l => l.saleType === 'Transfer').length}
            </div>
            <div className="text-sm text-muted-foreground">Satış</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-blue">
              {filteredListings.filter(l => l.saleType === 'Rent').length}
            </div>
            <div className="text-sm text-muted-foreground">Kiralama</div>
          </div>
        </div>
      </Card>

      {/* Listings */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="card-cyber p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold glow-text mb-1">
                  {listing.metadata?.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {listing.metadata?.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {listing.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-cyber-grid">
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Badge 
                variant="outline" 
                className={`ml-2 ${
                  listing.saleType === 'Transfer' 
                    ? 'border-cyber-green/50 text-cyber-green' 
                    : 'border-cyber-blue/50 text-cyber-blue'
                }`}
              >
                {listing.saleType === 'Transfer' ? 'Satış' : 'Kiralama'}
              </Badge>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Veri Tipi:</span>
                <span>{listing.metadata?.dataType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Şifreleme:</span>
                <div className="flex items-center">
                  <Lock className="w-3 h-3 mr-1 text-cyber-green" />
                  <span>{listing.metadata?.encryptionLevel}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Boyut:</span>
                <span>{listing.metadata?.size}</span>
              </div>
              {listing.rentDuration && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kiralama Süresi:</span>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-cyber-blue" />
                    <span>{formatDuration(listing.rentDuration)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-cyber-grid">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-cyber-yellow" />
                <span className="text-lg font-bold">{listing.price} OG</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-cyber-grid"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Detay
                </Button>
                <Button
                  onClick={() => handlePurchase(listing)}
                  disabled={loading || !isConnected}
                  className="btn-cyber"
                  size="sm"
                >
                  {loading ? 'İşleniyor...' : listing.saleType === 'Transfer' ? 'Satın Al' : 'Kirala'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Token #{listing.tokenId}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && !loading && (
        <Card className="card-cyber p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">İlan Bulunamadı</h3>
          <p className="text-muted-foreground">
            {searchQuery || saleTypeFilter !== 'all' || tagFilter !== 'all' 
              ? 'Filtrelere uygun ilan bulunamadı. Filtreleri temizleyip tekrar deneyin.'
              : 'Henüz aktif ilan bulunmuyor. İlk ilanı siz oluşturun!'
            }
          </p>
        </Card>
      )}
    </div>
  );
};

export default DataMarketplace;
