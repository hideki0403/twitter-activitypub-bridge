const fs = require('fs')
const path = require('path')
const target = path.resolve(__dirname, '../build')

if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true })
}