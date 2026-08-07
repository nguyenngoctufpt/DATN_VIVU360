import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { getDiaDiem } from '../services/diaDiemService'
import { getSafeImageSource } from '../utils/image'

const Home = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const result = await getDiaDiem();
            setData(result);
        } catch (error) {
            console.log("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );

    }
    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <View style={styles.card}>

                    <Image
                        source={getSafeImageSource(item.hinhAnh)}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    <Text style={styles.title}>{item.ten}</Text>

                    <Text>📍 {item.viTri}</Text>

                </View>
            )}>
        </FlatList>

    )
}

export default Home

const styles = StyleSheet.create({
    Container: {
        backgroundColor: 'red'
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    card: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 4,
},

title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
},
    image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
},

});



