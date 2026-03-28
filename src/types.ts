export interface Post {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_link?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  message: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  contact_number?: string;
  order_index: number;
  created_at: string;
}

export interface CompanySettings {
  contact_number: string;
  email_address: string;
  office_address: string;
  notice_board: string;
  about_us?: string;
  logo_url?: string;
  marquee_speed?: number;
  hero_title?: string;
  hero_subtitle?: string;
  hero_tagline?: string;
  hero_image_url?: string;
  hero_video_url?: string;
}
