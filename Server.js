const Http = require('http')

const server = Http.createServer((rep, res) => {
    res.write('hello')
    res.end()
})