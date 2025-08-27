// import multer from 'multer'

// const storage = multer.memoryStorage()

// const upload = multer({ storage : storage })

// export default upload
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Create upload folder if it doesn't exist
const uploadDir = './uploads/avatars'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName)
  }
})

const upload = multer({ storage })

export default upload
