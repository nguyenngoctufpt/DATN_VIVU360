import api from "./api";

export const reportPost = async (postId, reasons, description, reporterId) => {
    try {
        const response = await api.post('/reports', { postId, reasons, description, reporterId });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Lỗi gửi báo cáo');
        }
        throw new Error('Không thể kết nối đến server');
    }
};