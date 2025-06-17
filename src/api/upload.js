import request from '@/utils/request'

/**
 * 上传图片
 * @param {FormData} data
 * @returns {Promise<string>} 返回图片URL
 */
export function uploadImage(data) {
  return request({
    url: '/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}