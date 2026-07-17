import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import ScrollToTop from '../common/ScrollToTop';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-dark text-slate-800 dark:text-slate-100 transition-colors">
      <ScrollToTop />
      
      {/* Navigation */}
      <Navbar />

      {/* Main Routed Content with Fade Transition */}
      <main className="flex-grow pt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <Link
        to="/contact"
        className="fixed bottom-6 right-6 z-40 bg-secondary hover:bg-secondary/95 text-white p-4 rounded-full shadow-glow hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
      >
        <MessageSquare className="h-6 w-6" />
      </Link>

      {/* Footer */}
      <Footer />
    </div>
  );
};
