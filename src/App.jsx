// App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import About from "./pages/About";
import Documentation from "./pages/Documentation";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import FirestoreTest from "./components/FirestoreTest";
import "./styles/transaction-status.css";

export default function App() {
  const location = useLocation();
  const isDashboardRoute = location.pathname === "/dashboard";

  return (
    <>
      {!isDashboardRoute && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/contact" element={<Contact />} />

        {/* ✅ Firestore Test Route */}
        <Route path="/firestore-test" element={<FirestoreTest />} />

        {/* Clerk Auth Pages */}
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

        {/* ✅ Dashboard with UUID query parameter */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      {!isDashboardRoute && <Footer />}
    </>
  );
}