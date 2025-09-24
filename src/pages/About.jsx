// src/pages/About.jsx
import React from "react";

const About = () => {
  return (
    <main style={{ fontFamily: "Inter, sans-serif", color: "#fff", backgroundColor: "#000" }}>
      
      {/* HERO */}
      <section style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "1rem" }}>
          Empowering the Future of{" "}
          <span style={{ color: "#C6FF4D" }}>Sustainable AI Memory</span>
        </h1>
        <p style={{ maxWidth: "800px", margin: "0 auto", fontSize: "1.2rem", lineHeight: "1.6" }}>
          We’re not just building infrastructure for AI — we’re shaping the future of 
          intelligent systems with privacy-preserving, portable, and persistent memory powered by Web3.
        </p>

        <div style={{
          marginTop: "2rem",
          backgroundColor: "#111",
          padding: "1.5rem 2rem",
          borderRadius: "12px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          fontSize: "1rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.6)"
        }}>
          Our innovation isn’t about bigger models. It’s about smarter, sustainable memory 
          that empowers AI to collaborate securely and responsibly.
        </div>
      </section>

      {/* MISSION */}
      <section style={{ padding: "6rem 2rem", backgroundColor: "#fff", color: "#000", borderRadius: "30px 30px 0 0" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", textAlign: "center", marginBottom: "1rem" }}>
          Our Mission Stays the Same:{" "}
          <span style={{ color: "#A0E418" }}>Advancing Intelligence for All</span>
        </h2>
        <p style={{ maxWidth: "800px", margin: "0 auto 2rem", textAlign: "center", fontSize: "1.1rem" }}>
          De-MAPP’s mission is to make AI memory accessible, ethical, and interoperable — 
          driving innovation across industries without compromising security or ownership.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem"
        }}>
          {[
            "Expanding cross-agent collaboration with MCX",
            "Reducing reliance on centralized AI silos",
            "Empowering both people and enterprises",
            "Building a world where intelligent systems seamlessly integrate into everyday life"
          ].map((point, idx) => (
            <div key={idx} style={{
              backgroundColor: "#C6FF4D",
              color: "#000",
              padding: "1.5rem",
              borderRadius: "12px",
              fontWeight: "600",
              textAlign: "center",
              transition: "all 0.3s ease",
              boxShadow: "0 6px 16px rgba(0,0,0,0.3)"
            }}>
              {point}
            </div>
          ))}
        </div>
      </section>

      {/* INNOVATION QUOTE */}
      <section style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "1rem" }}>
          Innovation Fuels <span style={{ color: "#C6FF4D" }}>Every Interaction</span>
        </h2>
        <div style={{
          marginTop: "2rem",
          backgroundColor: "#111",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          fontSize: "1.1rem",
          fontStyle: "italic",
          border: "1px solid #C6FF4D",
          boxShadow: "0 6px 16px rgba(0,0,0,0.5)"
        }}>
          Innovation at De-MAPP means designing solutions that make AI memory more ethical, portable, 
          and future-ready. We’re not just building infrastructure — we’re building the intelligence 
          fabric for decades to come.
          <br /><br />
          <span style={{ fontWeight: "700", color: "#C6FF4D" }}>— The Founders of De-MAPP</span>
        </div>
      </section>

      {/* FOUNDING TEAM */}
      <section style={{ padding: "6rem 2rem", backgroundColor: "#111" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", textAlign: "center", marginBottom: "1rem", color: "#fff" }}>
          The Founding Team Behind <span style={{ color: "#C6FF4D" }}>De-MAPP</span>
        </h2>
        <p style={{ maxWidth: "800px", margin: "0 auto 3rem", textAlign: "center", fontSize: "1.1rem", color: "#aaa" }}>
          Four engineers. One mission. Building the backbone of sustainable, decentralized AI memory.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2rem",
          justifyItems: "center"
        }}>
          {[
            { name: "Founder 1", role: "Blockchain Developer", img: "/Priyank.jpg" },
            { name: "Founder 2", role: "AI Engineer", img: "/Anarv.jpg" },
            { name: "Founder 3", role: "System Architecture", img: "/Prayers.jpg" },
            { name: "Founder 4", role: "Frontend Designer", img: "/meet.jpg" },
          ].map((member, idx) => (
            <div key={idx} style={{
              backgroundColor: "#000",
              padding: "2rem 1rem",
              borderRadius: "16px",
              textAlign: "center",
              maxWidth: "250px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.7)",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <img 
                src={member.img} 
                alt={member.name} 
                style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", marginBottom: "1rem", border: "3px solid #C6FF4D" }}
              />
              <h4 style={{ color: "#fff", marginBottom: "0.5rem" }}>{member.name}</h4>
              <p style={{ color: "#C6FF4D", fontSize: "0.95rem" }}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default About;