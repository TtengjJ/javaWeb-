import request from '@/utils/request'

/**
 * 获取员工列表
 * @param {Object} params 查询参数 {name, gender, begin, end, page, pageSize}
 * @returns {Promise<{total: number, rows: Array}>}
 */
export function getEmpList(params) {
  return request({
    url: '/emps',
    method: 'get',
    params,
    timeout: 5000
  })
}

/**
 * 新增员工
 * @param {Object} data 员工信息
 * @returns {Promise<any>}
 */
export function addEmp(data) {
  return request({
    url: '/emps',
    method: 'post',
    data,
    timeout: 5000
  })
}

/**
 * 批量删除员工
 * @param {Array<number>} ids 员工ID数组
 * @returns {Promise<any>}
 */
export function batchDeleteEmp(ids) {
  return request({
    url: '/emps',
    method: 'delete',
    params: {
      ids: Array.isArray(ids) ? ids.join(',') : ids
    },
    timeout: 5000
  })
}

// 获取员工详情
export const getEmpDetail = (id) => {
  return request({
    url: `/emps/${id}`,
    method: 'get'
  })
}

// 更新员工信息
export const updateEmp = (data) => {
  return request({
    url: `/emps`,
    method: 'put',
    data
  })
}

/**
 * 员工性别统计
 * @returns {Promise<Array<{name: string, value: number}>>}
 */
export function getEmpGenderData() {
  return request({
    url: '/report/empGenderData',
    method: 'get'
  })
}

/**
 * 员工职位人数统计
 * @returns {Promise<{jobList: string[], dataList: number[]}>}
 */
export function getEmpJobData() {
  return request({
    url: '/report/empJobData',
    method: 'get'
  })
}