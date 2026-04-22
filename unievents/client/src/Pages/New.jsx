import { useState } from "react";
import { aiApi } from "../api/aiApi";
import { eventsApi } from "../api/eventsApi";

const initialEventState = {
  title: "",
  description: "",
  category: "",
  date: "",
  deadline: "",
  price: "",
  maxAttendees: "",
  location: "",
  image: "",
};

function New() {
  const [event, setEvent] = useState(initialEventState);
  const [submitMessage, setSubmitMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((currentEvent) => ({
      ...currentEvent,
      [name]: value,
    }));
  };

  const generateDescription = async () => {
    if (!event.title || !event.category || !event.location || !event.date) {
      setAiMessage("Add title, category, location, and date before using AI.");
      return;
    }

    setIsGenerating(true);
    setAiMessage("");

    try {
      const data = await aiApi.generateEventDescription({
        title: event.title,
        category: event.category,
        location: event.location,
        date: event.date,
      });

      setEvent((currentEvent) => ({
        ...currentEvent,
        description: data.description,
      }));
      setAiMessage("AI description generated. You can edit it before saving.");
    } catch (err) {
      setAiMessage(err.message || "AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      await eventsApi.create({
        ...event,
        price: Number(event.price) || 0,
        maxAttendees: Number(event.maxAttendees),
      });

      setSubmitMessage("Event created successfully.");
      setAiMessage("");
      setEvent(initialEventState);
    } catch (err) {
      setSubmitMessage(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-event-wrapper">
      <div className="form-card">
        <h3>Create a New Event</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Event Title"
            value={event.title}
            onChange={handleChange}
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={event.category}
            onChange={handleChange}
            required
          />

          <label className="form-label-dark" htmlFor="date">Event Day</label>
          <input
            id="date"
            type="date"
            name="date"
            value={event.date}
            onChange={handleChange}
            required
          />

          <label className="form-label-dark" htmlFor="deadline">Registration Deadline</label>
          <input
            id="deadline"
            type="date"
            name="deadline"
            value={event.deadline}
            onChange={handleChange}
            required
          />

          <input
            name="location"
            placeholder="Location"
            value={event.location}
            onChange={handleChange}
            required
          />

          <div className="ai-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={generateDescription}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Description With AI"}
            </button>
          </div>

          {aiMessage && <p className="form-message info-message">{aiMessage}</p>}

          <textarea
            name="description"
            placeholder="Description"
            value={event.description}
            onChange={handleChange}
            rows="5"
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Price INR"
            value={event.price}
            onChange={handleChange}
            min="0"
            required
          />

          <input
            type="number"
            name="maxAttendees"
            placeholder="Max Attendees"
            value={event.maxAttendees}
            onChange={handleChange}
            min="1"
            required
          />

          <input
            type="url"
            name="image"
            placeholder="Image URL (optional)"
            value={event.image}
            onChange={handleChange}
          />

          {submitMessage && <p className="form-message">{submitMessage}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default New;
