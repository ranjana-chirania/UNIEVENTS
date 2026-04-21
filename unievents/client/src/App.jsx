import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Events from "./Pages/Events";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import New from "./Pages/New"; 
import EventDetails from "./Pages/EventDetails";
import Admin from "./Pages/Admin";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminEvent from "./Pages/AdminEvent";

function App() {

  // 🔥 role check from localStorage
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

        <div className="main-content">
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Events />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/event/:id" element={<AdminEvent />} />

            {/* 🔥 STUDENT + ADMIN dono */}
            <Route 
              path="/events/new" 
              element={
                role ? <New /> : <Navigate to="/" />
              } 
            />

            {/* 🔥 ONLY ADMIN */}
            <Route
  path="/admin"
  element={
    localStorage.getItem("role") === "faculty" ? (
      <Admin />
    ) : (
      <Navigate to="/login" />
    )
  }
/>

          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;