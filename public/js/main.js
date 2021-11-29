// Front end JS to fetch from the API

const postsEl = document.querySelector('#posts')
const recentPostsEl = document.querySelector("#recent-posts")
const tagEl = document.querySelector('#tags')
const postContentEl = document.querySelector('#post-content')
const postTitleEl = document.querySelector('#post-title')
const postTocEl = document.querySelector('#toc')
const relatedPostEl = document.querySelector('#related-posts')
const loaderBackgroundEl = document.querySelector('#loader-background')
const loaderIconEl = document.querySelector('#loader-icon')

// get posts from backend
const getPostsFromBackend = async () => {
    const res = await fetch('http://localhost:5000/posts')
    const data = await res.json()
    return data
}


// add posts to DOM
const addPostsToDom = async () => {
    const posts = await getPostsFromBackend() 

    var taglist = {}

    posts.forEach(post => {
        const tags = post.tags.map(tag =>{
            if (!(tag in taglist)) {
                taglist[tag] = 0
            }
            return `<div class="post-card-tag">${tag}</div>` 
        })
        const div = document.createElement('div')
        div.className = 'post-card'
        div.id = post.title
        div.innerHTML = `
            <a href="/blog-post/${post.id}">
            <div class="post-card-thumb-container"><div style="background-image:url('${post.image}')" class="post-card-thumb"></div></div>
            <div class="post-card-content">
                <div class="post-card-tags-container">${tags.join('')}</div>
                <h3 class='post-card-title'>${post.title}</h3>
            </div>
            </a>
        `
        // console.log(div.innerHTML)
        postsEl.appendChild(div)
    });

    Object.keys(taglist).forEach(tag => {
        const div = document.createElement('div')
        div.setAttribute('onclick', 'filterFunction(this)')
        div.className = 'taglist-tag'
        div.id = tag
        div.innerHTML = tag 
        tagEl.appendChild(div) 
    })
}

const addRecentPostsToDom = async () => {
    const posts = await getPostsFromBackend();
    i = 0;
    posts.forEach(post => {
        if(i < 2) {
            console.log("if")
            const tags = post.tags.map(tag =>{
                return `<div class="post-card-tag">${tag}</div>` 
            })
            const div = document.createElement('div')
            div.className = 'post-card'
            div.id = post.title
            div.innerHTML = `
                <a href="/blog-post/${post.title}/${post.id}">
                <div class="post-card-thumb-container"><div style="background-image:url('${post.image}')" class="post-card-thumb"></div></div>
                <div class="break"></div>
                <div class="post-card-content">
                <h3 class='post-card-title'>${post.title}</h3>
                <div class="post-card-tags-container">${tags.join('')}</div>
                </div>
                </a>
            `
            
            recentPostsEl.appendChild(div)
            i ++;
        }
    });
}

const addRelatedPostsToDom = async (currentPostTags, currentPostId) => {
    const posts = await getPostsFromBackend();
    i = 0;
    posts.forEach(post => {
        if(i < 2) {
            if (currentPostTags.some(r => post.tags.includes(r)) && currentPostId != post.id) {
                console.log("Found posts with tags in common!")
                console.log(post.title)
                const tags = post.tags.map(tag =>{
                    return `<div class="post-card-tag">${tag}</div>` 
                })
                const div = document.createElement('div')
                div.className = 'post-card'
                div.id = post.title
                div.innerHTML = `
                    <a href="/blog-post/${post.title}/${post.id}" style="">
                    <div class="post-card-thumb-container"><div style="background-image:url('${post.image}')" class="post-card-thumb"></div></div>
                    <div class="break"></div>
                    <div class="post-card-content">
                    <h3 class='post-card-title'>${post.title}</h3>
                    <div class="post-card-tags-container">${tags.join('')}</div>
                    </div>
                    </a>
                `
                
                relatedPostEl.appendChild(div)
                i ++;
            }
        }
    });
}

async function filterFunction(tag) {
    const posts = await getPostsFromBackend() 
    if (tag.classList.contains('active')) {
        tag.classList.remove('active')
        if (document.querySelectorAll('.taglist-tag .active').length == 1) {
            document.querySelectorAll('.taglist-tag').forEach(el => {
                tag.classList.remove('inactive')
            })
        }
        posts.forEach(post => {
            posts.forEach(post => { 
                if (!(post.tags.includes(tag.id))) {
                    document.getElementById(post.title).style.display = ''
                }
            })
        })
    }
    else {
        tag.classList.remove('inactive')
        tag.classList.add('active')
        document.querySelectorAll( '.taglist-tag:not(.active)' ).forEach(el => {
            el.classList.add('inactive')
        })
        posts.forEach(post => { 
            if (!(post.tags.includes(tag.id))) {
                document.getElementById(post.title).style.display = 'none'
            }
        })
    }
}

