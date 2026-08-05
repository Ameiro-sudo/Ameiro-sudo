const fs = require('fs')
const path = require('path')

const FALLBACK = [
  '雪落无声,码字有声',
  '今天也在雪地里码代码',
  '咖啡因浓度:高',
  '夜猫子出没中',
  '雪山服务器运行中',
  '保持好奇,保持愚蠢',
  '先喝口水再干活',
  '雪下了一整天',
  '正在重启智商...',
  '目标是:不咕',
  '雨色超管,在线摸鱼',
  '波奇和吉他,代码和雪花',
  '写代码如踩雪,步步留痕',
  'Ameiro 的雨,落在代码里'
]

async function fetchQuote() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch('https://v1.hitokoto.cn/', { signal: controller.signal })
    const data = await res.json()
    if (data && data.hitokoto) {
      return data.from ? data.hitokoto + ' ——' + data.from : data.hitokoto
    }
  } catch (e) {
    console.log('API 失败,使用本地词库:', e.message)
  } finally {
    clearTimeout(timer)
  }
  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)]
}

const readmePath = path.join(process.cwd(), 'README.md')
let readme = fs.readFileSync(readmePath, 'utf8')

if (!readme.includes('<!--QUOTE_START-->')) {
  console.log('README 缺少 QUOTE 区块,跳过')
  process.exit(0)
}

fetchQuote().then((quote) => {
  const oldBlock = readme.match(/<!--QUOTE_START-->[\s\S]*?<!--QUOTE_END-->/)
  if (oldBlock && oldBlock[0].includes(quote)) {
    console.log('一言与上次相同,跳过提交')
    process.exit(0)
  }
  readme = readme.replace(
    /<!--QUOTE_START-->[\s\S]*?<!--QUOTE_END-->/,
    '<!--QUOTE_START-->\n> ' + quote + '\n<!--QUOTE_END-->'
  )
  fs.writeFileSync(readmePath, readme, 'utf8')
  console.log('一言已更新:', quote)
}).catch((e) => { console.error('更新失败:', e); process.exit(1) })
