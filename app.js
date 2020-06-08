const express = require('express')
const ejs = require('ejs')
const path = require('path')
const axios = require('axios')
const fs = require('fs')

const PORT = 3001 //设置 express 服务器端口

/**
 * 修改 axios 请求资源 baseUrl
 * 请求本地资源时，如果不设置，将请求 80 端口
 * 请求远程资源（包含完整的主机、端口、协议的资源路径）不会遇到这个问题
 * 此处设置端口和 express 服务器端口一致
 */
axios.defaults.baseURL = 'http://localhost:' + PORT 

const app = express()

app.use(express.static(__dirname))

app.set('views', path.join(__dirname, '/templates'));
app.set('view engine', 'ejs');

/**
 * Home Page & Post List Page
 */
app.get('/', async (req, res) => {
  const response = await requestMockData('https://raw.githubusercontent.com/getgridea/mock-json/master/list.json')
  res.render('index', { ...response.data })
})

/**
 * Post Page
 */
app.get('/post/:postName', async (req, res) => {
  const response = await requestMockData('https://raw.githubusercontent.com/getgridea/mock-json/master/post.json')
  res.render('post', { ...response.data })
})

/**
 * Archives Page
 */
app.get('/archives', async (req, res) => {
  const response = await requestMockData('https://raw.githubusercontent.com/getgridea/mock-json/master/archives.json')
  res.render('archives', { ...response.data })
})

/**
 * tags Page
 */
app.get('/tags', async (req, res) => {
  const response = await requestMockData('https://raw.githubusercontent.com/getgridea/mock-json/master/tags.json')
  res.render('tags', { ...response.data })
})

/**
 * tag Page
 */
app.get('/tag/:tagName', async (req, res) => {
  const response = await requestMockData('https://raw.githubusercontent.com/getgridea/mock-json/master/tag.json')
  res.render('tag', { ...response.data })
})

/**
 * 请求 mock 数据
 */
app.get('/mock/:path', async (req, res) => {
  const path = req.params.path;
  fs.readFile(path.join(__dirname, 'mock', path), (err, json) => {
    if (err) {
      res.status(404).send(err);
      return;
    }
    res.set('Content-Type', 'application/json').status(200).send(json);
  })
})

//使用 PORT 端口
app.listen(PORT)
console.log("The server is running on " + PORT)

/**
 * 请求 mock 主备数据
 */
function requestMockData(url) {
  const backupUrl = '/mock/' + url.split('/').pop()
  return axios.get(url)
    .then(result => result)
    .catch(reason => console.log(`[Main][${url}]\n${reason.message}`))
    .then(() => axios.get(backupUrl))
    .catch(reason => console.log(`[Backup][${url}]\n${reason.message}`))
}