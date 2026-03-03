export interface CV {
  id: string;
  title: string | null;
  summary: string | null;
  content: string | null; // Có thể dùng cho Markdown hoặc Rich Text
  file_url: string | null;
  updated_at: string;
}
