import { useState } from "react";
import { authApi } from "../api/authApi";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await authApi.login(form);

      // ✅ SINGLE BLOCK (fix)
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // 🔥 IMPORTANT FIX (reload instead of navigate)
        window.location.href =
          data.role === "faculty" ? "/admin" : "/events";

      } else {
        alert("Invalid credentials ❌");
      }

    } catch (err) {
      console.log(err);
      alert("Something went wrong ❌");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Login</h3>

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

        <button className="btn btn-dark w-100">Login</button>
      </form>
    </div>
  );
}

export default Login;
