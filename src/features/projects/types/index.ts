export interface Project {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[]; // text[]
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  created_at: string;
}
