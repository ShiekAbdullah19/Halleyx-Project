import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <img className='mb-5 w-32' src={assets.trans_logo} alt="" />
        <p className='w-full md:w-2/3 text-gray-600'>Style is a way to say who you are without speaking.At Halleyx, we believe clothes should tell your story. Whether you're dressing for confidence, comfort, or creativity, we’ve got you covered. Fashion isn’t just about trends — it’s about being unapologetically you. Wear your vibe. Own your look. Make a statement.

</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>+91 9342891618</li>
            <li> Contact@Halleyx.com</li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>© 2023 Halleyx Inc. Copyright and rights reserved</p>
      </div>

    </div>
  )
}

export default Footer
