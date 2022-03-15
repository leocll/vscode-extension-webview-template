const os = require('os');
const path = os.platform() === 'win32' ? require('path').win32 : require('path');
const fs = require('fs');
const htmlparser2 = require('htmlparser2');

const htmlPath = path.resolve(__dirname, '..', 'web', 'dist', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

const doc = htmlparser2.parseDocument(html);
const html1 = htmlparser2.DomUtils.getInnerHTML(doc);
const opre = e1 => {
    console.log(`${e1.type} => ${e1.name}`);
    if (e1.type !== 'tag' && e1.type !== 'script') {
        return
    }
    /**@type {import('domhandler').Element} */
    const e = e1;
    if (e.name === 'meta') {

    } else if (e.name === 'link') {
        if (e.attribs.rel === 'stylesheet') {
            e.attribs.href = `leocll://${e.attribs.href}`;
        }
    } else if (e.name === 'script') {
        if (e.attribs.type === 'text/javascript') {
            e.attribs.src = `leocll://${e.attribs.src}`;
        }
    }
    return;
}
const tags = htmlparser2.DomUtils.filter(e => { opre(e); return false; }, doc, true);
// const tags = htmlparser2.DomUtils.filter(e => { opre(e); return false; }, doc, true);
const html2 = htmlparser2.DomUtils.getInnerHTML(doc);
console.log(html1);
console.log(html2);