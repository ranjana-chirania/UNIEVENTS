import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registered Successfully ✅");
        navigate("/login");
      } else {
        alert(data.message || "Error ❌");
      }

    } catch (err) {
      alert("Something went wrong ❌");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Register</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="form-control mb-2"
          required
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="form-control mb-2"
          required
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* 🔥 ROLE SELECT */}
        <select
          className="form-control mb-2"
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>

        <button className="btn btn-dark w-100">Register</button>
      </form>
    </div>
  );
}

export default Register;