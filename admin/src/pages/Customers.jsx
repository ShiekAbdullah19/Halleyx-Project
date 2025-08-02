import React, { useState, useEffect } from 'react';
import CustomerProfile from '../components/CustomerProfile';
import { backendUrl } from '../App';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const statusQuery = statusFilter === 'All' ? '' : `&status=${statusFilter}`;
      const response = await fetch(`${backendUrl}/api/user/customers?search=${encodeURIComponent(search)}${statusQuery}`, {
        headers: { token },
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      } else {
        setError('Failed to fetch customers');
      }
    } catch (err) {
      setError('Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  const handleView = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseProfile = () => {
    setSelectedCustomer(null);
    fetchCustomers(); // Refresh list after profile update
  };

  const handleStatusToggle = async (customer) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${backendUrl}/api/user/customers/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({
          userId: customer._id,
          isActive: !customer.isActive,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchCustomers();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer ${customer.name}?`)) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${backendUrl}/api/user/customers/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({ userId: customer._id }),
      });
      const data = await response.json();
      if (data.success) {
        fetchCustomers();
      } else {
        alert('Failed to delete customer');
      }
    } catch (err) {
      alert('Error deleting customer');
    }
  };

  const handleImpersonate = async (customer) => {
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
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Customers</h1>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 flex-grow"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Blocked</option>
        </select>
      </div>
      {loading ? (
        <p>Loading customers...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">#</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer._id} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.name}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.email}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.isActive ? 'Active' : 'Blocked'}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <button onClick={() => handleView(customer)} className="text-blue-600 hover:underline">View</button>
                  <button
                    onClick={() => handleStatusToggle(customer)}
                    className={`text-${customer.isActive ? 'red' : 'green'}-600 hover:underline`}
                  >
                    {customer.isActive ? 'Block' : 'Unblock'}
                  </button>
                  <button onClick={() => handleImpersonate(customer)} className="text-purple-600 hover:underline">Impersonate</button>
                  <button onClick={() => handleDelete(customer)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedCustomer && <CustomerProfile customer={selectedCustomer} onClose={handleCloseProfile} />}
    </div>
  );
};

export default Customers;
