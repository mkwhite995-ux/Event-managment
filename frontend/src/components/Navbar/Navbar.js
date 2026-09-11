import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Calendar, 
  PlusCircle,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch (error) { user = null; }
  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
    setDropdownOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setDropdownOpen(false);
  };

  const navigationLinks = [
    {
      to: "/events",
      label: "Events",
      icon: <Calendar size={20} />,
      visible: true
    },
    {
      to: "/booked-events",
      label: "My Bookings",
      icon: <BookOpen size={20} />,
      visible: user?.role === 'PARTICIPANT'
    },
    {
      to: "/create-event",
      label: "Create Event",
      icon: <PlusCircle size={20} />,
      visible: isAdmin || isOrganizer
    },
    {
      to: isAdmin ? "/admin/dashboard" : isOrganizer ? "/organizer/dashboard" : "/participant/dashboard",
      label: "Dashboard",
      icon: <BookOpen size={20} />,
      visible: !!user
    },
    {
      to: "/admin/users",
      label: "Users",
      icon: <User size={20} />,
      visible: isAdmin
    }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src="/logo_circle.jpg" alt="GoPlanMe" height="40" />
          <span>GoPlanMe</span>
        </Link>

        <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <div className={`navbar-content ${isOpen ? 'active' : ''}`}>
          <div className="nav-links">
            {navigationLinks.map((link, index) => 
              link.visible && (
                <Link
                  key={index}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.icon}
                  {link.label}
                </Link>
              )
            )}

            {!user && (
              <>
                <Link 
                  to="/login" 
                  className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="nav-button"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {user && (
            <div className="nav-actions">
              <div className="user-dropdown">
                <button 
                  className="dropdown-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="user-avatar">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.name || user.email || 'User'}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to="/edit-profile" className="dropdown-item" onClick={closeMenu}>
                        <User size={16} />
                        Profile
                      </Link>
                      {/* <Link to="/settings" className="dropdown-item" onClick={closeMenu}>
                        <Settings size={16} />
                        Settings
                      </Link> */}
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
