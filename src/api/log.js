import request from '@/utils/request'

/**
 * 日志分页查询
 * @param {Object} params { page, pageSize }
 * @returns {Promise<{total: number, rows: Array}>}
 */
export function getLogList(params) {
  return request({
    url: '/log/page',
    method: 'get',
    params
  })
}