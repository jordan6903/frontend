import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5252/api', // 你的 API 基本 URL
  timeout: 10000, // 請求超時時間
})

// 請求攔截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 從 localStorage 取出 Token
    const token = localStorage.getItem('myToken')
    if (token) {
      // 如果有 Token，將其加入 Authorization Header
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 請求錯誤時返回 Promise 拒絕
    return Promise.reject(error)
  }
)

// 回應攔截器（可選）
axiosInstance.interceptors.response.use(
  (response) => {
    // 處理正常回應
    return response
  },
  (error) => {
    // 處理錯誤回應，例如 Token 過期的邏輯
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized - Token might be invalid or expired.')
      // 你可以在這裡進行重新導向登入或其他處理
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
