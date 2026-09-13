import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPaw, FaArrowRight, FaStar, FaHeart, FaUserMd, FaLock, FaClock,
  FaDog, FaBell, FaFileMedicalAlt, FaCalendarCheck, FaSyringe,
  FaCheckCircle, FaPhoneAlt, FaPrescriptionBottleAlt, FaSearch, FaQuoteLeft,
  FaMapMarkerAlt, FaEnvelope, FaPaperPlane, FaFacebookF, FaTwitter,
  FaInstagram, FaLinkedinIn, FaChevronDown,
} from 'react-icons/fa';
import VetoraLogo from '../components/common/VetoraLogo';

/* ---------- Animation presets ---------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ---------- Animated counter for stats ---------- */
function Counter({ value, suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    let frame;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) frame = requestAnimationFrame(step);
      else setCount(value);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const aboutFeatures = [
  { icon: FaFileMedicalAlt, title: 'Digital Records', desc: 'Full medical history, always accessible', bg: 'bg-purple-100', text: 'text-purple-600' },
  { icon: FaCalendarCheck, title: 'Easy Booking', desc: 'Schedule visits in just a few taps', bg: 'bg-blue-100', text: 'text-blue-600' },
  { icon: FaSyringe, title: 'Vaccination Tracking', desc: 'Stay ahead of every due date', bg: 'bg-orange-100', text: 'text-orange-600' },
  { icon: FaUserMd, title: 'Verified Doctors', desc: 'Only credentialed veterinarians', bg: 'bg-primary-100', text: 'text-primary-600' },
];

const whyChooseList = [
  'One-tap appointment booking',
  'Secure, cloud-based medical records',
  'Automated vaccination reminders',
  'Direct access to verified veterinarians',
];

const mainServices = [
  {
    img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=500&fit=crop&q=80',
    icon: FaCalendarCheck,
    title: 'Book Appointments',
    desc: 'Find and book trusted veterinarians near you in minutes.',
  },
  {
    img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=500&fit=crop&q=80',
    icon: FaFileMedicalAlt,
    title: 'Medical Records',
    desc: 'Your pet’s complete visit history, always at your fingertips.',
  },
  {
    img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&h=500&fit=crop&q=80',
    icon: FaSyringe,
    title: 'Vaccinations',
    desc: 'Track every dose and get reminded before it’s due.',
  },
];

const miniServices = [
  { icon: FaPrescriptionBottleAlt, title: 'E-Prescriptions', bg: 'bg-pink-100', text: 'text-pink-600' },
  { icon: FaBell, title: 'Smart Reminders', bg: 'bg-red-100', text: 'text-red-600' },
  { icon: FaSearch, title: 'Find A Vet', bg: 'bg-blue-100', text: 'text-blue-600' },
];

const testimonials = [
  {
    name: 'Amara Silva',
    role: 'Dog Owner',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: 'Booking appointments used to be a hassle. Now I do it in seconds and get reminders before every vaccine is due.',
  },
  {
    name: 'Ruwan Perera',
    role: 'Cat Parent',
    avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
    text: 'Having all of my cat’s medical records in one app gives me real peace of mind, especially during emergencies.',
  },
  {
    name: 'Dr. Nadeesha Fonseka',
    role: 'Verified Vet',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'Vetora keeps my schedule organized and lets me focus on patients instead of paperwork.',
  },
];

const Home = () => {
  const location = useLocation();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [subscribeEmail, setSubscribeEmail] = useState('');

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(timer);
  }, [location]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Message sent! Our team will get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeEmail) {
      toast.error('Enter your email to subscribe');
      return;
    }
    toast.success('Subscribed! Watch your inbox for pet care tips.');
    setSubscribeEmail('');
  };

  return (
    <div className="-mt-16 sm:-mt-20">
      {/* ============ HERO SECTION ============ */}
      <section className="full-bleed relative overflow-hidden min-h-[680px] sm:min-h-[750px] flex items-center pt-24 pb-28 sm:pb-32 bg-ink-950">
        
        {/* Full Image Background */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: 'easeOut' }}
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1600&auto=format&fit=crop&q=80"
            alt="Veterinarian with pet"
            className="w-full h-full object-cover object-[10%_20%]"
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-ink-950 via-ink-950/85 to-transparent w-full md:w-4/5 ml-auto" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="page-container relative z-10 flex justify-end w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl text-right flex flex-col items-end pt-6"
          >
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold text-white mb-6 shadow-sm"
            >
              Trusted by 1,000+ Pet Owners <FaPaw className="text-accent-300" />
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] text-white mb-6 tracking-tight"
            >
              Complete Care for Your <span className="text-accent-300 drop-shadow-sm">Beloved Pet</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants} 
              className="text-white/85 text-base sm:text-lg mb-8 leading-relaxed max-w-lg"
            >
              Book appointments, track vaccinations, and manage medical records—all in one place with Vetora, your pet’s digital health companion.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-end gap-4 mb-8">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="btn-base btn-lg bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all shadow-md"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="btn-primary btn-lg group shadow-xl">
                  Get Started Free
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-end gap-3 mt-2">
              <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-white shadow-md"
              >
                <FaStar className="text-accent-400 text-sm" />
                <span className="text-xs font-bold">4.9 <span className="text-white/70 font-normal">/ 5.0 Rating</span></span>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-white shadow-md"
              >
                <span className="w-6 h-6 rounded-lg bg-primary-500/80 flex items-center justify-center text-white text-xs">
                  <FaDog />
                </span>
                <span className="text-xs font-bold">500+ <span className="text-white/70 font-normal">Happy Pets</span></span>
              </motion.div>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="flex flex-wrap justify-end gap-x-6 gap-y-2 text-xs text-white/70 font-medium border-t border-white/10 pt-4 mt-6"
            >
              <span className="flex items-center gap-1.5"><FaLock className="text-accent-300" /> Secure &amp; Private</span>
              <span className="flex items-center gap-1.5"><FaUserMd className="text-accent-300" /> Verified Vets</span>
              <span className="flex items-center gap-1.5"><FaClock className="text-accent-300" /> 24/7 Access</span>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-white/50"
        >
          <span className="text-[10px] font-semibold tracking-widest uppercase">Scroll Down</span>
          <FaChevronDown className="text-xs" />
        </motion.div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <div className="page-container relative -mt-16 sm:-mt-20 z-20 mb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="card-hover text-center py-8 bg-white rounded-2xl shadow-card border border-ink-100">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              <FaUserMd />
            </div>
            <h3 className="font-bold text-ink-800 mb-1">Verified Veterinarians</h3>
            <p className="text-ink-500 text-sm">Every doctor on Vetora is credential-checked before approval</p>
          </motion.div>

          <motion.div variants={itemVariants} className="card-hover text-center py-8 bg-white rounded-2xl shadow-card border border-ink-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              <FaBell />
            </div>
            <h3 className="font-bold text-ink-800 mb-1">Smart Reminders</h3>
            <p className="text-ink-500 text-sm">Never miss a vaccination or follow-up appointment again</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-center text-white shadow-glow flex flex-col items-center justify-center"
          >
            <h3 className="font-bold text-lg mb-1">Ready to Book?</h3>
            <p className="text-primary-100 text-sm mb-4">Find a trusted vet near you in minutes</p>
            <Link to="/register" className="bg-white text-primary-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary-50 transition-colors shadow-md">
              Get Started &rarr;
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ============ ABOUT ============ */}
      <section id="about" className="page-container grid lg:grid-cols-2 gap-14 items-center mb-24 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative order-2 lg:order-1"
        >
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-accent-300 rounded-full opacity-70 blur-md pointer-events-none" />
          
          <img
            src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80"
            alt="Dog receiving care"
            className="rounded-3xl shadow-elevated w-4/5 h-80 object-cover object-[center_20%]"
          />
          
          <img
            src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&h=380&fit=crop&q=80"
            alt="Dog portrait"
            className="absolute -bottom-8 -right-2 rounded-2xl shadow-elevated w-2/5 h-44 object-cover object-center border-4 border-white"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-1 lg:order-2"
        >
          <span className="text-primary-600 font-bold text-sm uppercase tracking-wide mb-2 inline-block">About Vetora</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-ink-900 mb-4">
            Your Pet&rsquo;s Health, All In One Place
          </h2>
          <p className="text-ink-500 mb-8">
            From the first vaccine to a lifetime of check-ups, Vetora keeps every record, appointment and
            prescription organized &mdash; so you and your vet always have the full picture.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {aboutFeatures.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <span className={`w-11 h-11 rounded-xl ${f.bg} ${f.text} flex items-center justify-center shrink-0`}>
                    <Icon />
                  </span>
                  <div>
                    <p className="font-bold text-ink-800 text-sm">{f.title}</p>
                    <p className="text-ink-500 text-xs">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link to="/register" className="btn-primary group">
            Create Free Account
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="page-container grid lg:grid-cols-2 gap-14 items-center mb-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src="https://images.unsplash.com/photo-1587764379873-97837921fd44?w=800&auto=format&fit=crop&q=80"
            alt="Veterinary team caring for a pet"
            className="rounded-3xl shadow-elevated w-full h-[450px] object-cover object-top"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-primary-600 font-bold text-sm uppercase tracking-wide mb-2 inline-block">Why Choose Us</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-ink-900 mb-4">
            We Help Give Your Pet A Healthier Life
          </h2>
          <p className="text-ink-500 mb-6">
            Vetora brings pet owners, doctors and clinics onto a single trusted platform &mdash; built to make
            healthcare simple, transparent and always within reach.
          </p>

          <ul className="grid sm:grid-cols-2 gap-3 mb-8">
            {whyChooseList.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-ink-700 font-medium">
                <FaCheckCircle className="text-primary-500 shrink-0" /> {item}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-4 mb-8 pt-6 border-t border-ink-100">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-600 font-display">
                <Counter value={1198} suffix="+" />
              </p>
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">Pets Registered</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-600 font-display">
                <Counter value={3245} suffix="+" />
              </p>
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">Appointments</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-600 font-display">
                <Counter value={98} suffix="%" />
              </p>
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">Satisfaction</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center shrink-0">
                <FaPhoneAlt />
              </span>
              <div>
                <p className="text-xs text-ink-400">Need help getting started?</p>
                <p className="font-bold text-ink-800 text-sm">Contact our support team</p>
              </div>
            </div>
            <Link to="/register" className="btn-outline">Join Now</Link>
          </div>
        </motion.div>
      </section>

      {/* ============ PARALLAX DOCTOR SECTION (DARK OVERLAY) ============ */}
      <section 
        className="relative h-[420px] sm:h-[520px] bg-fixed bg-center bg-cover flex items-center justify-center my-24 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1770836037793-95bdbf190f71?w=1600&auto=format&fit=crop&crop=entropy&q=80')`
        }}
      >
        {/* Dark Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-black/85" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="text-accent-400 font-bold text-xs sm:text-sm uppercase tracking-widest mb-3 block">
            Expert Veterinary Care
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display mb-4 leading-tight">
            Professional Healthcare For Your Loved Ones
          </h2>
          
          <p className="text-white/80 text-sm sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Our team of experienced and verified veterinarians are dedicated to keeping your pets healthy and happy.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary shadow-lg inline-flex items-center gap-2">
              Book Appointment <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="full-bleed bg-primary-50/60 py-20 mb-24 scroll-mt-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-primary-600 font-bold text-sm uppercase tracking-wide">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-ink-900 mt-2 mb-3">
              Everything Your Pet Needs
            </h2>
            <p className="text-ink-500">
              From routine check-ups to emergency care, manage it all from a single dashboard.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid md:grid-cols-3 gap-8 mb-10"
          >
            {mainServices.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl shadow-card hover:shadow-elevated transition-all overflow-hidden group border border-ink-100"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={s.img}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 pt-8 relative">
                    <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center text-lg absolute -top-6 left-6 shadow-glow">
                      <Icon />
                    </div>
                    <h3 className="font-bold text-lg text-ink-900 mb-1">{s.title}</h3>
                    <p className="text-ink-500 text-sm mb-3">{s.desc}</p>
                    <Link to="/register" className="text-primary-600 text-sm font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
                      Learn more <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid sm:grid-cols-3 gap-5"
          >
            {miniServices.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="card bg-white p-5 rounded-2xl flex items-center gap-4 border border-ink-100 hover:shadow-elevated transition-all"
                >
                  <span className={`w-12 h-12 rounded-xl ${f.bg} ${f.text} flex items-center justify-center text-xl shrink-0`}>
                    <Icon />
                  </span>
                  <p className="font-bold text-ink-800">{f.title}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="full-bleed bg-gradient-to-br from-ink-900 via-primary-950 to-ink-900 py-20 mb-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white, transparent 35%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="page-container relative text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-accent-400 font-bold text-sm uppercase tracking-wide">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2 mb-3">
            What Pet Owners Say
          </h2>
          <p className="text-white/60">Real experiences from the Vetora community.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="page-container relative grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, idx) => (
            <motion.div key={idx} variants={itemVariants} className="bg-white rounded-2xl p-7 text-left shadow-lg">
              <FaQuoteLeft className="text-primary-200 text-3xl mb-4" />
              <p className="text-ink-600 text-sm mb-6">{t.text}</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-ink-200" />
                <div>
                  <p className="font-bold text-ink-900 text-sm">{t.name}</p>
                  <p className="text-ink-400 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============ CONTACT US ============ */}
      <section id="contact" className="page-container grid lg:grid-cols-2 gap-10 items-stretch mb-24 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-xl"
        >
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-accent-300 font-bold text-sm uppercase tracking-wide mb-2 inline-block">Contact Us</span>
            <h2 className="text-3xl font-extrabold font-display mb-4">
              Don&rsquo;t Hesitate To Reach Out
            </h2>
            <p className="text-primary-100 mb-8 relative z-10">
              Have a question about booking, records or your account? Our team is happy to help
              &mdash; reach us any way that&rsquo;s convenient for you.
            </p>
          </div>

          <div className="space-y-5 relative z-10">
            <div className="flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <FaMapMarkerAlt />
              </span>
              <div>
                <p className="text-xs text-primary-200">Our Location</p>
                <p className="font-semibold">Colombo, Sri Lanka</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <FaEnvelope />
              </span>
              <div>
                <p className="text-xs text-primary-200">Email Us</p>
                <p className="font-semibold">support@vetora.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <FaPhoneAlt />
              </span>
              <div>
                <p className="text-xs text-primary-200">Call Us</p>
                <p className="font-semibold">+94 76 123 4567</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="card bg-white p-8 rounded-3xl shadow-card border border-ink-100"
        >
          <h3 className="font-bold text-xl text-ink-900 mb-1">Send Us a Message</h3>
          <p className="text-ink-500 text-sm mb-6">We usually reply within one business day.</p>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label block text-xs font-bold text-ink-700 mb-1">Name</label>
                <input
                  type="text"
                  className="input-field w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label block text-xs font-bold text-ink-700 mb-1">Email</label>
                <input
                  type="email"
                  className="input-field w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group mb-0">
              <label className="form-label block text-xs font-bold text-ink-700 mb-1">Message</label>
              <textarea
                className="textarea-field w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm h-32"
                placeholder="How can we help?"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full sm:w-auto"
            >
              Send Message <FaPaperPlane className="text-sm ml-2" />
            </motion.button>
          </form>
        </motion.div>
      </section>

      {/* ============ CTA ============ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="page-container bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl relative overflow-hidden mb-4"
      >
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-accent-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
            <FaHeart className="text-5xl text-accent-300 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Ready to get started?</h2>
          <p className="text-primary-100 mb-8 text-lg font-light">
            Join thousands of pet owners who trust Vetora for their pet&rsquo;s healthcare
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link to="/register" className="bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold hover:bg-primary-50 transition-colors shadow-xl inline-flex items-center gap-2 group">
              Create Your Account Now
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ============ FOOTER ============ */}
      <footer className="full-bleed bg-ink-950 text-white/70 mt-24 pt-16 pb-8">
        <div className="page-container grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-white font-display mb-4">
              <span className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                <VetoraLogo className="w-5 h-5 text-white" />
              </span>
              VETORA
            </Link>
            <p className="text-sm mb-5 max-w-xs">
              Your trusted veterinary appointment and pet healthcare management platform.
            </p>
            <div className="flex gap-3">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary-600 flex items-center justify-center transition-colors text-white"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/#services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary-400 shrink-0" /> Colombo, Sri Lanka</li>
              <li className="flex items-center gap-2"><FaEnvelope className="text-primary-400 shrink-0" /> support@vetora.com</li>
              <li className="flex items-center gap-2"><FaPhoneAlt className="text-primary-400 shrink-0" /> +94 76 123 4567</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Get pet care tips and product updates in your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your Email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="bg-primary-600 hover:bg-primary-500 transition-colors px-4 rounded-xl shrink-0 text-white">
                <FaArrowRight />
              </button>
            </form>
          </div>
        </div>

        <div className="page-container pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Vetora. All rights reserved.</p>
          <p>Made with <FaHeart className="inline text-primary-500 mx-1" /> for pets everywhere.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;














