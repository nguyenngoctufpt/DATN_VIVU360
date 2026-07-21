import { StyleSheet, Text, View, ActivityIndicator, FlatList, Image, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useEffect, useState, useMemo } from "react";
import { getDiaDiem } from '../services/diaDiemService';
import { Heart, Flame, MapPin, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AllDiaDiem = ({ theme,onSelectDiaDiem }) => {
  //Địa điểm
  const [diaDiem, setDiaDiem] = useState([]);
  //Tìm kiếm bằng text
  const [searchText, setSearchText] = useState("");
  //Tìm kiếm 
  const [selectedLocation, setSelectedLocation] = useState("All");


  const locations = React.useMemo(() => {
    return ["All", ...new Set(diaDiem.map(item => item.viTri))];
  }, [diaDiem]);

  const renderItem = ({ item }) => (
    <Pressable
    onPress={()=> onSelectDiaDiem(item)}
      style={[
        styles.destCard,
        {
          borderColor: theme.border,
          backgroundColor: theme.card,
        },
      ]}
    >
      <Image
        source={{ uri: item.hinhAnh }}
        style={styles.destImg}
        resizeMode="cover"
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
        style={styles.destGrad}
      />

      <View style={styles.destCardHeader}>
        <View style={styles.destBadgeHot}>
          <Flame size={10} color="#f97316" fill="#f97316" />
          <Text style={styles.destBadgeText}>XU HƯỚNG</Text>
        </View>

        <Pressable style={styles.heartBtn}>
          <Heart size={16} color="#fff" fill="rgba(0,0,0,0.2)" />
        </Pressable>
      </View>

      <View
        style={[
          styles.destCardFooter,
          {
            backgroundColor: theme.cardGlass,
            borderColor: theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.destCity,
            { color: theme.textPrimary },
          ]}
        >
          {item.ten}
        </Text>

        <View style={styles.destRow}>
          <MapPin size={11} color={theme.textSecondary} />
          <Text
            style={[
              styles.destRegion,
              { color: theme.textSecondary },
            ]}
          >
            {item.viTri}
          </Text>
        </View>

        <View style={styles.destRatingRow}>
          <Text
            style={[
              styles.ratingReviews,
              { color: theme.textSecondary },
            ]}
          >
            Lượt xem: {item.danhGia}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  //Hàm gọi API địa điểm
  const fetchDiaDiem = async () => {
    try {
      const data = await getDiaDiem()
      console.log("API trả về:", data);
      setDiaDiem(data);
    } catch (error) {
      console.log("Lỗi API:", error);
    }
  }
  useEffect(() => {
    fetchDiaDiem();
  }, [])

  //Tìm kiếm
  const filteredDiaDiem = diaDiem.filter((item) => {

    const keyword = searchText.toLowerCase();

    const matchSearch =
      item.ten.toLowerCase().includes(keyword) ||
      item.viTri.toLowerCase().includes(keyword);

    const matchLocation =
      selectedLocation === "All"
        ? true
        : item.viTri === selectedLocation;

    return matchSearch && matchLocation;
  });

  return (
    <View style={{ flex: 1 }}>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Search size={20} color={theme.textSecondary} />

        <TextInput
          placeholder="Tìm địa điểm..."
          placeholderTextColor={theme.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          style={[
            styles.searchInput,
            {
              color: theme.textPrimary,
            },
          ]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >

        {locations.map((location) => (

          <Pressable
            key={location}
            onPress={() => setSelectedLocation(location)}
            style={[
              styles.chip,

              {
                borderColor:
                  selectedLocation === location
                    ? "rgba(59,130,246,0.8)"
                    : "rgba(255,255,255,0.08)",

                backgroundColor:
                  selectedLocation === location
                    ? "rgba(59,130,246,0.18)"
                    : "rgba(255,255,255,0.03)",
              },
            ]}
          >

            <Text
              style={{
                color:
                  selectedLocation === location
                    ? "#7cc4ff"
                    : "#cfd5df",

                fontWeight:
                  selectedLocation === location
                    ? "700"
                    : "500",
              }}
            >
              {location}
            </Text>

          </Pressable>

        ))}

      </ScrollView>

      <FlatList
        data={filteredDiaDiem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
      />

    </View>

  )
}

export default AllDiaDiem

const styles = StyleSheet.create({
  listContainer: {
    padding: 12,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  destCard: {
    width: "48%",
    height: 275,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1.2,
    marginBottom: 12,
  },
  destImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  destGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  destCardHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  destBadgeHot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(9, 9, 11, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.35)',
  },
  destBadgeText: { color: '#f97316', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.5 },
  heartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(9, 9, 11, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  destCardFooter: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  destCity: { fontSize: 15.5, fontWeight: '900', letterSpacing: -0.3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  destRegion: { fontSize: 10, fontWeight: '600' },
  destRatingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  ratingStars: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingReviews: { fontSize: 9.5, fontWeight: '600' },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    marginTop: 48,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  chipContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
  },

  chip: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,

    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,

  },

})