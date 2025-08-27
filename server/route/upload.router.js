import { Router } from 'express'
import auth from '../middleware/auth.js'
import uploadImageController from '../controllers/uploadImage.controller.js'
import upload from '../middleware/multer.js'

const uploadRouter = Router()

uploadRouter.post(
    "/upload",
    upload.single("image"),       // temporarily remove auth
    uploadImageController
)



export default uploadRouter