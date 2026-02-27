import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers, deleteUser, createUser, updateUser } from "../api/admin";
import CreateEditUserModal from "../components/CreateEditUserModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import UserAppointmentsModal from "../components/UserAppointmentsModal";
export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetUser, setResetUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointmentsUser, setAppointmentsUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  /* =====================
     Load users
  ===================== */
  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* =====================
     Search functionality
  ===================== */
  // Debounced search - only search after user stops typing for 500ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput);
    }
  };

  /* =====================
     Derived data
  ===================== */
  const totalDoctors = users.filter((u) => u.role.name === "DOCTOR").length;
  const totalPatients = users.filter((u) => u.role.name === "PATIENT").length;

  const filteredUsers = users.filter((u) => {
    // Filter by role
    const roleMatch = roleFilter === "ALL" || u.role.name === roleFilter;

    // Filter by search term (search in name and email)
    const searchMatch =
      !searchTerm ||
      (u.firstName &&
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.lastName &&
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    return roleMatch && searchMatch;
  });

  /* =====================
     Actions
  ===================== */
  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This will also delete all their appointments and medical records.",
      )
    )
      return;

    try {
      await deleteUser(id);
      loadUsers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to delete user";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleSubmitUser = async (data) => {
    if (selectedUser) {
      // Edit mode
      await updateUser(selectedUser.id, data);
    } else {
      // Create mode
      await createUser(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Admin dashboard
            </h1>
            <p className="text-slate-500 text-sm">Logged in as Admin</p>
          </div>

          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Total doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{totalDoctors}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Total patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{totalPatients}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Users</CardTitle>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleSearchKeyPress}
                  className="border rounded-md px-3 py-2 text-sm w-48 pr-8"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setSearchTerm("");
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="ALL">All roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="PATIENT">Patient</option>
              </select>

              <Button
                onClick={() => {
                  setSelectedUser(null);
                  setOpenModal(true);
                }}
              >
                Create user
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {loading && <p className="text-slate-500">Loading…</p>}

            {!loading && filteredUsers.length === 0 && (
              <p className="text-slate-500">
                {searchTerm
                  ? `No users found matching "${searchTerm}"${
                      roleFilter !== "ALL"
                        ? ` in ${roleFilter.toLowerCase()} role`
                        : ""
                    }.`
                  : `No users found for selected role.`}
              </p>
            )}

            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="border rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {u.firstName || u.lastName
                      ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                      : u.email}
                  </p>

                  <p className="text-xs text-slate-500">{u.role.name}</p>
                </div>

                <div className="flex gap-2">
                  {u.role.name === "PATIENT" && (
                    <Button
                      size="sm"
                      variant="outline"
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        borderColor: "black",
                      }}
                      onClick={() => setAppointmentsUser(u)}
                    >
                      Appointments
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(u);
                      setOpenModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setResetUser(u)}
                  >
                    Reset password
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(u.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit modal */}
      {openModal && (
        <CreateEditUserModal
          open={openModal}
          user={selectedUser}
          onClose={() => {
            setOpenModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setOpenModal(false);
            setSelectedUser(null);
            loadUsers();
          }}
          onSubmitAction={handleSubmitUser}
        />
      )}
      {/* Reset User Modal */}
      {resetUser && (
        <ResetPasswordModal
          open={!!resetUser}
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSuccess={() => setResetUser(null)}
        />
      )}

      {/* User Appointments Modal */}
      {appointmentsUser && (
        <UserAppointmentsModal
          open={!!appointmentsUser}
          user={appointmentsUser}
          onClose={() => setAppointmentsUser(null)}
        />
      )}
    </div>
  );
}
