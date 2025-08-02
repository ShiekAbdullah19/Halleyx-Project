import React, { useState, useEffect } from 'react';
import { backendUrl } from '../App';

const CustomerProfile = ({ customer, onClose }) => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [portalAccess, setPortalAccess] = useState(customer.isActive);

  useEffect(() => {
    setProfile({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
    });
    setPortalAccess(customer.isActive);
    fetchOrderHistory();
  }, [customer]);

  const fetchOrderHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/orders/user/${customer._id}`, {
        headers: { token },
      });
      const data = await response.json();
      if (data.success) {
        setOrderHistory(data.orders);
      } else {
        setError('Failed to fetch order history');
      }
    } catch (err) {
      setError('Error fetching order history');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${backendUrl}/api/user/customers/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({
          userId: customer._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          isActive: portalAccess,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully');
        onClose();
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      alert('Error updating profile');
    }
  };

  const handleResetPassword = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${backendUrl}/api/user/customers/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({ userId: customer._id }),
      });
      const data = await response.json();
      if (data.success) {
        setTempPassword(data.tempPassword);
        alert(`Temporary password: ${data.tempPassword}`);
      } else {
        alert('Failed to reset password');
      }
    } catch (err) {
      alert('Error resetting password');
    }
  };

  const handlePortalAccessToggle = () => {
    setPortalAccess(!portalAccess);
  };

  const handleImpersonate = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${backendUrl}/api/user/customers/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({ userId: customer._id }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('impersonationToken', data.token);
        window.location.href = '/customer-portal'; // Redirect to customer portal
      } else {
        alert('Failed to impersonate customer');
      }
    } catch (err) {
      alert('Error impersonating customer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50">
      <div className="bg-white rounded p-6 w-3/4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Customer Profile</h2>
        <div className="mb-4">
          <label className="block mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={portalAccess}
              onChange={handlePortalAccessToggle}
              className="mr-2"
            />
            Enable Portal Access
          </label>
        </div>
        <div className="mb-4">
          <button
            onClick={handleResetPassword}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Reset Password
          </button>
          <button
            onClick={handleImpersonate}
            className="bg-purple-600 text-white px-4 py-2 rounded mr-2"
          >
            Impersonate
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="ml-2 px-4 py-2 rounded border border-gray-300"
          >
            Close
          </button>
        </div>
        <h3 className="text-lg font-semibold mb-2">Order History</h3>
        {loading ? (
          <p>Loading order history...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orderHistory.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Order ID</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderHistory.map((order) => (
                <tr key={order._id} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">{order._id}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.status}</td>
                  <td className="border border-gray-300 px-4 py-2">${order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
