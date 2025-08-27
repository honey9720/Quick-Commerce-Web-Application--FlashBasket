// import Axios from '../utils/Axios'
// import SummaryApi from '../common/SummaryApi'

// const uploadImage = async (image) => {
//   try {
//     const formData = new FormData()
//     formData.append("image", image)  // ✅ must match multer.single("image")


//     const response = await Axios({
//       ...SummaryApi.uploadImage,
//       data: formData
//     })


//     // ✅ return only response.data
//     return response.data
//   } catch (error) {
//     throw error.response?.data || error
//   }
// }

// export default uploadImage

import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const uploadImage = async (image) => {
  try {
    const formData = new FormData()
    formData.append("image", image)

    const token = localStorage.getItem("accessToken") // or however you store it

    const response = await Axios({
  ...SummaryApi.uploadImage,
  data: formData,
  headers: {
    Authorization: `Bearer ${token}`, 
  },
})

    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export default uploadImage
