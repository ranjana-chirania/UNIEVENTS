import { useState } from "react";

function RegisterForm({ eventId, refreshEvent, closeForm }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const checkRegistration = async (email) => {
  const res = await fetch(
    `http://localhost:3000/api/check-registration?email=${email}&eventId=${eventId}`
  );

  const data = await res.json();
  setAlreadyRegistered(data.registered);
};

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        eventId,
      }),
    });

    // 🔥 IMPORTANT FIX
    if (!res.ok) {
      throw new Error("Response not OK");
    }

    const data = await res.json();

    console.log("DATA:", data); // debug

    setMessage(data.message || "Done");

    if (data.message && data.message.toLowerCase().includes("success")) {
      refreshEvent();
      setForm({ name: "", email: "" });

      setTimeout(() => {
        closeForm();
      }, 1500);
    }

  } catch (err) {
    console.log("ERROR:", err); // 🔥 THIS WILL SHOW REAL ISSUE
    setMessage("Something went wrong ❌");
  }

  setLoading(false);
};

  return (
    <form onSubmit={handleSubmit}>

      {/* ✅ MESSAGE ALERT */}

      {alreadyRegistered && (
    <div className="alert alert-warning">
      ⚠️ You already registered for this event
    </div>
  )}

      {message && (
        <div
          className={`alert ${
            message.toLowerCase().includes("success")
              ? "alert-success"
              : "alert-danger"
          }`}
        >
          {message}
        </div>
      )}

      {/* NAME */}
      <input
        type="text"
        placeholder="Name"
        className="form-control mb-2"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      {/* EMAIL */}
      <input
  type="email"
  placeholder="Email"
  className="form-control mb-2"
  value={form.email}
  onChange={(e) => {
    setForm({ ...form, email: e.target.value });
    checkRegistration(e.target.value); // 👈 yahi add karna hai
  }}
/>

      {/* BUTTON */}
     <button
  className="btn btn-success w-100"
  disabled={loading || alreadyRegistered}
>
  {alreadyRegistered
    ? "Already Registered"
    : loading
    ? "Registering..."
    : "Register"}
</button>

    </form>
  );
}

export default RegisterForm;