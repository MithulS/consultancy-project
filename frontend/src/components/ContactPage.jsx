import React, { useState } from 'react';
import CommercialHardwareHeader from './CommercialHardwareHeader';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Icons = {
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Message: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  ),
  Tag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  ),
  Pen: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 2 4 4" />
      <path d="m7.5 20.5 14-14a2.828 2.828 0 1 0-4-4l-14 14a2 2 0 0 0-.5.8L2 22l4.2-1.1a2 2 0 0 0 .8-.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);



  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) newErrors.phone = 'Valid phone number is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '', email: '', phone: '', company: '',
          subject: '', message: '', inquiryType: 'general'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <style>
        {`
          .contact-page-wrapper {
            background-color: #0f172a;
            min-height: 100vh;
            color: var(--text-primary, #e2e8f0);
            padding-bottom: 80px;
          }
          
          .contact-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 24px;
            position: relative;
          }
          
          .contact-header {
            text-align: center;
            margin-bottom: 60px;
            position: relative;
            z-index: 10;
          }
          
          .contact-title {
            font-size: clamp(32px, 5vw, 48px);
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
            letter-spacing: -1px;
            text-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
          }
          
          .contact-subtitle {
            font-size: 18px;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          }
          
          .contact-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 40px;
            position: relative;
            z-index: 10;
          }
          
          @media (max-width: 992px) {
            .contact-grid {
              grid-template-columns: 1fr;
              gap: 40px;
            }
          }
          
          .contact-form-card {
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            border-radius: 20px;
            padding: 40px;
            position: relative;
            overflow: hidden;
          }
          
          .contact-form-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%);
          }
          
          .contact-form-title {
            font-size: 24px;
            margin-bottom: 30px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .contact-input-wrapper {
            position: relative;
            margin-bottom: 24px;
          }
          
          .contact-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }
          
          .contact-required {
            color: var(--accent-red-primary, #ef4444);
          }
          
          .input-icon-container {
            position: absolute;
            left: 14px;
            top: 40px;
            color: #94a3b8;
            transition: all 0.3s ease;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
          }
          
          .input-icon-container svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }
          
          .textarea-icon-container {
            top: 44px;
          }
          
          .contact-input {
            width: 100%;
            padding: 14px 16px 14px 44px;
            font-size: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background-color: #1e293b;
            color: var(--text-primary, #e2e8f0);
            border-radius: 12px;
            outline: none;
            transition: all 0.3s ease;
            box-sizing: border-box;
            font-family: inherit;
          }
          
          .contact-textarea {
            padding-left: 44px;
            min-height: 140px;
            resize: vertical;
          }
          
          .contact-input::placeholder {
            color: #94a3b8;
            opacity: 1;
          }

          .contact-input:focus {
            border-color: var(--accent-blue-primary, #3b82f6);
            background-color: #334155;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          }
          
          .contact-input:focus ~ .input-icon-container {
            color: var(--accent-blue-primary, #3b82f6);
          }
          
          .contact-input.error {
            border-color: var(--accent-red-primary, #ef4444);
          }
          
          .contact-input.error ~ .input-icon-container {
            color: var(--accent-red-primary, #ef4444);
          }

          .contact-select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 16px center;
            background-size: 16px;
            cursor: pointer;
            padding-right: 44px;
          }

          .contact-select option {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 8px;
          }
          
          .error-text {
            color: var(--accent-red-primary, #ef4444);
            font-size: 13px;
            margin-top: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .error-text svg {
            width: 14px;
            height: 14px;
            flex-shrink: 0;
          }
          
          .contact-submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.5);
            margin-top: 10px;
          }
          
          .contact-submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 15px 25px -10px rgba(59, 130, 246, 0.6);
          }
          
          .contact-submit-btn:active:not(:disabled) {
            transform: translateY(1px);
          }
          
          .contact-submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            background: linear-gradient(135deg, #475569 0%, #334155 100%);
            box-shadow: none;
          }
          
          .info-card {
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            height: fit-content;
          }
          
          .contact-method {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 24px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            margin-bottom: 20px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .contact-method:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }
          
          .method-icon-wrap {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(59, 130, 246, 0.1);
            color: var(--accent-blue-primary, #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.3s ease;
          }
          
          .contact-method:hover .method-icon-wrap {
            background: var(--accent-blue-primary, #3b82f6);
            color: white;
            transform: scale(1.05);
          }
          
          .method-details {
            flex: 1;
          }
          
          .method-label {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 6px;
            font-weight: 500;
          }
          
          .method-value {
            font-size: 16px;
            color: var(--text-primary);
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
          }
          
          a.method-value:hover {
            color: var(--accent-blue-primary, #3b82f6);
          }
          
          .status-alert {
            padding: 16px 24px;
            border-radius: 12px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            gap: 16px;
            animation: slideDown 0.4s ease-out;
            border: 1px solid rgba(255,255,255,0.1);
          }
          
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
            color: #34d399;
          }
          
          .alert-error {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            color: #f87171;
          }

          .ambient-glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(15,23,42,0) 70%);
            top: -100px;
            right: -200px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
          }
        `}
      </style>

      <CommercialHardwareHeader />

      <div className="contact-container">
        <div className="ambient-glow"></div>
        <div className="contact-header">
          <h1 className="contact-title">Contact Our Experts</h1>
          <p className="contact-subtitle">
            Have questions about our products or need professional assistance?
            Our team is here to help you find the perfect hardware solution.
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="status-alert alert-success">
            <Icons.CheckCircle />
            <span>Thank you! Your message has been sent successfully. We'll get back to you shortly.</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="status-alert alert-error">
            <Icons.AlertCircle />
            <span>Sorry, there was an error sending your message. Please try again or contact us directly.</span>
          </div>
        )}

        <div className="contact-grid">
          {/* Contact Form */}
          <div className="contact-form-card">
            <h2 className="contact-form-title">
              <Icons.Message />
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="contact-input-wrapper">
                <label htmlFor="contact-name" className="contact-label">Full Name <span className="contact-required">*</span></label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`contact-input ${errors.name ? 'error' : ''}`}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                <div className="input-icon-container"><Icons.User /></div>
                {errors.name && <span className="error-text"><Icons.AlertCircle /> {errors.name}</span>}
              </div>

              <div className="contact-input-wrapper">
                <label htmlFor="contact-email" className="contact-label">Email Address <span className="contact-required">*</span></label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`contact-input ${errors.email ? 'error' : ''}`}
                  placeholder="john@company.com"
                  autoComplete="email"
                />
                <div className="input-icon-container"><Icons.Mail /></div>
                {errors.email && <span className="error-text"><Icons.AlertCircle /> {errors.email}</span>}
              </div>

              <div className="contact-input-wrapper">
                <label htmlFor="contact-phone" className="contact-label">Phone Number <span className="contact-required">*</span></label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`contact-input ${errors.phone ? 'error' : ''}`}
                  placeholder="+1 (555) 123-4567"
                  autoComplete="tel"
                />
                <div className="input-icon-container"><Icons.Phone /></div>
                {errors.phone && <span className="error-text"><Icons.AlertCircle /> {errors.phone}</span>}
              </div>

              <div className="contact-input-wrapper">
                <label htmlFor="contact-company" className="contact-label">Company Name</label>
                <input
                  id="contact-company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="contact-input"
                  placeholder="Your Company Name"
                  autoComplete="organization"
                />
                <div className="input-icon-container"><Icons.Building /></div>
              </div>

              <div className="contact-input-wrapper">
                <label htmlFor="contact-inquiry" className="contact-label">Inquiry Type</label>
                <select
                  id="contact-inquiry"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  className="contact-input contact-select"
                >
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Information</option>
                  <option value="quote">Request a Quote</option>
                  <option value="support">Technical Support</option>
                  <option value="bulk">Bulk Orders</option>
                  <option value="partnership">Partnership Opportunities</option>
                </select>
                <div className="input-icon-container"><Icons.Tag /></div>
              </div>

              <div className="contact-input-wrapper">
                <label htmlFor="contact-subject" className="contact-label">Subject <span className="contact-required">*</span></label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`contact-input ${errors.subject ? 'error' : ''}`}
                  placeholder="How can we help you?"
                />
                <div className="input-icon-container"><Icons.Pen /></div>
                {errors.subject && <span className="error-text"><Icons.AlertCircle /> {errors.subject}</span>}
              </div>

              <div className="contact-input-wrapper">
                <label htmlFor="contact-message" className="contact-label">Message <span className="contact-required">*</span></label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`contact-input contact-textarea ${errors.message ? 'error' : ''}`}
                  placeholder="Please provide details about your inquiry..."
                  rows={5}
                />
                <div className="input-icon-container textarea-icon-container"><Icons.Message /></div>
                {errors.message && <span className="error-text"><Icons.AlertCircle /> {errors.message}</span>}
              </div>

              <button type="submit" disabled={submitting} className="contact-submit-btn">
                {submitting ? 'Sending...' : 'Send Message'}
                {!submitting && <Icons.Send />}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="info-card">
            <h2 className="contact-form-title" style={{ marginBottom: '40px' }}>Get In Touch</h2>

            <div className="contact-method">
              <div className="method-icon-wrap"><Icons.Phone /></div>
              <div className="method-details">
                <div className="method-label">Direct Line</div>
                <a href="tel:+917904212501" className="method-value">+91 7904212501</a>
              </div>
            </div>

            <div className="contact-method">
              <div className="method-icon-wrap"><Icons.Mail /></div>
              <div className="method-details">
                <div className="method-label">Email Support</div>
                <a href="mailto:support@sriammantraders.com" className="method-value">support@sriammantraders.com</a>
              </div>
            </div>

            <div className="contact-method">
              <div className="method-icon-wrap"><Icons.MapPin /></div>
              <div className="method-details">
                <div className="method-label">Headquarters</div>
                <div className="method-value" style={{ lineHeight: '1.5' }}>
                  Chinnasalem Main Road<br />
                  Kallakurichi, Tamil Nadu 606213<br />
                  India
                </div>
              </div>
            </div>

            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="method-details">
                <div className="method-label" style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--text-primary)' }}>
                  Business Hours
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Monday - Friday</span>
                  <span style={{ fontWeight: 500 }}>8:00 AM - 6:00 PM IST</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Saturday</span>
                  <span style={{ fontWeight: 500 }}>9:00 AM - 4:00 PM IST</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Sunday</span>
                  <span style={{ fontWeight: 500, color: 'var(--accent-red-primary, #ef4444)' }}>Closed</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
