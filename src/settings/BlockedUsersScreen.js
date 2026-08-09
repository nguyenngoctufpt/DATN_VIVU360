import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ban, Search, UserMinus, UserPlus, X } from 'lucide-react-native';
import { searchFriends } from '../services/userService';
import { getSafeAvatarSource } from '../utils/image';
import { getSettingsText } from './constants';
import { SettingsLayout } from './components/SettingsLayout';

export function BlockedUsersScreen({
  theme,
  language,
  ownerId,
  settings,
  onBack,
  onUpdateSettings,
}) {
  const text = getSettingsText(language);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyUserId, setBusyUserId] = useState('');
  const [statusBanner, setStatusBanner] = useState(null);

  const blockedIds = useMemo(
    () => new Set((settings.blockedUsers || []).map((item) => item.firebaseUid)),
    [settings.blockedUsers]
  );

  const showBanner = (type, message) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 2600);
  };

  useEffect(() => {
    const query = searchText.trim();
    if (query.length < 2 || !ownerId) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      searchFriends(query, ownerId)
        .then((users) => {
          if (!active) return;
          setResults(Array.isArray(users) ? users.filter((item) => item.firebaseUid !== ownerId) : []);
        })
        .catch(() => active && setResults([]))
        .finally(() => active && setLoading(false));
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchText, ownerId]);

  const persistBlockedUsers = async (blockedUsers) => {
    const result = await onUpdateSettings({ blockedUsers });
    showBanner(result?.syncError ? 'error' : 'success', result?.syncError ? text.partialSaveSuccess : text.saveSuccess);
  };

  const handleBlock = async (user) => {
    setBusyUserId(user.firebaseUid);
    await persistBlockedUsers([
      {
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        blockedAt: new Date().toISOString(),
      },
      ...(settings.blockedUsers || []),
    ]);
    setBusyUserId('');
  };

  const handleUnblock = async (userId) => {
    setBusyUserId(userId);
    await persistBlockedUsers((settings.blockedUsers || []).filter((item) => item.firebaseUid !== userId));
    setBusyUserId('');
  };

  return (
    <SettingsLayout
      theme={theme}
      title={text.blockedUsers}
      subtitle={text.blockedUsersDescription}
      onBack={onBack}
      statusBanner={statusBanner}
    >
      <View style={[styles.searchWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.searchInputWrap, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
          <Search size={16} color={theme.textMuted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={text.searchPlaceholder}
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
          {searchText ? (
            <Pressable onPress={() => setSearchText('')}>
              <X size={16} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {loading ? <ActivityIndicator color="#3b82f6" style={{ marginTop: 12 }} /> : null}

        {results.length > 0 ? (
          <View style={styles.resultList}>
            {results.map((user) => {
              const isBlocked = blockedIds.has(user.firebaseUid);
              const isBusy = busyUserId === user.firebaseUid;
              return (
                <View key={user.firebaseUid} style={[styles.userRow, { borderBottomColor: theme.border }]}>
                  <Image source={getSafeAvatarSource(user.avatar)} style={styles.avatar} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name}</Text>
                    <Text style={[styles.userMeta, { color: theme.textSecondary }]} numberOfLines={1}>{user.email}</Text>
                  </View>
                  <Pressable
                    style={[
                      styles.blockButton,
                      { backgroundColor: isBlocked ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)' },
                    ]}
                    onPress={() => (isBlocked ? handleUnblock(user.firebaseUid) : handleBlock(user))}
                    disabled={isBusy}
                  >
                    {isBusy ? (
                      <ActivityIndicator size="small" color={isBlocked ? '#ef4444' : '#3b82f6'} />
                    ) : isBlocked ? (
                      <>
                        <UserMinus size={14} color="#ef4444" />
                        <Text style={[styles.blockButtonText, { color: '#ef4444' }]}>
                          {language === 'en' ? 'Unblock' : 'Bỏ chặn'}
                        </Text>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} color="#3b82f6" />
                        <Text style={[styles.blockButtonText, { color: '#3b82f6' }]}>
                          {language === 'en' ? 'Block' : 'Chặn'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : searchText.trim().length >= 2 && !loading ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{text.noResults}</Text>
        ) : null}
      </View>

      <View style={[styles.blockedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.blockedHeader}>
          <Ban size={16} color="#ef4444" />
          <Text style={[styles.blockedTitle, { color: theme.textPrimary }]}>{text.blockedUsers}</Text>
        </View>
        {(settings.blockedUsers || []).length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{text.blockedListEmpty}</Text>
        ) : (
          (settings.blockedUsers || []).map((user, index) => (
            <View
              key={user.firebaseUid}
              style={[
                styles.userRow,
                index !== settings.blockedUsers.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
              ]}
            >
              <Image source={getSafeAvatarSource(user.avatar)} style={styles.avatar} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name}</Text>
                <Text style={[styles.userMeta, { color: theme.textSecondary }]} numberOfLines={1}>{user.email}</Text>
              </View>
              <Pressable style={[styles.blockButton, { backgroundColor: 'rgba(239,68,68,0.12)' }]} onPress={() => handleUnblock(user.firebaseUid)}>
                <UserMinus size={14} color="#ef4444" />
                <Text style={[styles.blockButtonText, { color: '#ef4444' }]}>{language === 'en' ? 'Unblock' : 'Bỏ chặn'}</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  searchInputWrap: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  resultList: {
    gap: 2,
  },
  userRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
  },
  userMeta: {
    fontSize: 11.5,
  },
  blockButton: {
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  blockButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  blockedCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  blockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  blockedTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
