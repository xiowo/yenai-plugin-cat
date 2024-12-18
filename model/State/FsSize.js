import _ from "lodash"
import { getFileSize } from "./utils.js"
import Monitor from "./Monitor.js"
import si from "systeminformation"

/**
 *  获取硬盘
 */
export async function getFsSize() {
  // 去重
  let HardDisk = _.uniqWith(await si.fsSize(),
    (a, b) =>
      a.used === b.used && a.size === b.size && a.use === b.use && a.available === b.available
  )
    .filter(item => item.size && item.used && item.available && item.use)
    // 为空返回false
  if (_.isEmpty(HardDisk)) return false
  // 数值转换
  return HardDisk.map(item => {
    item.used = getFileSize(item.used)
    item.size = getFileSize(item.size)
    item.use = Math.round(item.use)
    item.color = setColor(item.use)
    return item
  })
}
function setColor(use) {
  if (use >= 90) {
    return "var(--high-color)"
  } else if (use >= 70) {
    return "var(--medium-color)"
  }
  return "var(--low-color)"
}

/**
 * 获取磁盘读写速度
 * @returns {object | boolean} 返回一个对象，包含读速度（rx_sec）和写速度（wx_sec），如果无法获取则返回false。
 */
export function getDiskSpeed() {
  let disksIO = Monitor.disksIO
  if (!disksIO || disksIO.rIO_sec == null || disksIO.wIO_sec == null) {
    return false
  }
  return {
    rIO_sec: getFileSize(disksIO.rIO_sec, { showByte: false, showSuffix: false }),
    wIO_sec: getFileSize(disksIO.wIO_sec, { showByte: false, showSuffix: false })
  }
}
