import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-luxury-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center text-denim-blue hover:text-denim-blue-light transition-colors duration-300 font-street font-medium uppercase tracking-wider text-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-street font-bold uppercase tracking-widest mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm font-street uppercase tracking-widest">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              1. Introduction
            </h2>
            <p className="font-street">
              Art Connect Us ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              2. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-street font-semibold text-gray-200 mb-2">
                  2.1 Personal Information
                </h3>
                <p className="font-street">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 font-street">
                  <li>Register for an account</li>
                  <li>Make a purchase</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Contact us through our contact form</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p className="mt-2 font-street">
                  This information may include your name, email address, phone number, shipping address, billing address, and payment information.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-street font-semibold text-gray-200 mb-2">
                  2.2 Automatically Collected Information
                </h3>
                <p className="font-street">
                  When you visit our website, we automatically collect certain information about your device, including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 font-street">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages you visit and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Date and time of your visit</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              3. How We Use Your Information
            </h2>
            <p className="font-street mb-2">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 font-street">
              <li>Processing and fulfilling your orders</li>
              <li>Communicating with you about your orders, products, services, and promotional offers</li>
              <li>Sending you marketing communications (with your consent)</li>
              <li>Responding to your inquiries and providing customer support</li>
              <li>Improving our website, products, and services</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
              <li>Analyzing website usage and trends</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              4. Information Sharing and Disclosure
            </h2>
            <p className="font-street mb-2">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 font-street">
              <li><strong className="text-white">Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing, shipping, and email delivery.</li>
              <li><strong className="text-white">Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities.</li>
              <li><strong className="text-white">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</li>
              <li><strong className="text-white">With Your Consent:</strong> We may share information with your explicit consent.</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              5. Data Security
            </h2>
            <p className="font-street">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              6. Your Rights and Choices
            </h2>
            <p className="font-street mb-2">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 font-street">
              <li><strong className="text-white">Access:</strong> Request access to your personal information</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate information</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
              <li><strong className="text-white">Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong className="text-white">Data Portability:</strong> Request a copy of your data in a portable format</li>
            </ul>
            <p className="mt-4 font-street">
              To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="font-street">
              We use cookies and similar tracking technologies to collect and store information about your preferences and activity on our website. You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features of our website.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              8. Third-Party Links
            </h2>
            <p className="font-street">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read the privacy policies of any third-party sites you visit.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              9. Children's Privacy
            </h2>
            <p className="font-street">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              10. Changes to This Privacy Policy
            </h2>
            <p className="font-street">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-street font-bold text-white mb-4 uppercase tracking-wider">
              11. Contact Us
            </h2>
            <p className="font-street mb-2">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-dark-navy border border-gray-700 p-6 mt-4 font-street">
              <p className="text-white font-semibold mb-2">Art Connect Us</p>
              <p className="text-gray-300 mb-1">Email: contact@artconnectus.com</p>
              <p className="text-gray-300">
                You can also reach us through our contact form on the website.
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <button
            onClick={() => navigate('/')}
            className="bg-denim-blue hover:bg-denim-blue-light text-white font-street font-bold py-3 px-8 transition-all duration-300 uppercase tracking-wider text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

