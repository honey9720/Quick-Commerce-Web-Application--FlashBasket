import React from 'react'
import banner from '../assets/bannernew.jpeg'
import bannerMobile from '../assets/banner-mobile.jpg'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()

  const handleRedirectProductListpage = (categoryId, categoryName, subcategory) => {
    if (!subcategory) {
      console.warn("No subcategory found for category:", categoryName)
      return
    }
    const url = `/${valideURLConvert(categoryName)}-${categoryId}/${valideURLConvert(subcategory.name)}-${subcategory._id}`
    navigate(url)
  }

  return (
    <section className='bg-white'>
      <div className='container mx-auto'>
        <div className={`w-full h-full min-h-48 bg-blue-100 rounded ${!banner && "animate-pulse my-2"}`}>
          <img src={banner} className='w-full h-full hidden lg:block' alt='banner' />
          <img src={bannerMobile} className='w-full h-full lg:hidden' alt='banner' />
        </div>
      </div>

      <div className='container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2'>
        {loadingCategory
          ? new Array(12).fill(null).map((_, index) => (
            <div key={index + "loadingcategory"} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
              <div className='bg-blue-100 min-h-24 rounded'></div>
              <div className='bg-blue-100 h-8 rounded'></div>
            </div>
          ))
          : categoryData.map(cat => {
            // Find first subcategory for the category
            const subcategory = subCategoryData.find(sub => sub.category.some(c => c._id === cat._id))
            return (
              <div
                key={cat._id + "displayCategory"}
                className='w-full h-full cursor-pointer'
                onClick={() => handleRedirectProductListpage(cat._id, cat.name, subcategory)}
              >
                <img
                  src={cat.image}
                  className="w-24 h-24 object-contain mx-auto"
                  alt={cat.name}
                />
                <p className="text-center mt-1 font-semibold">{cat.name}</p>

              </div>
            )
          })}
      </div>
    </section>
  )
}

export default Home



