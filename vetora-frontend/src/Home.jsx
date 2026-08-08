import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div style={styles.page}>

      {/* ================= NAVBAR ================= */}
      <header style={styles.header}>
        <div style={styles.navbar}>

          <Link to="/" style={styles.logo}>
            <img 
  src="/vetora-logo.svg.svg" 
  alt="VETORA Logo" 
  style={{ width: "32px", height: "32px", objectFit: "contain", marginRight: "8px", verticalAlign: "middle" }} 
/>
            <span>VETORA</span>
          </Link>

          <nav
            style={{
              ...styles.navLinks,
              ...(isMobileMenuOpen ? styles.navLinksMobileActive : {}),
            }}
          >
            <a
              href="#home"
              onClick={() => setIsMobileMenuOpen(false)}
              style={styles.navLink}
            >
              Home
            </a>

            <a
              href="#services"
              onClick={() => setIsMobileMenuOpen(false)}
              style={styles.navLink}
            >
              Services
            </a>

            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              style={styles.navLink}
            >
              How It Works
            </a>

            <a
              href="#doctors"
              onClick={() => setIsMobileMenuOpen(false)}
              style={styles.navLink}
            >
              Doctors
            </a>

            <a
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
              style={styles.navLink}
            >
              About Us
            </a>
          </nav>

          <div style={styles.navActions}>

            <Link to="/login" style={styles.loginBtn}>
              Login
            </Link>

            <Link to="/signup" style={styles.signupBtn}>
              Sign Up
            </Link>

            <div
              style={styles.hamburger}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </div>

          </div>

        </div>
      </header>


      {/* ================= HERO ================= */}
      <section id="home" style={styles.hero}>

        <div style={styles.heroOverlay}></div>

        <div style={styles.heroContent}>

          <div style={styles.heroTag}>
            🩺 Trusted Veterinary Healthcare Platform
          </div>

          <h1 style={styles.heroTitle}>
            Smart Veterinary Care
            <br />
            <span style={styles.greenText}>
              For Your Beloved Pets
            </span>
          </h1>

          <p style={styles.heroText}>
            Find verified veterinary doctors, book appointments,
            manage your pet's health records and receive important
            vaccination and medication reminders — all in one place.
          </p>

          <div style={styles.heroButtons}>

            <Link to="/login" style={styles.primaryLink}>
              <button style={styles.primaryBtn}>
                Book an Appointment →
              </button>
            </Link>

            <Link to="/login" style={styles.secondaryLink}>
              <button style={styles.secondaryBtn}>
                Find a Veterinary Doctor
              </button>
            </Link>

          </div>

          <div style={styles.heroStats}>

            <div>
              <strong style={styles.statNumber}>24/7</strong>
              <span style={styles.statText}>Access</span>
            </div>

            <div style={styles.statDivider}></div>

            <div>
              <strong style={styles.statNumber}>100%</strong>
              <span style={styles.statText}>Digital Records</span>
            </div>

            <div style={styles.statDivider}></div>

            <div>
              <strong style={styles.statNumber}>Easy</strong>
              <span style={styles.statText}>Appointments</span>
            </div>

          </div>

        </div>

      </section>


      {/* ================= WHY VETORA ================= */}
      <section style={styles.whySection}>

        <div style={styles.container}>

          <div style={styles.sectionHeading}>

            <span style={styles.sectionTag}>
              WHY VETORA
            </span>

            <h2 style={styles.sectionTitle}>
              Everything Your Pet Needs
            </h2>

            <p style={styles.sectionDescription}>
              VETORA brings essential veterinary healthcare services
              together in one convenient digital platform.
            </p>

          </div>

          <div style={styles.featureGrid}>

            <FeatureCard
              icon="🩺"
              title="Verified Veterinary Doctors"
              text="Connect with registered and verified veterinary professionals."
            />

            <FeatureCard
              icon="📅"
              title="Easy Appointment Booking"
              text="Choose a convenient date and time without waiting in long queues."
            />

            <FeatureCard
              icon="📋"
              title="Digital Health Records"
              text="Keep your pet's medical history and treatment records securely online."
            />

            <FeatureCard
              icon="🔔"
              title="Smart Reminders"
              text="Receive reminders for vaccinations, medications and appointments."
            />

          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section id="services" style={styles.servicesSection}>

        <div style={styles.container}>

          <div style={styles.sectionHeading}>

            <span style={styles.sectionTag}>
              OUR SERVICES
            </span>

            <h2 style={styles.sectionTitle}>
              Complete Pet Healthcare
            </h2>

            <p style={styles.sectionDescription}>
              Simple digital tools to make veterinary care easier
              for pet owners and doctors.
            </p>

          </div>

          <div style={styles.serviceGrid}>

            <ServiceCard
              number="01"
              icon="📍"
              title="Find Nearby Doctors"
              text="Search for veterinary doctors and clinics based on location."
            />

            <ServiceCard
              number="02"
              icon="📅"
              title="Book Appointments"
              text="Schedule veterinary appointments at a convenient time."
            />

            <ServiceCard
              number="03"
              icon="💊"
              title="Digital Prescriptions"
              text="View electronic prescriptions and treatment information."
            />

            <ServiceCard
              number="04"
              icon="📖"
              title="Medical History"
              text="Access your pet's previous medical and treatment records."
            />

            <ServiceCard
              number="05"
              icon="💉"
              title="Vaccination Reminders"
              text="Never miss important vaccination dates for your pet."
            />

            <ServiceCard
              number="06"
              icon="🔔"
              title="Medication Reminders"
              text="Receive reminders about upcoming medications and treatments."
            />

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" style={styles.howSection}>

        <div style={styles.container}>

          <div style={styles.sectionHeading}>

            <span style={styles.sectionTag}>
              HOW IT WORKS
            </span>

            <h2 style={styles.sectionTitle}>
              Simple Steps to Better Pet Care
            </h2>

          </div>

          <div style={styles.stepsContainer}>

            <Step
              number="01"
              icon="👤"
              title="Create Your Account"
              text="Register as a pet owner and create your personal profile."
            />

            <Step
              number="02"
              icon="🐶"
              title="Register Your Pet"
              text="Add your pet details and keep their healthcare information organized."
            />

            <Step
              number="03"
              icon="🩺"
              title="Find a Doctor"
              text="Search and select a suitable veterinary doctor."
            />

            <Step
              number="04"
              icon="📅"
              title="Book & Get Care"
              text="Book an appointment and receive digital healthcare services."
            />

          </div>

        </div>

      </section>


      {/* ================= DOCTORS ================= */}
      <section id="doctors" style={styles.doctorsSection}>

        <div style={styles.container}>

          <div style={styles.sectionHeading}>

            <span style={styles.sectionTag}>
              OUR VETERINARY TEAM
            </span>

            <h2 style={styles.sectionTitle}>
              Meet Our Veterinary Doctors
            </h2>

            <p style={styles.sectionDescription}>
              Professional veterinary care from trusted healthcare
              providers.
            </p>

          </div>

          <div style={styles.doctorGrid}>

            <DoctorCard
              image="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80"
              name="Dr. Sarah Perera"
              specialty="Veterinary Surgeon"
              experience="8+ Years Experience"
              rating="4.9"
            />

            <DoctorCard
              image="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80"
              name="Dr. Nimal Fernando"
              specialty="Veterinary Doctor"
              experience="6+ Years Experience"
              rating="4.8"
            />

            <DoctorCard
              image="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=500&q=80"
              name="Dr. Kavindi Silva"
              specialty="Veterinary Surgeon"
              experience="5+ Years Experience"
              rating="4.9"
            />

            <DoctorCard
              image="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80"
              name="Dr. Tharindu Jayasinghe"
              specialty="Veterinary Doctor"
              experience="7+ Years Experience"
              rating="4.7"
            />

          </div>

          <div style={styles.viewDoctorsWrapper}>

            <Link to="/login">
              <button style={styles.outlineBtn}>
                View All Doctors →
              </button>
            </Link>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}
      <section id="about" style={styles.aboutSection}>

        <div style={styles.container}>

          <div style={styles.aboutGrid}>

            <div style={styles.aboutImageWrapper}>

              <img
            
  src="/about-vet.jpg"
  alt="Veterinary doctor caring for a pet"
  style={styles.aboutImage}
