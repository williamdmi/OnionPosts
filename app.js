const url = require('url');
const http = require('http');
const fs = require('fs');
const HttpProxyAgent = require('http-proxy-agent');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


// HTTP/HTTPS proxy to connect to
let proxy = process.env.http_proxy || 'http://localhost:8118';
console.log('using proxy server %j', proxy);

// HTTP endpoint for the proxy to connect to
let endpoint = process.argv[2] || 'http://paste2vljvhmwq5zy33re2hzu4fisgqsohufgbljqomib2brzx3q4mid.onion/lists';
console.log('attempting to GET %j', endpoint);
let opts = url.parse(endpoint);

// create an instance of the `HttpProxyAgent` class with the proxy server information
let agent = new HttpProxyAgent(proxy);
opts.agent = agent;

const fetchPages = () => {
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
    let htmlString = await fetchPages();
    fs.writeFile('myFile', htmlString, e => console.log(e))
    let dom = new JSDOM(htmlString);
    let trArray = dom.window.document.querySelectorAll('tr');
    trArray.forEach(element => 
        console.log(element.innerHTML));
}

main();