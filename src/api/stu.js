import request from '@/utils/request'

/**
 * 获取学员列表
 */
export function getStuList(params) {
  return request({
    url: '/students',
    method: 'get',
    params,
    timeout: 5000
  })
}

/**
 * 删除学员（支持批量）
 */
export function deleteStu(ids) {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids
  return request({
    url: `/students/${idStr}`,
    method: 'delete'
  })
}

/**
 * 添加学员
 */
export function addStu(data) {
  return request({
    url: '/students',
    method: 'post',
    data
  })
}

/**
 * 根据ID查询学员信息
 * @param {number} id
 */
export function getStuDetail(id) {
  return request({
    url: `/students/${id}`,
    method: 'get'
  })
}

/**
 * 修改学员信息
 * @param {Object} data
 */
export function updateStu(data) {
  return request({
    url: '/students',
    method: 'put',
    data
  })
}

/**
 * 违纪处理
 * @param {number} id 学员ID
 * @param {number} score 扣除分数
 */
export function violationStu(id, score) {
  return request({
    url: `/students/violation/${id}/${score}`,
    method: 'put'
  })
}

/**
 * 学员学历统计
 * @returns {Promise<Array<{name: string, value: number}>>}
 */
export function getStudentDegreeData() {
  return request({
    url: '/report/studentDegreeData',
    method: 'get'
  })
}

/**
 * 班级人数统计
 * @returns {Promise<{clazzList: string[], dataList: number[]}>}
 */
export function getStudentCountData() {
  return request({
    url: '/report/studentCountData',
    method: 'get'
  })
}