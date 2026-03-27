/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Logo } from './components/Logo';
import { Post, Notification, CompanySettings } from './types';
import { Trash2, Edit, Plus, LogOut, Settings, Bell, Image, Phone, Mail, MapPin, Heart, MessageCircle, Users } from 'lucide-react';
import { Auth } from './components/Auth';
import { ImageUpload } from './components/ImageUpload';
import { Modal } from './components/Modal';

function Layout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>({
    contact_number: '',
    email_address: '',
    office_address: '',
    notice_board: ''
  });
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-navy-900 text-gold-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold animate-pulse">Loading Ugrasena Educum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Notice Board Bar */}
      {settings.notice_board && (
        <div className="bg-gold-500 text-navy-900 py-2 px-4 overflow-hidden whitespace-nowrap z-[60]">
          <div className="animate-marquee inline-block font-bold">
            {settings.notice_board}
          </div>
        </div>
      )}
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] flex flex-wrap justify-center items-center overflow-hidden">
        {settings.logo_url && [...Array(20)].map((_, i) => (
          <img key={i} src={settings.logo_url} alt="Watermark" className="w-64 h-64 m-8" referrerPolicy="no-referrer" />
        ))}
      </div>
      <header className="bg-navy-900 text-gold-500 p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-md gap-4">
        <Logo />
        <nav className="flex gap-6 font-medium overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <Link to="/" className="hover:text-white transition whitespace-nowrap">Home</Link>
          <Link to="/about" className="hover:text-white transition whitespace-nowrap">About Us</Link>
          <Link to="/gallery" className="hover:text-white transition whitespace-nowrap">Gallery</Link>
          <Link to="/contact" className="hover:text-white transition whitespace-nowrap">Contact</Link>
          <Link to="/notice" className="hover:text-white transition whitespace-nowrap">Notice Board</Link>
          <Link to="/secret-dashboard" className="text-gold-500/20 hover:text-white transition whitespace-nowrap ml-4">Admin</Link>
        </nav>
      </header>
      <main className="flex-grow p-4 z-10">{children}</main>
      <footer className="bg-navy-900 text-gold-500 p-8 text-center text-sm border-t border-gold-500 z-10">
        <p className="font-bold text-lg mb-2 transition-all duration-300 hover:text-white cursor-default">UGRASENA EDUCUM PRIVATE LIMITED</p>
        <p className="transition-all duration-300 hover:text-white cursor-default">Registered Office: {settings.office_address} | CIN: U85500BR2026PTC083704</p>
        <p className="transition-all duration-300 hover:text-white cursor-default">Contact: {settings.contact_number} | Email: {settings.email_address}</p>
        <div className="mt-6">
          <Link to="/secret-dashboard" className="bg-gold-500/10 hover:bg-gold-500 text-gold-500 hover:text-navy-900 border border-gold-500 px-4 py-1 rounded-full transition-all text-xs font-bold">
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
    <form onSubmit={handleSubmit} className="border p-4 rounded shadow mt-8 bg-white">
      <h3 className="text-2xl font-bold text-navy-900 mb-4">Scholarship Registration</h3>
      <input type="text" placeholder="Name" className="block w-full p-2 mb-2 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
      <input type="text" placeholder="Class" className="block w-full p-2 mb-2 border" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} required />
      <input type="text" placeholder="School" className="block w-full p-2 mb-2 border" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} required />
      <input type="tel" placeholder="Mobile" className="block w-full p-2 mb-2 border" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} required />
      <button type="submit" className="bg-navy-900 text-gold-500 px-6 py-2 rounded font-bold">Register</button>
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
  const [team, setTeam] = useState<{ name: string, role: string }[]>([]);

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
      const { data } = await supabase.from('team').select('name, role').order('order_index', { ascending: true });
      if (data) setTeam(data);
    }
    fetchCompanyInfo();
    fetchTeam();

    // Add real-time subscription
    const channel = supabase?.channel('public_contact_info_changes')
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

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-navy-900 mb-12 text-center">Contact Us & Leadership</h2>
      
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gold-200 flex flex-col">
          <h3 className="text-2xl font-bold text-navy-900 mb-6">Get In Touch</h3>
          <div className="space-y-4 flex-grow">
            {info.contact_number && (
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="text-gold-500 shrink-0" size={20} />
                <span>{info.contact_number}</span>
              </div>
            )}
            {info.email_address && (
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="text-gold-500 shrink-0" size={20} />
                <span>{info.email_address}</span>
              </div>
            )}
            {info.office_address && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="text-gold-500 shrink-0" size={20} />
                <span>{info.office_address}</span>
              </div>
            )}
            {!info.contact_number && !info.email_address && !info.office_address && (
              <p className="text-gray-500 italic">Contact information not available.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md border border-gold-200">
          <h3 className="text-2xl font-bold text-navy-900 mb-4">Our Location</h3>
          {info.office_address ? (
            <p className="text-gray-700 leading-relaxed">
              Registered Office: {info.office_address}<br />
              CIN: U85500BR2026PTC083704
            </p>
          ) : (
            <p className="text-gray-500 italic">Address not available.</p>
          )}
        </div>
      </div>

      <h3 className="text-3xl font-bold text-navy-900 mb-8 text-center">Meet Our Leadership</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {team.length > 0 ? (
          team.map((member, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-gold-500 text-center">
              <h4 className="text-xl font-bold text-navy-900 mb-2">{member.name}</h4>
              <p className="text-gold-600 font-medium">{member.role}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 italic col-span-3">Leadership team information not available.</p>
        )}
      </div>
    </div>
  );
}

function NoticePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      if (!supabase) return;
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (data) setNotifications(data);
    }
    fetchNotifications();

    // Add real-time subscription
    const channel = supabase?.channel('public_all_notifications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h2 className="text-4xl font-bold text-navy-900 mb-8 text-center">Notice Board</h2>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <div key={n.id} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-gold-500">
              <p className="text-lg text-gray-700">{n.message}</p>
              <span className="text-xs text-gray-400 mt-2 block">{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gold-500 text-center">
            <p className="text-lg text-gray-700 italic">No active notices at the moment.</p>
          </div>
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
    <section className="max-w-6xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-navy-900 mb-12 text-center">About Us</h2>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gold-200">
          <h3 className="text-2xl font-bold text-navy-900 mb-4">Our Vision & Mission</h3>
          {aboutContent ? (
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {aboutContent}
            </div>
          ) : (
            <p className="text-gray-500 italic">About content not available.</p>
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gold-200">
            <h4 className="font-bold text-navy-900 mb-2">Scholarship Program</h4>
            <p className="text-sm text-gray-600">Selection based on merit through a transparent exam process. Top students receive 1-year full fee support, ensuring equal opportunity for all.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gold-200">
            <h4 className="font-bold text-navy-900 mb-2">Coaching & Guidance</h4>
            <p className="text-sm text-gray-600">We offer free online and affordable offline coaching classes, providing proper academic and career guidance to help students excel.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gold-200">
            <h4 className="font-bold text-navy-900 mb-2">Sports & Skill Development</h4>
            <p className="text-sm text-gray-600">We organize sports events to encourage physical and mental development, building teamwork, confidence, and a healthy lifestyle.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const [latestNotice, setLatestNotice] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;
      
      // Try fetching from company_info first for the sticky notice
      const { data: companyData } = await supabase.from('company_info').select('notice_board').eq('id', 1).single();
      if (companyData?.notice_board) {
        setLatestNotice(companyData.notice_board);
      } else {
        // Fallback to latest notification
        const { data: notices } = await supabase.from('notifications').select('message').order('created_at', { ascending: false }).limit(1).single();
        if (notices) setLatestNotice(notices.message);
      }

      const { data: postsData } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(3);
      if (postsData) setPosts(postsData);
    }
    fetchData();

    // Add real-time subscriptions
    const noticeChannel = supabase?.channel('public_notifications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchData();
      })
      .subscribe();

    const postsChannel = supabase?.channel('public_posts_changes')
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
      <section className="relative h-[70vh] flex items-center justify-center text-center text-white bg-navy-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-navy-900"></div>
        <div className="relative z-10 p-8 max-w-4xl">
          <h1 className="text-6xl font-extrabold mb-6 tracking-tight">UGRASENA EDUCUM PRIVATE LIMITED</h1>
          <p className="text-3xl font-light italic text-gold-500">"Empowering Minds, Shaping Futures"</p>
        </div>
      </section>

      {/* Summary Section */}
      <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {[
          { title: 'About Us', desc: 'Empowering students with quality education.', link: '/about', label: 'Read More' },
          { title: 'Latest Notice', desc: latestNotice || 'Stay tuned for updates.', link: '/notice', label: 'View All' },
          { title: 'Gallery', desc: 'Explore our campus life and achievements.', link: '/gallery', label: 'View Gallery' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-gold-100 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-navy-900 mb-4">{item.title}</h3>
            <p className="text-gray-600 mb-6 flex-grow line-clamp-3">{item.desc}</p>
            <Link to={item.link} className="bg-gold-500 text-navy-900 px-6 py-2 rounded-full font-bold hover:bg-gold-600 transition-colors">
              {item.label}
            </Link>
          </div>
        ))}
      </section>

      {/* Latest Posts Section */}
      {posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-navy-900 mb-12 text-center">Latest Updates</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gold-100 flex flex-col">
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-bold text-navy-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-4 mb-4">{post.description}</p>
                </div>
                {post.video_link && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <a href={post.video_link} target="_blank" rel="noopener noreferrer" className="text-gold-600 font-bold text-sm hover:underline">Watch Video</a>
                  </div>
                )}
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
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState({ name: '', content: '' });

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    if (!supabase) return;
    const { data } = await supabase.from('posts').select('*').not('image_url', 'is', null).order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  }

  const handleLike = async (post: Post) => {
    if (!supabase) return;
    const newLikes = (post.likes_count || 0) + 1;
    const { error } = await supabase.from('posts').update({ likes_count: newLikes }).eq('id', post.id);
    if (!error) {
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes_count: newLikes } : p));
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
      alert('Comment added!');
      setCommentingPost(null);
      setNewComment({ name: '', content: '' });
    }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div></div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold text-navy-900 mb-8 text-center">Gallery</h2>
      
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gold-100 group flex flex-col">
              <div className="relative overflow-hidden h-72 cursor-pointer" onClick={() => setSelectedImage(post.image_url || null)}>
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 ease-in-out" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold bg-navy-900/50 px-4 py-2 rounded-full backdrop-blur-sm">View Full Image</span>
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-navy-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.description}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button 
                    onClick={() => handleLike(post)}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group/like"
                  >
                    <Heart size={20} className={post.likes_count ? "fill-red-500 text-red-500" : "group-hover/like:fill-red-500"} />
                    <span className="font-bold text-sm">{post.likes_count || 0}</span>
                  </button>
                  
                  <button 
                    onClick={() => setCommentingPost(post)}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span className="font-bold text-sm">Comment</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Image className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No photos in the gallery yet.</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-8 right-8 text-white text-4xl hover:text-gold-500 transition">&times;</button>
          <img 
            src={selectedImage} 
            alt="Full view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300" 
            referrerPolicy="no-referrer" 
          />
        </div>
      )}

      {/* Comment Modal */}
      <Modal isOpen={!!commentingPost} onClose={() => setCommentingPost(null)}>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-navy-900 mb-4 flex items-center gap-2">
            <MessageCircle className="text-gold-500" /> Add Comment
          </h3>
          <p className="text-gray-500 text-sm mb-6">Sharing your thoughts on: <span className="font-bold text-navy-900">{commentingPost?.title}</span></p>
          
          <form onSubmit={handleAddComment} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-gold-500 outline-none" 
                placeholder="Enter your name"
                value={newComment.name}
                onChange={e => setNewComment({...newComment, name: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Comment</label>
              <textarea 
                className="w-full p-3 border rounded-xl h-32 focus:ring-2 focus:ring-gold-500 outline-none" 
                placeholder="What's on your mind?"
                value={newComment.content}
                onChange={e => setNewComment({...newComment, content: e.target.value})}
                required 
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-grow bg-navy-900 text-gold-500 py-3 rounded-xl font-bold hover:bg-navy-800 transition-all">
                Post Comment
              </button>
              <button type="button" onClick={() => setCommentingPost(null)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">
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
  const [activeTab, setActiveTab] = useState<'posts' | 'notifications' | 'settings' | 'registrations' | 'team'>('posts');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
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
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', order_index: 0 });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<any | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

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

  useEffect(() => {
    if (user && supabase) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    if (!supabase) return;
    try {
      const [{ data: postsData }, { data: regData }, { data: notifData }, { data: companyData }, { data: teamData }] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('company_info').select('*').eq('id', 1).single(),
        supabase.from('team').select('*').order('order_index', { ascending: true })
      ]);

      setPosts(postsData || []);
      setRegistrations(regData || []);
      setNotifications(notifData || []);
      setTeam(teamData || []);
      
      if (companyData) {
        setSettings(prev => ({ ...prev, ...companyData }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  const handleUpdateSettings = async (key: keyof CompanySettings, value: string) => {
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
    if (!supabase) return;
    const { error } = await supabase.from('notifications').insert([{ message: newNotification }]);
    if (error) {
      alert('Error sending notification.');
    } else {
      alert('Notification sent!');
      setNewNotification('');
      fetchData();
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) alert('Error deleting notification.');
    else fetchData();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    if (editingPost) {
      const { error } = await supabase.from('posts').update(newPost).eq('id', editingPost.id);
      if (error) alert('Error updating post.');
      else {
        alert('Post updated!');
        setEditingPost(null);
        setNewPost({ title: '', description: '', image_url: '', video_link: '' });
        fetchData();
      }
    } else {
      const { error } = await supabase.from('posts').insert([newPost]);
      if (error) alert('Error creating post.');
      else {
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
    if (!supabase) return;
    
    if (editingTeamMember) {
      const { error } = await supabase.from('team').update(newTeamMember).eq('id', editingTeamMember.id);
      if (error) alert('Error updating team member.');
      else {
        alert('Team member updated!');
        setEditingTeamMember(null);
        setNewTeamMember({ name: '', role: '', order_index: 0 });
        fetchData();
      }
    } else {
      const { error } = await supabase.from('team').insert([newTeamMember]);
      if (error) alert('Error adding team member.');
      else {
        alert('Team member added!');
        setNewTeamMember({ name: '', role: '', order_index: 0 });
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

  const handleBulkDelete = async (table: string, ids: string[], setSelected: (ids: string[]) => void) => {
    if (!supabase) return;
    const { error } = await supabase.from(table).delete().in('id', ids);
    if (error) alert(`Error deleting ${table}.`);
    else {
      setSelected([]);
      fetchData();
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 text-navy-900 font-bold">Loading Admin Panel...</div>;

  if (!supabase) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Database Not Configured</h2>
        <p className="text-gray-600 mb-8">Please configure your Supabase URL and Anon Key in the Secrets panel to use the Admin Dashboard.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Auth />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-navy-900 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-gold-500 mb-8 flex items-center gap-2">
          <Settings /> Admin
        </h2>
        <nav className="flex-grow space-y-2">
          {[
            { id: 'posts', label: 'Gallery & Posts', icon: Image },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'team', label: 'Leadership Team', icon: Users },
            { id: 'settings', label: 'Company Info', icon: Settings },
            { id: 'registrations', label: 'Registrations', icon: Plus }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id ? 'bg-gold-500 text-navy-900' : 'text-gray-400 hover:bg-navy-800 hover:text-white'
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
      <main className="flex-grow p-8">
        <div className="flex justify-end mb-4">
          <button onClick={fetchData} className="flex items-center gap-2 text-navy-900 hover:text-gold-600 font-bold transition-all">
            <Settings size={18} className="animate-spin-slow" /> Refresh Data
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-gold-100 p-8">
          {activeTab === 'posts' && (
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                  {editingPost ? <Edit size={24} /> : <Plus size={24} />} {editingPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                {selectedPosts.length > 0 && (
                  <button onClick={() => handleBulkDelete('posts', selectedPosts, setSelectedPosts)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-all">
                    Delete Selected ({selectedPosts.length})
                  </button>
                )}
              </div>
              <form onSubmit={handleCreatePost} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Title" className="p-3 border rounded-lg" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} required />
                  <ImageUpload onUpload={(url) => setNewPost({...newPost, image_url: url})} />
                  <input type="url" placeholder="Video Link (Optional)" className="p-3 border rounded-lg" value={newPost.video_link} onChange={e => setNewPost({...newPost, video_link: e.target.value})} />
                </div>
                <textarea placeholder="Description" className="w-full p-3 border rounded-lg mb-4 h-32" value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} required />
                <div className="flex gap-2">
                  <button type="submit" className="bg-navy-900 text-gold-500 px-8 py-2 rounded-lg font-bold hover:bg-navy-800 transition-all">
                    {editingPost ? 'Update Post' : 'Publish Post'}
                  </button>
                  {editingPost && (
                    <button type="button" onClick={() => { setEditingPost(null); setNewPost({ title: '', description: '', image_url: '', video_link: '' }); }} className="bg-gray-200 text-gray-700 px-8 py-2 rounded-lg font-bold">
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="grid md:grid-cols-2 gap-6">
                {posts.map(p => (
                  <div key={p.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 bg-white hover:shadow-md transition-shadow relative">
                    <input type="checkbox" className="absolute top-4 left-4" checked={selectedPosts.includes(p.id)} onChange={e => {
                      if (e.target.checked) setSelectedPosts([...selectedPosts, p.id]);
                      else setSelectedPosts(selectedPosts.filter(id => id !== p.id));
                    }} />
                    {p.image_url && <img src={p.image_url} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0 ml-6" />}
                    <div className="flex-grow">
                      <h4 className="font-bold text-navy-900 line-clamp-1">{p.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.description}</p>
                      <div className="flex gap-3">
                        <button onClick={() => handleEditPost(p)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDeletePost(p.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs font-bold">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-navy-900 flex items-center gap-2"><Bell size={24} /> Send New Notification</h3>
                {selectedNotifications.length > 0 && (
                  <button onClick={() => handleBulkDelete('notifications', selectedNotifications, setSelectedNotifications)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-all">
                    Delete Selected ({selectedNotifications.length})
                  </button>
                )}
              </div>
              <form onSubmit={handleCreateNotification} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <textarea placeholder="Type your notification message here..." className="w-full p-3 border rounded-lg mb-4 h-24" value={newNotification} onChange={e => setNewNotification(e.target.value)} required />
                <button type="submit" className="bg-navy-900 text-gold-500 px-8 py-2 rounded-lg font-bold hover:bg-navy-800 transition-all">Send Notification</button>
              </form>

              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={selectedNotifications.includes(n.id)} onChange={e => {
                      if (e.target.checked) setSelectedNotifications([...selectedNotifications, n.id]);
                      else setSelectedNotifications(selectedNotifications.filter(id => id !== n.id));
                    }} />
                    <div className="flex-grow">
                      <p className="text-gray-700">{n.message}</p>
                      <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <button onClick={() => handleDeleteNotification(n.id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                  {editingTeamMember ? <Edit size={24} /> : <Plus size={24} />} {editingTeamMember ? 'Edit Member' : 'Add Team Member'}
                </h3>
                {selectedTeamMembers.length > 0 && (
                  <button onClick={() => handleBulkDelete('team', selectedTeamMembers, setSelectedTeamMembers)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-all">
                    Delete Selected ({selectedTeamMembers.length})
                  </button>
                )}
              </div>
              <form onSubmit={handleCreateTeamMember} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <input type="text" placeholder="Name" className="p-3 border rounded-lg" value={newTeamMember.name} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} required />
                  <input type="text" placeholder="Role" className="p-3 border rounded-lg" value={newTeamMember.role} onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value})} required />
                  <input type="number" placeholder="Order Index" className="p-3 border rounded-lg" value={newTeamMember.order_index} onChange={e => setNewTeamMember({...newTeamMember, order_index: parseInt(e.target.value)})} required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-navy-900 text-gold-500 px-8 py-2 rounded-lg font-bold hover:bg-navy-800 transition-all">
                    {editingTeamMember ? 'Update Member' : 'Add Member'}
                  </button>
                  {editingTeamMember && (
                    <button type="button" onClick={() => { setEditingTeamMember(null); setNewTeamMember({ name: '', role: '', order_index: 0 }); }} className="bg-gray-200 text-gray-700 px-8 py-2 rounded-lg font-bold">
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="grid md:grid-cols-2 gap-6">
                {team.map(m => (
                  <div key={m.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 bg-white hover:shadow-md transition-shadow relative">
                    <input type="checkbox" className="absolute top-4 left-4" checked={selectedTeamMembers.includes(m.id)} onChange={e => {
                      if (e.target.checked) setSelectedTeamMembers([...selectedTeamMembers, m.id]);
                      else setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== m.id));
                    }} />
                    <div className="flex-grow ml-6">
                      <h4 className="font-bold text-navy-900">{m.name}</h4>
                      <p className="text-sm text-gold-600 font-medium">{m.role}</p>
                      <p className="text-xs text-gray-400 mt-1">Order: {m.order_index}</p>
                      <div className="flex gap-3 mt-3">
                        <button onClick={() => handleEditTeamMember(m)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDeleteTeamMember(m.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs font-bold">
                          <Trash2 size={14} /> Delete
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
              <h3 className="text-2xl font-bold text-navy-900 flex items-center gap-2"><Settings size={24} /> Company Information</h3>
              {successMessage && <div className="bg-green-100 text-green-800 p-4 rounded-lg">{successMessage}</div>}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Company Logo</label>
                  <ImageUpload onUpload={(url) => handleUpdateSettings('logo_url', url)} />
                  {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-16 mt-2" />}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Phone size={14} /> Contact Number</label>
                  <div className="flex gap-2">
                    <input type="text" className="flex-grow p-3 border rounded-lg" value={settings.contact_number || ''} onChange={e => setSettings({...settings, contact_number: e.target.value})} />
                    <button onClick={() => handleUpdateSettings('contact_number', settings.contact_number)} className="bg-navy-900 text-gold-500 px-4 py-2 rounded-lg font-bold">Save</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Mail size={14} /> Email Address</label>
                  <div className="flex gap-2">
                    <input type="email" className="flex-grow p-3 border rounded-lg" value={settings.email_address || ''} onChange={e => setSettings({...settings, email_address: e.target.value})} />
                    <button onClick={() => handleUpdateSettings('email_address', settings.email_address)} className="bg-navy-900 text-gold-500 px-4 py-2 rounded-lg font-bold">Save</button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><MapPin size={14} /> Office Address</label>
                  <div className="flex gap-2">
                    <input type="text" className="flex-grow p-3 border rounded-lg" value={settings.office_address || ''} onChange={e => setSettings({...settings, office_address: e.target.value})} />
                    <button onClick={() => handleUpdateSettings('office_address', settings.office_address)} className="bg-navy-900 text-gold-500 px-4 py-2 rounded-lg font-bold">Save</button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-600 flex items-center gap-2">About Us Content</label>
                  <textarea className="w-full p-3 border rounded-lg h-32" value={settings.about_us || ''} onChange={e => setSettings({...settings, about_us: e.target.value})} />
                  <button onClick={() => handleUpdateSettings('about_us', settings.about_us || '')} className="bg-navy-900 text-gold-500 px-8 py-2 rounded-lg font-bold mt-2">Save About Us</button>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-600 flex items-center gap-2">Notice Board Text</label>
                  <textarea className="w-full p-3 border rounded-lg h-24" value={settings.notice_board || ''} onChange={e => setSettings({...settings, notice_board: e.target.value})} />
                  <button onClick={() => handleUpdateSettings('notice_board', settings.notice_board || '')} className="bg-navy-900 text-gold-500 px-8 py-2 rounded-lg font-bold mt-2">Save Notice Board</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-navy-900">Student Registrations</h3>
                {selectedRegistrations.length > 0 && (
                  <button onClick={() => handleBulkDelete('registrations', selectedRegistrations, setSelectedRegistrations)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-all">
                    Delete Selected ({selectedRegistrations.length})
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4">
                        <input type="checkbox" checked={selectedRegistrations.length === registrations.length && registrations.length > 0} onChange={e => {
                          if (e.target.checked) setSelectedRegistrations(registrations.map(r => r.id));
                          else setSelectedRegistrations([]);
                        }} />
                      </th>
                      <th className="p-4 font-bold text-navy-900">Name</th>
                      <th className="p-4 font-bold text-navy-900">Class</th>
                      <th className="p-4 font-bold text-navy-900">School</th>
                      <th className="p-4 font-bold text-navy-900">Mobile</th>
                      <th className="p-4 font-bold text-navy-900">Date</th>
                      <th className="p-4 font-bold text-navy-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(r => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <input type="checkbox" checked={selectedRegistrations.includes(r.id)} onChange={e => {
                            if (e.target.checked) setSelectedRegistrations([...selectedRegistrations, r.id]);
                            else setSelectedRegistrations(selectedRegistrations.filter(id => id !== r.id));
                          }} />
                        </td>
                        <td className="p-4 text-gray-700">{r.name}</td>
                        <td className="p-4 text-gray-700">{r.class}</td>
                        <td className="p-4 text-gray-700">{r.school}</td>
                        <td className="p-4 text-gray-700">{r.mobile}</td>
                        <td className="p-4 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <button onClick={() => handleDeleteRegistration(r.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
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
