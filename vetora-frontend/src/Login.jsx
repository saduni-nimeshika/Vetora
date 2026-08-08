import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  /* =========================================================
     CLEAR PREVIOUS LOGIN SESSION
  ========================================================= */

  useEffect(() => {
    localStorage.removeItem("user");
  }, []);

  /* =========================================================
     HANDLE INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (message.text) {
      setMessage({
        type: "",
        text: "",
      });
    }
  };

  /* =========================================================
     HANDLE LOGIN
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/users/login",
        formData
      );

      const userData = response.data;

      /* Save logged-in user */
      localStorage.setItem("user", JSON.stringify(userData));

      setMessage({
        type: "success",
        text: "Welcome back! Login successful.",
      });

      /* Navigate according to role */
      setTimeout(() => {
        if (userData.role === "ADMIN") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }, 700);
    } catch (error) {
      let errorMessage =
        "Invalid email or password. Please try again.";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">

      {/* =====================================================
          LEFT SIDE - VETORA BRAND / HERO
      ===================================================== */}

      <div
        className="
          hidden
          lg:flex
          lg:w-[58%]
          xl:w-[60%]
          min-h-screen
          relative
          overflow-hidden
          bg-cover
          bg-center
        "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=85&w=1800&auto=format&fit=crop')",
        }}
      >

        {/* Dark Blue Overlay */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#1D3557]/95
            via-[#1D3557]/75
            to-[#1D3557]/40
          "
        />

        {/* Bottom Overlay */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-80
            bg-gradient-to-t
            from-[#0F172A]/90
            to-transparent
          "
        />

        {/* Left Content */}

        <div
          className="
            relative
            z-10
            flex
            flex-col
            justify-between
            w-full
            min-h-screen
            p-12
            xl:p-16
          "
        >

          {/* ================= LOGO ================= */}

          <div className="flex items-center gap-4">

            {/* Logo Icon */}

            <div
              className="
                w-14
                h-14
                flex
                items-center
                justify-center
                rounded-2xl
                bg-white/10
                border
                border-white/20
                backdrop-blur-md
                shadow-lg
              "
            >
              <svg
                className="w-8 h-8 text-[#60A5FA]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6 3 3 0 000 6zm-5-1a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
            </div>

            {/* Brand */}

            <div>
              <h1
                className="
                  text-2xl
                  font-extrabold
                  tracking-[0.08em]
                  text-white
                "
              >
                VETORA
              </h1>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  font-semibold
                  tracking-[0.18em]
                  text-[#93C5FD]
                "
              >
                VETERINARY CARE SYSTEM
              </p>
            </div>

          </div>

          {/* ================= HERO CONTENT ================= */}

          <div className="max-w-2xl">

            {/* Trust Badge */}

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                mb-6
                rounded-full
                bg-white/10
                border
                border-white/20
                backdrop-blur-md
                text-[#DBEAFE]
                text-xs
                font-semibold
              "
            >

              <svg
                className="w-4 h-4 text-[#60A5FA]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>

              Trusted Veterinary Care
            </div>

            {/* Main Heading */}

            <h2
              className="
                text-4xl
                xl:text-5xl
                font-extrabold
                leading-[1.12]
                tracking-tight
                text-white
                max-w-xl
              "
            >
              Compassionate Pet Care
              <span className="block text-[#60A5FA]">
                Management, Simplified.
              </span>
            </h2>

            {/* Description */}

            <p
              className="
                mt-6
                max-w-xl
                text-sm
                xl:text-base
                leading-7
                text-slate-200
              "
            >
              Manage appointments, health records, vaccination
              schedules, and pet history through one simple
              veterinary care management system.
            </p>

            {/* Small Features */}

            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8">

              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                Health Records
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                Appointments
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                Vaccination Reminders
              </div>

            </div>

          </div>

          {/* ================= COPYRIGHT ================= */}

          <div>

            <div
              className="
                w-14
                h-px
                bg-[#60A5FA]/50
                mb-4
              "
            />

            <p className="text-xs text-slate-300">
              © 2026 Vetora Systems. All rights reserved.
            </p>

          </div>

        </div>
      </div>


      {/* =====================================================
          RIGHT SIDE - LOGIN AREA
      ===================================================== */}

      <div
        className="
          w-full
          lg:w-[42%]
          xl:w-[40%]
          min-h-screen
          flex
          items-center
          justify-center
          px-6
          py-10
          sm:px-10
          bg-[#F8FAFC]
          relative
        "
      >

        {/* Subtle Background Decoration */}

        <div
          className="
            absolute
            top-0
            right-0
            w-80
            h-80
            bg-[#2563EB]/5
            rounded-full
            blur-3xl
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            w-64
            h-64
            bg-[#60A5FA]/5
            rounded-full
            blur-3xl
            pointer-events-none
          "
        />


        {/* Login Content */}

        <div className="relative z-10 w-full max-w-[430px]">


          {/* ================= MOBILE LOGO ================= */}

          <div
            className="
              flex
              lg:hidden
              items-center
              justify-center
              gap-3
              mb-8
            "
          >

            <div
              className="
                w-11
                h-11
                flex
                items-center
                justify-center
                rounded-xl
                bg-[#EFF6FF]
                border
                border-[#BFDBFE]
              "
            >

              <svg
                className="w-6 h-6 text-[#2563EB]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6 3 3 0 000 6zm-5-1a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>

            </div>

            <div>

              <div
                className="
                  text-xl
                  font-extrabold
                  tracking-wider
                  text-[#1D3557]
                "
              >
                VETORA
              </div>

              <div
                className="
                  text-[9px]
                  font-semibold
                  tracking-widest
                  text-[#2563EB]
                "
              >
                VETERINARY CARE SYSTEM
              </div>

            </div>

          </div>


          {/* ================= LOGIN CARD ================= */}

          <div
            className="
              bg-white
              border
              border-[#E2E8F0]
              rounded-3xl
              p-7
              sm:p-9
              shadow-[0_20px_50px_rgba(15,23,42,0.08)]
            "
          >

            {/* ================= CARD HEADER ================= */}

            <div className="mb-7">

              <div className="flex items-center gap-2 mb-3">

                <div
                  className="
                    w-8
                    h-1
                    rounded-full
                    bg-[#2563EB]
                  "
                />

                <span
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.2em]
                    font-bold
                    text-[#2563EB]
                  "
                >
                  Account Access
                </span>

              </div>

              <h3
                className="
                  text-3xl
                  font-extrabold
                  text-[#0F172A]
                  tracking-tight
                "
              >
                Welcome Back
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-[#64748B]
                  leading-6
                "
              >
                Sign in to access your VETORA account.
              </p>

            </div>


            {/* ================= ALERT ================= */}

            {message.text && (
              <div
                className={`
                  mb-6
                  p-3.5
                  rounded-xl
                  text-xs
                  font-medium
                  border
                  ${
                    message.type === "success"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-red-50 border-red-200 text-red-600"
                  }
                `}
              >

                <div className="flex items-start gap-2">

                  {message.type === "success" ? (
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v4m0 4h.01M10.29 3.86l-8.82 15a2 2 0 001.71 3h17.64a2 2 0 001.71-3l-8.82-15a2 2 0 00-3.42 0z"
                      />
                    </svg>
                  )}

                  <span>{message.text}</span>

                </div>

              </div>
            )}


            {/* ================= LOGIN FORM ================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* ================= EMAIL ================= */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    block
                    mb-2
                    text-xs
                    font-semibold
                    text-[#334155]
                  "
                >
                  Email Address
                </label>

                <div className="relative">

                  {/* Email Icon */}

                  <div
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#94A3B8]
                      pointer-events-none
                    "
                  >

                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>

                  </div>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="
                      w-full
                      pl-12
                      pr-4
                      py-3.5
                      bg-[#F8FAFC]
                      border
                      border-[#CBD5E1]
                      rounded-xl
                      text-[#0F172A]
                      text-sm
                      placeholder-[#94A3B8]
                      outline-none
                      transition-all
                      focus:bg-white
                      focus:border-[#2563EB]
                      focus:ring-4
                      focus:ring-[#2563EB]/10
                    "
                  />

                </div>

              </div>


              {/* ================= PASSWORD ================= */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="password"
                    className="
                      text-xs
                      font-semibold
                      text-[#334155]
                    "
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="
                      text-xs
                      font-semibold
                      text-[#2563EB]
                      hover:text-[#1D4ED8]
                      transition-colors
                    "
                  >
                    Forgot password?
                  </Link>

                </div>


                <div className="relative">

                  {/* Lock Icon */}

                  <div
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#94A3B8]
                      pointer-events-none
                    "
                  >

                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>

                  </div>


                  {/* Password Input */}

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="
                      w-full
                      pl-12
                      pr-12
                      py-3.5
                      bg-[#F8FAFC]
                      border
                      border-[#CBD5E1]
                      rounded-xl
                      text-[#0F172A]
                      text-sm
                      placeholder-[#94A3B8]
                      outline-none
                      transition-all
                      focus:bg-white
                      focus:border-[#2563EB]
                      focus:ring-4
                      focus:ring-[#2563EB]/10
                    "
                  />


                  {/* Show Password */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#94A3B8]
                      hover:text-[#2563EB]
                      transition-colors
                      cursor-pointer
                    "
                  >

                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83M9.88 4.24A9.1 9.1 0 0112 4c7 0 11 8 11 8a18.45 18.45 0 01-2.16 3.19M6.23 6.23C3.82 7.88 2.46 10.12 2.46 12c0 0 4 7 9.54 7 1.61 0 3.08-.41 4.37-1.03"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}

                  </button>

                </div>

              </div>


              {/* ================= LOGIN BUTTON ================= */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  py-3.5
                  mt-2
                  rounded-xl
                  bg-[#2563EB]
                  hover:bg-[#1D4ED8]
                  active:scale-[0.99]
                  text-white
                  font-bold
                  text-sm
                  shadow-lg
                  shadow-[#2563EB]/20
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  cursor-pointer
                "
              >

                {loading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Signing In...
                  </>
                ) : (
                  <>
                    Log In

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}

              </button>

            </form>


            {/* ================= SIGN UP ================= */}

            <div
              className="
                mt-7
                pt-6
                border-t
                border-[#E2E8F0]
                text-center
              "
            >

              <p className="text-sm text-[#64748B]">

                Don't have an account?{" "}

                <Link
                  to="/signup"
                  className="
                    font-bold
                    text-[#2563EB]
                    hover:text-[#1D4ED8]
                    transition-colors
                  "
                >
                  Create an account
                </Link>

              </p>

            </div>

          </div>


          {/* ================= MOBILE COPYRIGHT ================= */}

          <p
            className="
              lg:hidden
              text-center
              text-[10px]
              text-[#94A3B8]
              mt-6
            "
          >
            © 2026 Vetora Systems. All rights reserved.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;