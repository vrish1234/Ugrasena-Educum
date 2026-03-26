export interface Post {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_link?: string;
  type?: 'film' | 'image' | 'video';
  created_at: string;
}

export interface Notification {
  id: string;
  message: string;
  created_at: string;
}

export interface CompanySettings {
  phone: string;
  email: string;
  address: string;
  notice_board: string;
  logo_url?: string;
}