/>
              

              <div style={styles.aboutFloatingCard}>

                <span style={styles.floatingIcon}>
                  <img 
    src="/vetora-logo.svg.svg" 
    alt="VETORA Logo" 
    style={{ width: "24px", height: "24px", objectFit: "contain" }} 
  />
                </span>

                <div>

                  <strong style={styles.floatingTitle}>
                    Better Care
                  </strong>

                  <span style={styles.floatingText}>
                    Happier Pets
                  </span>

                </div>

              </div>

            </div>


            <div style={styles.aboutContent}>

              <span style={styles.sectionTag}>
                ABOUT VETORA
              </span>

              <h2 style={styles.aboutTitle}>
                Making Veterinary Care
                <span style={styles.greenText}>
                  {" "}Simple & Accessible
                </span>
              </h2>

              <p style={styles.aboutText}>
                VETORA is a web-based Veterinary Appointment and Pet
                Healthcare Management System designed to improve the
                way pet owners access veterinary healthcare services.
              </p>

              <p style={styles.aboutText}>
                Our platform connects pet owners with veterinary
                doctors while providing convenient appointment
                booking, digital medical records, prescriptions
                and healthcare reminders.
              </p>

              <div style={styles.aboutPoints}>

                <div style={styles.aboutPoint}>
                  <span style={styles.check}>✓</span>
                  <p>Easy access to veterinary services</p>
                </div>

                <div style={styles.aboutPoint}>
                  <span style={styles.check}>✓</span>
                  <p>Digital pet healthcare management</p>
                </div>

                <div style={styles.aboutPoint}>
                  <span style={styles.check}>✓</span>
                  <p>Better communication with veterinarians</p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= DOCTOR CTA ================= */}
      <section style={styles.doctorCTA}>

        <div style={styles.container}>

          <div style={styles.ctaBox}>

            <div>

              <span style={styles.ctaTag}>
                FOR VETERINARY DOCTORS
              </span>

              <h2 style={styles.ctaTitle}>
                Are You a Veterinary Doctor?
              </h2>

              <p style={styles.ctaText}>
                Join VETORA to manage appointments, maintain pet
                medical records and provide digital healthcare
                services to pet owners.
              </p>

            </div>

            <Link to="/login">
              <button style={styles.ctaButton}>
                Register as a Doctor →
              </button>
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FINAL CTA ================= */}
      <section style={styles.finalCTA}>

        <div style={styles.container}>

          <div style={styles.finalContent}>

            <span style={styles.sectionTag}>
              START TODAY
            </span>

            <h2 style={styles.finalTitle}>
              Your Pet Deserves
              <br />
              <span style={styles.greenText}>
                Better Healthcare
              </span>
            </h2>

            <p style={styles.finalText}>
              Join VETORA and make your pet's healthcare
              simpler, smarter and more organized.
            </p>

            <Link to="/signup">
              <button style={styles.primaryBtn}>
                Get Started →
              </button>
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer style={styles.footer}>

        <div style={styles.container}>

          <div style={styles.footerGrid}>

            <div>

              <Link to="/" style={styles.footerLogo}>
                🐾 <span>VETORA</span>
              </Link>

              <p style={styles.footerDescription}>
                Veterinary Appointment and Pet Healthcare
                Management System.
              </p>

            </div>


            <div>

              <h4 style={styles.footerTitle}>
                Quick Links
              </h4>

              <a href="#home" style={styles.footerLink}>
                Home
              </a>

              <a href="#services" style={styles.footerLink}>
                Services
              </a>

              <a href="#doctors" style={styles.footerLink}>
                Doctors
              </a>

              <a href="#about" style={styles.footerLink}>
                About Us
              </a>

            </div>


            <div>

              <h4 style={styles.footerTitle}>
                Portals
              </h4>

              <Link to="/login" style={styles.footerLink}>
                Pet Owner Login
              </Link>

              <Link to="/login" style={styles.footerLink}>
                Doctor Login
              </Link>

              <Link to="/login" style={styles.footerLink}>
                Admin Login
              </Link>

            </div>


            <div>

              <h4 style={styles.footerTitle}>
                Contact
              </h4>

              <p style={styles.footerContact}>
                📍 Headquarters, Colombo, Sri Lanka
              </p>

              <p style={styles.footerContact}>
                ✉ vetoracare@gmail.com
              </p>

              <p style={styles.footerContact}>
                ☎ +94 71 322 7926
              </p>

            </div>

          </div>


          <div style={styles.footerBottom}>

            <span>
              © 2026 VETORA. All rights reserved.
            </span>

            <span>
              Veterinary Healthcare Management System
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
};


