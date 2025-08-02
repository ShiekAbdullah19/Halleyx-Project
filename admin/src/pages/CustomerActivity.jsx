import React, { useEffect, useState } from 'react';
import { backendUrl } from '../App';

const CustomerActivity = () => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  const handleImpersonate = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/user/customers/impersonate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('impersonationToken', data.token);
        window.location.href = '/customer-portal'; // Redirect to customer portal
      } else {
        alert('Failed to impersonate user: ' + data.message);
      }
    } catch (error) {
      alert('Error impersonating user: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchCustomerActivity = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendUrl}/api/user/customer-activity`, { headers: { token } });
        const data = await response.json();
        console.log("Fetched activities from API:", data);
        if (data.success) {
          setActivities(data.data);
          console.log("Set activities state:", data.data);
        } else {
          setError('Failed to fetch customer activity data');
        }
      } catch (err) {
        setError('Error fetching customer activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerActivity();
  }, []);

  if (loading) {
    return <div className="p-4">Loading customer activity...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Customer Activity</h1>
      {activities.length > 0 ? (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">User ID</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Event Type</th>
              <th className="border border-gray-300 px-4 py-2">Time and Date</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{activity.userId.toString()}</td>
                <td className="border border-gray-300 px-4 py-2">{activity.name}</td>
                <td className="border border-gray-300 px-4 py-2">{activity.eventType}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(activity.timestamp).toLocaleString()}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Active</button>
                  <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">View</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Block</button>
                  <button
                    className="bg-yellow-500 text-black px-2 py-1 rounded hover:bg-yellow-600"
                    onClick={() => handleImpersonate(activity.userId)}
                  >
                    Impersonate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No customer activity data available.</p>
      )}
    </div>
  );
};

export default CustomerActivity;
