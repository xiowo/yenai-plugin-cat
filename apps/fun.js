

export class Fun extends plugin {
  constructor(e) {
    super({
      name: "椰奶娱乐",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#支付宝到账",
          fnc: "ZFB"
        },
        {
          reg: "github.com/[a-zA-Z0-9-]{1,39}/[a-zA-Z0-9_-]{1,100}",
          fnc: "GH"
        }
      ]
    })
  }

  /**
   * 支付宝语音
   * @param e
   */
  async ZFB(e) {
    let amount = parseFloat(e.msg.replace(/#|支付宝到账|元|圆/g, "").trim())

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return e.reply("你觉得这河里吗！！", true)

    if (!(amount >= 0.01 && amount <= 999999999999.99)) {
      return e.reply("数字大小超出限制，支持范围为0.01~999999999999.99")
    }
    e.reply([segment.record(`https://mm.cqu.cc/share/zhifubaodaozhang/mp3/${amount}.mp3`)])
  }

  /**
   * Github略缩图
   * @param e
   */
  async GH(e) {
    const api = "https://opengraph.githubassets.com"

    let reg = /github.com\/[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_-]{1,100}(?:\/(?:pull|issues)\/\d+)?/
    const isMatched = e.msg.match(reg)

    const id = "Yenai"
    if (isMatched) {
      // const res = isMatched[0].split('/')
      let path = isMatched[0].replace("github.com/", "")
      e.reply(segment.image(`${api}/${id}/${path}`))
      // const [user, repo] = [res[1], res[2].split('#')[0]]
      // e.reply(segment.image(`${api}/${id}/${user}/${repo}`))
    }
  }
}