/* ================= FEATURE CARD ================= */

const FeatureCard = ({ icon, title, text }) => (
  <div style={styles.featureCard}>

    <div style={styles.featureIcon}>
      {icon}
    </div>

    <h3 style={styles.cardTitle}>
      {title}
    </h3>

    <p style={styles.cardText}>
      {text}
    </p>

  </div>
);


/* ================= SERVICE CARD ================= */

const ServiceCard = ({ number, icon, title, text }) => (
  <div style={styles.serviceCard}>

    <div style={styles.serviceTop}>

      <span style={styles.serviceNumber}>
        {number}
      </span>

      <span style={styles.serviceIcon}>
        {icon}
      </span>

    </div>

    <h3 style={styles.serviceTitle}>
      {title}
    </h3>

    <p style={styles.serviceText}>
      {text}
    </p>

    <span style={styles.serviceArrow}>
      →
    </span>

  </div>
);


/* ================= STEP ================= */

const Step = ({ number, icon, title, text }) => (
  <div style={styles.step}>

    <div style={styles.stepNumber}>
      {number}
    </div>

    <div style={styles.stepIcon}>
      {icon}
    </div>

    <h3 style={styles.stepTitle}>
      {title}
    </h3>

    <p style={styles.stepText}>
      {text}
    </p>

  </div>
);


