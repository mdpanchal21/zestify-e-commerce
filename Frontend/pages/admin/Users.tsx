import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

type DashboardUser = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const usersPerPage = 10;
  const usersSectionRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleEditUser = (user: DashboardUser) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditIsAdmin(user.isAdmin);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when currentPage changes
  }, [currentPage]);

  // Fetch users on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.isAdmin) {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await res.json();
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load users');
      }
    };

    fetchUsers();
  }, []);

  // Handle user search
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination for users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search change
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

 const deleteUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to delete user');
    }

    setUsers((prev) => prev.filter((user) => user._id !== userId));
    toast.success('User deleted successfully');
    
    // Close the delete modal after successful deletion
    setIsDeleteModalOpen(false);
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete user');
  }
};


  const updateUser = async (userId: string, name: string, email: string, isAdmin: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, isAdmin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update user');
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, name, email, isAdmin } : user
        )
      );
      toast.success('User updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user');
    }
  };

  // Handle open user modal
  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Loading state
  if (loading) return <p className="loading">Loading users...</p>;

  return (
    <div className="user-management">
      <input
        type="text"
        placeholder="Search users by name or email..."
        className="user-search-input"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className="user-list">
        {filteredUsers.length > 0 ? (
          currentUsers.map((user: DashboardUser) => (
            <div
              key={user._id}
              className="user-list-item"
              onClick={() => openUserModal(user)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="user-name-role">
                  <strong>{user.name}</strong>
                  <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                <p className="user-email">{user.email}</p>
              </div>

              <div className="user-actions">
                <button onClick={(e) => { e.stopPropagation(); handleEditUser(user); }}>Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(user); }}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>

      {/* Modal for User Details */}
        {isModalOpen && selectedUser && (
        <div className="modal-overlay open" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-pro" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-pro" onClick={() => setIsModalOpen(false)}>
              <span>&times;</span>
            </button>

            <div className="modal-header-pro">
              <div className="avatar-pro">
                {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "?"} {/* Check if name exists */}
              </div>
              <h2>{selectedUser.name || "Name Not Available"}</h2> {/* Fallback if name is missing */}
              <p>{selectedUser.isAdmin ? "Admin" : "User"}</p>
            </div>

            <div className="modal-body-pro">
              <div className="user-detail-row fade-in-delay">
                <span>Email:</span>
                <span>{selectedUser.email || "No Email"}</span> {/* Fallback for email */}
              </div>
              <div className="user-detail-row fade-in-delay">
                <span>Role:</span>
                <span>{selectedUser.isAdmin ? "Admin" : "User"}</span>
              </div>
              <div className="user-detail-row fade-in-delay">
                <span>Joined:</span>
                <span>Jan 15, 2024</span> {/* Static date */}
              </div>
              <div className="user-detail-row fade-in-delay">
                <span>Last Login:</span>
                <span>May 9, 2025</span> {/* Static date */}
              </div>
              <div className="user-detail-row fade-in-delay">
                <span>Status:</span>
                <span className="status-badge active">Active</span> {/* Static status */}
              </div>
            </div>

            <div className="modal-footer-pro">
              <button className="view-profile-btn">View Full Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="modal-overlay open" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-pro" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-pro" onClick={() => setIsEditModalOpen(false)}>
              <span>&times;</span>
            </button>

            <div className="modal-header-pro-edit">
              <h2>Edit User</h2>
            </div>

            <div className="modal-body-pro-edit">
              <div className="user-detail-row fade-in-delay">
                <label className='edit-label1'>Name:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="edit-input-user"
                />
              </div>

              <div className="user-detail-row fade-in-delay">
                <label className='edit-label1'>Email:</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="edit-input-user"
                />
              </div>

              <div className="user-detail-row fade-in-delay">
                <label className='edit-label1'>Is Admin:</label>
                <input
                  type="checkbox"
                  checked={editIsAdmin}
                  onChange={(e) => setEditIsAdmin(e.target.checked)}
                />
              </div>
            </div>

            <div className="modal-footer-pro">
              <button
                className="save-btn"
                onClick={() => {
                  if (!editName || !editEmail) {
                    toast.error('Name and Email are required');
                    return;
                  }
                  updateUser(selectedUser._id, editName, editEmail, editIsAdmin);
                  setIsEditModalOpen(false);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="modal-overlay open" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content-pro-delete" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header-pro-delete">
              <h2>Confirm Deletion</h2>
            </div>

            <div className="modal-body-pro-delete">
              <p>Are you sure you want to delete  <span className='delete-user-name'>{userToDelete.name}?</span></p>
            </div>

            <div className="modal-footer-pro-delete">
              <button className="delete-btn-delete" onClick={() => deleteUser(userToDelete._id)}>
                Yes, Delete
              </button>
              <button className="cancel-btn-delete" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}

        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
