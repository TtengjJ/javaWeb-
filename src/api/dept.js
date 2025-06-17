import request from '@/utils/request'

/**
 * 获取部门列表
 * @returns {Promise<Array>}
 */
export function getDeptList() {
  return request({
    url: '/depts',
    method: 'get',
    timeout: 5000 // 添加超时设置
  })
}

/**
 * 新增部门
 * @param {Object} data 
 * @returns {Promise<any>}
 */
export function addDept(data) {
  return request({
    url: '/depts',
    method: 'post',
    data,
    timeout: 5000
  })
}

/**
 * 修改部门
 * @param {Object} data 
 * @returns {Promise<any>}
 */
export function updateDept(data) {
  return request({
    url: `/depts`,
    method: 'put',
    data,
    timeout: 5000
  })
}

/**
 * 删除部门
 * @param {number|string} id 
 * @returns {Promise<any>}
 */
export function deleteDept(id) {
  return request({
    url: `/depts`,
    method: 'delete',
    params: { id },
    timeout: 5000
  })
}