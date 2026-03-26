/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Logo } from './components/Logo';
import { Post, Notification, CompanySettings } from './types';
import { Trash2, Edit, Plus, LogOut, Settings, Bell, Image, Phone, Mail, MapPin } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>({
    phone: '+91 XXXXXXXXXX',
    email: 'info@ugrasenaeducum.com',
    address: 'Sasaram, Bihar',
    notice_board: 'SCHOLARSHIP 2026: Registration open for Classes 5th-10th. Application Fee: ₹399.'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          const s: any = {};
          data.forEach(item => { s[item.key] = item.value; });
          setSettings(prev => ({ ...prev, ...s }));
          localStorage.setItem('mock_settings', JSON.stringify(s));
        } else {
          const mock = localStorage.getItem('mock_settings');
          if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
        }
      } catch (error) {
        const mock = localStorage.getItem('mock_settings');
        if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
      }
    };
    fetchSettings();

    const channel = supabase.channel('layout_settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchSettings();
      }).subscribe();

    const handleLocalUpdate = () => {
      const mock = localStorage.getItem('mock_settings');
      if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
    };
    window.addEventListener('settings_updated', handleLocalUpdate);

    return () => { 
      supabase.removeChannel(channel); 
      window.removeEventListener('settings_updated', handleLocalUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] flex flex-wrap justify-center items-center overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <img key={i} src={settings.logo_url || "https://raw.githubusercontent.com/vrishketuray0/ugrasena-educum/main/logo.png"} alt="Watermark" className="w-64 h-64 m-8" referrerPolicy="no-referrer" />
        ))}
      </div>
      <header className="bg-navy-900 text-gold-500 p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-md gap-4">
        <Logo url={settings.logo_url} />
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
        <p className="transition-all duration-300 hover:text-white cursor-default">Registered Office: {settings.address} | CIN: U85500BR2026PTC083704</p>
        <p className="transition-all duration-300 hover:text-white cursor-default">Contact: {settings.phone} | Email: {settings.email}</p>
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
    try {
      const { error } = await supabase.from('registrations').insert([{
        ...formData,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      alert('Registration successful!');
      setFormData({ name: '', class: '', school: '', mobile: '' });
    } catch (error) {
      console.error('Error registering:', error);
      alert('Registration failed.');
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
  const [settings, setSettings] = useState({ phone: '', email: '', address: '' });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          const s: any = {};
          data.forEach(item => { s[item.key] = item.value; });
          setSettings(prev => ({ ...prev, ...s }));
          localStorage.setItem('mock_settings', JSON.stringify(s));
        } else {
          const mock = localStorage.getItem('mock_settings');
          if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
        }
      } catch (error) {
        const mock = localStorage.getItem('mock_settings');
        if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
      }
    }
    fetchSettings();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-navy-900 mb-12 text-center">Contact Us & Leadership</h2>
      
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gold-200">
          <h3 className="text-2xl font-bold text-navy-900 mb-6">Get In Touch</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="text-gold-500" size={20} />
              <span>{settings.phone || '+91 XXXXXXXXXX'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="text-gold-500" size={20} />
              <span>{settings.email || 'info@ugrasenaeducum.com'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="text-gold-500" size={20} />
              <span>{settings.address || 'Sasaram, Bihar'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md border border-gold-200">
          <h3 className="text-2xl font-bold text-navy-900 mb-4">Our Location</h3>
          <p className="text-gray-700 leading-relaxed">
            Registered Office: {settings.address || 'Sasaram, Bihar'}<br />
            CIN: U85500BR2026PTC083704
          </p>
        </div>
      </div>

      <h3 className="text-3xl font-bold text-navy-900 mb-8 text-center">Meet Our Leadership</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: 'Mr. Himanshu Kumar', role: 'CEO & Finance Department Head' },
          { name: 'Mr. Dipak Patel', role: 'Marketing Department Head' },
          { name: 'Mr. Vrishketu Ray', role: 'IT Cell & Management Department Head' }
        ].map((member, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-gold-500 text-center">
            <h4 className="text-xl font-bold text-navy-900 mb-2">{member.name}</h4>
            <p className="text-gold-600 font-medium">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setNotifications(data as Notification[]);
          localStorage.setItem('mock_notifications', JSON.stringify(data));
        } else {
          const mock = localStorage.getItem('mock_notifications');
          if (mock) setNotifications(JSON.parse(mock));
        }
      } catch (error) {
        const mock = localStorage.getItem('mock_notifications');
        if (mock) setNotifications(JSON.parse(mock));
      }
    };
    fetchNotices();

    const channel = supabase.channel('notice_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotices();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
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
  return (
    <section className="max-w-6xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-navy-900 mb-12 text-center">About Us</h2>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gold-200">
          <h3 className="text-2xl font-bold text-navy-900 mb-4">Our Vision & Mission</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Under the visionary leadership of our CEO <strong>Mr. Himanshu Kumar</strong>, Ugrasena Educum is an education-based organization dedicated to empowering students from Class 5th to 10th. 
            We believe every student deserves a fair chance to succeed. We bridge the gap in quality education by providing 
            scholarships, free online coaching, affordable offline coaching, sports support, and career guidance, 
            ensuring holistic development and a brighter future for all.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our dedicated team, including <strong>Mr. Dipak Patel</strong> (Marketing Head) and <strong>Mr. Vrishketu Ray</strong> (IT & Management Head), works tirelessly to ensure that talent is recognized and nurtured, regardless of financial barriers.
          </p>
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
      try {
        const { data: noticeData, error: nError } = await supabase
          .from('notifications')
          .select('message')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (nError) throw nError;
        if (noticeData && noticeData.length > 0) {
          setLatestNotice(noticeData[0].message);
        } else {
          const mock = localStorage.getItem('mock_notifications');
          if (mock) {
            const parsed = JSON.parse(mock);
            if (parsed.length > 0) setLatestNotice(parsed[0].message);
          }
        }
      } catch (error) {
        const mock = localStorage.getItem('mock_notifications');
        if (mock) {
          const parsed = JSON.parse(mock);
          if (parsed.length > 0) setLatestNotice(parsed[0].message);
        }
      }

      try {
        const { data: postsData, error: pError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (pError) throw pError;
        if (postsData && postsData.length > 0) {
          setPosts(postsData as Post[]);
        } else {
          const mock = localStorage.getItem('mock_posts');
          if (mock) setPosts(JSON.parse(mock).slice(0, 3));
        }
      } catch (error) {
        const mock = localStorage.getItem('mock_posts');
        if (mock) setPosts(JSON.parse(mock).slice(0, 3));
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center text-center text-white bg-navy-900 rounded-3xl overflow-hidden shadow-2xl">
        <img src="https://picsum.photos/seed/education/1920/1080" alt="Students" className="absolute inset-0 w-full h-full object-cover opacity-30" referrerPolicy="no-referrer" />
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
  const [media, setMedia] = useState<Post[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const mockAdmin = localStorage.getItem('mock_admin');
      if (mockAdmin) { setIsAdmin(true); }
      else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setIsAdmin(true);
      }
    };
    checkAdmin();

    const fetchMedia = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) {
          const mediaPosts = data.filter(p => p.image_url || p.video_link);
          setMedia(mediaPosts as Post[]);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
        const mock = localStorage.getItem('mock_posts');
        if (mock) {
          const parsed = JSON.parse(mock);
          setMedia(parsed.filter((p: any) => p.image_url || p.video_link));
        }
      }
    };
    fetchMedia();
    
    const channel = supabase.channel('gallery_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchMedia)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!confirm('Are you sure you want to delete this media post?')) return;
    try {
      // Optimistic update
      const newMedia = media.filter(p => p.id !== id);
      setMedia(newMedia);
      
      // Update local storage mock posts
      const mock = localStorage.getItem('mock_posts');
      if (mock) {
        const parsed = JSON.parse(mock);
        const updatedMock = parsed.filter((p: any) => p.id !== id);
        localStorage.setItem('mock_posts', JSON.stringify(updatedMock));
      }

      if (imageUrl && imageUrl.includes('supabase.co')) {
        try {
          const fileName = imageUrl.split('/').pop();
          if (fileName) {
            await supabase.storage.from('images').remove([fileName]);
          }
        } catch (e) {
          console.error("Failed to delete image from storage", e);
        }
      }
      
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      alert('Failed to delete media: ' + error.message);
      // Revert optimistic update by refetching
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (data) {
        setMedia(data.filter(p => p.image_url || p.video_link) as Post[]);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold text-navy-900 mb-8 text-center">Gallery</h2>
      {media.length === 0 ? (
        <p className="text-center text-gray-500">No media found in the gallery.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((item) => (
            <div key={item.id} className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-gold-500 group bg-navy-900">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" referrerPolicy="no-referrer" />
              ) : item.video_link ? (
                <div className="w-full h-64 flex items-center justify-center">
                  <a href={item.video_link} target="_blank" rel="noopener noreferrer" className="text-gold-500 flex flex-col items-center hover:text-white transition-colors">
                    <div className="w-16 h-16 rounded-full border-2 border-gold-500 flex items-center justify-center mb-2">
                      <span className="ml-1 text-2xl">▶</span>
                    </div>
                    <span className="font-bold">Watch Video</span>
                  </a>
                </div>
              ) : null}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white font-bold truncate">{item.title}</p>
                {item.description && <p className="text-gray-300 text-sm truncate">{item.description}</p>}
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(item.id, item.image_url)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                  title="Delete Media"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'notifications' | 'settings' | 'registrations'>('posts');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({ phone: '', email: '', address: '', notice_board: '' });

  const [newPost, setNewPost] = useState({ title: '', description: '', image_url: '', video_link: '', type: 'image' as 'film' | 'image' | 'video' });
  const [newNotification, setNewNotification] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error } = await supabase.storage.from('images').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      return publicUrl;
    } catch (error: any) {
      console.warn("Supabase storage error:", error.message);
      alert(`Image Upload Failed: ${error.message}. Please check your Supabase Storage settings or ensure you are logged in with a real account.`);
      return URL.createObjectURL(file);
    }
  };

  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [dbError, setDbError] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const mockAdmin = localStorage.getItem('mock_admin');
    if (mockAdmin) {
      setUser(JSON.parse(mockAdmin));
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        setLoading(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('mock_admin')) {
        setUser(session?.user || null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('mock_admin');
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      try {
        const { error: checkError } = await supabase.from('settings').select('key').limit(1);
        if (checkError && checkError.code !== 'PGRST116') {
          setDbStatus('error');
          setDbError(checkError.message);
        } else {
          setDbStatus('ok');
        }
      } catch (e: any) {
        setDbStatus('error');
        setDbError(e.message);
      }

      try {
        const { data: pData, error: pError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (pError) throw pError;
        if (pData && pData.length > 0) {
          setPosts(pData as Post[]);
          localStorage.setItem('mock_posts', JSON.stringify(pData));
        } else {
          const mock = localStorage.getItem('mock_posts');
          if (mock) setPosts(JSON.parse(mock));
        }
      } catch (e) {
        const mock = localStorage.getItem('mock_posts');
        if (mock) setPosts(JSON.parse(mock));
      }

      try {
        const { data: rData } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
        if (rData) setRegistrations(rData);
      } catch (e) {}

      try {
        const { data: nData, error: nError } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (nError) throw nError;
        if (nData && nData.length > 0) {
          setNotifications(nData as Notification[]);
          localStorage.setItem('mock_notifications', JSON.stringify(nData));
        } else {
          const mock = localStorage.getItem('mock_notifications');
          if (mock) setNotifications(JSON.parse(mock));
        }
      } catch (e) {
        const mock = localStorage.getItem('mock_notifications');
        if (mock) setNotifications(JSON.parse(mock));
      }

      try {
        const { data: sData, error: sError } = await supabase.from('settings').select('*');
        if (sError) throw sError;
        if (sData && sData.length > 0) {
          const s: any = {};
          sData.forEach(item => { s[item.key] = item.value; });
          setSettings(prev => ({ ...prev, ...s }));
          localStorage.setItem('mock_settings', JSON.stringify(s));
        } else {
          const mock = localStorage.getItem('mock_settings');
          if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
        }
      } catch (e) {
        const mock = localStorage.getItem('mock_settings');
        if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
      }
    };

    fetchAllData();

    const channel = supabase.channel('admin_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchAllData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Keep fetchData as an empty function to avoid breaking other parts of the code that call it
  async function fetchData() {}

  const handleUpdateSettings = async (key: keyof CompanySettings, value: string) => {
    const previousSettings = { ...settings };
    try {
      // Optimistic update
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      localStorage.setItem('mock_settings', JSON.stringify(newSettings));
      window.dispatchEvent(new Event('settings_updated'));

      const { data, error: selectError } = await supabase.from('settings').select('key').eq('key', key);
      if (selectError && selectError.code !== 'PGRST116') throw selectError;

      if (data && data.length > 0) {
        const { error } = await supabase.from('settings').update({ value }).eq('key', key);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('settings').insert([{ key, value }]);
        if (error) throw error;
      }
      
      alert(`${key.replace('_', ' ')} updated successfully in database!`);
    } catch (error: any) {
      console.error("Supabase error:", error);
      // Revert optimistic update
      setSettings(previousSettings);
      localStorage.setItem('mock_settings', JSON.stringify(previousSettings));
      window.dispatchEvent(new Event('settings_updated'));
      alert(`Failed to save to database: ${error.message}. (Are you using Demo Mode or missing tables?)`);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const newNotif = { message: newNotification, created_at: new Date().toISOString() };
    const tempId = Math.random().toString();
    const previousNotifs = [...notifications];
    
    try {
      // Optimistic update
      const newNotifs = [{ ...newNotif, id: tempId } as Notification, ...notifications];
      setNotifications(newNotifs);
      localStorage.setItem('mock_notifications', JSON.stringify(newNotifs));
      setNewNotification('');
      
      const { data, error } = await supabase.from('notifications').insert([newNotif]).select();
      if (error) throw error;
      if (data) {
        const finalNotifs = newNotifs.map(n => n.id === tempId ? data[0] as Notification : n);
        setNotifications(finalNotifs);
        localStorage.setItem('mock_notifications', JSON.stringify(finalNotifs));
      }
      
      alert('Notification sent successfully!');
    } catch (error: any) {
      console.error("Supabase error:", error);
      // Revert optimistic update
      setNotifications(previousNotifs);
      localStorage.setItem('mock_notifications', JSON.stringify(previousNotifs));
      setNewNotification(newNotif.message);
      alert(`Failed to sync to database: ${error.message}`);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    const previousNotifs = [...notifications];
    try {
      // Optimistic update
      const newNotifs = notifications.filter(n => n.id !== id);
      setNotifications(newNotifs);
      localStorage.setItem('mock_notifications', JSON.stringify(newNotifs));
      
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Supabase error:", error);
      // Revert optimistic update
      setNotifications(previousNotifs);
      localStorage.setItem('mock_notifications', JSON.stringify(previousNotifs));
      alert(`Failed to sync to database: ${error.message}`);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    const previousNotifs = [...notifications];
    try {
      // Optimistic update
      setNotifications([]);
      localStorage.setItem('mock_notifications', JSON.stringify([]));
      
      const { error } = await supabase.from('notifications').delete().neq('id', '0');
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Supabase error:", error);
      // Revert optimistic update
      setNotifications(previousNotifs);
      localStorage.setItem('mock_notifications', JSON.stringify(previousNotifs));
      alert(`Failed to sync to database: ${error.message}`);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const postToSave = { ...newPost, created_at: new Date().toISOString() };
    const previousPosts = [...posts];
    
    try {
      if (editingPost) {
        // Optimistic update
        const newPosts = posts.map(p => p.id === editingPost.id ? { ...p, ...newPost } : p);
        setPosts(newPosts);
        localStorage.setItem('mock_posts', JSON.stringify(newPosts));
        setEditingPost(null);
        
        const { error } = await supabase.from('posts').update(newPost).eq('id', editingPost.id);
        if (error) throw error;
        
        alert('Post updated successfully!');
      } else {
        // Optimistic update
        const tempId = Math.random().toString();
        const newPosts = [{ ...postToSave, id: tempId } as Post, ...posts];
        setPosts(newPosts);
        localStorage.setItem('mock_posts', JSON.stringify(newPosts));
        
        const { data, error } = await supabase.from('posts').insert([postToSave]).select();
        if (error) throw error;
        if (data) {
          const finalPosts = newPosts.map(p => p.id === tempId ? data[0] as Post : p);
          setPosts(finalPosts);
          localStorage.setItem('mock_posts', JSON.stringify(finalPosts));
        }
        
        alert('Post published successfully!');
      }
      setNewPost({ title: '', description: '', image_url: '', video_link: '', type: 'image' });
    } catch (error: any) {
      console.error("Supabase error:", error);
      // Revert optimistic update
      setPosts(previousPosts);
      localStorage.setItem('mock_posts', JSON.stringify(previousPosts));
      if (editingPost) setEditingPost(editingPost);
      alert(`Failed to sync to database: ${error.message}`);
    }
  };

  const handleDeletePost = async (id: string, imageUrl?: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const previousPosts = [...posts];
    try {
      // Optimistic update
      const newPosts = posts.filter(p => p.id !== id);
      setPosts(newPosts);
      localStorage.setItem('mock_posts', JSON.stringify(newPosts));
      
      if (imageUrl && imageUrl.includes('supabase.co')) {
        try {
          const fileName = imageUrl.split('/').pop();
          if (fileName) {
            await supabase.storage.from('images').remove([fileName]);
          }
        } catch (err) {
          console.error('Error deleting image from storage:', err);
        }
      }
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Supabase error:", error);
      // Revert optimistic update
      setPosts(previousPosts);
      localStorage.setItem('mock_posts', JSON.stringify(previousPosts));
      alert(`Failed to sync to database: ${error.message}`);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      description: post.description,
      image_url: post.image_url || '',
      video_link: post.video_link || '',
      type: post.type || 'image'
    });
    setActiveTab('posts');
    window.scrollTo(0, 0);
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;
    try {
      const { error } = await supabase.from('registrations').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      alert(`Error deleting registration: ${error.message}`);
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      let authError;
      if (isSignUpMode) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        authError = error;
        if (!error) {
          alert('Account created! If email confirmation is enabled in your Supabase dashboard, please check your email to verify your account before logging in.');
          setIsSignUpMode(false);
          setIsLoggingIn(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authError = error;
      }
      
      if (authError) throw authError;
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8">
          <div className="text-center mb-8">
            <div className="bg-navy-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Settings className="text-gold-500" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-navy-900">{isSignUpMode ? 'Create Admin' : 'Admin Login'}</h2>
            <p className="text-gray-500 mt-2">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full bg-navy-900 text-gold-500 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-navy-800 transition-all flex items-center justify-center gap-2 ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                  {isSignUpMode ? 'Creating...' : 'Logging in...'}
                </>
              ) : (
                isSignUpMode ? 'Create Account' : 'Login to Dashboard'
              )}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={() => {
                const mockUser = { email: 'vrishketuray0@gmail.com', id: 'demo-user' };
                localStorage.setItem('mock_admin', JSON.stringify(mockUser));
                setUser(mockUser);
              }}
              className="w-full bg-white text-navy-900 border-2 border-navy-900 py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              Bypass Login (Demo Mode)
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button 
              onClick={() => { setIsSignUpMode(!isSignUpMode); setLoginError(''); }}
              className="text-sm text-navy-900 font-bold hover:underline"
            >
              {isSignUpMode ? 'Already have an account? Login' : 'Need to create an admin account? Sign Up'}
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Ugrasena Educum Private Limited | Admin Portal
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allowedAdmins = ['ugrasena26@gmail.com', 'vrishketuray0@gmail.com'];
  if (!allowedAdmins.includes(user.email || '')) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">You do not have permission to access this dashboard.</p>
        <button onClick={handleLogout} className="bg-navy-900 text-gold-500 px-8 py-2 rounded-full font-bold">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {dbStatus === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Settings className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-lg font-medium text-red-800">Database Setup Required</h3>
              <div className="mt-2 text-sm text-red-700">
                <p className="mb-2">Your Supabase database is not configured correctly. Data will not be saved permanently until you run the following SQL script in your Supabase SQL Editor.</p>
                <p className="mb-4 font-mono bg-red-100 p-2 rounded text-xs">Error: {dbError}</p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
{`-- Run this in Supabase SQL Editor to create tables and allow access

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_link TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  school TEXT NOT NULL,
  mobile TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON registrations FOR SELECT USING (true);

-- Allow authenticated users to write
CREATE POLICY "Allow auth write" ON settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth write" ON posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth write" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth write" ON registrations FOR ALL USING (auth.role() = 'authenticated');`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-bold text-navy-900 flex items-center gap-2">
          <Settings className="text-gold-500" /> Admin Dashboard
        </h2>
        <div className="flex gap-2">
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        {[
          { id: 'posts', label: 'Manage Posts', icon: Image },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'settings', label: 'Company Info', icon: Settings },
          { id: 'registrations', label: 'Registrations', icon: Plus }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-navy-900 text-gold-500 shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white/40 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
        {activeTab === 'posts' && (
          <div className="space-y-12">
            <form onSubmit={handleCreatePost} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm">
              <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                {editingPost ? <Edit size={20} /> : <Plus size={20} />} {editingPost ? 'Edit Post' : 'Create New Post'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Title" className="p-3 border border-white/40 rounded-lg bg-white/50 focus:bg-white/80 transition-colors" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} required />
                <select className="p-3 border border-white/40 rounded-lg bg-white/50 focus:bg-white/80 transition-colors" value={newPost.type} onChange={e => setNewPost({...newPost, type: e.target.value as any})}>
                  <option value="image">Image Post</option>
                  <option value="video">Video Post</option>
                  <option value="film">Film Post</option>
                </select>
                <div className="flex flex-col gap-2">
                  <input type="url" placeholder="Image URL (Optional)" className="p-3 border border-white/40 rounded-lg bg-white/50 focus:bg-white/80 transition-colors" value={newPost.image_url} onChange={e => setNewPost({...newPost, image_url: e.target.value})} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Or upload:</span>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploading(true);
                          try {
                            const url = await uploadImage(file);
                            setNewPost({ ...newPost, image_url: url });
                          } catch (error) {
                            alert('Error uploading file.');
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-900 file:text-gold-500 hover:file:bg-navy-800"
                    />
                  </div>
                </div>
                <input type="url" placeholder="Video Link (Optional)" className="p-3 border border-white/40 rounded-lg bg-white/50 focus:bg-white/80 transition-colors" value={newPost.video_link} onChange={e => setNewPost({...newPost, video_link: e.target.value})} />
              </div>
              <textarea placeholder="Description" className="w-full p-3 border border-white/40 rounded-lg mb-4 h-32 bg-white/50 focus:bg-white/80 transition-colors" value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} required />
              <div className="flex gap-2">
                <button type="submit" disabled={isUploading} className="bg-navy-900 text-gold-500 px-8 py-2 rounded-lg font-bold hover:bg-navy-800 transition-all shadow-md disabled:opacity-50">
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </button>
                {editingPost && (
                  <button type="button" onClick={() => { setEditingPost(null); setNewPost({ title: '', description: '', image_url: '', video_link: '', type: 'image' }); }} className="bg-white/60 text-gray-700 px-8 py-2 rounded-lg font-bold border border-white/50 hover:bg-white/80 transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="grid md:grid-cols-2 gap-6">
              {posts.map(p => (
                <div key={p.id} className="border border-white/50 rounded-2xl p-4 flex gap-4 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all">
                  {p.image_url && <img src={p.image_url} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0 shadow-sm" />}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-navy-900 line-clamp-1">{p.title}</h4>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-navy-900/10 text-navy-900 px-2 py-1 rounded-full">{p.type || 'image'}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2 mt-1">{p.description}</p>
                    <div className="flex gap-3">
                      <button onClick={() => handleEditPost(p)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold transition-colors">
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeletePost(p.id, p.image_url)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs font-bold transition-colors">
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
            <form onSubmit={handleCreateNotification} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm">
              <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2"><Bell size={20} /> Send New Notification</h3>
              <textarea placeholder="Type your notification message here..." className="w-full p-3 border border-white/40 rounded-lg mb-4 h-24 bg-white/50 focus:bg-white/80 transition-colors" value={newNotification} onChange={e => setNewNotification(e.target.value)} required />
              <button type="submit" className="bg-navy-900 text-gold-500 px-8 py-2 rounded-lg font-bold hover:bg-navy-800 transition-all shadow-md">Send Notification</button>
            </form>

            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-navy-900">Recent Notifications</h4>
                {notifications.length > 0 && (
                  <button onClick={handleClearAllNotifications} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 transition-colors">
                    <Trash2 size={14} /> Clear All
                  </button>
                )}
              </div>
              {notifications.map(n => (
                <div key={n.id} className="flex items-center justify-between p-4 border border-white/50 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all shadow-sm">
                  <div className="flex-grow pr-4">
                    <p className="text-gray-700">{n.message}</p>
                    <span className="text-[10px] text-gray-500 font-medium">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <button onClick={() => handleDeleteNotification(n.id)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2"><Settings size={20} /> Company Information</h3>
            
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-4">Website Logo</label>
              <div className="flex items-center gap-6">
                <div className="bg-white/80 p-2 rounded-xl border border-white/50 shadow-sm">
                  <img src={logoPreviewUrl || settings.logo_url || "https://raw.githubusercontent.com/vrishketuray0/ugrasena-educum/main/logo.png"} alt="Current Logo" className="h-20 w-20 object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow flex flex-col gap-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedLogoFile(file);
                        setLogoPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-900 file:text-gold-500 hover:file:bg-navy-800 transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={async () => {
                        if (!selectedLogoFile) {
                          alert('Please select a logo file first.');
                          return;
                        }
                        setIsUploading(true);
                        try {
                          const url = await uploadImage(selectedLogoFile);
                          await handleUpdateSettings('logo_url', url);
                          setSelectedLogoFile(null);
                          setLogoPreviewUrl(null);
                        } catch (error) {
                          alert('Error saving logo.');
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                      disabled={isUploading || !selectedLogoFile}
                      className="bg-navy-900 text-gold-500 px-6 py-2 rounded-lg font-bold hover:bg-navy-800 transition-colors shadow-md disabled:opacity-50"
                    >
                      {isUploading ? 'Saving...' : 'Save Logo'}
                    </button>
                    {selectedLogoFile && (
                      <button 
                        onClick={() => {
                          setSelectedLogoFile(null);
                          setLogoPreviewUrl(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-sm font-bold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Recommended: Square PNG with transparent background</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Phone size={14} /> Contact Number</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-grow p-3 border border-white/40 rounded-lg bg-white/50 focus:bg-white/80 transition-colors" value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} />
                  <button onClick={() => handleUpdateSettings('phone', settings.phone || '')} className="bg-navy-900 text-gold-500 px-4 py-2 rounded-lg font-bold hover:bg-navy-800 transition-colors shadow-md">Save</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mail size={14} /> Email Address</label>
                <div className="flex gap-2">
                  <input type="email" className="flex-grow p-3 border border-white/40 rounded-lg bg-white/50 focus:bg-white/80 transition-colors" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} />
                  <button onClick={() => handleUpdateSettings('email', settings.email || '')} className="bg-navy-900 text-gold-500 px-4 py-2 rounded-lg font-bold hover:bg-navy-800 transition-colors shadow-md">Save</button>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><MapPin size={14} /> Office Address</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-grow p-3 border border-white/40 rounded-lg bg-white/50 focus:bg-white/80 transition-colors" value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} />
                  <button onClick={() => handleUpdateSettings('address', settings.address || '')} className="bg-navy-900 text-gold-500 px-4 py-2 rounded-lg font-bold hover:bg-navy-800 transition-colors shadow-md">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-navy-900 mb-4">Student Registrations</h3>
            <div className="overflow-x-auto rounded-2xl border border-white/50 shadow-sm bg-white/60 backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 border-b border-white/50">
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
                    <tr key={r.id} className="border-b border-white/30 hover:bg-white/80 transition-colors">
                      <td className="p-4 text-gray-800 font-medium">{r.name}</td>
                      <td className="p-4 text-gray-700">{r.class}</td>
                      <td className="p-4 text-gray-700">{r.school}</td>
                      <td className="p-4 text-gray-700">{r.mobile}</td>
                      <td className="p-4 text-gray-500 text-xs font-medium">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteRegistration(r.id)} className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No registrations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
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
