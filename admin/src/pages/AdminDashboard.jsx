import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, onClick, children }) => (
  <div 
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
      <span className="text-3xl">{icon}</span>
    </div>
    {value !== undefined && <p className="text-4xl font-bold text-gray-800">{value}</p>}
    {children && <div className="mt-2 text-gray-700">{children}</div>}
  </div>
);
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    productCount: 0,
    customerCount: 0,
    orderStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { token }
        };
        const response = await axios.get(`${backendUrl}/api/admin/stats`, config);
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err.response || err);
        setError(err.response?.data?.message || 'Failed to load dashboard stats. Please check the console for more details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading dashboard stats...</div>;
  if (error) return <div className="p-4 text-center text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;

  const allOrderStatuses = ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <StatCard 
          title="New Product List" 
          value={stats.productCount} 
          icon="📦"
          onClick={() => navigate('/list')}
        />

        <StatCard 
          title="Total Customers" 
          value={stats.customerCount} 
          icon="👥"
          onClick={() => navigate('/customer-activity')}
        />

        <StatCard 
          title="Orders Summary" 
          icon="🛒"
          onClick={() => navigate('/orders')}
        >
          <ul className="space-y-2">
            {allOrderStatuses.map(status => (
              <li key={status} className="flex justify-between items-center">
                <span className="font-medium">{status}:</span>
                <span className="font-bold text-lg">{stats.orderStats[status] || 0}</span>
              </li>
            ))}
          </ul>
        </StatCard>

      </div>
    </div>
  );
};

export default AdminDashboard;
