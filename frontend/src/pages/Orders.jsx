import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { toast } from 'react-toastify'

const Orders = () => {

    const { currency, user } = useContext(ShopContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !user.token) {
                setOrders([]);
                return;
            }
            setLoading(true);
            try {
                const response = await fetch('http://localhost:4000/api/order/userorders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': user.token
                    },
                    body: JSON.stringify({})
                });
                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    toast.error('Failed to fetch orders');
                }
            } catch (error) {
                toast.error('Error fetching orders: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    return (
        <div className='border-t pt-16'>

            <div className='text-2xl'>
                <Title text1={'MY'} text2={'ORDERS'} />
            </div>

            {loading ? (
                <p>Loading orders...</p>
            ) : (
                <div>
                    {orders.length === 0 ? (
                        <p>No orders found.</p>
                    ) : (
                        orders.map((order, index) => (
                            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                                <div className='flex items-start gap-6 text-sm '>
                                    <img className='w-16 sm:w-20' src={order.items[0]?.image[0]} alt="" />
                                    <div>
                                        <p className='sm:text-base font-medium'>{order.items[0]?.name}</p>
                                        <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                                            <p className='text-lg'>{currency}{order.items[0]?.price}</p>
                                            <p>Quantity: {order.items[0]?.quantity}</p>
                                            <p>Size: {order.items[0]?.size}</p>
                                        </div>
                                        <p className='mt-2'>Date: <span className='text-gray-400'>{new Date(order.date).toLocaleDateString()}</span></p>
                                    </div>
                                </div>
                                <div className='md:w-1/2 flex justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                                        <p className='text-sm md:text-base'>{order.status || 'Processing'}</p>
                                    </div>
                                    <button className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
    )
}

export default Orders
