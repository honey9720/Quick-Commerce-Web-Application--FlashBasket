import { Router } from 'express'
import { 
  registerController, 
  loginController, 
  logoutController, 
  refreshTokenController, 
  resetPassword, 
  updateUserDetails, 
  userDetails, 
  forgotPasswordController, 
  verifyEmailController, 
  verifyForgotPasswordOtp, 
  uploadAvatar // we'll implement this next
} from '../controllers/user.controller.js'

import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = Router()

userRouter.post('/register', registerController)
userRouter.post('/verify-email', verifyEmailController)
userRouter.post('/login', loginController)
userRouter.get('/logout', auth, logoutController)
// user.route.js
userRouter.put('/upload-avatar', auth, upload.single('avatar'), uploadAvatar)

userRouter.put('/update-user', auth, updateUserDetails)
userRouter.put('/forgot-password', forgotPasswordController)
userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp)
userRouter.put('/reset-password', resetPassword)
userRouter.post('/refresh-token', refreshTokenController)
userRouter.get('/user-details', auth, userDetails)

export default userRouter
