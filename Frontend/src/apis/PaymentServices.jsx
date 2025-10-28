import axiosConfig from '../axiosConfig';

export const createPayment = async(data, token) => {
    const res = await axiosConfig.post(`/api/v1/payos/create-payment-link`, data, {
        headers: { Authorization: `Bearer ${token}`}
    });
    return res.data;
}