import fs from 'node:fs'
import YAML from 'yaml'
import axios from 'axios'
const _path = process.cwd()

logger.info('-------------------------------------------')
logger.info('WeLM AI对话插件正在测试API是否可用并加载JS中~')
logger.info('-------------------------------------------')
const settings = await YAML.parse(fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`,'utf8'));
let res = fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`,"utf8")
let token = settings.API_token
let str = `${res}`
var reg = new RegExp(`"(.*?)"`); 
var a = str.replace(reg,`"${token}"`);
fs.writeFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`,a,"utf8");
let API_token = settings.API_token
axios({
    method: 'post',
    url: 'https://welm.weixin.qq.com/v1/completions',
    headers: {
      "Content-Type": "application/json",
      "Authorization": API_token
    },
    data: {
      "prompt": "测试",
      "model": "xl",
      "max_tokens": "64",
      "temperature": "0.85",
      "top_p": "0.95",
      "top_k": "50",
      "n": "2",
      "stop": "\n",
    }
  })
  .then(function (response) {
  return true
  })
  .catch(function (error) {
    logger.error('Token不可用或者无法访问WeLM，请检查Token或网络, 如果未填写Token请使用指令: #填写token xxx进行填写')
    return false
  });

const files = fs.readdirSync(`${_path}/plugins/WeLM-plugin/apps`).filter(file => file.endsWith('.js'))

let ret = []

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status !== 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }
