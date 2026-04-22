import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/eventsApi";

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventsApi
      .getAll()
      .then((data) => setEvents(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="container mt-3">
      <h3>Upcoming Events</h3>

      <div className="row row-cols-lg-3 row-cols-md-2 row-cols-1 g-4">
        {events.map((event) => (
          <Link to={`/events/${event._id}`}
            key={event._id}
            style={{ textDecoration: "none" }}
          >
            <div className="card h-100 shadow-sm card-col">

              {/* Image */}
              <img
                src={event.image}
                className="card-img-top"
                alt="event"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="overlay">
                <h5>{event.title}</h5>
                <p>
                  {event.description
                    ? event.description.substring(0, 100)
                    : "No description"}
                </p>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Events;
