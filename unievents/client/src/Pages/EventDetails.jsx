import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterForm from "./RegisterForm";

function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // ✅ NEW FUNCTION (same logic, bas separate kiya)
  const fetchEvent = () => {
    fetch(`http://localhost:3000/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => setEvent(data));
  };

  // ✅ UPDATED useEffect
  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (!event) return <h3 className="text-center mt-5">Loading...</h3>;

  return (
    <div className="container mt-5 d-flex justify-content-center">
      
      <div className="card shadow-lg event-detail-card">

        {/* IMAGE */}
        <div className="event-img-wrapper">
          <img src={event.image} alt="event" />
          <div className="event-overlay">
            <h2>{event.title}</h2>
          </div>
        </div>

        {/* BODY */}
        <div className="card-body">
          <p className="text-muted">{event.description}</p>

          {event.attendees >= event.maxAttendees && (
            <p className="text-danger">⚠️ Seats Full</p>
          )}

          <div className="row">
            <div className="col-md-6">
              <p><b>Category:</b> {event.category}</p>
              <p><b>Date:</b> {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}</p>
              <p><b>Location:</b> {event.location}</p>
            </div>

            <div className="col-md-6">
              <p><b>Deadline:</b> {event.deadline ? new Date(event.deadline).toLocaleDateString() : "N/A"}</p>
              <p><b>Price:</b> ₹{event.price}</p>
              <p><b>Attendees:</b> {event.attendees}</p>
            </div>
          </div>

          {/* BUTTON */}
          <button
            className="btn btn-dark w-100 mt-3"
            disabled={event.attendees >= event.maxAttendees}
            onClick={() => setShowForm(!showForm)}
          >
            {event.attendees >= event.maxAttendees
              ? "Seats Full"
              : showForm
              ? "Close Registration"
              : "Participate"}
          </button>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              
              <h4>Register</h4>

              <RegisterForm 
                eventId={id} 
                refreshEvent={fetchEvent}   
                closeForm={() => setShowForm(false)} 
              />

              <button
                className="btn btn-secondary mt-2"
                onClick={() => setShowForm(false)}
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetails;