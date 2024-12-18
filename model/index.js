import puppeteer from "../lib/puppeteer/puppeteer.js"
import uploadRecord from "../tools/uploadRecord.js"
import common from "../lib/common/common.js"
import GroupAdmin from "./GroupAdmin.js"
import funApi from "./api/funApi.js"
import QQApi from "./api/QQApi.js"
import GroupBannedWords from "./GroupBannedWords.js"
import memes from "./memes.js"
// 导出模块
export {
  puppeteer,
  common,
  uploadRecord,
  GroupAdmin,
  QQApi,
  GroupBannedWords,
  funApi,
  memes
}
