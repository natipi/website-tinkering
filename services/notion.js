const dotenv = require('dotenv').config()

const {Client} = require('@notionhq/client')

// Init client
const notion = new Client({
    auth: process.env.NOTION_TOKEN
})

const database_id = process.env.NOTION_DATABASE_ID

exports.getPosts = async function getPosts() {
    const payload = {
        path: `databases/${database_id}/query`,
        method: 'POST'
    }

    const {results} = await notion.request(payload)

    const posts = results.map(page => {
        const tags = page.properties.Tags.multi_select.map(tag => {
            return tag.name
        })
        console.log(page.url);
        postUrl = page.url.split("-")
        postID = postUrl[postUrl.length - 1]
        return {
            title: page.properties.Name.title[0].text.content,
            tags: tags,
            image: page.properties['Display image'].files[0].file.url,
            date: page.properties.Posted.created_time,
            id: postID,
        }
    })
    return posts
} 

exports.getPostContent = async function getPostContent (pageID, cursor) {
    let payload = {
        path: `blocks/${pageID}/children`, 
        method: 'GET'
    }
    if(cursor != "undefined") {
        payload.path += `?start_cursor=${cursor}`
    }

    const return_query = await notion.request(payload);
    console.log(`getPostContent is running with input ${pageID}`)
    return return_query;
}

exports.getSimpleQuery = async function getSimpleQuery (queryString, queryMethod) {
    console.log("Adding TOC")
    let payload = {
        path: queryString,
        method: queryMethod
    }
    const return_query = await notion.request(payload);
    return return_query
}

// module.exports = {
//     getPosts: getPosts(),
//     getPostContent: getPostContent(),
// }
