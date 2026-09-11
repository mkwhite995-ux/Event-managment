import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserListRow from './UserListRow';
import './UserList.css';

import { API_URL as API_ROUTE } from '../../api';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_ROUTE}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const removeUser = (id) => setUsers((currentUsers) => currentUsers.filter((user) => user._id !== id));

  if (loading) return <p className="user-list-status">Loading users…</p>;

  return (
    <main className="user-list-page"><div className="user-list-header"><div><h1>User Management</h1><p>View and manage registered users.</p></div><span>{users.length} users</span></div><div className="user-table-container"><table className="userDisplayTable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => <UserListRow key={user._id} user={user} onDeleted={removeUser} />)}
      </tbody>
    </table></div></main>
  );
}

export default UserList;
