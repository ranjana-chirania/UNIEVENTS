const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const Event = require("./models/events");
const Registration = require("./models/Registration");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/unievent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

function buildEventPrompt({ title, category, location, date }) {
  return [
    "Write a polished campus event description.",
    "Keep it between 90 and 140 words.",
    "Make it energetic, clear, and student-friendly.",
    "Mention what attendees will gain and why they should join.",
    "Do not use bullet points, hashtags, quotation marks, or markdown.",
    `Title: ${title}`,
    `Category: ${category}`,
    `Location: ${location}`,
    `Date: ${date}`,
  ].join("\n");
}

async function generateEventDescription(details) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: "You write concise, appealing event descriptions for college students.",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildEventPrompt(details),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 220,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || "Failed to generate description";
    throw new Error(errorMessage);
  }

  const generatedText = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!generatedText) {
    throw new Error("AI response was empty");
  }

  return generatedText;
}

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find({});

    const updatedEvents = await Promise.all(
      events.map(async (event) => {
        const count = await Registration.countDocuments({
          eventId: event._id,
        });

        return {
          ...event.toObject(),
          attendees: count,
        };
      })
    );

    res.json(updatedEvents);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching events" });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrationsCount = await Registration.countDocuments({
      eventId: req.params.id,
    });

    res.json({
      ...event.toObject(),
      attendees: registrationsCount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching event" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      deadline,
      price,
      location,
      image,
      maxAttendees,
    } = req.body;

    if (!title || !description || !category || !date || !deadline || !location) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!maxAttendees || Number(maxAttendees) <= 0) {
      return res.status(400).json({ message: "Max attendees must be greater than 0" });
    }

    if (new Date(deadline) > new Date(date)) {
      return res.status(400).json({
        message: "Registration deadline must be on or before the event date",
      });
    }

    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      date,
      deadline,
      price: Number(price) || 0,
      location: location.trim(),
      image: image?.trim() || undefined,
      maxAttendees: Number(maxAttendees),
    });

    await newEvent.save();

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(err.errors)[0]?.message || "Invalid event data",
      });
    }
    res.status(500).json({ message: "Error creating event" });
  }
});

app.post("/api/ai/generate-event-description", async (req, res) => {
  try {
    const { title, category, location, date } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        message: "GEMINI_API_KEY is missing in server/.env",
      });
    }

    if (!title || !category || !location || !date) {
      return res.status(400).json({
        message: "Title, category, location, and date are required",
      });
    }

    const description = await generateEventDescription({
      title: title.trim(),
      category: category.trim(),
      location: location.trim(),
      date,
    });

    res.json({ description });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message || "Could not generate description",
    });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ eventId: req.params.id });

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting event" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, eventId } = req.body;
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !eventId) {
      return res.status(400).json({ message: "Name, email, and event are required" });
    }

    const existing = await Registration.findOne({ email: normalizedEmail, eventId });
    if (existing) {
      return res.json({ message: "Already Registered!" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registeredCount = await Registration.countDocuments({ eventId });

    if (registeredCount >= event.maxAttendees) {
      return res.json({ message: "Seats Full" });
    }

    const newReg = new Registration({
      name: normalizedName,
      email: normalizedEmail,
      eventId,
    });
    await newReg.save();

    res.json({ message: "Registered Successfully" });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.json({ message: "Already Registered!" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(err.errors)[0]?.message || "Invalid registration data",
      });
    }
    res.status(500).json({ message: "Error" });
  }
});

app.get("/api/check-registration", async (req, res) => {
  try {
    const { email, eventId } = req.query;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !eventId) {
      return res.json({ registered: false });
    }

    const existing = await Registration.findOne({
      email: normalizedEmail,
      eventId,
    });

    res.json({ registered: Boolean(existing) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ registered: false });
  }
});

app.get("/api/admin/event/:id/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find({
      eventId: req.params.id,
    });

    res.json(registrations);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching registrations" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.comparePassword(password)) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      role: user.role,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.post("/api/register-user", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    const role = req.body.role?.trim().toLowerCase() || "student";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = new User({ email, password, role });
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors)[0]?.message || "Registration failed",
      });
    }
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Server working");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
