import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Admin = () => {
  const { backendUrl, token } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) setDoctors(data.doctors);
    } catch (error) {
      toast.error("Error loading doctors");
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
        headers: { token },
      });
      if (data.success) setAppointments(data.appointments);
    } catch (error) {
      toast.error("Error loading appointments");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { token },
      });
      if (data.success) setUsers(data.users);
    } catch (error) {
      toast.error("Error loading users");
    }
  };

  useEffect(() => {
    if (activeTab === "doctors") fetchDoctors();
    if (activeTab === "appointments") fetchAppointments();
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <div className="p-5 space-y-4 text-white bg-gray-900 w-60">
        <h2 className="text-xl font-bold">Admin Panel</h2>

        <button onClick={() => setActiveTab("dashboard")} className="block">
          Dashboard
        </button>

        <button onClick={() => setActiveTab("doctors")} className="block">
          Manage Doctors
        </button>

        <button onClick={() => setActiveTab("appointments")} className="block">
          Appointments
        </button>

        <button onClick={() => setActiveTab("users")} className="block">
          Users
        </button>
      </div>

      <div className="flex-1 p-8 bg-gray-100">
        {activeTab === "dashboard" && (
          <div>
            <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded shadow">
                Total Doctors: {doctors.length}
              </div>

              <div className="p-4 bg-white rounded shadow">
                Total Users: {users.length}
              </div>

              <div className="p-4 bg-white rounded shadow">
                Appointments: {appointments.length}
              </div>
            </div>
          </div>
        )}

        {activeTab === "doctors" && (
          <div>
            <h1 className="mb-4 text-xl font-bold">Doctors</h1>

            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="flex justify-between p-3 mb-2 bg-white rounded shadow"
              >
                <span>{doc.name}</span>
                <span>{doc.speciality}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <h1 className="mb-4 text-xl font-bold">Appointments</h1>

            {appointments.map((app) => (
              <div key={app._id} className="p-3 mb-2 bg-white rounded shadow">
                {app.userData?.name} → {app.docData?.name}
              </div>
            ))}
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h1 className="mb-4 text-xl font-bold">Users</h1>

            {users.map((user) => (
              <div
                key={user._id}
                className="flex justify-between p-3 mb-2 bg-white rounded shadow"
              >
                <span>{user.name}</span>
                <span>{user.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
