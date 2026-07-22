import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Pressable,
} from 'react-native'
import React from 'react'

import {
    MapPin,
    Eye,
    ArrowLeft,
    Backpack,
    Share2,
} from "lucide-react-native";
import ShareLocationModal from '../components/ShareLocationModal';

const DiaDiemDetails = ({
    theme,
    isDarkMode,
    diaDiem,
    onBack,
    ownerId,
    currentUser,
    onNavigateToTab,
}) => {
    const [shareModalVisible, setShareModalVisible] = React.useState(false);
    console.log("Dia diem Detail:");
    console.log(JSON.stringify(diaDiem, null, 2));
    if (!diaDiem) return null;
    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: theme.background,
            }}
            showsVerticalScrollIndicator={false}
        >

            {/* Banner */}

            <View>

                <Image
                    source={{ uri: diaDiem.hinhAnh }}
                    style={styles.banner}
                    resizeMode="cover"
                />

                <Pressable
                    onPress={onBack}
                    style={styles.backButton}
                >
                    <ArrowLeft
                        size={22}
                        color="#fff"
                    />
                </Pressable>

                <Pressable
                    onPress={() => setShareModalVisible(true)}
                    style={styles.shareButton}
                >
                    <Share2
                        size={20}
                        color="#fff"
                    />
                </Pressable>

            </View>

            {/* Nội dung */}

            <View
                style={[
                    styles.content,
                    {
                        backgroundColor: theme.background,
                    },
                ]}
            >

                {/* Header */}

                <View style={styles.header}>

                    <View style={{ flex: 1 }}>

                        <Text
                            style={[
                                styles.title,
                                {
                                    color: theme.textPrimary,
                                },
                            ]}
                        >
                            {diaDiem.ten}
                        </Text>

                        <View style={styles.locationRow}>

                            <MapPin
                                size={16}
                                color={theme.textSecondary}
                            />

                            <Text
                                style={[
                                    styles.location,
                                    {
                                        color: theme.textSecondary,
                                    },
                                ]}
                            >
                                {diaDiem.viTri}
                            </Text>

                        </View>

                    </View>

                    <View style={styles.viewBox}>

                        <Eye
                            size={18}
                            color="#0ea5e9"
                        />

                        <Text style={styles.viewText}>
                            {diaDiem.danhGia}
                        </Text>

                    </View>

                </View>

                {/* Mô tả */}

                <Text
                    style={[
                        styles.sectionTitle,
                        {
                            color: theme.textPrimary,
                        },
                    ]}
                >
                    Mô tả
                </Text>

                <Text
                    style={[
                        styles.description,
                        {
                            color: theme.textSecondary,
                        },
                    ]}
                >
                    {diaDiem.moTa}
                </Text>

                {/* Đồ dùng */}

              <Text
  style={[
    styles.sectionTitle,
    {
      color: theme.textPrimary,
    },
  ]}
>
  Đồ dùng cần thiết
</Text>

<Text
  style={[
    styles.doDungText,
    {
      color: theme.textSecondary,
    },
  ]}
>
  {diaDiem.doDung?.join(", ")}
</Text>

            </View>

            <ShareLocationModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                locationData={{
                    name: diaDiem.ten,
                    location: diaDiem.viTri,
                    description: diaDiem.moTa,
                    image: diaDiem.hinhAnh,
                }}
                ownerId={ownerId}
                currentUser={currentUser}
                onShareSuccess={() => {
                    if (onNavigateToTab) onNavigateToTab('chat');
                }}
                theme={theme}
                isDarkMode={isDarkMode}
            />

        </ScrollView>
    )
}

export default DiaDiemDetails

const styles = StyleSheet.create({
    banner: {
        width: "100%",
        height: 260,
    },

    backButton: {
        position: "absolute",
        top: 50,
        left: 18,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
    },

    shareButton: {
        position: "absolute",
        top: 50,
        right: 18,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(59, 130, 246, 0.85)",
        justifyContent: "center",
        alignItems: "center",
    },

    content: {
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 22,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },

    location: {
        marginLeft: 6,
        fontSize: 15,
    },

    viewBox: {
        flexDirection: "row",
        alignItems: "center",
    },

    viewText: {
        marginLeft: 5,
        fontWeight: "700",
        color: "#0ea5e9",
        fontSize: 18,
    },

    sectionTitle: {
        marginTop: 28,
        marginBottom: 12,
        fontSize: 22,
        fontWeight: "700",
    },

    description: {
        fontSize: 18,
        lineHeight: 30,
    },

    itemContainer: {
  borderRadius: 18,
  padding: 18,
  borderWidth: 1,
},

itemRow: {
  flexDirection: "row",
  alignItems: "flex-start",
},

itemText: {
  flex: 1,
  marginLeft: 12,
  fontSize: 17,
  lineHeight: 28,
},
doDungText: {
  fontSize: 17,
  lineHeight: 28,
  marginTop: 6,
},
})