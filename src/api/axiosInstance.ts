import axios from 'axios';

// Axios instance kept for any future REST endpoint integration.
// Primary data path is Firestore via firebaseService.
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default axiosInstance;
