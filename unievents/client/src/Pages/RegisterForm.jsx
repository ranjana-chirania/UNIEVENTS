import { useState } from "react";
import { registrationApi } from "../api/registrationApi";

function RegisterForm({ eventId, refreshEvent, closeForm }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const checkRegistration = async (email) => {
    const data = await registrationApi.check(email, eventId);
    setAlreadyRegistered(data.registered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await registrationApi.create({
        name: form.name,
        email: form.email,
        eventId,
      });

      console.log("DATA:", data);

      setMessage(data.message || "Done");

      if (data.message && data.message.toLowerCase().includes("success")) {
        refreshEvent();
        setForm({ name: "", email: "" });

        setTimeout(() => {
          closeForm();
        }, 1500);
      }
    } catch (err) {
      console.log("ERROR:", err);
      setMessage("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {alreadyRegistered && (
        <div className="alert alert-warning">
          You already registered for this event
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

      <input
        type="text"
        placeholder="Name"
        className="form-control mb-2"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        type="email"
        placeholder="Email"
        className="form-control mb-2"
        value={form.email}
        onChange={(e) => {
          setForm({ ...form, email: e.target.value });
          checkRegistration(e.target.value);
        }}
      />

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
