/**
 * CONTACT PAGE COMPONENT
 * Professional contact form with validation and error handling
 * Includes multiple contact methods and business information
 */

import React, { useState, useEffect } from 'react';
import CommercialHardwareHeader from './CommercialHardwareHeader';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitStatus('error');
        console.error('Form submission failed:', data);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    page: {
      backgroundColor: 'transparent',
      minHeight: '100vh'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 24px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '60px'
    },
    title: {
      fontSize: '42px',
      fontWeight: 700,
      color: 'var(--text-primary)',
      marginBottom: '16px',
      textShadow: '0 0 20px rgba(46, 134, 222, 0.5)'
    },
    subtitle: {
      fontSize: '18px',
      color: 'var(--text-secondary)',
      maxWidth: '600px',
      margin: '0 auto'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '40px'
    },
    formCard: {
      backgroundColor: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--glass-border)'
    },
    formTitle: {
      fontSize: '24px',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '24px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      color: 'var(--text-secondary)',
      marginBottom: '8px'
    },
    required: {
      color: '#DC2626'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: '1px solid var(--glass-border)',
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: 'var(--text-primary)',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#DC2626'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.2s',
      fontFamily: 'inherit',
      backgroundColor: 'rgba(31, 41, 55, 0.9)', // Darker background for select options visibility
      color: 'var(--text-primary)',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: '1px solid var(--glass-border)',
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: 'var(--text-primary)',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.2s',
      fontFamily: 'inherit',
      minHeight: '150px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    errorText: {
      color: '#DC2626',
      fontSize: '13px',
      marginTop: '4px',
      display: 'block'
    },
    submitButton: {
      width: '100%',
      padding: '14px 24px',
      backgroundColor: 'var(--accent-blue-primary)',
      background: 'linear-gradient(135deg, #2e86de 0%, #2472c4 100%)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '8px',
      boxShadow: '0 4px 12px var(--accent-blue-glow)'
    },
    submitButtonDisabled: {
      backgroundColor: '#9CA3AF',
      cursor: 'not-allowed'
    },
    infoCard: {
      backgroundColor: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--glass-border)',
      height: 'fit-content'
    },
    infoTitle: {
      fontSize: '24px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      marginBottom: '24px'
    },
    contactMethod: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      border: '1px solid var(--glass-border)'
    },
    icon: {
      fontSize: '24px',
      flexShrink: 0
    },
    contactDetails: {
      flex: 1
    },
    contactLabel: {
      fontSize: '14px',
      fontWeight: 500,
      color: 'var(--text-secondary)',
      marginBottom: '4px'
    },
    contactValue: {
      fontSize: '16px',
      fontWeight: 500,
      color: 'var(--text-primary)'
    },
    contactLink: {
      color: 'var(--accent-blue-primary)',
      textDecoration: 'none',
      transition: 'color 0.2s'
    },
    businessHours: {
      marginTop: '32px',
      padding: '24px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '8px',
      border: '1px solid var(--glass-border)'
    },
    hoursTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      marginBottom: '12px'
    },
    hoursText: {
      fontSize: '14px',
      color: 'var(--text-secondary)',
      marginBottom: '4px'
    },
    alert: {
      padding: '16px 20px',
      borderRadius: '8px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '15px',
      fontWeight: 500
    },
    alertSuccess: {
      backgroundColor: '#D1FAE5',
      color: '#065F46',
      border: '1px solid #A7F3D0'
    },
    alertError: {
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
      border: '1px solid #FECACA'
    }
  };

  return (
    <div style={styles.page}>
      <CommercialHardwareHeader />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Contact Our Experts</h1>
          <p style={styles.subtitle}>
            Have questions about our products or need professional assistance?
            Our team is here to help you find the perfect hardware solution.
          </p>
        </div>

        {submitStatus === 'success' && (
          <div style={{ ...styles.alert, ...styles.alertSuccess }}>
            <span>✓</span>
            <span>Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={{ ...styles.alert, ...styles.alertError }}>
            <span>⚠</span>
            <span>Sorry, there was an error sending your message. Please try again or contact us directly via phone or email.</span>
          </div>
        )}

        <div style={styles.grid}>
          {/* Contact Form */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Send Us a Message</h2>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Full Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.name && styles.inputError)
                  }}
                  placeholder="John Doe"
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email Address <span style={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.email && styles.inputError)
                  }}
                  placeholder="john@company.com"
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Phone Number <span style={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.phone && styles.inputError)
                  }}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Your Company Name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Inquiry Type</label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Information</option>
                  <option value="quote">Request a Quote</option>
                  <option value="support">Technical Support</option>
                  <option value="bulk">Bulk Orders</option>
                  <option value="partnership">Partnership Opportunities</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Subject <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.subject && styles.inputError)
                  }}
                  placeholder="How can we help you?"
                />
                {errors.subject && <span style={styles.errorText}>{errors.subject}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Message <span style={styles.required}>*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  style={{
                    ...styles.textarea,
                    ...(errors.message && styles.inputError)
                  }}
                  placeholder="Please provide details about your inquiry..."
                />
                {errors.message && <span style={styles.errorText}>{errors.message}</span>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitButton,
                  ...(submitting && styles.submitButtonDisabled)
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.backgroundColor = '#0956CC';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(11, 116, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.backgroundColor = '#0B74FF';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div style={styles.infoCard}>
              <h2 style={styles.infoTitle}>Get In Touch</h2>

              <div style={styles.contactMethod}>
                <div style={styles.icon}>📞</div>
                <div style={styles.contactDetails}>
                  <div style={styles.contactLabel}>Phone</div>
                  <a href="tel:+917904212501" style={{ ...styles.contactValue, ...styles.contactLink }}>
                    +91 7904212501
                  </a>
                </div>
              </div>

              <div style={styles.contactMethod}>
                <div style={styles.icon}>📧</div>
                <div style={styles.contactDetails}>
                  <div style={styles.contactLabel}>Email</div>
                  <a href="mailto:info@homehardware.com" style={{ ...styles.contactValue, ...styles.contactLink }}>
                    info@homehardware.com
                  </a>
                </div>
              </div>

              <div style={styles.contactMethod}>
                <div style={styles.icon}>💬</div>
                <div style={styles.contactDetails}>
                  <div style={styles.contactLabel}>Live Chat</div>
                  <div style={styles.contactValue}>Available on website</div>
                </div>
              </div>

              <div style={styles.contactMethod}>
                <div style={styles.icon}>📍</div>
                <div style={styles.contactDetails}>
                  <div style={styles.contactLabel}>Address</div>
                  <div style={styles.contactValue}>
                    123 Hardware Street<br />
                    New York, NY 10001<br />
                    United States
                  </div>
                </div>
              </div>

              <div style={styles.businessHours}>
                <div style={styles.hoursTitle}>Business Hours</div>
                <div style={styles.hoursText}><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM EST</div>
                <div style={styles.hoursText}><strong>Saturday:</strong> 9:00 AM - 4:00 PM EST</div>
                <div style={styles.hoursText}><strong>Sunday:</strong> Closed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
