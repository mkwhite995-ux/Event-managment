import axios from 'axios';
import toast from 'react-hot-toast';

import { API_URL as API_ROUTE } from '../../api';

function UserListRow({ user, onDeleted }) {
  const handleDelete = async () => {
    if (!window.confirm(`Delete ${user.name}'s account?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_ROUTE}/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message || 'User deleted successfully');
      onDeleted(user._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete user');
    }
  };

  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.phone}</td>
      <td>{user.role}</td>
      <td><button type="button" onClick={handleDelete} className="delete-button">Delete</button></td>
    </tr>
  );
}

export default UserListRow;
