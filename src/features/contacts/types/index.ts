export interface Contact {
  id: string;          // UUID trong Postgres sẽ map thành string trong TS
  name: string;
  email: string;
  message: string;
  is_read: boolean;    // Cần thiết để xử lý logic "Mark as Read"
  created_at: string;  // Timestamptz từ Postgres trả về dạng ISO string
}
