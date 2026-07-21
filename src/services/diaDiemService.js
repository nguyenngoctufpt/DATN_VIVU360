import api from "./api";

export const getDiaDiem = async () => {
    try {
        const res = await api.get("/diadiem")
        return res.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}