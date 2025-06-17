import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 自动携带 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { code, msg, data } = response.data

    // 请求成功
    if (code === 1) {
      return data
    }

    // 请求失败但有后端返回的错误信息
    ElMessage.error(msg || '操作失败')
    return Promise.reject(new Error(msg || '操作失败'))
  },
  error => {
    // 处理401未登录
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/login')
    } else {
      // 处理其他网络错误
      const message = error.response?.data?.msg || error.message || '网络请求失败'
      ElMessage.error(message)
    }
    return Promise.reject(error)
  }
)

export default service