/* ================= DOCTOR CARD ================= */

const DoctorCard = ({
  image,
  name,
  specialty,
  experience,
  rating,
}) => (
  <div style={styles.doctorCard}>

    <div style={styles.doctorImageWrapper}>

      <img
        src={image}
        alt={name}
        style={styles.doctorImage}
      />

      <span style={styles.verified}>
        ✓ Verified
      </span>

    </div>

    <div style={styles.doctorInfo}>

      <h3 style={styles.doctorName}>
        {name}
      </h3>

      <p style={styles.doctorSpecialty}>
        {specialty}
      </p>

      <div style={styles.doctorMeta}>

        <span>
          ⭐ {rating}
        </span>

        <span>
          {experience}
        </span>

      </div>

      <Link to="/login" style={styles.doctorLink}>
        View Profile →
      </Link>

    </div>

  </div>
);


/* ================= STYLES ================= */

const styles = {

  /* ================= GLOBAL ================= */

  page: {
    backgroundColor: "#F8FAFC",
    color: "#1E293B",
    minHeight: "100vh",
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    overflowX: "hidden",
  },

  container: {
    width: "90%",
    maxWidth: "1200px",
    margin: "0 auto",
  },


  /* ================= NAVBAR ================= */

  header: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    backgroundColor: "#1D3557",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 4px 20px rgba(15,23,42,0.08)",
  },

  navbar: {
    width: "90%",
    maxWidth: "1250px",
    margin: "0 auto",
    minHeight: "76px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    textDecoration: "none",
    color: "#FFFFFF",
    fontSize: "25px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    letterSpacing: "-0.5px",
  },

  logoIcon: {
    fontSize: "27px",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
  },

  navLinksMobileActive: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    top: "76px",
    left: 0,
    width: "100%",
    backgroundColor: "#1D3557",
    padding: "22px 0",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
  },

  navLink: {
    color: "#E2E8F0",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },

  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  loginBtn: {
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    padding: "10px 16px",
  },

  signupBtn: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    textDecoration: "none",
    padding: "11px 21px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 6px 14px rgba(37,99,235,0.25)",
  },

  hamburger: {
    display: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#FFFFFF",
    marginLeft: "10px",
  },


  /* ================= HERO ================= */

  hero: {
    position: "relative",
    minHeight: "760px",
    display: "flex",
    alignItems: "center",
    backgroundImage: "url('/hero-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    paddingTop: "75px",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(29,53,87,0.96) 0%, rgba(29,53,87,0.82) 45%, rgba(29,53,87,0.30) 100%)",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
    width: "90%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  heroTag: {
    display: "inline-block",
    padding: "8px 15px",
    borderRadius: "30px",
    backgroundColor: "rgba(96,165,250,0.15)",
    border: "1px solid rgba(96,165,250,0.35)",
    color: "#BFDBFE",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "22px",
    letterSpacing: "0.3px",
  },

  heroTitle: {
    fontSize: "52px",
    lineHeight: "1.1",
    maxWidth: "700px",
    margin: "0 0 24px",
    fontWeight: "800",
    letterSpacing: "-1.5px",
    color: "#FFFFFF",
  },

  greenText: {
    color: "#60A5FA",
  },

  heroText: {
    maxWidth: "650px",
    color: "#E2E8F0",
    fontSize: "16px",
    lineHeight: "1.8",
    marginBottom: "34px",
  },

  heroButtons: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },

  primaryLink: {
    textDecoration: "none",
  },

  secondaryLink: {
    textDecoration: "none",
  },

  primaryBtn: {
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    padding: "14px 25px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(37,99,235,0.30)",
  },

  secondaryBtn: {
    border: "1px solid rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    padding: "14px 25px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    backdropFilter: "blur(8px)",
  },

  heroStats: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    marginTop: "55px",
  },

  statNumber: {
    display: "block",
    fontSize: "20px",
    fontWeight: "700",
    color: "#FFFFFF",
  },

  statText: {
    color: "#CBD5E1",
    fontSize: "12px",
  },

  statDivider: {
    height: "35px",
    width: "1px",
    backgroundColor: "rgba(255,255,255,0.20)",
  },


  /* ================= SECTIONS ================= */

  whySection: {
    padding: "95px 0",
    backgroundColor: "#FFFFFF",
  },

  servicesSection: {
    padding: "100px 0",
    backgroundColor: "#F8FAFC",
  },

  howSection: {
    padding: "100px 0",
    backgroundColor: "#FFFFFF",
  },

  doctorsSection: {
    padding: "100px 0",
    backgroundColor: "#F8FAFC",
  },

  aboutSection: {
    padding: "110px 0",
    backgroundColor: "#FFFFFF",
  },

  sectionHeading: {
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto 55px",
  },

  sectionTag: {
    color: "#2563EB",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  sectionTitle: {
    fontSize: "36px",
    margin: "10px 0 14px",
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: "-0.5px",
  },

  sectionDescription: {
    color: "#64748B",
    lineHeight: "1.8",
    fontSize: "15px",
  },


  /* ================= FEATURES ================= */

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "22px",
  },

  featureCard: {
    padding: "30px 25px",
    borderRadius: "16px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  featureIcon: {
    width: "55px",
    height: "55px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    fontSize: "25px",
    marginBottom: "20px",
  },

  cardTitle: {
    fontSize: "17px",
    margin: "0 0 10px",
    fontWeight: "700",
    color: "#0F172A",
  },

  cardText: {
    color: "#64748B",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0,
  },


  /* ================= SERVICES ================= */

  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "22px",
  },

  serviceCard: {
    position: "relative",
    padding: "28px",
    borderRadius: "16px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  },

  serviceTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  serviceNumber: {
    color: "#94A3B8",
    fontSize: "12px",
    fontWeight: "700",
  },

  serviceIcon: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    fontSize: "24px",
  },

  serviceTitle: {
    fontSize: "18px",
    margin: "22px 0 9px",
    color: "#0F172A",
    fontWeight: "700",
  },

  serviceText: {
    color: "#64748B",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0,
  },

  serviceArrow: {
    display: "block",
    color: "#2563EB",
    fontSize: "19px",
    marginTop: "20px",
    fontWeight: "700",
  },


  /* ================= HOW IT WORKS ================= */

  stepsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "22px",
  },

  step: {
    padding: "30px 25px",
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  stepNumber: {
    color: "#2563EB",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  stepIcon: {
    width: "62px",
    height: "62px",
    margin: "18px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    fontSize: "30px",
  },

  stepTitle: {
    fontSize: "17px",
    margin: "0 0 9px",
    color: "#0F172A",
    fontWeight: "700",
  },

  stepText: {
    color: "#64748B",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0,
  },


  /* ================= DOCTORS ================= */

  doctorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "22px",
  },

  doctorCard: {
    overflow: "hidden",
    borderRadius: "16px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  },

  doctorImageWrapper: {
    position: "relative",
    height: "280px",
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },

  doctorImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  verified: {
    position: "absolute",
    top: "14px",
    right: "14px",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
    boxShadow: "0 4px 10px rgba(15,23,42,0.15)",
  },

  doctorInfo: {
    padding: "22px",
  },

  doctorName: {
    fontSize: "17px",
    margin: "0 0 5px",
    color: "#0F172A",
    fontWeight: "700",
  },

  doctorSpecialty: {
    color: "#2563EB",
    fontSize: "12px",
    margin: "0 0 15px",
    fontWeight: "600",
  },

  doctorMeta: {
    display: "flex",
    justifyContent: "space-between",
    color: "#64748B",
    fontSize: "11px",
    marginBottom: "18px",
  },

  doctorLink: {
    color: "#2563EB",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: "700",
  },

  viewDoctorsWrapper: {
    textAlign: "center",
    marginTop: "45px",
  },

  outlineBtn: {
    padding: "12px 24px",
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #2563EB",
    color: "#2563EB",
    fontWeight: "700",
    cursor: "pointer",
  },


  /* ================= ABOUT ================= */

  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "50px",
    alignItems: "center",
  },

  aboutImageWrapper: {
    position: "relative",
  },

  aboutImage: {
    width: "100%",
    height: "420px",
    objectFit: "cover",
    borderRadius: "20px",
  },

  aboutFloatingCard: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 20px",
    borderRadius: "14px",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 15px 35px rgba(15,23,42,0.12)",
    border: "1px solid #E2E8F0",
  },

  floatingIcon: {
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    fontSize: "23px",
  },

  floatingTitle: {
    display: "block",
    fontSize: "14px",
    color: "#0F172A",
    fontWeight: "700",
  },

  floatingText: {
    display: "block",
    color: "#2563EB",
    fontSize: "11px",
    marginTop: "2px",
  },

  aboutTitle: {
    fontSize: "36px",
    lineHeight: "1.2",
    margin: "12px 0 22px",
    color: "#0F172A",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  aboutText: {
    color: "#64748B",
    fontSize: "14px",
    lineHeight: "1.8",
    marginBottom: "17px",
  },

  aboutPoints: {
    marginTop: "25px",
  },

  aboutPoint: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "13px",
    color: "#475569",
    fontSize: "14px",
  },

  check: {
    width: "22px",
    height: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    fontWeight: "800",
    fontSize: "12px",
  },


  /* ================= DOCTOR CTA ================= */

  doctorCTA: {
    padding: "45px 0",
    backgroundColor: "#FFFFFF",
  },

  ctaBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    padding: "45px",
    borderRadius: "20px",
    backgroundColor: "#1D3557",
    color: "#FFFFFF",
    boxShadow: "0 18px 40px rgba(29,53,87,0.16)",
  },

  ctaTag: {
    color: "#60A5FA",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  ctaTitle: {
    fontSize: "27px",
    margin: "8px 0 10px",
    color: "#FFFFFF",
    fontWeight: "700",
  },

  ctaText: {
    maxWidth: "650px",
    color: "#E2E8F0",
    fontSize: "14px",
    lineHeight: "1.7",
    margin: 0,
  },

  ctaButton: {
    whiteSpace: "nowrap",
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    padding: "14px 24px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(37,99,235,0.30)",
  },


  /* ================= FINAL CTA ================= */

  finalCTA: {
    padding: "100px 0",
    backgroundColor: "#EFF6FF",
  },

  finalContent: {
    textAlign: "center",
  },

  finalTitle: {
    fontSize: "44px",
    lineHeight: "1.15",
    margin: "12px 0 17px",
    color: "#0F172A",
    fontWeight: "800",
    letterSpacing: "-1px",
  },

  finalText: {
    color: "#64748B",
    maxWidth: "550px",
    margin: "0 auto 28px",
    lineHeight: "1.7",
    fontSize: "14px",
  },


  /* ================= FOOTER ================= */

  footer: {
    backgroundColor: "#1D3557",
    padding: "70px 0 25px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "35px",
    paddingBottom: "45px",
  },

  footerLogo: {
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "23px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  footerDescription: {
    color: "#94A3B8",
    fontSize: "13px",
    lineHeight: "1.7",
    marginTop: "15px",
    maxWidth: "300px",
  },

  footerTitle: {
    fontSize: "14px",
    marginBottom: "18px",
    color: "#FFFFFF",
    fontWeight: "700",
  },

  footerLink: {
    display: "block",
    color: "#CBD5E1",
    textDecoration: "none",
    fontSize: "13px",
    marginBottom: "10px",
  },

  footerContact: {
    color: "#CBD5E1",
    fontSize: "12px",
    lineHeight: "1.7",
    margin: "0 0 10px",
  },

  footerBottom: {
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: "22px",
    textAlign: "center",
    color: "#94A3B8",
    fontSize: "11px",
  },
};

export default Home;