/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { Logo } from './components/Logo';
import { Post, Notification, CompanySettings, TeamMember } from './types';
import { Trash2, Edit, Plus, LogOut, Settings, Bell, Image, Phone, Mail, MapPin, Heart, MessageCircle, Users, Menu, X } from 'lucide-react';
import { Auth } from './components/Auth';
import { ImageUpload } from './components/ImageUpload';
import { VideoUpload } from './components/VideoUpload';
import { Modal } from './components/Modal';

function Layout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>({
    contact_number: '',
    email_address: '',
    office_address: '',
    notice_board: ''
  });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    async function fetchSettings() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('company_info').select('*').eq('id', 1).single();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
      setLoading(false);
    }
    fetchSettings();

    // Add real-time subscription for settings
    const channel = supabase?.channel('public_company_info_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'company_info', 
        filter: 'id=eq.1' 
      }, (payload: any) => {
        setSettings(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-gold-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold animate-pulse">Loading Ugrasena Educum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-transparent selection:bg-gold-500 selection:text-navy-900">
      {/* Notice Board Bar */}
      {settings.notice_board && (
        <div className="glass-gold text-gold-500 py-3 px-4 overflow-hidden whitespace-nowrap z-[60] border-none backdrop-blur-md">
          <div className="animate-marquee inline-block font-bold tracking-wide" style={{ animationDuration: `${settings.marquee_speed || 25}s` }}>
            {settings.notice_board}
          </div>
        </div>
      )}
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] flex flex-wrap justify-center items-center overflow-hidden z-0">
        {settings.logo_url && [...Array(20)].map((_, i) => (
          <img key={i} src={settings.logo_url} alt="Watermark" className="w-64 h-64 m-12 grayscale brightness-200" referrerPolicy="no-referrer" />
        ))}
      </div>
      <header className="glass-dark text-gold-500 p-4 md:p-6 flex flex-row justify-between items-center sticky top-0 z-50 gap-4 border-x-0 border-t-0 border-b-white/5">
        <div className="shrink-0 scale-105 transition-transform hover:scale-110">
          <Logo />
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 glass-gold rounded-xl text-gold-500 hover:bg-gold-500 hover:text-navy-900 transition-all"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 md:gap-8 font-bold text-sm md:text-base">
          <Link to="/" className="hover:text-white transition-all whitespace-nowrap relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/about" className="hover:text-white transition-all whitespace-nowrap relative group">
            About Us
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/gallery" className="hover:text-white transition-all whitespace-nowrap relative group">
            Gallery
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/contact" className="hover:text-white transition-all whitespace-nowrap relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/notice" className="hover:text-white transition-all whitespace-nowrap relative group">
            Notice Board
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/secret-dashboard" className="text-gold-500/30 hover:text-gold-500 transition-all whitespace-nowrap ml-2 md:ml-4 text-xs md:text-sm flex items-center gap-1">
            <Settings size={14} /> Admin
          </Link>
        </nav>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full glass-dark border-t border-white/5 p-6 flex flex-col gap-4 md:hidden z-50 shadow-2xl"
            >
              <Link to="/" className="text-lg font-bold hover:text-white transition-all py-2 border-b border-white/5">Home</Link>
              <Link to="/about" className="text-lg font-bold hover:text-white transition-all py-2 border-b border-white/5">About Us</Link>
              <Link to="/gallery" className="text-lg font-bold hover:text-white transition-all py-2 border-b border-white/5">Gallery</Link>
              <Link to="/contact" className="text-lg font-bold hover:text-white transition-all py-2 border-b border-white/5">Contact</Link>
              <Link to="/notice" className="text-lg font-bold hover:text-white transition-all py-2 border-b border-white/5">Notice Board</Link>
              <Link to="/secret-dashboard" className="text-lg font-bold text-gold-500/50 hover:text-gold-500 transition-all py-2 flex items-center gap-2">
                <Settings size={18} /> Admin Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="flex-grow px-5 py-6 md:px-12 md:py-12 lg:px-16 lg:py-16 z-10 relative">{children}</main>
      <footer className="glass-dark text-gold-500 p-10 text-center text-sm border-x-0 border-b-0 border-t-white/5 z-10 relative">
        <p className="font-black text-2xl mb-3 tracking-tighter transition-all duration-300 hover:text-white cursor-default uppercase">UGRASENA EDUCUM PRIVATE LIMITED</p>
        <p className="transition-all duration-300 hover:text-white cursor-default break-words max-w-4xl mx-auto opacity-60 font-medium">Registered Office: {settings.office_address} | CIN: U85500BR2026PTC083704</p>
        <p className="transition-all duration-300 hover:text-white cursor-default break-words max-w-4xl mx-auto mt-2 opacity-60 font-medium">Contact: {settings.contact_number} | Email: {settings.email_address}</p>
        <div className="mt-8">
          <Link to="/secret-dashboard" className="glass-gold text-gold-500 hover:bg-gold-500 hover:text-navy-900 px-8 py-3 rounded-xl transition-all text-xs font-black inline-block uppercase tracking-widest border-gold-500/30 shadow-xl">
            Admin Dashboard Access
          </Link>
        </div>
      </footer>
    </div>
  );
}

