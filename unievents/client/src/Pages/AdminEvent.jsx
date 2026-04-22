import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { eventsApi } from "../api/eventsApi";

function AdminEvent() {
  const { id } = useParams();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    eventsApi.getRegistrations(id).then((data) => setUsers(data));
  }, [id]);

  return (
    <div className="container mt-4">
      <h3>Participants</h3>

      {users.map((u) => (
        <div key={u._id} className="card p-2 mb-2">
          <p>{u.name}</p>
          <p>{u.email}</p>
        </div>
      ))}
    </div>
  );
}

export default AdminEvent;
