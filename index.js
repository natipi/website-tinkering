// import getPosts from "/services/notion.js"
const express = require('express')
const getPosts = require('./services/notion').getPosts
const getPostContent = require('./services/notion').getPostContent
const getSimpleQuery = require('./services/notion').getSimpleQuery
const path = require('path');
const PORT = process.env.PORT || 5000

const app = express()
app.use(express.static('public'))

app.get('/posts', async (req, res) => {
    const posts = await getPosts()
    res.json(posts)
})

app.get('', async (req, res) => {
    res.html('./public/index.html')
    // res.html('./public/home.html')
})

app.get('/js/main.js', async (req, res) => {
    console.log(`retrieving /js/main.js`)
    res.sendFile(path.join(__dirname + '/public/js/main.js'))
})

app.get('/blog-post/*', async (req, res) => {
    // console.log("im here")
    // console.log(path.join(__dirname, '/public/blog-post.html'))
    res.sendFile(path.join(__dirname, '/public/blog-post.html'))
})

app.get('/blog-post-content/:id/:cursor', async (req, res) => {
    console.log(`http request to /blog-post-content/${req.params.id}`)
    const postContent = await getPostContent(req.params.id, req.params.cursor)
    res.json(postContent)
})

app.get('/simple-query/:queryString/:queryMethod', async (req, res) => {
    let qs = req.params.queryString.replace(' ', `/`)
    const simpleQuery = await getSimpleQuery(qs, req.params.queryMethod)
    // console.log(simpleQuery.properties.Name.title)
    res.json(simpleQuery)
})

app.listen(PORT, console.log(`Server started on ${PORT}.`))