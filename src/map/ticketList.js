import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, Dimensions, Platform } from 'react-native';
import { ArrowLeft, Search, QrCode, ChevronRight, Calendar, MapPin, Building, Compass, Ticket, Car, Wifi } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const getCategoryDetails = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('khách sạn') || t.includes('resort') || t.includes('hotel')) {
    return { Icon: Building, color: '#ff6b6b', label: 'Khách sạn' };
  }
  if (t.includes('tour')) {
    return { Icon: Compass, color: '#0abde3', label: 'Tour du lịch' };
  }
  if (t.includes('vé') || t.includes('vinwonders') || t.includes('vịnh hạ long')) {
    return { Icon: Ticket, color: '#ff9f43', label: 'Vé vui chơi' };
  }
  if (t.includes('xe') || t.includes('car')) {
    return { Icon: Car, color: '#10ac84', label: 'Thuê xe' };
  }
  if (t.includes('wifi') || t.includes('sim')) {
    return { Icon: Wifi, color: '#5f27cd', label: 'WiFi & SIM' };
  }
  return { Icon: Compass, color: '#3b82f6', label: 'Dịch vụ' };
};

export function TicketListScreen({ theme, isDarkMode, bookedTickets, onBack, onViewTicket }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'history'

  const filteredTickets = useMemo(() => {
    let tickets = bookedTickets;
    
    // Status tabs filtering
    if (activeTab === 'active') {
      tickets = tickets.filter(t => t.status && (t.status.includes('Đã thanh toán') || t.status === 'Đã xác nhận'));
    } else if (activeTab === 'history') {
      tickets = tickets.filter(t => !t.status || (!t.status.includes('Đã thanh toán') && t.status !== 'Đã xác nhận'));
    }

    if (!searchQuery.trim()) return tickets;
    const query = searchQuery.toLowerCase().trim();
    return tickets.filter(
      ticket => 
        ticket.title.toLowerCase().includes(query) ||
        ticket.code.toLowerCase().includes(query) ||
        ticket.region.toLowerCase().includes(query)
    );
  }, [searchQuery, bookedTickets, activeTab]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable style={[styles.iconBtn, { backgroundColor: theme.statusBg }]} onPress={onBack}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Vé Điện Tử Của Tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchContainer, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
          <Search size={18} color={theme.textMuted} />
          <TextInput
            placeholder="Tìm theo điểm đến, mã đặt chỗ..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
        </View>
      </View>

      {/* TABS SELECTOR */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'active', label: 'Đang hoạt động' },
          { key: 'history', label: 'Lịch sử' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tabBtn,
                isActive && { borderBottomColor: '#3b82f6' }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                { color: isActive ? '#3b82f6' : theme.textSecondary },
                isActive && { fontWeight: '900' }
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* TICKETS LIST */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredTickets && filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, index) => {
            const cat = getCategoryDetails(ticket.title);
            const CatIcon = cat.Icon;
            return (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.ticketCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => {
                  if (onViewTicket) onViewTicket(ticket.code);
                }}
              >
                {/* Header section of card */}
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}15`, borderColor: `${cat.color}30` }]}>
                      <CatIcon size={14} color={cat.color} />
                    </View>
                    <Text style={[styles.catLabel, { color: theme.textSecondary }]}>{cat.label}</Text>
                  </View>

                  <View style={[
                    styles.statusPill,
                    { 
                      backgroundColor: ticket.status && (ticket.status.includes('Đã thanh toán') || ticket.status === 'Đã xác nhận') 
                        ? 'rgba(16, 185, 129, 0.15)' 
                        : 'rgba(245, 158, 11, 0.15)',
                      borderColor: ticket.status && (ticket.status.includes('Đã thanh toán') || ticket.status === 'Đã xác nhận') 
                        ? '#10b981' 
                        : '#f59e0b'
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      {
                        color: ticket.status && (ticket.status.includes('Đã thanh toán') || ticket.status === 'Đã xác nhận') 
                          ? '#10b981' 
                          : '#f59e0b'
                      }
                    ]}>
                      {(ticket.status || 'Đã xác nhận').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Title & Body */}
                <Text style={[styles.ticketTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                  {ticket.title}
                </Text>
                
                <View style={styles.metaRow}>
                  <Calendar size={13} color={theme.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    Khởi hành: {ticket.date} • {ticket.guests} khách
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <MapPin size={13} color={theme.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    Khu vực: {ticket.region}
                  </Text>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                {/* Action and pricing row */}
                <View style={styles.actionRow}>
                  <View style={styles.priceCol}>
                    <Text style={{ fontSize: 8.5, fontWeight: '800', color: theme.textMuted, letterSpacing: 0.5 }}>CHI PHÍ TRỌN GÓI</Text>
                    <Text style={{ fontSize: 15, fontWeight: '950', color: '#3b82f6', marginTop: 2 }}>{ticket.price}</Text>
                  </View>

                  {/* Barcode Mock */}
                  <View style={styles.barcodeCol}>
                    <View style={{ flexDirection: 'row', gap: 1.5, height: 16, opacity: isDarkMode ? 0.35 : 0.6 }}>
                      {[2, 4, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3].map((w, idx) => (
                        <View key={idx} style={{ width: w, backgroundColor: theme.textPrimary, height: '100%' }} />
                      ))}
                    </View>
                    <Text style={{ fontSize: 8, color: theme.textMuted, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', letterSpacing: 0.5 }}>{ticket.code}</Text>
                  </View>

                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: theme.statusBg, borderColor: theme.border }]}
                    onPress={() => {
                      if (onViewTicket) onViewTicket(ticket.code);
                    }}
                  >
                    <QrCode size={13} color={theme.textPrimary} />
                    <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Xem QR</Text>
                    <ChevronRight size={12} color={theme.textSecondary} />
                  </Pressable>
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <QrCode size={48} color={theme.textMuted} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Không tìm thấy vé điện tử nào.</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  searchContainer: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  ticketCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
  },
  ticketCode: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceCol: {
    justifyContent: 'center',
  },
  barcodeCol: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
