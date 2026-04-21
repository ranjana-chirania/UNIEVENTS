/* eslint-disable no-restricted-globals */


import { useEffect, useState } from "react";

function Admin() {
  const [events, setEvents] = useState([]);

  const fetchEvents = () => {
    fetch("http://localhost:3000/api/events")
      .then(res => res.json())
      .then(data => setEvents(data));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const deleteEvent = async (id) => {
  const confirmDelete = window.confirm("Are you sure?");
  if (!confirmDelete) return;

  await fetch(`http://localhost:3000/api/events/${id}`, {
    method: "DELETE",
  });

  // 🔥 refresh events
  setEvents(events.filter((e) => e._id !== id));
};


const exportCSV = async (eventId) => {
  const res = await fetch(
    `http://localhost:3000/api/admin/event/${eventId}/registrations`
  );

  const data = await res.json();

  // CSV format
  const csv = [
    ["Name", "Email"],
    ...data.map((r) => [r.name, r.email]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "participants.csv";
  a.click();
};



  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

    {events.map((e) => (
  <div key={e._id} className="card p-3 mb-2 dashboard-card">
    <h4>{e.title}</h4>
    <p>👥 {e.attendees} / {e.maxAttendees}</p>

    <button
      className="btn btn-primary "
      onClick={() =>
        window.location.href = `/admin/event/${e._id}`
      }
    >
      View Participants
    </button>

    {/* ✅ SAME e use karo */}
    <button
      className="btn btn-success mt-2 w-100"
      onClick={() => exportCSV(e._id)}
    >
      Export Participants
    </button>

    <button
      className="btn btn-danger mt-2 w-100"
      onClick={() => deleteEvent(e._id)}
    >
      Delete Event
    </button>

  </div>
))}
    </div>
  );
}

export default Admin;