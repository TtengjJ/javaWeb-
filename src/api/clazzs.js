import request from '@/utils/request'

/**
 * 获取班级列表（条件分页查询）
 */
export function getClazzList(params) {
  return request({
    url: '/clazzs',
    method: 'get',
    params,
    timeout: 5000
  })
}

/**
 * 新增班级
 */
export function addClazz(data) {
  return request({
    url: '/clazzs',
    method: 'post',
    data,
    timeout: 5000
  })
}

/**
 * 修改班级
 */
export function updateClazz(data) {
  return request({
    url: '/clazzs',
    method: 'put',
    data,
    timeout: 5000
  })
}

/**
 * 删除班级
 */
export function deleteClazz(id) {
  return request({
    url: `/clazzs/${id}`,
    method: 'delete',
    timeout: 5000
  })
}

/**
 * 根据ID查询班级信息
 */
export function getClazzById(id) {
  return request({
    url: `/clazzs/${id}`,
    method: 'get',
    timeout: 5000
  })
}