// input: 
// "annotations": {
//     "bold": false,
//     "italic": false,
//     "strikethrough": false,
//     "underline": false,
//     "code": false,
//     "color": "yellow"
// },
// output: css for appropriate text decoration
function computeStyle(annotations) {
    var cssOut = "";
    if(annotations.bold) {
        cssOut += `font-weight: bold;`
    }
    if(annotations.italic) {
        cssOut += `font-style: italic;`
    }
    // TO-DO: add strikethrough, underline, code
    cssOut += `color: var(--${annotations.color}-text-color);`
    return cssOut
}

function formatTextBlockWithInlineEquations(textjson) {
    the_html = ''
    textjson.forEach(textPortion => {
        if (textPortion.type == "text") {
            // TO-DO: add href
            the_html += `
                <span style="${computeStyle(textPortion.annotations)}">${textPortion.text.content}</span>
            `
        }
        if (textPortion.type == "equation") {
            the_html += `
                <span class="katex-eqn" style="${computeStyle(textPortion.annotations)}">\\( ${textPortion.equation.expression} \\)</span>
            `
        }
    })
    return the_html
}

// TO-DO: headings and toc
const addPostContentInnerHtml = function(postcontent) {
    let first_nonempty_passed = false
    postcontent.forEach(block => {
        const div = document.createElement('div')
        
        if (block.type == "paragraph") {
            div.className = 'text-block'
            eqnctr = 0
            block.paragraph.text.forEach(textPortion => {
                if (textPortion.type == "text") {
                    // TO-DO: add href
                    if (textPortion.text.content == "Table of Contents") {
                        postTocEl.innerHTML += `
                        <div style="${computeStyle(textPortion.annotations)} margin-bottom:10px;">${textPortion.text.content}</div>
                        `
                    }
                    else {
                        if (textPortion.text.content.length > 0) {
                            first_nonempty_passed = true
                        }
                        if (first_nonempty_passed) {
                            div.innerHTML += `
                                <span style="${computeStyle(textPortion.annotations)}">${textPortion.text.content}</span>
                            `
                        }
                    }
                }
                if (textPortion.type == "equation") {
                    first_nonempty_passed = true
                    div.innerHTML += `
                        <span id="${block.id}-eqn-${eqnctr}" class="katex-eqn" style="${computeStyle(textPortion.annotations)}">\\( ${textPortion.equation.expression} \\)</span>
                    `
                }
            })
        }
        if (block.type == "equation") {
            first_nonempty_passed = true
            div.className = 'katex-block-eqn katex-eqn'
            div.innerHTML += `
                \\(${block.equation.expression}\\)
            `
        }
        if (block.type == "image") {
            first_nonempty_passed = true 
            console.log(block.image.file.url)
            div.innerHTML = `<img src="${block.image.file.url}" style="width:100%" style=""><br><br>`
        }
        if (block.type == "heading_1") {
            first_nonempty_passed = true
            var divContent = `<h1 style="padding-top:40px;font-size:36px;padding-bottom:0px;margin-bottom:15px;">`
            block.heading_1.text.forEach(textPortion => {
                if (textPortion.type == "text") {
                    // TO-DO: add href
                    divContent += `
                        <span style="${computeStyle(textPortion.annotations)}">${textPortion.text.content}</span>
                    `
                }
                if (textPortion.type == "equation") {
                    divContent += `
                        <span id="${block.id}-eqn-${eqnctr}" class="katex-eqn" style="${computeStyle(textPortion.annotations)}">\\( ${textPortion.equation.expression} \\)</span>
                    `
                }
            })
            divContent += `</h1>`
            div.innerHTML += divContent
        }
        if (block.type == "heading_2") {
            first_nonempty_passed = true
            var divContent = `<h2 style="padding-top:20px;padding-bottom:0px;margin-bottom:10px;">`
            block.heading_2.text.forEach(textPortion => {
                if (textPortion.type == "text") {
                    // TO-DO: add href
                    divContent += `
                        <span style="${computeStyle(textPortion.annotations)}">${textPortion.text.content}</span>
                    `
                }
                if (textPortion.type == "equation") {
                    divContent += `
                        <span id="${block.id}-eqn-${eqnctr}" class="katex-eqn" style="${computeStyle(textPortion.annotations)}">\\( ${textPortion.equation.expression} \\)</span>
                    `
                }
            })
        }
        if (block.type == "callout") {
            first_nonempty_passed = true
            // TO-DO: reformat all equations so that they get picked up by the API
            div.className = `callout`
            eqnctr = 0
            block.callout.text.forEach(textPortion => {
                if (textPortion.type == "text") {
                    // TO-DO: add href
                    div.innerHTML += `
                        <span style="${computeStyle(textPortion.annotations)}">${textPortion.text.content}</span>
                    `
                }
                if (textPortion.type == "equation") {
                    if (textPortion.equation.expression.replace('text','').replace('\\','').replace('mathcal','').replace('mathbb','').replace('\\perp', 'p').replace('gamma', '').length > 10) {
                        div.innerHTML += `
                        <div id="${block.id}-eqn-${eqnctr}" class="katex-block-eqn katex-eqn" style="${computeStyle(textPortion.annotations)}">\\( ${textPortion.equation.expression} \\)</div>
                        `
                    }
                    else {
                        div.innerHTML += `
                        <span id="${block.id}-eqn-${eqnctr}" class="katex-eqn" style="${computeStyle(textPortion.annotations)}">\\( ${textPortion.equation.expression} \\)</span>
                        `
                    }                    
                }
            })
        }
        if (first_nonempty_passed) {
            postContentEl.appendChild(div)
        }
    })

    eqns = document.querySelectorAll(".katex-eqn")
    eqns.forEach(equation => {
        // console.log(equation)
        renderMathInElement(equation, {});
    })
}


