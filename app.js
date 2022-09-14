const url = require('url');
const http = require('http');
const fs = require('fs');
const HttpProxyAgent = require('http-proxy-agent');
const jsdom = require("jsdom");
const { log } = require('console');
const { JSDOM } = jsdom;

// HTTP/HTTPS proxy to connect to
let proxy = process.env.http_proxy || 'http://localhost:8118';
console.log('using proxy server %j', proxy);


const fetchPages = (position) => {

    // HTTP endpoint for the proxy to connect to
    let endpoint = process.argv[2] || 'http://paste2vljvhmwq5zy33re2hzu4fisgqsohufgbljqomib2brzx3q4mid.onion/lists/' + position;
    console.log('attempting to GET %j', endpoint);
    let opts = url.parse(endpoint);

    // create an instance of the `HttpProxyAgent` class with the proxy server information
    let agent = new HttpProxyAgent(proxy);
    opts.agent = agent;

    return new Promise((resolve, reject) => {
        let result = http.get(opts, (res) => {
            let html = '';
            res.on('data', function (chunk) {
                html += ("" + chunk)
            });
            res.on('error', error => {
                console.error(error);
                reject(error);
            });
            res.on("end", d => {
                resolve(html);
            });
        });
        result.end();
    })
}


async function main() {
    let position = 0;
    let posts = [];
    while (true) {
        let htmlString = await fetchPages(position);
        let dom = new JSDOM(htmlString);
        let trArray = Array.from(dom.window.document.querySelectorAll('tr'));
        if (trArray.length > 0) {
            let pagePosts = trArray.map(element => {
                const children = element.children;
                const postObject = {
                    title: children[0].textContent || null,
                    name: children[1].textContent || null,
                    when: children[3].textContent || null
                };
                return postObject;
            });
            posts = posts.concat(pagePosts);
            position += 50;
        }
        else break;
    }
    console.log(posts.length);
}

main();