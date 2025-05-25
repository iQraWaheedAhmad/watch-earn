"use client";
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="text-center flex flex-col items-center space-y-6 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Join 10,000+ People!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white-300 max-w-3xl leading-relaxed">
            With just a little investment, you can start making money and secure your future.
            Don't miss out—take the first step today and watch your earnings grow!
          </p>
          <Link href="/registrationfom" passHref>
            <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300 text-base sm:text-lg font-semibold">
              GET STARTED
            </button>
          </Link>
        </div>

        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Legal Banner Section */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-6">Learn More About Our Platform</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/about" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors">About Us</Link>
                <Link href="/terms" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors">Privacy Policy</Link>
                <Link href="/contact" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors">Contact Us</Link>
              </div>
            </div>

            {/* Footer Grid Links */}
            <div className="border-t border-gray-700 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Company */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><Link href="/about" className="text-gray-300 hover:text-white transition">About Us</Link></li>
                    <li><Link href="/contact" className="text-gray-300 hover:text-white transition">Contact Us</Link></li>
                    <li><Link href="/careers" className="text-gray-300 hover:text-white transition">Careers</Link></li>
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Resources</h3>
                  <ul className="space-y-2">
                    <li><Link href="/blog" className="text-gray-300 hover:text-white transition">Blog</Link></li>
                    <li><Link href="/help-center" className="text-gray-300 hover:text-white transition">Help Center</Link></li>
                    <li><Link href="/faq" className="text-gray-300 hover:text-white transition">FAQ</Link></li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li><Link href="/terms-of-service" className="text-gray-300 hover:text-white transition">Terms of Service</Link></li>
                    <li><Link href="/privacy" className="text-gray-300 hover:text-white transition">Privacy Policy</Link></li>
                    <li><Link href="/cookie-policy" className="text-gray-300 hover:text-white transition">Cookie Policy</Link></li>
                  </ul>
                </div>

                {/* Connect */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Connect</h3>
    <div className="flex space-x-4">
      {/* Twitter */}
      <a href="#" className=" hover:text-yellow-500" aria-label="Twitter">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4 1.64a9.1 9.1 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.88.9a4.48 4.48 0 0 0-4.48 4.48c0 .35.04.7.11 1.03A12.81 12.81 0 0 1 3.16 2.2a4.48 4.48 0 0 0-.6 2.26c0 1.56.8 2.94 2.02 3.75A4.48 4.48 0 0 1 2.8 7.7v.06a4.48 4.48 0 0 0 3.6 4.39 4.52 4.52 0 0 1-2.02.08 4.48 4.48 0 0 0 4.2 3.13A9 9 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.02c8.27 0 12.8-6.85 12.8-12.8v-.58A9.22 9.22 0 0 0 23 3z" />
        </svg>
      </a>
      {/* Instagram */}
      <a href="#" className="hover:text-yellow-500" aria-label="Instagram">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.75 2h8.5C19.1 2 22 4.9 22 7.75v8.5C22 19.1 19.1 22 16.25 22h-8.5C4.9 22 2 19.1 2 16.25v-8.5C2 4.9 4.9 2 7.75 2zm0 2C6.23 4 5 5.23 5 6.75v10.5C5 18.77 6.23 20 7.75 20h8.5c1.52 0 2.75-1.23 2.75-2.75V6.75C19 5.23 17.77 4 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm4.5-2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" />
        </svg>
      </a>
      {/* Telegram */}
      <a href="#" className=" hover:text-yellow-500">
                    <span className="sr-only">Telegram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.25l-2.173 10.244c-.168.78-.614.975-1.243.606l-3.346-2.455-1.646 1.578c-.168.168-.336.336-.673.336l.252-3.345 6.115-5.51c.252-.227-.056-.353-.42-.126l-7.53 4.723-3.257-1.058c-.722-.227-.722-.722.168-1.09l12.673-4.89c.588-.196 1.162.141.98.889z"></path>
                    </svg>
                  </a>
    </div>
  
                </div>

                {/* Bottom Footer */}
                <div className="text-center pt-6 border-t border-gray-700 col-span-full">
                  <p className="text-sm text-gray-400">
                    © {currentYear} Watch And Earn. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </footer>
  );
};

export default Footer;