function RegistrationForm() {
  const [formData, setFormData] = useState({ name: '', class: '', school: '', mobile: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from('registrations').insert([formData]);
    if (error) {
      console.error('Error registering:', error);
      alert('Registration failed.');
    } else {
      alert('Registration successful!');
      setFormData({ name: '', class: '', school: '', mobile: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-10 rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-white/10 mt-12 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-30"></div>
      <h3 className="text-4xl font-black text-gold-500 mb-8 tracking-tighter uppercase">Scholarship Registration</h3>
      <div className="space-y-5">
        <div className="relative">
          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/50" size={20} />
          <input 
            type="text" 
            placeholder="Full Name" 
            className="block w-full p-4 pl-12 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold-500/50 outline-none text-white placeholder-white/20 transition-all hover:bg-white/10" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
        </div>
        <div className="relative">
          <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/50" size={20} />
          <input 
            type="text" 
            placeholder="Class" 
            className="block w-full p-4 pl-12 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold-500/50 outline-none text-white placeholder-white/20 transition-all hover:bg-white/10" 
            value={formData.class} 
            onChange={e => setFormData({...formData, class: e.target.value})} 
            required 
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/50" size={20} />
          <input 
            type="text" 
            placeholder="School Name" 
            className="block w-full p-4 pl-12 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold-500/50 outline-none text-white placeholder-white/20 transition-all hover:bg-white/10" 
            value={formData.school} 
            onChange={e => setFormData({...formData, school: e.target.value})} 
            required 
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/50" size={20} />
          <input 
            type="tel" 
            placeholder="Mobile Number" 
            className="block w-full p-4 pl-12 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold-500/50 outline-none text-white placeholder-white/20 transition-all hover:bg-white/10" 
            value={formData.mobile} 
            onChange={e => setFormData({...formData, mobile: e.target.value})} 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="w-full glass-gold text-gold-500 py-5 rounded-2xl font-black text-xl hover:bg-gold-500 hover:text-navy-900 transition-all shadow-2xl uppercase tracking-widest active:scale-95 border-gold-500/30"
        >
          Register Now
        </button>
      </div>
    </form>
  );
}

function RegistrationPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <RegistrationForm />
    </div>
  );
}

function ContactPage() {
  const [info, setInfo] = useState({ contact_number: '', email_address: '', office_address: '' });
  const [team, setTeam] = useState<{ name: string, role: string, email?: string, contact_number?: string }[]>([]);

  useEffect(() => {
    async function fetchCompanyInfo() {
      if (!supabase) return;
      const { data } = await supabase.from('company_info').select('*').eq('id', 1).single();
      if (data) {
        setInfo({
          contact_number: data.contact_number || '',
          email_address: data.email_address || '',
          office_address: data.office_address || ''
        });
      }
    }
    async function fetchTeam() {
      if (!supabase) return;
      const { data } = await supabase.from('team').select('name, role, email, contact_number').order('order_index', { ascending: true });
      if (data) setTeam(data);
    }
    fetchCompanyInfo();
    fetchTeam();

    // Add real-time subscription
    const companyChannel = supabase?.channel('public_contact_info_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'company_info', 
        filter: 'id=eq.1' 
      }, (payload: any) => {
        setInfo({
          contact_number: payload.new.contact_number || '',
          email_address: payload.new.email_address || '',
          office_address: payload.new.office_address || ''
        });
      })
      .subscribe();

    const teamChannel = supabase?.channel('public_team_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team' }, () => {
        fetchTeam();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(companyChannel);
      supabase?.removeChannel(teamChannel);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 md:px-0">
      <h2 className="text-3xl md:text-5xl font-black text-gold-500 mb-12 md:mb-16 text-center tracking-tighter uppercase italic mt-8 md:mt-0">Contact Us & Leadership</h2>
      
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-24 items-stretch">
        <div className="glass-card flex flex-col h-full p-[25px] md:p-12 mx-auto lg:mx-0 w-full max-w-[500px] lg:max-w-none">
          <h3 className="text-2xl md:text-3xl font-bold text-gold-500 mb-8 md:mb-10 shrink-0 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gold-500 rounded-full"></div>
            Get In Touch
          </h3>
          <div className="space-y-8 md:space-y-10 flex-grow">
            {info.contact_number && (
              <div className="flex items-start gap-4 md:gap-6 text-white/90 group mb-5">
                <div className="p-3 glass-gold rounded-2xl text-gold-500 group-hover:bg-gold-500 group-hover:text-navy-900 transition-all">
                  <Phone className="shrink-0" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">Call Us</span>
                  <span className="whitespace-normal break-all font-medium text-lg">{info.contact_number}</span>
                </div>
              </div>
            )}
            {info.email_address && (
              <div className="flex items-start gap-4 md:gap-6 text-white/90 group mb-5">
                <div className="p-3 glass-gold rounded-2xl text-gold-500 group-hover:bg-gold-500 group-hover:text-navy-900 transition-all">
                  <Mail className="shrink-0" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">Email Us</span>
                  <span className="whitespace-normal break-all font-medium text-lg">{info.email_address}</span>
                </div>
              </div>
            )}
            {info.office_address && (
              <div className="flex items-start gap-4 md:gap-6 text-white/90 group mb-5">
                <div className="p-3 glass-gold rounded-2xl text-gold-500 group-hover:bg-gold-500 group-hover:text-navy-900 transition-all">
                  <MapPin className="shrink-0" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">Visit Us</span>
                  <span className="whitespace-normal break-all font-medium text-lg">{info.office_address}</span>
                </div>
              </div>
            )}
            {team.length > 0 && (
              <div className="pt-10 border-t border-white/10 mt-6">
                <h4 className="text-xs font-black text-gold-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Users size={16} /> Team Directory
                </h4>
                <div className="grid gap-4">
                  {team.map((member, i) => (
                    (member.email || member.contact_number) && (
                      <div key={i} className="glass-dark p-5 rounded-2xl border border-white/5 hover:border-gold-500/30 transition-all group/member">
                        <p className="font-bold text-gold-500 mb-2 group-hover/member:translate-x-1 transition-transform whitespace-normal break-all">{member.name}</p>
                        <div className="flex flex-col gap-2">
                          {member.contact_number && (
                            <a href={`tel:${member.contact_number}`} className="text-white/40 hover:text-white flex items-center gap-2 text-xs transition-colors whitespace-normal break-all">
                              <Phone size={12} className="text-gold-500" /> {member.contact_number}
                            </a>
                          )}
                          {member.email && (
                            <a href={`mailto:${member.email}`} className="text-white/40 hover:text-white flex items-center gap-2 text-xs transition-colors whitespace-normal break-all">
                              <Mail size={12} className="text-gold-500" /> {member.email}
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            {!info.contact_number && !info.email_address && !info.office_address && team.length === 0 && (
              <p className="text-gray-500 italic text-center py-8">Contact information not available.</p>
            )}
          </div>
        </div>

        <div className="glass-card flex flex-col h-full p-[25px] md:p-12 mx-auto lg:mx-0 w-full max-w-[500px] lg:max-w-none">
          <h3 className="text-2xl md:text-3xl font-bold text-gold-500 mb-8 md:mb-10 shrink-0 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gold-500 rounded-full"></div>
            Our Location
          </h3>
          <div className="flex-grow">
            {info.office_address ? (
              <div className="space-y-6 md:space-y-8">
                <div className="glass-dark p-6 md:p-8 rounded-2xl border border-white/5">
                  <p className="text-gold-500 text-xs font-black uppercase tracking-widest mb-4">Registered Office</p>
                  <p className="text-white/80 leading-relaxed whitespace-normal break-all text-base md:text-lg font-medium">
                    {info.office_address}
                  </p>
                </div>
                <div className="glass-gold p-6 md:p-8 rounded-2xl border border-gold-500/20 shadow-lg">
                  <p className="text-gold-500 text-xs font-black uppercase tracking-widest mb-4">Corporate Identity</p>
                  <p className="text-white font-mono text-sm md:text-base tracking-wider whitespace-normal break-all">
                    CIN: U85500BR2026PTC083704
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-white/40 italic text-center py-12">Address not available.</p>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-4xl font-black text-gold-500 mb-16 text-center tracking-tighter uppercase italic">Meet Our Leadership</h3>
      <div className="grid grid-cols-1 md:flex md:overflow-x-auto gap-8 md:gap-12 pb-32 pt-10 px-0 md:px-20 md:-mx-20 snap-x scrollbar-hide">
        {team.length > 0 ? (
          team.map((member, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card text-center w-full max-w-[350px] mx-auto md:min-w-[320px] md:snap-center md:shrink-0 flex flex-col justify-center border-t-8 border-t-gold-500 relative group/card"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gold-500 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <h4 className="text-3xl font-black text-gold-500 mb-2 tracking-tight whitespace-normal break-all">{member.name}</h4>
              <p className="text-white/40 font-bold mb-6 uppercase tracking-[0.2em] text-xs whitespace-normal break-all">{member.role}</p>
              {(member.email || member.contact_number) && (
                <div className="space-y-4 pt-8 border-t border-white/5 mt-4">
                  {member.contact_number && (
                    <a href={`tel:${member.contact_number}`} className="flex items-center justify-center gap-3 text-sm text-white/60 hover:text-gold-500 transition-all">
                      <Phone size={18} className="text-gold-500" />
                      <span className="font-bold whitespace-normal break-all">{member.contact_number}</span>
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-3 text-sm text-white/60 hover:text-gold-500 transition-all">
                      <Mail size={18} className="text-gold-500" />
                      <span className="break-all font-bold whitespace-normal break-all">{member.email}</span>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-center w-full text-white/40 italic py-16">Leadership team information not available.</p>
        )}
      </div>
    </div>
  );
}

function NoticePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stickyNotice, setStickyNotice] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    if (!supabase) return;
    
    const { data: companyData } = await supabase.from('company_info').select('notice_board').eq('id', 1).single();
    setStickyNotice(companyData?.notice_board || null);

    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();

    // Add real-time subscription
    const channel = supabase?.channel('public_all_notifications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'company_info', filter: 'id=eq.1' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const handleDeleteNotification = async (id: string) => {
    if (!supabase || !user) return;
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const handleClearStickyNotice = async () => {
    if (!supabase) return;
    if (!window.confirm('Are you sure you want to clear the sticky notice?')) return;
    const { error } = await supabase.from('company_info').update({ notice_board: '' }).eq('id', 1);
    if (!error) {
      setStickyNotice(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-4xl font-bold text-gold-500 mb-8 text-center">Notice Board</h2>
      <div className="space-y-6">
        {stickyNotice && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-gold p-10 rounded-3xl shadow-2xl border-l-8 border-gold-500 relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="glass-gold text-gold-500 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border-gold-500/30">Important Announcement</span>
            </div>
            <p className="text-2xl text-white font-bold leading-relaxed relative z-10">{stickyNotice}</p>
          </motion.div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">Recent Notifications</h3>
        </div>
        {notifications.length > 0 ? (
          notifications.map((n, i) => (
            <motion.div 
              key={n.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-3xl shadow-xl border-l-4 border-white/10 hover:border-gold-500/50 transition-all duration-500 group relative"
            >
              <p className="text-xl text-white/90 leading-relaxed group-hover:text-white transition-colors pr-10">{n.message}</p>
              <div className="flex items-center gap-3 mt-6 text-white/30 text-xs font-bold uppercase tracking-[0.2em]">
                <span className="w-12 h-[1px] bg-gold-500/30 group-hover:w-20 transition-all duration-500"></span>
                {new Date(n.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))
        ) : (
          !stickyNotice && (
            <div className="glass p-12 rounded-3xl border-2 border-dashed border-white/10 text-center">
              <p className="text-xl text-white/30 italic">No active notices at the moment.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function AboutPage() {
  const [aboutContent, setAboutContent] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAbout() {
      if (!supabase) return;
      const { data } = await supabase.from('company_info').select('about_us').eq('id', 1).single();
      if (data?.about_us) {
        setAboutContent(data.about_us);
      }
    }
    fetchAbout();

    // Add real-time subscription
    const channel = supabase?.channel('public_about_us_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'company_info', 
        filter: 'id=eq.1' 
      }, (payload: any) => {
        if (payload.new.about_us) setAboutContent(payload.new.about_us);
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  return (
    <section className="max-w-6xl mx-auto py-16">
      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="text-5xl font-extrabold text-gold-500 mb-16 text-center tracking-tight"
      >
        About Us
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card border-gold-500/20"
        >
          <h3 className="text-3xl font-bold text-gold-500 mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-gold-500 rounded-full"></div>
            Our Vision & Mission
          </h3>
          {aboutContent ? (
            <div className="text-white/90 leading-relaxed whitespace-pre-wrap text-lg">
              {aboutContent}
            </div>
          ) : (
            <p className="text-white/50 italic py-12 text-center">About content not available.</p>
          )}
        </motion.div>
        <div className="space-y-8">
          {[
            { title: 'Scholarship Program', desc: 'Selection based on merit through a transparent exam process. Top students receive 1-year full fee support, ensuring equal opportunity for all.' },
            { title: 'Coaching & Guidance', desc: 'We offer free online and affordable offline coaching classes, providing proper academic and career guidance to help students excel.' },
            { title: 'Sports & Skill Development', desc: 'We organize sports events to encourage physical and mental development, building teamwork, confidence, and a healthy lifestyle.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-3xl shadow-xl border-gold-500/10 hover:border-gold-500/40 transition-all duration-500 group"
            >
              <h4 className="font-bold text-xl text-gold-500 mb-3 group-hover:translate-x-2 transition-transform duration-300">{item.title}</h4>
              <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const [latestNotice, setLatestNotice] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;
      
      // Try fetching from company_info first for the sticky notice
      const { data: companyData } = await supabase.from('company_info').select('*').eq('id', 1).single();
      if (companyData) {
        setSettings(companyData);
        if (companyData.notice_board) {
          setLatestNotice(companyData.notice_board);
        }
      }

      if (!companyData?.notice_board) {
        // Fallback to latest notification
        const { data: notices } = await supabase.from('notifications').select('message').order('created_at', { ascending: false }).limit(1).single();
        if (notices) setLatestNotice(notices.message);
      }

      const { data: postsData } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(1);
      if (postsData) setPosts(postsData);
    }
    fetchData();

    // Add real-time subscriptions
    const noticeChannel = supabase?.channel('public_notifications_changes_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'company_info', filter: 'id=eq.1' }, () => {
        fetchData();
      })
      .subscribe();

    const postsChannel = supabase?.channel('public_posts_changes_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(noticeChannel);
      supabase?.removeChannel(postsChannel);
    };
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative min-h-[45vh] md:h-[65vh] flex items-center justify-center text-center text-white bg-transparent rounded-3xl overflow-hidden shadow-2xl mx-2 md:mx-4">
        {settings?.hero_video_url || settings?.hero_image_url ? (
          <div className="absolute inset-0">
            {settings.hero_video_url ? (
              <video 
                src={settings.hero_video_url} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover opacity-40"
              />
            ) : (
              <img 
                src={settings.hero_image_url} 
                alt="Hero Background" 
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        )}
        
        <div className="relative z-10 p-6 md:p-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-center text-3xl md:text-7xl font-extrabold mb-4 md:mb-6 tracking-tight leading-tight">
              {settings?.hero_title || "Ugra Sena EDU"}
            </h1>
            <h2 className="text-base md:text-2xl font-semibold mb-6 md:mb-8 text-gold-400 opacity-90 uppercase tracking-[0.15em] md:tracking-[0.4em]">
              {settings?.hero_subtitle || "UGRASENA EDUCUM PRIVATE LIMITED"}
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gold-500 mx-auto mb-6 md:mb-8 rounded-full"></div>
            <p className="text-lg md:text-4xl font-light italic text-gold-500 mb-8 md:mb-10">
              "{settings?.hero_tagline || "Empowering Minds, Shaping Futures"}"
            </p>
            <div className="flex flex-row gap-3 md:gap-4 justify-center">
              <Link to="/about" className="glass-gold text-gold-500 px-6 md:8 py-2 md:py-3 rounded-full font-bold hover:bg-gold-500 hover:text-navy-900 transition-all hover:scale-105 shadow-lg text-sm md:text-base">
                Learn More
              </Link>
              <Link to="/gallery" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 md:8 py-2 md:py-3 rounded-full font-bold hover:bg-white/20 transition-all hover:scale-105 text-sm md:text-base">
                View Gallery
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Summary Section - Bento Grid Style */}
      <section className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 glass-card flex flex-col items-center text-center"
        >
          <h3 className="text-3xl font-bold text-gold-500 mb-4">About Us</h3>
          <p className="text-white/80 mb-6 flex-grow text-lg leading-relaxed">Empowering students with quality education and a vision for a brighter future.</p>
          <Link to="/about" className="glass-gold text-gold-500 px-10 py-3 rounded-full font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-xl">
            Read Our Story
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-card flex flex-col items-center text-center"
        >
          <h3 className="text-2xl font-bold text-gold-500 mb-4">Latest Notice</h3>
          <p className="text-white/60 mb-6 flex-grow line-clamp-4 italic">"{latestNotice || 'Stay tuned for updates.'}"</p>
          <Link to="/notice" className="text-gold-500 font-bold hover:underline">View All</Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-card flex flex-col items-center text-center"
        >
          <h3 className="text-2xl font-bold text-gold-500 mb-4">Gallery</h3>
          <p className="text-white/60 mb-6 flex-grow">Explore our campus life and achievements.</p>
          <Link to="/gallery" className="text-gold-500 font-bold hover:underline">View Gallery</Link>
        </motion.div>
      </section>

      {/* Latest Posts Section */}
      {posts.length > 0 && (
        <section className="max-w-4xl mx-auto py-12">
          <h2 className="text-4xl font-bold text-gold-500 mb-12 text-center">Latest Gallery Update</h2>
          <div className="flex justify-center">
            {posts.map(post => (
              <div key={post.id} className="glass rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row w-full border-gold-500/20">
                {post.image_url && (
                  <div className="w-full md:w-1/2 h-64 md:h-auto cursor-pointer relative group" onClick={() => {
                    if (post.video_link) {
                      window.open(post.video_link, '_blank', 'noopener,noreferrer');
                    }
                  }}>
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {post.video_link && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-bold glass-dark px-6 py-2 rounded-full backdrop-blur-sm">Open Link</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-8 flex flex-col justify-center w-full md:w-1/2">
                  <h3 className="text-2xl font-bold text-gold-500 mb-4">{post.title}</h3>
                  <p className="text-white/80 text-base mb-6">{post.description}</p>
                  {post.video_link && (
                    <a href={post.video_link} target="_blank" rel="noopener noreferrer" className="inline-block glass-gold text-gold-500 px-8 py-2 rounded-full font-bold hover:bg-gold-500 hover:text-navy-900 transition-all text-center">
                      Open Link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function GalleryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  const [viewingCommentsPost, setViewingCommentsPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState({ name: '', content: '' });
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('likedPosts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('likedPosts', JSON.stringify(Array.from(likedPosts)));
  }, [likedPosts]);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    if (!supabase) return;
    const [{ data: postsData }, { data: commentsData }] = await Promise.all([
      supabase.from('posts').select('*').not('image_url', 'is', null).order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false })
    ]);
    
    if (postsData) setPosts(postsData);
    if (commentsData) setAllComments(commentsData);
    
    if (commentsData) {
      const counts: Record<string, number> = {};
      commentsData.forEach(c => {
        counts[c.post_id] = (counts[c.post_id] || 0) + 1;
      });
      setCommentCounts(counts);
    }
    
    setLoading(false);
  }

  const handleLike = async (post: Post) => {
    if (!supabase) return;
    
    const isLiked = likedPosts.has(post.id);
    const newLikes = isLiked ? Math.max(0, (post.likes_count || 0) - 1) : (post.likes_count || 0) + 1;
    
    // Optimistic update
    setPosts(currentPosts => currentPosts.map(p => p.id === post.id ? { ...p, likes_count: newLikes } : p));
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(post.id);
      } else {
        newSet.add(post.id);
      }
      return newSet;
    });

    try {
      const { error } = await supabase.from('posts').update({ likes_count: newLikes }).eq('id', post.id);
      if (error) throw error;
    } catch (error: any) {
      console.error("Error liking post:", error);
      alert(`Failed to save like: ${error.message}`);
      // Revert on error
      setPosts(currentPosts => currentPosts.map(p => p.id === post.id ? { ...p, likes_count: post.likes_count } : p));
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(post.id);
        } else {
          newSet.delete(post.id);
        }
        return newSet;
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !commentingPost) return;
    
    // Assuming a 'comments' table exists. If not, this will fail silently or show error.
    const { error } = await supabase.from('comments').insert([{
      post_id: commentingPost.id,
      user_name: newComment.name,
      content: newComment.content
    }]);

    if (error) {
      alert('Error adding comment. (Database table may not exist yet)');
    } else {
      const newCount = (commentingPost.comments_count || 0) + 1;
      await supabase.from('posts').update({ comments_count: newCount }).eq('id', commentingPost.id);
      
      setPosts(currentPosts => currentPosts.map(p => p.id === commentingPost.id ? { ...p, comments_count: newCount } : p));
      setCommentCounts(prev => ({ ...prev, [commentingPost.id]: (prev[commentingPost.id] || 0) + 1 }));
      
      // Refresh comments
      const { data: updatedComments } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
      if (updatedComments) setAllComments(updatedComments);

      alert('Comment added!');
      setCommentingPost(null);
      setNewComment({ name: '', content: '' });
    }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div></div>;

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h2 className="text-4xl font-bold text-gold-500 mb-8 text-center">Gallery</h2>
      
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div 
              key={post.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-3xl overflow-hidden shadow-2xl border-gold-500/20 group flex flex-col hover:border-gold-500/50 transition-all duration-500"
            >
              <div className="relative overflow-hidden h-72" onClick={() => {
                if (!post.video_link) {
                  setSelectedImage(post.image_url || null);
                }
              }}>
                {post.video_link ? (
                  post.video_link.includes('youtube.com') || post.video_link.includes('youtu.be') ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${post.video_link.split('v=')[1]?.split('&')[0] || post.video_link.split('/').pop()}`} 
                      className="w-full h-full" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  ) : post.video_link.includes('vimeo.com') ? (
                    <iframe 
                      src={`https://player.vimeo.com/video/${post.video_link.split('/').pop()}`} 
                      className="w-full h-full" 
                      frameBorder="0" 
                      allow="autoplay; fullscreen; picture-in-picture" 
                      allowFullScreen
                    />
                  ) : (
                    <video src={post.video_link} className="w-full h-full object-cover" controls />
                  )
                ) : (
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 ease-in-out cursor-pointer" 
                    referrerPolicy="no-referrer" 
                  />
                )}
                {!post.video_link && (
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setSelectedImage(post.image_url || null)}>
                    <span className="text-white font-bold glass-dark px-6 py-2 rounded-full backdrop-blur-sm border-gold-500/30">
                      View Full Image
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gold-500 mb-2">{post.title}</h3>
                <p className="text-white/70 text-sm line-clamp-2 mb-4">{post.description}</p>
                
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleLike(post)}
                    className={`flex items-center gap-2 transition-colors group/like ${likedPosts.has(post.id) ? 'text-red-500' : 'text-white/60 hover:text-red-500'}`}
                  >
                    <Heart size={20} className={likedPosts.has(post.id) ? "fill-red-500 text-red-500" : "group-hover/like:fill-red-500"} />
                    <span className="font-bold text-sm">{post.likes_count || 0}</span>
                  </motion.button>
                  
                  <button 
                    onClick={() => setViewingCommentsPost(post)}
                    className="flex items-center gap-2 text-white/60 hover:text-gold-500 transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span className="font-bold text-sm">{commentCounts[post.id] || 0} Comments</span>
                  </button>
                </div>
                <button 
                  onClick={() => setCommentingPost(post)}
                  className="mt-4 w-full py-2 glass-gold text-gold-500 rounded-xl font-bold text-sm hover:bg-gold-500 hover:text-navy-900 transition-all"
                >
                  Add a Comment
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass rounded-3xl border-2 border-dashed border-white/10">
          <Image className="mx-auto text-white/20 mb-4" size={48} />
          <p className="text-white/50 text-lg">No photos in the gallery yet.</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12" 
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-8 right-8 text-white/60 text-4xl hover:text-gold-500 transition-all hover:rotate-90">&times;</button>
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedImage} 
            alt="Full view" 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" 
            referrerPolicy="no-referrer" 
          />
        </motion.div>
      )}

      {/* Viewing Comments Modal */}
      <Modal isOpen={!!viewingCommentsPost} onClose={() => setViewingCommentsPost(null)}>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gold-500 mb-4 flex items-center gap-2">
            <MessageCircle className="text-gold-500" /> Comments
          </h3>
          <p className="text-white/60 text-sm mb-6">Discussion on: <span className="font-bold text-white">{viewingCommentsPost?.title}</span></p>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6 scrollbar-hide">
            {allComments.filter(c => c.post_id === viewingCommentsPost?.id).map(c => (
              <div key={c.id} className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gold-500 text-sm">{c.user_name}</span>
                  <span className="text-[10px] text-white/40">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{c.content}</p>
              </div>
            ))}
            {allComments.filter(c => c.post_id === viewingCommentsPost?.id).length === 0 && (
              <p className="text-center text-white/40 py-8 italic">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>

          <button 
            onClick={() => {
              setCommentingPost(viewingCommentsPost);
              setViewingCommentsPost(null);
            }}
            className="w-full glass-gold text-gold-500 py-3 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all"
          >
            Add a Comment
          </button>
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal isOpen={!!commentingPost} onClose={() => setCommentingPost(null)}>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gold-500 mb-4 flex items-center gap-2">
            <MessageCircle className="text-gold-500" /> Add Comment
          </h3>
          <p className="text-white/60 text-sm mb-6">Sharing your thoughts on: <span className="font-bold text-white">{commentingPost?.title}</span></p>
          
          <form onSubmit={handleAddComment} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white/70 mb-1">Your Name</label>
              <input 
                type="text" 
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white" 
                placeholder="Enter your name"
                value={newComment.name}
                onChange={e => setNewComment({...newComment, name: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/70 mb-1">Comment</label>
              <textarea 
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl h-32 focus:ring-2 focus:ring-gold-500 outline-none text-white" 
                placeholder="What's on your mind?"
                value={newComment.content}
                onChange={e => setNewComment({...newComment, content: e.target.value})}
                required 
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-grow glass-gold text-gold-500 py-3 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all">
                Post Comment
              </button>
              <button type="button" onClick={() => setCommentingPost(null)} className="px-6 py-3 glass text-white/60 rounded-xl font-bold hover:bg-white/10 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'notifications' | 'settings' | 'registrations' | 'team' | 'comments'>('dashboard');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({ contact_number: '', email_address: '', office_address: '', notice_board: '', logo_url: '' });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const [newPost, setNewPost] = useState({ title: '', description: '', image_url: '', video_link: '' });
  const [newNotification, setNewNotification] = useState('');
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', email: '', contact_number: '', order_index: 0 });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  useEffect(() => {
    async function checkUser() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    }
    checkUser();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user && supabase) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    if (!supabase) return;
    try {
      const [{ data: postsData }, { data: regData }, { data: notifData }, { data: companyData }, { data: teamData }, { data: commentsData }] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('company_info').select('*').eq('id', 1).single(),
        supabase.from('team').select('*').order('order_index', { ascending: true }),
        supabase.from('comments').select('*').order('created_at', { ascending: false })
      ]);

      setPosts(postsData || []);
      setRegistrations(regData || []);
      setNotifications(notifData || []);
      setTeam(teamData || []);
      setComments(commentsData || []);
      
      if (companyData) {
        setSettings(prev => ({ ...prev, ...companyData }));
      }

      if (commentsData) {
        const counts: Record<string, number> = {};
        commentsData.forEach(c => {
          counts[c.post_id] = (counts[c.post_id] || 0) + 1;
        });
        setCommentCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  const handleUpdateSettings = async (key: keyof CompanySettings, value: string | number) => {
    if (!supabase) return;
    // Use update instead of upsert to avoid overwriting other fields
    const { error } = await supabase.from('company_info').update({ [key]: value }).eq('id', 1);
    
    // If update fails (e.g. row doesn't exist), try upsert as fallback
    if (error) {
      const { error: upsertError } = await supabase.from('company_info').upsert({ id: 1, [key]: value });
      if (upsertError) {
        alert(`Error updating ${key}`);
        return;
      }
    }
    
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccessMessage(`${key.replace('_', ' ')} updated successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    if (!supabase) return;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error uploading logo');
      return;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    handleUpdateSettings('logo_url', data.publicUrl);
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }
    
    if (editingNotification) {
      const { error } = await supabase.from('notifications').update({ message: newNotification }).eq('id', editingNotification.id);
      if (error) {
        console.error('Error updating notification:', error);
        alert('Error updating notification.');
      } else {
        setEditingNotification(null);
        setNewNotification('');
        fetchData();
      }
    } else {
      const { error } = await supabase.from('notifications').insert([{ message: newNotification }]);
      if (error) {
        console.error('Error sending notification:', error);
        alert('Error sending notification.');
      } else {
        setNewNotification('');
        fetchData();
      }
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) alert('Error deleting notification.');
    else fetchData();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }
    
    if (editingPost) {
      const { error } = await supabase.from('posts').update(newPost).eq('id', editingPost.id);
      if (error) {
        console.error('Error updating post:', error);
        alert(`Error updating post: ${error.message}`);
      } else {
        alert('Post updated!');
        setEditingPost(null);
        setNewPost({ title: '', description: '', image_url: '', video_link: '' });
        fetchData();
      }
    } else {
      const { error } = await supabase.from('posts').insert([newPost]);
      if (error) {
        console.error('Error creating post:', error);
        alert(`Error creating post: ${error.message}`);
      } else {
        alert('Post created!');
        setNewPost({ title: '', description: '', image_url: '', video_link: '' });
        fetchData();
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) alert('Error deleting post.');
    else fetchData();
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      description: post.description,
      image_url: post.image_url || '',
      video_link: post.video_link || ''
    });
    setActiveTab('posts');
    window.scrollTo(0, 0);
  };

  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }
    
    if (editingTeamMember) {
      const { error } = await supabase.from('team').update(newTeamMember).eq('id', editingTeamMember.id);
      if (error) {
        console.error('Error updating team member:', error);
        alert(`Error updating team member: ${error.message}`);
      } else {
        alert('Team member updated!');
        setEditingTeamMember(null);
        setNewTeamMember({ name: '', role: '', email: '', contact_number: '', order_index: 0 });
        fetchData();
      }
    } else {
      const { error } = await supabase.from('team').insert([newTeamMember]);
      if (error) {
        console.error('Error adding team member:', error);
        alert(`Error adding team member: ${error.message}`);
      } else {
        alert('Team member added!');
        setNewTeamMember({ name: '', role: '', email: '', contact_number: '', order_index: 0 });
        fetchData();
      }
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('team').delete().eq('id', id);
    if (error) alert('Error deleting team member.');
    else fetchData();
  };

  const handleEditTeamMember = (member: any) => {
    setEditingTeamMember(member);
    setNewTeamMember({
      name: member.name,
      role: member.role,
      email: member.email || '',
      contact_number: member.contact_number || '',
      order_index: member.order_index
    });
    setActiveTab('team');
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) alert('Error deleting registration.');
    else fetchData();
  };

  const handleDeleteComment = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) alert('Error deleting comment.');
    else fetchData();
  };

  const handleBulkDelete = async (table: string, ids: string[], setSelected: (ids: string[]) => void) => {
    if (!supabase) return;
    if (confirm(`Are you sure you want to delete ${ids.length} items?`)) {
      const { error } = await supabase.from(table).delete().in('id', ids);
      if (error) alert(`Error deleting ${table}: ${error.message}`);
      else {
        setSelected([]);
        fetchData();
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-transparent text-gold-500 font-bold">Loading Admin Panel...</div>;

  if (!supabase) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Database Not Configured</h2>
        <p className="text-white/60 mb-8">Please configure your Supabase URL and Anon Key in the Secrets panel to use the Admin Dashboard.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <Auth />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-transparent">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-dark text-white p-6 flex flex-col border-r border-white/10">
        <h2 className="text-2xl font-bold text-gold-500 mb-8 flex items-center gap-2">
          <Settings /> Admin
        </h2>
        <nav className="flex-grow space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Settings },
              { id: 'posts', label: 'Gallery & Posts', icon: Image },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'team', label: 'Leadership Team', icon: Users },
              { id: 'comments', label: 'User Comments', icon: MessageCircle },
              { id: 'settings', label: 'Company Info', icon: Settings },
              { id: 'registrations', label: 'Registrations', icon: Plus }
            ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id ? 'glass-gold text-gold-500' : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>
        <button onClick={() => supabase!.auth.signOut()} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 bg-transparent overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gold-500 capitalize">
              {activeTab.replace('_', ' ')} Management
            </h1>
            <button onClick={fetchData} className="flex items-center gap-2 glass text-gold-500 px-6 py-2 rounded-xl hover:bg-white/10 font-bold transition-all shadow-lg border-gold-500/20">
              <Settings size={18} className="animate-spin-slow" /> Refresh Data
            </button>
          </div>
          
          <div className="glass rounded-3xl shadow-2xl border-gold-500/20 p-8">
            {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Posts', value: posts.length, icon: Image },
                  { label: 'Registrations', value: registrations.length, icon: Users },
                  { label: 'Comments', value: comments.length, icon: MessageCircle },
                  { label: 'Total Likes', value: posts.reduce((acc, p) => acc + (p.likes_count || 0), 0), icon: Heart }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass p-6 rounded-2xl border-white/10 shadow-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 glass-gold text-gold-500 rounded-xl group-hover:scale-110 transition-transform"><stat.icon size={24} /></div>
                      <div>
                        <p className="text-sm text-white/50 font-medium">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-gold-500">{stat.value}</h4>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <h3 className="text-lg font-bold text-gold-500 mb-6 flex items-center gap-2"><Plus size={20} /> Recent Registrations</h3>
                  <div className="space-y-4">
                    {registrations.slice(0, 5).map(r => (
                      <div key={r.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                          <p className="font-bold text-white">{r.name}</p>
                          <p className="text-xs text-white/50">{r.class} | {r.school}</p>
                        </div>
                        <span className="text-xs text-white/30">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {registrations.length === 0 && <p className="text-center text-white/40 py-8">No registrations yet.</p>}
                  </div>
                </div>
                <div className="glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <h3 className="text-lg font-bold text-gold-500 mb-6 flex items-center gap-2"><MessageCircle size={20} /> Recent Comments</h3>
                  <div className="space-y-4">
                    {comments.slice(0, 5).map(c => (
                      <div key={c.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between mb-1">
                          <p className="font-bold text-gold-500 text-sm">{c.user_name}</p>
                          <span className="text-[10px] text-white/30">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-white/70 line-clamp-1">{c.content}</p>
                      </div>
                    ))}
                    {comments.length === 0 && <p className="text-center text-white/40 py-8">No comments yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gold-500 flex items-center gap-2">
                  {editingPost ? <Edit size={20} /> : <Plus size={20} />} {editingPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                {selectedPosts.length > 0 && (
                  <button onClick={() => handleBulkDelete('posts', selectedPosts, setSelectedPosts)} className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold hover:bg-red-500/20 transition-all text-sm">
                    Delete Selected ({selectedPosts.length})
                  </button>
                )}
              </div>
              <form onSubmit={handleCreatePost} className="glass p-8 rounded-2xl border-white/10 mb-10 shadow-xl">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Title</label>
                    <input type="text" placeholder="Enter post title" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Image Upload</label>
                    <ImageUpload onUpload={(url) => setNewPost({...newPost, image_url: url})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Video Upload</label>
                    <VideoUpload onUpload={(url) => setNewPost({...newPost, video_link: url})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-white/70">External Link (e.g., Google Form, Doc)</label>
                    <input type="url" placeholder="https://..." className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={newPost.video_link} onChange={e => setNewPost({...newPost, video_link: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-bold text-white/70">Description</label>
                  <textarea placeholder="Post description..." className="w-full p-3 bg-white/5 border border-white/10 rounded-xl h-32 focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all resize-none" value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="glass-gold text-gold-500 px-8 py-3 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg">
                    {editingPost ? 'Update Post' : 'Publish Post'}
                  </button>
                  {editingPost && (
                    <button type="button" onClick={() => { setEditingPost(null); setNewPost({ title: '', description: '', image_url: '', video_link: '' }); }} className="glass text-white/60 px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(p => (
                  <div key={p.id} className="glass rounded-2xl overflow-hidden border-white/10 hover:shadow-2xl transition-all relative group flex flex-col">
                    <div className="absolute top-3 left-3 z-10">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500 cursor-pointer" checked={selectedPosts.includes(p.id)} onChange={e => {
                        if (e.target.checked) setSelectedPosts([...selectedPosts, p.id]);
                        else setSelectedPosts(selectedPosts.filter(id => id !== p.id));
                      }} />
                    </div>
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-white/5 flex items-center justify-center text-white/20">
                        <Image size={48} />
                      </div>
                    )}
                    <div className="p-6 flex-grow flex flex-col">
                      <h4 className="font-bold text-gold-500 text-lg line-clamp-1 mb-2">{p.title}</h4>
                      <p className="text-sm text-white/60 line-clamp-2 mb-4 flex-grow">{p.description}</p>
                      <div className="flex items-center gap-4 mb-4 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-gold-500/80"><Heart size={16} className="fill-current" /> {p.likes_count || 0} Likes</span>
                        <span className="flex items-center gap-1.5 text-blue-400"><MessageCircle size={16} /> {commentCounts[p.id] || 0} Comments</span>
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-white/10 mt-auto">
                        <button onClick={() => handleEditPost(p)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-sm font-bold transition-colors">
                          <Edit size={16} /> Edit
                        </button>
                        <button onClick={() => handleDeletePost(p.id)} className="text-red-400 hover:text-red-300 flex items-center gap-1.5 text-sm font-bold transition-colors ml-auto">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            loading ? (
              <div className="glass p-12 rounded-3xl border-2 border-dashed border-white/10 text-center">
                <p className="text-xl text-white/30 italic">Loading...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gold-500 flex items-center gap-2"><Bell size={20} /> Send New Notification</h3>
                  {selectedNotifications.length > 0 && (
                    <button onClick={() => handleBulkDelete('notifications', selectedNotifications, setSelectedNotifications)} className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold hover:bg-red-500/20 transition-all text-sm">
                      Delete Selected ({selectedNotifications.length})
                    </button>
                  )}
                </div>
                <form onSubmit={handleCreateNotification} className="glass p-8 rounded-2xl border-white/10 mb-8 shadow-xl">
                  <div className="space-y-2 mb-6">
                    <label className="text-sm font-bold text-white/70">Message</label>
                    <textarea placeholder="Type your notification message here..." className="w-full p-3 bg-white/5 border border-white/10 rounded-xl h-24 focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all resize-none" value={newNotification} onChange={e => setNewNotification(e.target.value)} required />
                  </div>
                  <button type="submit" className="glass-gold text-gold-500 px-8 py-3 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg">
                    {editingNotification ? 'Update Notification' : 'Send Notification'}
                  </button>
                  {editingNotification && (
                    <button type="button" onClick={() => { setEditingNotification(null); setNewNotification(''); }} className="glass text-white/60 px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
                      Cancel
                    </button>
                  )}
                </form>

                <div className="space-y-4">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-4 p-6 glass rounded-2xl border-white/10 hover:shadow-xl transition-all">
                      <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500 cursor-pointer" checked={selectedNotifications.includes(n.id)} onChange={e => {
                        if (e.target.checked) setSelectedNotifications([...selectedNotifications, n.id]);
                        else setSelectedNotifications(selectedNotifications.filter(id => id !== n.id));
                      }} />
                      <div className="flex-grow">
                        <p className="text-white font-medium mb-1">{n.message}</p>
                        <span className="text-xs text-white/30 font-bold">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <button onClick={() => { setEditingNotification(n); setNewNotification(n.message); }} className="text-white/30 hover:text-gold-500 transition-colors p-2 rounded-xl hover:bg-white/5">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDeleteNotification(n.id)} className="text-white/30 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-white/5 flex items-center gap-2">
                        <Trash2 size={20} /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {activeTab === 'team' && (
            <div className="space-y-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gold-500 flex items-center gap-2">
                  {editingTeamMember ? <Edit size={20} /> : <Plus size={20} />} {editingTeamMember ? 'Edit Member' : 'Add Team Member'}
                </h3>
                {selectedTeamMembers.length > 0 && (
                  <button onClick={() => handleBulkDelete('team', selectedTeamMembers, setSelectedTeamMembers)} className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold hover:bg-red-500/20 transition-all text-sm">
                    Delete Selected ({selectedTeamMembers.length})
                  </button>
                )}
              </div>
              <form onSubmit={handleCreateTeamMember} className="glass p-8 rounded-2xl border-white/10 mb-10 shadow-xl">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Name</label>
                    <input type="text" placeholder="John Doe" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={newTeamMember.name} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Role</label>
                    <input type="text" placeholder="Director" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={newTeamMember.role} onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={newTeamMember.email} onChange={e => setNewTeamMember({...newTeamMember, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Contact Number</label>
                    <input type="text" placeholder="+91 1234567890" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={newTeamMember.contact_number} onChange={e => setNewTeamMember({...newTeamMember, contact_number: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Order Index</label>
                    <input type="number" placeholder="1" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={newTeamMember.order_index} onChange={e => setNewTeamMember({...newTeamMember, order_index: parseInt(e.target.value)})} required />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="glass-gold text-gold-500 px-8 py-3 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg">
                    {editingTeamMember ? 'Update Member' : 'Add Member'}
                  </button>
                  {editingTeamMember && (
                    <button type="button" onClick={() => { setEditingTeamMember(null); setNewTeamMember({ name: '', role: '', email: '', contact_number: '', order_index: 0 }); }} className="glass text-white/60 px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map(m => (
                  <div key={m.id} className="glass rounded-2xl p-6 flex gap-4 border-white/10 hover:shadow-2xl transition-all relative group">
                    <div className="absolute top-3 left-3 z-10">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500 cursor-pointer" checked={selectedTeamMembers.includes(m.id)} onChange={e => {
                        if (e.target.checked) setSelectedTeamMembers([...selectedTeamMembers, m.id]);
                        else setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== m.id));
                      }} />
                    </div>
                    <div className="flex-grow ml-6">
                      <h4 className="font-bold text-gold-500 text-lg mb-1">{m.name}</h4>
                      <p className="text-sm text-white/50 font-bold mb-3">{m.role}</p>
                      <div className="space-y-1.5 mb-4">
                        {m.contact_number && <p className="text-xs text-white/70 flex items-center gap-2"><Phone size={14} /> {m.contact_number}</p>}
                        {m.email && <p className="text-xs text-white/70 flex items-center gap-2"><Mail size={14} /> {m.email}</p>}
                      </div>
                      <p className="text-[10px] text-gold-500/60 bg-white/5 inline-block px-3 py-1 rounded-full font-bold uppercase tracking-wider">Order: {m.order_index}</p>
                      <div className="flex gap-3 pt-4 mt-4 border-t border-white/10">
                        <button onClick={() => handleEditTeamMember(m)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-sm font-bold transition-colors">
                          <Edit size={16} /> Edit
                        </button>
                        <button onClick={() => handleDeleteTeamMember(m.id)} className="text-red-400 hover:text-red-300 flex items-center gap-1.5 text-sm font-bold transition-colors ml-auto">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gold-500 flex items-center gap-2 mb-6"><Settings size={20} /> Company Information</h3>
              {successMessage && <div className="glass-gold text-gold-500 border-gold-500/20 p-4 rounded-xl font-bold shadow-lg">{successMessage}</div>}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <label className="text-sm font-bold text-white/70">Company Logo</label>
                  <ImageUpload onUpload={(url) => handleUpdateSettings('logo_url', url)} />
                  {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-16 mt-4 rounded-xl border border-white/10 glass p-2" />}
                </div>
                <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <label className="text-sm font-bold text-white/70 flex items-center gap-2"><Phone size={16} /> Contact Number</label>
                  <div className="flex gap-3">
                    <input type="text" className="flex-grow p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={settings.contact_number || ''} onChange={e => setSettings({...settings, contact_number: e.target.value})} />
                    <button onClick={() => handleUpdateSettings('contact_number', settings.contact_number)} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg">Save</button>
                  </div>
                </div>
                <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <label className="text-sm font-bold text-white/70 flex items-center gap-2"><Mail size={16} /> Email Address</label>
                  <div className="flex gap-3">
                    <input type="email" className="flex-grow p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={settings.email_address || ''} onChange={e => setSettings({...settings, email_address: e.target.value})} />
                    <button onClick={() => handleUpdateSettings('email_address', settings.email_address)} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg">Save</button>
                  </div>
                </div>
                <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <label className="text-sm font-bold text-white/70 flex items-center gap-2"><MapPin size={16} /> Office Address</label>
                  <div className="flex gap-3">
                    <input type="text" className="flex-grow p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={settings.office_address || ''} onChange={e => setSettings({...settings, office_address: e.target.value})} />
                    <button onClick={() => handleUpdateSettings('office_address', settings.office_address)} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg h-fit">Save</button>
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2 glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <label className="text-sm font-bold text-white/70 flex items-center gap-2">About Us Content</label>
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <textarea className="flex-grow p-3 bg-white/5 border border-white/10 rounded-xl h-32 focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all resize-none" value={settings.about_us || ''} onChange={e => setSettings({...settings, about_us: e.target.value})} />
                    <button onClick={() => handleUpdateSettings('about_us', settings.about_us || '')} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg h-fit sm:mt-0 mt-2">Save About Us</button>
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-white/10 pt-8 mt-4">
                  <h4 className="text-lg font-bold text-gold-500 mb-6 flex items-center gap-2"><Image size={20} /> Hero Section Customization</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                      <label className="text-sm font-bold text-white/70">Hero Main Title</label>
                      <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={settings.hero_title || ''} onChange={e => setSettings({...settings, hero_title: e.target.value})} placeholder="e.g. Ugra Sena EDU" />
                      <button onClick={() => handleUpdateSettings('hero_title', settings.hero_title || '')} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all text-sm mt-2">Update Title</button>
                    </div>
                    <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                      <label className="text-sm font-bold text-white/70">Hero Subtitle</label>
                      <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={settings.hero_subtitle || ''} onChange={e => setSettings({...settings, hero_subtitle: e.target.value})} placeholder="e.g. UGRASENA EDUCUM PRIVATE LIMITED" />
                      <button onClick={() => handleUpdateSettings('hero_subtitle', settings.hero_subtitle || '')} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all text-sm mt-2">Update Subtitle</button>
                    </div>
                    <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                      <label className="text-sm font-bold text-white/70">Hero Tagline</label>
                      <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={settings.hero_tagline || ''} onChange={e => setSettings({...settings, hero_tagline: e.target.value})} placeholder='e.g. "Empowering Minds, Shaping Futures"' />
                      <button onClick={() => handleUpdateSettings('hero_tagline', settings.hero_tagline || '')} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all text-sm mt-2">Update Tagline</button>
                    </div>
                    <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                      <label className="text-sm font-bold text-white/70">Hero Background Image</label>
                      <ImageUpload onUpload={(url) => handleUpdateSettings('hero_image_url', url)} />
                      {settings.hero_image_url && <img src={settings.hero_image_url} alt="Hero Preview" className="h-24 mt-4 rounded-xl border border-white/10 object-cover w-full glass" />}
                    </div>
                    <div className="space-y-3 glass p-6 rounded-2xl border-white/10 shadow-xl">
                      <label className="text-sm font-bold text-white/70">Hero Background Video</label>
                      <VideoUpload onUpload={(url) => handleUpdateSettings('hero_video_url', url)} />
                      {settings.hero_video_url && <video src={settings.hero_video_url} autoPlay loop muted playsInline className="h-24 mt-4 rounded-xl border border-white/10 object-cover w-full glass" />}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2 glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <label className="text-sm font-bold text-white/70 flex items-center gap-2"><Bell size={16} /> Sticky Notice Board</label>
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <textarea className="flex-grow p-3 bg-white/5 border border-white/10 rounded-xl h-24 focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all resize-none" value={settings.notice_board || ''} onChange={e => setSettings({...settings, notice_board: e.target.value})} placeholder="This notice will always appear at the top of the Notice Board..." />
                    <button onClick={() => handleUpdateSettings('notice_board', settings.notice_board || '')} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg h-fit sm:mt-0 mt-2">Save Notice</button>
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2 glass p-6 rounded-2xl border-white/10 shadow-xl">
                  <label className="text-sm font-bold text-white/70 flex items-center gap-2">Notice Board Speed (seconds)</label>
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <input type="number" min="5" max="100" className="flex-grow p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-white transition-all" value={settings.marquee_speed || 25} onChange={e => setSettings({...settings, marquee_speed: parseInt(e.target.value)})} placeholder="25" />
                    <button onClick={() => handleUpdateSettings('marquee_speed', settings.marquee_speed || 25)} className="glass-gold text-gold-500 px-6 py-2 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg h-fit sm:mt-0 mt-2">Save Speed</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gold-500">User Comments</h3>
                {selectedComments.length > 0 && (
                  <button onClick={() => handleBulkDelete('comments', selectedComments, setSelectedComments)} className="glass text-red-400 border-red-500/20 px-4 py-2 rounded-xl font-bold hover:bg-red-500/10 transition-all text-sm shadow-lg">
                    Delete Selected ({selectedComments.length})
                  </button>
                )}
              </div>
              <div className="grid gap-4">
                {comments.map(c => {
                  const post = posts.find(p => p.id === c.post_id);
                  return (
                    <div key={c.id} className="glass border-white/10 rounded-2xl p-5 flex gap-4 hover:shadow-2xl transition-all">
                      <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500 cursor-pointer" checked={selectedComments.includes(c.id)} onChange={e => {
                        if (e.target.checked) setSelectedComments([...selectedComments, c.id]);
                        else setSelectedComments(selectedComments.filter(id => id !== c.id));
                      }} />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gold-500">{c.user_name}</h4>
                            <p className="text-xs text-white/50">{new Date(c.created_at).toLocaleString()}</p>
                          </div>
                          <button onClick={() => handleDeleteComment(c.id)} className="text-white/40 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-500/10">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-white/80 text-sm bg-white/5 p-3 rounded-xl border border-white/5 mb-2">{c.content}</p>
                        {post && (
                          <div className="flex items-center gap-2 text-xs text-gold-500 font-bold">
                            <Image size={12} /> On Post: {post.title}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {comments.length === 0 && (
                  <div className="text-center py-12 glass rounded-2xl border-2 border-dashed border-white/10">
                    <MessageCircle className="mx-auto text-white/20 mb-2" size={32} />
                    <p className="text-white/40">No comments found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gold-500">Student Registrations</h3>
                {selectedRegistrations.length > 0 && (
                  <button onClick={() => handleBulkDelete('registrations', selectedRegistrations, setSelectedRegistrations)} className="glass text-red-400 border-red-500/20 px-4 py-2 rounded-xl font-bold hover:bg-red-500/10 transition-all text-sm shadow-lg">
                    Delete Selected ({selectedRegistrations.length})
                  </button>
                )}
              </div>
              <div className="overflow-x-auto glass border-white/10 rounded-3xl shadow-2xl scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="p-6 w-12 text-gold-500">
                        <input type="checkbox" className="w-5 h-5 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500 cursor-pointer" checked={selectedRegistrations.length === registrations.length && registrations.length > 0} onChange={e => {
                          if (e.target.checked) setSelectedRegistrations(registrations.map(r => r.id));
                          else setSelectedRegistrations([]);
                        }} />
                      </th>
                      <th className="p-6 font-bold text-gold-500 text-sm uppercase tracking-wider">Name</th>
                      <th className="p-6 font-bold text-gold-500 text-sm uppercase tracking-wider">Class</th>
                      <th className="p-6 font-bold text-gold-500 text-sm uppercase tracking-wider">School</th>
                      <th className="p-6 font-bold text-gold-500 text-sm uppercase tracking-wider">Mobile</th>
                      <th className="p-6 font-bold text-gold-500 text-sm uppercase tracking-wider">Date</th>
                      <th className="p-6 font-bold text-gold-500 text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                        <td className="p-6">
                          <input type="checkbox" className="w-5 h-5 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500 cursor-pointer" checked={selectedRegistrations.includes(r.id)} onChange={e => {
                            if (e.target.checked) setSelectedRegistrations([...selectedRegistrations, r.id]);
                            else setSelectedRegistrations(selectedRegistrations.filter(id => id !== r.id));
                          }} />
                        </td>
                        <td className="p-6 text-white font-bold">{r.name}</td>
                        <td className="p-6 text-white/70">{r.class}</td>
                        <td className="p-6 text-white/70">{r.school}</td>
                        <td className="p-6 text-white/70 font-mono">{r.mobile}</td>
                        <td className="p-6 text-white/50 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleDeleteRegistration(r.id)} className="text-white/20 hover:text-red-400 transition-all p-3 rounded-xl hover:bg-red-500/10 group-hover:text-white/40">
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/secret-dashboard" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </Router>
  );
}
