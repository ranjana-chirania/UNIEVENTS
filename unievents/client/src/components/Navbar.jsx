import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {

  const [role, setRole] = useState(localStorage.getItem("role"));

  // 🔥 FIX: listen for changes
  useEffect(() => {
    const checkRole = () => {
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", checkRole);

    return () => window.removeEventListener("storage", checkRole);
  }, []);

  // ✅ logout function
  const handleLogout = () => {
    localStorage.removeItem("role");
    setRole(null); // 🔥 instant update
    window.location.href = "/"; // refresh
  };

  return (
    <nav className="navbar navbar-expand-md bg-light border-bottom sticky-top ">
      <div className="container-fluid">

        <Link className="navbar-brand" to="/">
          <img src="/images/logo.png" alt="logo" style={{ height: "50px" }} />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">

  {/* 👨‍🎓 STUDENT */}
  {role === "student" && (
    <>
      <Link className="nav-link" to="/">Home</Link>
      <Link className="nav-link" to="/events">Explore Events</Link>

      <button className="btn btn-sm btn-danger ms-2" onClick={handleLogout}>
        Logout
      </button>
    </>
  )}

  {/* 👨‍🏫 FACULTY */}
  {role === "faculty" && (
    <>
      <Link className="nav-link" to="/">Home</Link>
      <Link className="nav-link" to="/admin">Dashboard</Link>
      <Link className="nav-link" to="/events/new">Host Event</Link>

      <button className="btn btn-sm btn-danger ms-2" onClick={handleLogout}>
        Logout
      </button>
    </>
  )}

  {/* ❌ NOT LOGGED IN */}
  {!role && (
    <>
      <Link className="nav-link" to="/">Home</Link>
      <Link className="nav-link" to="/events">Explore Events</Link>
      <Link className="nav-link" to="/login">Login</Link>
      <Link className="nav-link" to="/register">Register</Link>
    </>
  )}

</div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;