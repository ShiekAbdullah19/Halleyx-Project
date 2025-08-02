import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, cartItems, products, user } = useContext(ShopContext);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');

    const handlePlaceOrder = async () => {
        if (!user || !user.token) {
            toast.error('Please login to place an order');
            navigate('/login');
            return;
        }

        if (!firstName || !lastName || !email || !street || !city || !state || !zipcode || !country || !phone) {
            toast.error('Please fill all delivery information fields');
            return;
        }

        // Prepare order items from cartItems and products
        const items = [];
        for (const itemId in cartItems) {
            for (const size in cartItems[itemId]) {
                const quantity = cartItems[itemId][size];
                if (quantity > 0) {
                    const product = products.find(p => p._id === itemId);
                    if (product) {
                        items.push({
                            productId: itemId,
                            name: product.name,
                            price: product.price,
                            quantity,
                            size,
                            image: product.image
                        });
                    }
                }
            }
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        const amount = items.reduce((total, item) => total + item.price * item.quantity, 0);

        const address = {
            firstName,
            lastName,
            email,
            street,
            city,
            state,
            zipcode,
            country,
            phone
        };

        try {
            let response;
            if (method === 'cod') {
                response = await fetch('http://localhost:4000/api/order/place', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': user.token
                    },
                    body: JSON.stringify({ userId: user.token, items, amount, address })
                });
            } else if (method === 'stripe') {
                response = await fetch('http://localhost:4000/api/order/stripe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': user.token
                    },
                    body: JSON.stringify({ userId: user.token, items, amount, address })
                });
            } else if (method === 'razorpay') {
                response = await fetch('http://localhost:4000/api/order/razorpay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': user.token
                    },
                    body: JSON.stringify({ userId: user.token, items, amount, address })
                });
            }

            const data = await response.json();

            if (data.success) {
                toast.success('Order placed successfully');
                // Clear cart and navigate accordingly
                if (method === 'cod') {
                    navigate('/orders');
                } else if (method === 'stripe') {
                    window.location.href = data.session_url;
                } else if (method === 'razorpay') {
                    // Implement Razorpay payment flow here if needed
                    navigate('/orders');
                }
            } else {
                toast.error(data.message || 'Failed to place order');
            }
        } catch (error) {
            toast.error('Error placing order: ' + error.message);
        }
    };

    return (
        <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>

            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' value={street} onChange={(e) => setStreet(e.target.value)} />
                <div className='flex gap-3'>
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' value={city} onChange={(e) => setCity(e.target.value)} />
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className='flex gap-3'>
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' value={zipcode} onChange={(e) => setZipcode(e.target.value)} />
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Phone' value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className='mt-8'>

                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className=' text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button onClick={handlePlaceOrder} className='bg-black text-white px-16 py-3 text-sm '>PLACE ORDER</button>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default PlaceOrder
