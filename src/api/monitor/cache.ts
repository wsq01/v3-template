import request from '@/utils/request'

// 查询缓存详细
export function getCache() {
  return request({ url: '/monitor/cache' })
}
// 查询缓存名称列表
export function listCacheName() {
  return request({ url: '/monitor/cache/getNames' })
}
// 查询缓存键名列表
export function listCacheKey(cacheName: any) {
  return request({ url: '/monitor/cache/getKeys/' + cacheName })
}
// 查询缓存内容
export function getCacheValue(cacheName: any, cacheKey: any) {
  return request({ url: '/monitor/cache/getValue/' + cacheName + '/' + cacheKey })
}
// 清理指定名称缓存
export function clearCacheName(cacheName: any) {
  return request({ url: '/monitor/cache/clearCacheName/' + cacheName, method: 'delete' })
}
// 清理指定键名缓存
export function clearCacheKey(cacheKey: any) {
  return request({ url: '/monitor/cache/clearCacheKey/' + cacheKey, method: 'delete' })
}
// 清理全部缓存
export function clearCacheAll() {
  return request({ url: '/monitor/cache/clearCacheAll', method: 'delete' })
}
