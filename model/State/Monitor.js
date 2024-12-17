import { Config } from "../../components/index.js"
import _ from "lodash"
import si from "systeminformation"

const CHART_DATA_KEY = "yenai:state:chartData"
const DEFAULT_INTERVAL = 60 * 1000
const DEFAULT_SAVE_DATA_NUMBER = 60

export default new class monitor {
  constructor() {
    this.checkDataNum = 0
    this.network = null
    this.fsStats = null
    this.chartData = {
      network: {
        upload: [], // 上行
        download: [] // 下行
      },
      fsStats: {
        readSpeed: [], // 读
        writeSpeed: [] // 写
      },
      cpu: [], // cpu
      ram: [] // 内存
    }
    this.valueObject = {
      networkStats: "rx_sec,tx_sec,iface,rx_bytes,tx_bytes",
      currentLoad: "currentLoad",
      mem: "active",
      fsStats: "wx_sec,rx_sec"
    }

    this.config = Config.state.monitor
    this.getDataInterval = this.config.getDataInterval ?? DEFAULT_INTERVAL
    this.saveDataNumber = this.config.saveDataNumber ?? DEFAULT_SAVE_DATA_NUMBER
    this.init()
  }

  async init() {
    await this.getRedisChartData()
    if (!this.config?.open) return

    if (this.config?.statusPowerShellStart) si.powerShellStart()
    const cb = (data) => this.handleData(data)
    this.timer = si.observe(this.valueObject, this.getDataInterval, cb)
  }

  handleData(data) {
    this.checkData(data)

    const now = Date.now()

    const {
      fsStats = {},
      networkStats = [],
      mem: { active } = {},
      currentLoad: { currentLoad } = {}
    } = data

    const addDataIfNumber = (chart, value) => {
      if (_.isNumber(value)) {
        this._addData(chart, [now, value])
      }
    }

    addDataIfNumber(this.chartData.ram, active)
    addDataIfNumber(this.chartData.cpu, currentLoad)

    if (_.isNumber(fsStats?.wx_sec) && _.isNumber(fsStats?.rx_sec)) {
      this.fsStats = fsStats
      addDataIfNumber(this.chartData.fsStats.writeSpeed, fsStats.wx_sec)
      addDataIfNumber(this.chartData.fsStats.readSpeed, fsStats.rx_sec)
    }

    if (networkStats.length > 0 && _.isNumber(networkStats[0]?.tx_sec) && _.isNumber(networkStats[0]?.rx_sec)) {
      this.network = networkStats
      addDataIfNumber(this.chartData.network.upload, networkStats[0].tx_sec)
      addDataIfNumber(this.chartData.network.download, networkStats[0].rx_sec)
    }

    this.setRedisChartData()
    return data
  }

  checkData(data) {
    if (this.checkDataNum < 5) {
      if (_.isEmpty(data)) clearInterval(this.timer)
      _.forIn(data, (value, key) => {
        if (_.isEmpty(value)) {
          logger.debug(`[Yenai-Plugin-Cat][monitor]获取${key}数据失败，停止获取对应数据`)
          delete this.valueObject[key]
        }
      })
      this.checkDataNum++
    }
  }

  async getRedisChartData() {
    if (!this.config.openRedisSaveData) return false
    let data = await redis.get(CHART_DATA_KEY)
    if (data) {
      this.chartData = JSON.parse(data)
      return true
    }
    return false
  }

  async setRedisChartData() {
    if (!this.config.openRedisSaveData) return false
    try {
      await redis.set(CHART_DATA_KEY, JSON.stringify(this.chartData), { EX: 60 * 60 * 12 })
    } catch (error) {
      logger.error(error)
    }
  }

  /**
   * 向数组中添加数据，如果数组长度超过允许的最大值，则删除最早添加的数据
   * @param {Array} arr - 要添加数据的数组
   * @param {*} data - 要添加的新数据
   * @param {number} [maxLen] - 数组允许的最大长度，默认值为60
   * @returns {void}
   */
  _addData(arr, data, maxLen = this.saveDataNumber) {
    if (data === null || data === undefined) return
    // 如果数组长度超过允许的最大值，删除第一个元素
    if (arr.length >= maxLen) {
      _.pullAt(arr, 0)
    }
    // 添加新数据
    arr.push(data)
  }
}()