function addTocToDom() {
    const sections = document.querySelectorAll('h1')

    skip = true 
    sections.forEach(sectionTitle => {
        if (skip) {
            skip = false
        }
        else {
            postTocEl.innerHTML += `
                <div class="text-block-link">${sectionTitle.innerHTML}</div>
            `
        }
    })
}

const addPostContentToDom = async(postUrl) => {
    console.log(`addPostContentToDom is running from ${postUrl}`)
    u = postUrl.split("/")
    postID = u[u.length - 1]
    postTitle = u[u.length - 2]

    let titleQuery = await fetch(`http://localhost:5000/simple-query/pages%20${postID}/GET`)
    let titleQueryJson = await titleQuery.json()
    // console.log(titleQueryJson)
    let titleHtml = formatTextBlockWithInlineEquations(titleQueryJson.properties.Name.title)
    console.log(titleHtml)
    postTitleEl.innerHTML += titleHtml
    // postTitle.replaceAll('%20', ' ')

    taglist = []
    titleQueryJson.properties.Tags.multi_select.forEach(tag => {
        const div = document.createElement('div')
        div.className = 'taglist-tag'
        div.id = tag.name
        div.innerHTML = tag.name
        tagEl.appendChild(div) 
        taglist.push(tag.name)
    })

    let res = await fetch(`http://localhost:5000/blog-post-content/${postID}/undefined`)
    let postcontent = await res.json()
    // console.log(postcontent)
    addPostContentInnerHtml(postcontent.results)

    while (postcontent.has_more) {
        console.log("post content has more")
        console.log(postcontent.next_cursor)
        res = await fetch(`http://localhost:5000/blog-post-content/${postID}/${postcontent.next_cursor}`)
        postcontent = await res.json()
        console.log(postcontent.results)
        addPostContentInnerHtml(postcontent.results)
    }
    
    addTocToDom()
    addRelatedPostsToDom(taglist, postID)

    loaderIconEl.style.opacity = 0
    loaderBackgroundEl.classList.add('left-slide-pane')
    // https://stackoverflow.com/questions/39198083/remove-hide-div-from-dom-after-animation-completes-using-css
    $('.left-slide-pane').bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function(e) { $(this).remove(); });
}

const addPostTitleToDom = async(postUrl) => {
    u = postUrl.split("/")
    postID = u[u.length - 1]
    posts = getPostsFromBackend()
}

// console.log("main.js is running")
// addPostContentToDom();

// addPostsToDom()
// addRecentPostsToDom()


// let p1 = window.pageYOffset
// const looper = () => {
//     console.log('looper')
//     const p2 = window.pageYOffset
//     const diff = p2 - p1
//     const speed = -1*diff * 0.3
//     $('.post-card-thumb-container').css({
//         "transform": `skewY(${speed}deg)`, 
//         "-webkit-transform": `skewY(${speed}deg)`
//     })
//     p1 = p2 
//     requestAnimationFrame(looper)
// }
// looper()
// document.addEventListener('scroll', function ()  {
//     looper()
//     console.log('looper')
// })
