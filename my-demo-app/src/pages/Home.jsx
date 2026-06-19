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
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
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

        {/* Desktop Auth Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <>
              <button
                onClick={() => navigate(user.role === 'patient' ? '/patient' : (user.role === 'clinic_admin' ? '/clinic' : (user.role === 'therapist' ? '/therapist' : '/superadmin')))}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(37,99,235,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <User size={16} />
                {user.role === 'patient' ? 'My Profile' : 'Dashboard'}
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  padding: '0.65rem 1rem',
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(37,99,235,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Clinic Login
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Hero Section ───────────────────────────────────────── */
function Hero({ onSignupClick, onLoginClick }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#f8fafc',
        padding: '2rem 1rem',
      }}
    >
      <AnimatedBackground />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '900px',
          textAlign: 'center',
        }}
      >
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
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.2,
            marginBottom: '1.5rem',
          }}
        >
          Manage Your Clinic<br />
          <span style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Effortlessly
          </span>
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: '1.25rem',
            color: '#64748b',
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: 1.6,
          }}
        >
          Complete clinic management platform: staff scheduling, online bookings, patient messaging, SOAP notes, payments and multi-branch operations.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={onSignupClick}
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(37,99,235,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Register Clinic <ArrowRight size={20} />
          </button>

          <button
            onClick={onLoginClick}
            style={{
              padding: '1rem 2.5rem',
              background: 'transparent',
              color: '#2563eb',
              border: '2px solid #2563eb',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1.05rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#dbeafe';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            Clinic Sign In
          </button>
        </div>



        {/* Trust Indicator */}
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          No credit card required • 1 month free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}

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
    <section
      id="features"
      style={{
        padding: '5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '1rem',
          }}
        >
          Everything You Need to Manage Your Clinic
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
          Comprehensive tools designed specifically for physiotherapy clinics to streamline operations and improve patient care.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              style={{
                padding: '2rem',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Icon
                size={32}
                color="#2563eb"
                style={{
                  marginBottom: '1rem',
                }}
              />
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.75rem',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          );
        })}
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
    <section
      id="how-it-works"
      style={{
        padding: '5rem 2rem',
        background: '#f8fafc',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '1rem',
          }}
        >
          How to Get Started
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
          Set up your clinic in minutes, not hours.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
        }}
      >
        {steps.map((step, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <div
              style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                color: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                marginBottom: '1.5rem',
              }}
            >
              {step.number}
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '0.5rem',
              }}
            >
              {step.title}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Pricing Section ────────────────────────────────────── */
function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(to bottom, #f8fafc, #eff6ff)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: '1rem',
            }}
          >
            Pricing for Your Clinic
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            Every clinic is unique. We provide tailored plans that fit perfectly with your size, requirements, and growth goals.
          </p>
        </div>

        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '4rem 3rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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

            <h3
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '1rem',
              }}
            >
              Get Your Quote
            </h3>

            <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto' }}>
              Contact our sales team today. We'll analyze your needs and provide a transparent, competitive pricing structure.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              <a
                href="mailto:contact@physiobook.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '1.15rem',
                  color: '#2563eb',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '1rem 2rem',
                  background: '#eff6ff',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  width: '100%',
                  maxWidth: '400px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </div>
                contact@physiobook.com
              </a>

              <a
                href="tel:+15551234567"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '1.15rem',
                  color: '#0f172a',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '1rem 2rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  width: '100%',
                  maxWidth: '400px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '8px', display: 'flex', border: '1px solid #e2e8f0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                +1 (555) 123-4567
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

