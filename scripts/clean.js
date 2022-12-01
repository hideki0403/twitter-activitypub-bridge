const fs = require('fs')
const path = require('path')

fs.rmdirSync(path.resolve(__dirname, '../build'), { recursive: true })