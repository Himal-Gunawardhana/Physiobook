import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, Calendar, TrendingUp, Shield, Zap, CheckCircle, ArrowRight,
  Clock, BarChart3, Lock, MessageSquare, CreditCard, Menu, X, ChevronDown, User, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


/* ── Animated Background ────────────────────────────────── */
function AnimatedBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.3 + 0.05,
    }));

    const draw = () => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${p.a})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

/* ── Navigation Header ──────────────────────────────────── */
function Header({ onLoginClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header-nav">
      <div className="container header-container">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/physiobook.svg"
            alt="Physiobook Logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              objectFit: 'cover',
            }}
          />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Physiobook
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="header-links">
          <a href="#features" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>
            Features
          </a>
          <a href="#pricing" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>
            Pricing
          </a>
          <a href="#how-it-works" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>
            How It Works
          </a>
        </div>

        {/* Desktop Auth Buttons & Mobile Menu Toggle */}
        <div className="header-actions">
          {user ? (
            <>
              <button
                onClick={() => navigate(user.role === 'patient' ? '/patient' : (user.role === 'clinic_admin' ? '/clinic' : (user.role === 'therapist' ? '/therapist' : '/superadmin')))}
                className="btn-premium"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem' }}
              >
                <User size={16} />
                {user.role === 'patient' ? 'My Profile' : 'Dashboard'}
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn-outline"
                style={{ padding: '0.65rem 1rem' }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button onClick={onLoginClick} className="btn-premium" style={{ padding: '0.75rem 1.5rem' }}>
              Clinic Login
            </button>
          )}

          {/* Mobile Hamburger Icon */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          {!user && (
            <button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="btn-premium" style={{ marginTop: '1rem', justifyContent: 'center' }}>
              Clinic Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}

/* ── Hero Section ───────────────────────────────────────── */
function Hero({ onSignupClick, onLoginClick }) {
  return (
    <section className="hero-section">
      <AnimatedBackground />

      <div className="hero-content">
        {/* Badge */}
        <div
          style={{
            display: 'inline-block',
            background: '#dbeafe',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '2rem',
          }}
        >
          For Physiotherapy Clinics
        </div>

        {/* Main Headline */}
        <h1 className="hero-title">
          Manage Your Clinic<br />
          <span className="gradient-text">
            Effortlessly
          </span>
        </h1>

        {/* Subheading */}
        <p className="hero-subtitle">
          Complete clinic management platform: staff scheduling, online bookings, patient messaging, SOAP notes, payments and multi-branch operations.
        </p>

        {/* CTA Buttons */}
        <div className="hero-buttons">
          <button onClick={onSignupClick} className="btn-premium">
            Register Clinic <ArrowRight size={20} />
          </button>

          <button onClick={onLoginClick} className="btn-outline">
            Clinic Sign In
          </button>
        </div>

        {/* Trust Indicator */}
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '2rem' }}>
          No credit card required • 1 month free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ── Hero Section ───────────────────────────────────────── */


/* ── Features Section ───────────────────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated staff scheduling, real-time slot management, therapist availability, and intelligent therapist auto-assignment.',
    },
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Patient profiles, appointment history, automated booking confirmations, and patient feedback/ratings system.',
    },
    {
      icon: MessageSquare,
      title: 'Built-in Messaging',
      description: 'Direct patient-therapist communication, session reminders, and real-time notifications.',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track therapist ratings, revenue metrics, clinic statistics, and business insights.',
    },
    {
      icon: CreditCard,
      title: 'Payment Processing',
      description: 'Secure online payments, payment tracking, invoice generation, and refund management.',
    },
    {
      icon: Lock,
      title: 'HIPAA Compliant',
      description: 'Secure SOAP clinical notes, encrypted patient data, role-based access control.',
    },
  ];

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Everything You Need to Manage Your Clinic
          </h2>
          <p className="section-subtitle">
            Comprehensive tools designed specifically for physiotherapy clinics to streamline operations and improve patient care.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Icon size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works Section ───────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Sign Up Your Clinic',
      description: 'Create your clinic account and set up basic information.',
    },
    {
      number: '2',
      title: 'Onboard Your Staff',
      description: 'Add therapists and staff members with their availability schedules.',
    },
    {
      number: '3',
      title: 'Configure Services',
      description: 'Set up your services, pricing, and duration options.',
    },
    {
      number: '4',
      title: 'Start Accepting Bookings',
      description: 'Patients book appointments directly through your clinic page.',
    },
  ];

  return (
    <section id="how-it-works" className="steps-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How to Get Started</h2>
          <p className="section-subtitle">Set up your clinic in minutes, not hours.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                {step.title}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing Section ────────────────────────────────────── */
function PricingSection() {
  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Pricing for Your Clinic</h2>
          <p className="section-subtitle">
            Every clinic is unique. We provide tailored plans that fit perfectly with your size, requirements, and growth goals.
          </p>
        </div>

        <div className="pricing-card">
          {/* Decorative Background Elements */}
          <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: '#dbeafe', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', background: '#e0e7ff', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }}></div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 2rem',
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                transform: 'rotate(-5deg)',
                boxShadow: '0 10px 25px rgba(37,99,235,0.3)',
              }}
            >
              <MessageSquare size={36} style={{ transform: 'rotate(5deg)' }} />
            </div>

            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Get Your Quote
            </h3>

            <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto' }}>
              Contact our sales team today. We'll analyze your needs and provide a transparent, competitive pricing structure.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              <a
                href="mailto:info@itselfcare.com"
                className="btn-outline"
                style={{ width: '100%', maxWidth: '400px', justifyContent: 'center', background: '#eff6ff', border: 'none', color: '#2563eb' }}
              >
                <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '8px', display: 'flex', marginRight: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </div>
                info@itselfcare.com
              </a>

              <a
                href="tel:+94 70 282 8400"
                className="btn-outline"
                style={{ width: '100%', maxWidth: '400px', justifyContent: 'center', background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}
              >
                <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '8px', display: 'flex', border: '1px solid #e2e8f0', marginRight: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                +94 70 282 8400
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '3rem 2rem',
        textAlign: 'center',
        fontSize: '0.9rem',
      }}
    >
      <p style={{ marginBottom: '0.5rem' }}>© 2024 Physiobook. All rights reserved.</p>
      <p>
        <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', marginRight: '2rem' }}>
          Privacy Policy
        </a>
        <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>
          Terms of Service
        </a>
      </p>
    </footer>
  );
}

/* ── Main Export ────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/register/clinic');
  };

  const handleLogin = () => {
    navigate('/login/clinic');
  };

  return (
    <div style={{ background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <Header onLoginClick={handleLogin} />
      <Hero onSignupClick={handleSignup} onLoginClick={handleLogin} />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <Footer />
    </div>
  );
}

