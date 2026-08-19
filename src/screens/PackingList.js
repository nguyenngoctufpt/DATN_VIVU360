import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, ClipboardList, Plus, Sparkles, Trash2 } from 'lucide-react-native';

export function PackingListScreen({ theme, packingItems, setPackingItems, onGetSuggestions }) {
  const [newItem, setNewItem] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const items = Array.isArray(packingItems) ? packingItems : [];

  const packedCount = useMemo(
    () => items.filter(item => item.packed).length,
    [items]
  );

  const addItem = () => {
    const title = newItem.trim();
    if (!title) return;

    setPackingItems(prev => [
      ...(Array.isArray(prev) ? prev : []),
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        packed: false
      }
    ]);

    setNewItem('');
  };

  const toggleItem = id =>
    setPackingItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );

  const removeItem = id =>
    setPackingItems(prev => prev.filter(item => item.id !== id));

  const addSuggestion = title => {
    const existing = items.some(
      item =>
        item.title.trim().toLocaleLowerCase('vi') ===
        title.toLocaleLowerCase('vi')
    );

    if (existing) return;

    setPackingItems(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        packed: false
      }
    ]);
  };

  const requestSuggestions = async () => {
    if (!onGetSuggestions || isSuggesting) return;

    setIsSuggesting(true);

    try {
      const result = await onGetSuggestions();
      setSuggestions(Array.isArray(result?.items) ? result.items : []);
    } catch (error) {
      Alert.alert(
        'Chưa thể gợi ý',
        error.response?.data?.message ||
          'Vui lòng kiểm tra kết nối và thử lại.'
      );
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.card,
            borderColor: theme.border
          }
        ]}
      >
        <View style={styles.heroIcon}>
          <ClipboardList size={25} color="#fff" />
        </View>

        <View style={styles.heroText}>
          <Text
            style={[
              styles.title,
              { color: theme.textPrimary }
            ]}
          >
            Đồ dùng cần mang
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: theme.textSecondary }
            ]}
          >
            Ghi nhớ hành lý cho chuyến đi của bạn
          </Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text
          style={[
            styles.progressText,
            { color: theme.textSecondary }
          ]}
        >
          Đã mang {packedCount}/{items.length} món
        </Text>

        {items.length > 0 && (
          <Text style={styles.progressPercent}>
            {Math.round((packedCount / items.length) * 100)}%
          </Text>
        )}
      </View>

      <View
        style={[
          styles.progressTrack,
          { backgroundColor: theme.border }
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${
                items.length
                  ? (packedCount / items.length) * 100
                  : 0
              }%`
            }
          ]}
        />
      </View>

      <View
        style={[
          styles.addRow,
          {
            backgroundColor: theme.card,
            borderColor: theme.border
          }
        ]}
      >
        <TextInput
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
          placeholder="Nhập đồ dùng cần mang..."
          placeholderTextColor={theme.textMuted}
          returnKeyType="done"
          style={[
            styles.input,
            { color: theme.textPrimary }
          ]}
        />

        <Pressable
          onPress={addItem}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed
          ]}
          accessibilityLabel="Thêm đồ dùng"
        >
          <Plus size={21} color="#fff" />
        </Pressable>
      </View>

      <Pressable
        onPress={requestSuggestions}
        disabled={isSuggesting}
        style={({ pressed }) => [
          styles.aiButton,
          {
            borderColor: theme.border,
            backgroundColor: theme.card
          },
          (pressed || isSuggesting) && styles.pressed
        ]}
      >
        <Sparkles size={19} color="#8b5cf6" />

        <Text style={styles.aiButtonText}>
          {isSuggesting
            ? 'AI đang gợi ý...'
            : 'Gợi ý đồ dùng bằng AI'}
        </Text>
      </Pressable>

      {suggestions.length > 0 && (
        <View
          style={[
            styles.suggestions,
            {
              backgroundColor: theme.card,
              borderColor: theme.border
            }
          ]}
        >
          <View style={styles.suggestionHeader}>
            <Text
              style={[
                styles.suggestionTitle,
                { color: theme.textPrimary }
              ]}
            >
              Gợi ý từ AI
            </Text>

            <Pressable
              onPress={() =>
                suggestions.forEach(addSuggestion)
              }
            >
              <Text style={styles.addAllText}>
                Thêm tất cả
              </Text>
            </Pressable>
          </View>

          {suggestions.map((title, index) => {
            const alreadyAdded = items.some(
              item =>
                item.title
                  .trim()
                  .toLocaleLowerCase('vi') ===
                title.toLocaleLowerCase('vi')
            );

            return (
              <Pressable
                key={`${title}-${index}`}
                onPress={() => addSuggestion(title)}
                disabled={alreadyAdded}
                style={styles.suggestionItem}
              >
                <View style={styles.suggestionNumber}>
                  <Text style={styles.suggestionNumberText}>
                    {index + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.suggestionText,
                    {
                      color: alreadyAdded
                        ? theme.textMuted
                        : theme.textPrimary
                    },
                    alreadyAdded && styles.addedText
                  ]}
                >
                  {title}
                </Text>

                <Text
                  style={[
                    styles.addOneText,
                    alreadyAdded && {
                      color: theme.textMuted
                    }
                  ]}
                >
                  {alreadyAdded ? 'Đã thêm' : 'Thêm'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {items.length === 0 ? (
        <View
          style={[
            styles.empty,
            {
              backgroundColor: theme.card,
              borderColor: theme.border
            }
          ]}
        >
          <ClipboardList
            size={38}
            color={theme.textMuted}
          />

          <Text
            style={[
              styles.emptyTitle,
              { color: theme.textPrimary }
            ]}
          >
            Chưa có đồ dùng nào
          </Text>

          <Text
            style={[
              styles.emptyText,
              { color: theme.textSecondary }
            ]}
          >
            Nhập từng món bạn cần mang theo ở ô phía trên.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map(item => (
            <View
              key={item.id}
              style={[
                styles.item,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }
              ]}
            >
              <Pressable
                onPress={() => toggleItem(item.id)}
                style={styles.itemMain}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: item.packed
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.packed &&
                      styles.checkboxChecked
                  ]}
                >
                  {item.packed && (
                    <Check
                      size={16}
                      color="#fff"
                      strokeWidth={3}
                    />
                  )}
                </View>

                <Text
                  style={[
                    styles.itemText,
                    { color: theme.textPrimary },
                    item.packed && {
                      color: theme.textMuted,
                      textDecorationLine: 'line-through'
                    }
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => removeItem(item.id)}
                hitSlop={10}
                style={styles.deleteButton}
                accessibilityLabel={`Xóa ${item.title}`}
              >
                <Trash2
                  size={18}
                  color={theme.textMuted}
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 110
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    borderRadius: 20
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center'
  },

  heroText: {
    flex: 1,
    marginLeft: 13
  },

  title: {
    fontSize: 22,
    fontWeight: '800'
  },

  subtitle: {
    fontSize: 13,
    marginTop: 3
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8
  },

  progressText: {
    fontSize: 13,
    fontWeight: '600'
  },

  progressPercent: {
    color: '#3b82f6',
    fontWeight: '800',
    fontSize: 13
  },

  progressTrack: {
    height: 8,
    borderRadius: 99,
    overflow: 'hidden'
  },

  progressFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#3b82f6'
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
    padding: 8,
    borderWidth: 1,
    borderRadius: 15
  },

  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 8,
    paddingVertical: 8
  },

  addButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#3b82f6'
  },

  aiButton: {
    marginTop: 12,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },

  aiButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '800'
  },

  suggestions: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1
  },

  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },

  suggestionTitle: {
    fontSize: 16,
    fontWeight: '800'
  },

  addAllText: {
    color: '#3b82f6',
    fontWeight: '800',
    fontSize: 13
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42
  },

  suggestionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center'
  },

  suggestionNumberText: {
    color: '#7c3aed',
    fontWeight: '800',
    fontSize: 11
  },

  suggestionText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 13,
    fontWeight: '600'
  },

  addOneText: {
    color: '#3b82f6',
    fontWeight: '800',
    fontSize: 12
  },

  addedText: {
    textDecorationLine: 'line-through'
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }]
  },

  empty: {
    alignItems: 'center',
    marginTop: 20,
    padding: 30,
    borderRadius: 18,
    borderWidth: 1
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700'
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19
  },

  list: {
    marginTop: 16,
    gap: 10
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 15,
    paddingLeft: 14,
    paddingRight: 10
  },

  itemMain: {
    flex: 1,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center'
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center'
  },

  checkboxChecked: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e'
  },

  itemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600'
  },

  deleteButton: {
    padding: 8
  }
});