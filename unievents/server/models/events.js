const mongoose = require("mongoose");

const { Schema } = mongoose;
const DEFAULT_EVENT_IMAGE = "https://placehold.co/1200x800?text=Campus+Event";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    deadline: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: DEFAULT_EVENT_IMAGE,
      trim: true,
      set: (value) => (value ? value.trim() : DEFAULT_EVENT_IMAGE),
    },
    attendees: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttendees: {
      type: Number,
      required: true,
      min: 1,
    },
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
      },
    ],
  },
  {
    timestamps: true,
  }
);

eventSchema.path("deadline").validate(function validateDeadline(deadlineValue) {
  if (!deadlineValue || !this.date) {
    return true;
  }

  return new Date(deadlineValue) <= new Date(this.date);
}, "Registration deadline must be on or before the event date");

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
