import Axios from 'axios';

const AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

AxiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('API Error: ', error);
    return Promise.reject(error);
  }
);

export default AxiosInstance;
