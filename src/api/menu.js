import request from '@/utils/request'

export function fetchUserTree() {
  return request({
    url: '/ssm/auth/userTree',
    method: 'get'
  })
}
