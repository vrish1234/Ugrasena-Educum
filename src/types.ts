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

export interface CompanySettings {
  contact_number: string;
  email_address: string;
  office_address: string;
  notice_board: string;
  about_us?: string;
  logo_url?: string;
  marquee_speed?: number;
}
