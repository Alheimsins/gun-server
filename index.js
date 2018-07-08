if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Gun = require('gun')
const { tmpdir } = require('os')
const port = process.env.PORT || 8000
const { createServer } = require('http')
const notFound = res => { res.writeHead(404, {'Content-Type': 'text/plain'}); res.write('404 Not Found\n'); res.end() }

const storeConfig = () => {
  const useS3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET
  if (useS3) {
    console.log('> s3 storage configured')
    console.log(`> bucket ${process.env.AWS_S3_BUCKET}`)
    return {
      s3: {
        key: process.env.AWS_ACCESS_KEY_ID,
        secret: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: process.env.AWS_S3_BUCKET
      }
    }
  } else {
    const file = `${tmpdir()}/data.json`
    console.log('> using local filestorage')
    console.log(`> data filePath: ${file}`)
    return { file }
  }
}

const server = createServer((req, res) => Gun.serve(req, res) || notFound(res))

const gun = Gun({
  web: server,
  super: true,
  ...storeConfig()
})

// Sync everything
gun.on('out', {get: {'#': {'*': ''}}})

server.listen(port)
console.log(`> GUN server started on port ${port}`)
