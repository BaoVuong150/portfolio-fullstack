-- ============================================================
--  PROJECT     : Portfolio Fullstack
--  AUTHOR      : Vuong Ngoc Gia Bao
--  GITHUB      : https://github.com/BaoVuong150
--  VERSION     : 1.0.0
--  DATE        : 2026-03-04
--  DATABASE    : PostgreSQL 17+ (hosted on Supabase)
--  DESCRIPTION : Public schema cho website Portfolio cá nhân.
--                Bao gồm DDL (Create Table), Indexes, RLS Policies,
--                và Seed Data mẫu.
-- ============================================================
--
--  ERD (Entity Relationship Diagram) — Tóm tắt bằng văn bản:
--
--  [profile]          — Thông tin cá nhân của developer (1 bản ghi)
--       |
--       +── không có FK trực tiếp, nhưng là trung tâm logic
--
--  [projects]         — Danh sách dự án đã làm (n bản ghi)
--
--  [skills]           — Kỹ năng lập trình, phân nhóm theo category
--
--  [cv]               — Hồ sơ CV / file PDF upload lên Supabase Storage
--
--  [contact_messages] — Tin nhắn từ khách gửi qua form liên hệ
--
--  [site_settings]    — Cài đặt chung của website (1 bản ghi singleton)
--
--  Quan hệ chính:
--    • Tất cả các bảng dùng UUID làm Primary Key (gen_random_uuid()).
--    • Không có Foreign Key liên kết giữa các bảng public (thiết kế
--      denormalized cho đơn giản và hiệu năng tốt hơn với Supabase).
--    • Row Level Security (RLS) được bật cho tất cả bảng.
--      - Người dùng chưa đăng nhập (anon) chỉ có quyền SELECT.
--      - Người dùng đã đăng nhập (authenticated) có toàn quyền.
-- ============================================================

-- Đảm bảo extension uuid được bật (Supabase đã cài sẵn)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 1: DDL — CREATE TABLES
-- Thứ tự: Độc lập trước, phụ thuộc sau (tránh lỗi FK nếu có)
--   1. profile
--   2. cv
--   3. site_settings
--   4. skills
--   5. projects
--   6. contact_messages
-- ============================================================

-- ------------------------------------------------------------
-- TABLE: public.profile
-- Mục đích : Lưu thông tin cá nhân của developer.
--            Chỉ có đúng 1 bản ghi trong bảng này (singleton).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile (
    id          uuid                     DEFAULT gen_random_uuid()  NOT NULL,
    full_name   text                                                NOT NULL,  -- Họ và tên đầy đủ
    title       text                     DEFAULT 'Software Engineer'          ,  -- Chức danh / vị trí
    bio         text                                                          ,  -- Giới thiệu bản thân ngắn
    goal        text                                                          ,  -- Mục tiêu nghề nghiệp
    avatar_url  text                                                          ,  -- URL ảnh đại diện (Cloudinary / Supabase Storage)
    email       text                                                          ,  -- Email liên hệ công khai
    github      text                                                          ,  -- URL GitHub profile
    linkedin    text                                                          ,  -- URL LinkedIn profile
    created_at  timestamptz              DEFAULT now()              NOT NULL,
    updated_at  timestamptz              DEFAULT now()              NOT NULL,

    CONSTRAINT profile_pkey PRIMARY KEY (id),
    CONSTRAINT profile_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE  public.profile              IS 'Thông tin cá nhân của developer. Singleton — chỉ có 1 bản ghi.';
COMMENT ON COLUMN public.profile.full_name    IS 'Họ và tên đầy đủ của developer.';
COMMENT ON COLUMN public.profile.title        IS 'Chức danh công việc, ví dụ: Fullstack Developer.';
COMMENT ON COLUMN public.profile.bio          IS 'Giới thiệu bản thân ngắn gọn hiển thị ở trang chủ.';
COMMENT ON COLUMN public.profile.goal         IS 'Mục tiêu nghề nghiệp ngắn hạn hoặc dài hạn.';
COMMENT ON COLUMN public.profile.avatar_url   IS 'URL ảnh đại diện, có thể là Cloudinary hoặc Supabase Storage URL.';
COMMENT ON COLUMN public.profile.email        IS 'Email công khai để nhà tuyển dụng liên hệ.';
COMMENT ON COLUMN public.profile.github       IS 'Đường dẫn tới GitHub profile.';
COMMENT ON COLUMN public.profile.linkedin     IS 'Đường dẫn tới LinkedIn profile.';
COMMENT ON COLUMN public.profile.created_at   IS 'Thời điểm tạo bản ghi (UTC).';
COMMENT ON COLUMN public.profile.updated_at   IS 'Thời điểm cập nhật gần nhất (UTC).';


-- ------------------------------------------------------------
-- TABLE: public.cv
-- Mục đích : Lưu thông tin CV và đường dẫn file PDF.
--            Singleton — chỉ 1 bản ghi, cập nhật khi upload mới.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cv (
    id          uuid        DEFAULT gen_random_uuid()  NOT NULL,
    title       text        DEFAULT 'Curriculum Vitae'            ,  -- Tiêu đề CV
    summary     text                                              ,  -- Tóm tắt nội dung CV
    content     text                                              ,  -- Nội dung chi tiết (markdown / plain text)
    file_url    text                                              ,  -- URL file PDF lưu trên Supabase Storage
    updated_at  timestamptz DEFAULT now()              NOT NULL,

    CONSTRAINT cv_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE  public.cv           IS 'Lưu thông tin CV của developer và URL trỏ tới file PDF trên Supabase Storage.';
COMMENT ON COLUMN public.cv.title     IS 'Tiêu đề CV, ví dụ: "Curriculum Vitae - Gia Bao".';
COMMENT ON COLUMN public.cv.summary   IS 'Tóm tắt ngắn về nội dung và định hướng trong CV.';
COMMENT ON COLUMN public.cv.content   IS 'Nội dung chi tiết CV dạng text (tuỳ chọn, có thể để trống nếu dùng file PDF).';
COMMENT ON COLUMN public.cv.file_url  IS 'Signed URL hoặc Public URL của file PDF trên Supabase Storage.';
COMMENT ON COLUMN public.cv.updated_at IS 'Thời điểm cập nhật gần nhất khi CV được upload lại.';


-- ------------------------------------------------------------
-- TABLE: public.site_settings
-- Mục đích : Cài đặt toàn trang (tên website, SEO, footer).
--            Singleton — chỉ 1 bản ghi.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id               uuid        DEFAULT gen_random_uuid()  NOT NULL,
    site_name        text        DEFAULT 'My Portfolio'           NOT NULL,  -- Tên hiển thị của website
    logo_url         text                                                  ,  -- URL logo website
    footer_text      text        DEFAULT '© 2026. All rights reserved.'   ,  -- Văn bản footer
    seo_title        text                                                  ,  -- Thẻ <title> cho SEO
    seo_description  text                                                  ,  -- Thẻ <meta description> cho SEO
    updated_at       timestamptz DEFAULT now()              NOT NULL,

    CONSTRAINT site_settings_pkey     PRIMARY KEY (id),
    CONSTRAINT site_settings_name_len CHECK (char_length(site_name) <= 100)
);

COMMENT ON TABLE  public.site_settings                IS 'Cài đặt chung của toàn website. Singleton — chỉ có 1 bản ghi.';
COMMENT ON COLUMN public.site_settings.site_name      IS 'Tên website hiển thị trên thanh tiêu đề trình duyệt.';
COMMENT ON COLUMN public.site_settings.logo_url       IS 'URL hình ảnh logo (PNG/SVG), hiển thị trên navbar.';
COMMENT ON COLUMN public.site_settings.footer_text    IS 'Văn bản bản quyền hiển thị ở cuối trang.';
COMMENT ON COLUMN public.site_settings.seo_title      IS 'Tiêu đề SEO dạng "Tên | Chức danh", hiện trong tab trình duyệt.';
COMMENT ON COLUMN public.site_settings.seo_description IS 'Mô tả SEO 150-160 ký tự, được Google đọc và hiển thị trong kết quả tìm kiếm.';


-- ------------------------------------------------------------
-- TABLE: public.skills
-- Mục đích : Danh sách kỹ năng lập trình, phân nhóm theo danh mục.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
    id          uuid        DEFAULT gen_random_uuid()  NOT NULL,
    name        text                                   NOT NULL,  -- Tên kỹ năng, ví dụ: "ReactJS"
    level       integer     DEFAULT 50                 NOT NULL,  -- Mức độ thành thạo (1–100)
    category    text        DEFAULT 'Other'            NOT NULL,  -- Nhóm kỹ năng: Frontend, Backend, Database, Other
    created_at  timestamptz DEFAULT now()              NOT NULL,

    CONSTRAINT skills_pkey         PRIMARY KEY (id),
    CONSTRAINT skills_name_unique  UNIQUE (name),
    CONSTRAINT skills_level_range  CHECK (level BETWEEN 1 AND 100),
    CONSTRAINT skills_category_val CHECK (category IN ('Frontend', 'Backend', 'Database', 'DevOps', 'Other'))
);

COMMENT ON TABLE  public.skills           IS 'Danh sách kỹ năng lập trình của developer, phân loại theo nhóm.';
COMMENT ON COLUMN public.skills.name      IS 'Tên kỹ năng (unique), ví dụ: ReactJS, PostgreSQL, Docker.';
COMMENT ON COLUMN public.skills.level     IS 'Mức độ thành thạo từ 1 đến 100. Hiển thị dạng thanh progress bar trên UI.';
COMMENT ON COLUMN public.skills.category  IS 'Nhóm kỹ năng: Frontend | Backend | Database | DevOps | Other.';
COMMENT ON COLUMN public.skills.created_at IS 'Thời điểm thêm kỹ năng.';

-- Index: Tăng tốc lọc kỹ năng theo danh mục (dùng nhiều trong UI)
CREATE INDEX IF NOT EXISTS idx_skills_category
    ON public.skills (category);

-- Index: Hỗ trợ tìm kiếm kỹ năng theo tên (text search)
CREATE INDEX IF NOT EXISTS idx_skills_name
    ON public.skills (name);


-- ------------------------------------------------------------
-- TABLE: public.projects
-- Mục đích : Danh sách dự án nổi bật của developer.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id           uuid        DEFAULT gen_random_uuid()  NOT NULL,
    title        text                                   NOT NULL,  -- Tên dự án
    description  text                                            ,  -- Mô tả ngắn về dự án
    tech_stack   text[]      DEFAULT '{}'::text[]       NOT NULL,  -- Mảng tên công nghệ sử dụng
    image_url    text                                            ,  -- URL ảnh thumbnail dự án
    demo_url     text                                            ,  -- Link demo trực tiếp (Vercel, Netlify, ...)
    github_url   text                                            ,  -- Link repository GitHub
    is_featured  boolean     DEFAULT false              NOT NULL,  -- Đánh dấu dự án nổi bật (hiện trên trang chủ)
    created_at   timestamptz DEFAULT now()              NOT NULL,

    CONSTRAINT projects_pkey       PRIMARY KEY (id),
    CONSTRAINT projects_title_len  CHECK (char_length(title) <= 200)
);

COMMENT ON TABLE  public.projects              IS 'Danh sách các dự án của developer, bao gồm dự án cá nhân và nhóm.';
COMMENT ON COLUMN public.projects.title        IS 'Tên dự án, ngắn gọn và mô tả rõ ràng.';
COMMENT ON COLUMN public.projects.description  IS 'Mô tả tổng quan về chức năng và mục tiêu của dự án.';
COMMENT ON COLUMN public.projects.tech_stack   IS 'Mảng PostgreSQL chứa tên các công nghệ, ví dụ: {ReactJS,Node.js,PostgreSQL}.';
COMMENT ON COLUMN public.projects.image_url    IS 'URL ảnh thumbnail đại diện cho dự án (tỉ lệ 16:9 khuyến nghị).';
COMMENT ON COLUMN public.projects.demo_url     IS 'URL trang demo trực tiếp (Vercel, Netlify,...).';
COMMENT ON COLUMN public.projects.github_url   IS 'URL repository GitHub công khai của dự án.';
COMMENT ON COLUMN public.projects.is_featured  IS 'Nếu TRUE, dự án được hiển thị ở vị trí nổi bật trên trang chủ.';
COMMENT ON COLUMN public.projects.created_at   IS 'Ngày thêm dự án vào hệ thống.';

-- Index: Lọc nhanh dự án nổi bật (is_featured = true)
CREATE INDEX IF NOT EXISTS idx_projects_is_featured
    ON public.projects (is_featured);

-- Index: Sắp xếp dự án theo thời gian tạo mới nhất
CREATE INDEX IF NOT EXISTS idx_projects_created_at
    ON public.projects (created_at DESC);


-- ------------------------------------------------------------
-- TABLE: public.contact_messages
-- Mục đích : Lưu tin nhắn khách hàng/nhà tuyển dụng gửi qua
--            form liên hệ. Admin đọc và đánh dấu đã xem.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id          uuid        DEFAULT gen_random_uuid()  NOT NULL,
    name        text                                   NOT NULL,  -- Tên người gửi
    email       text                                   NOT NULL,  -- Email người gửi (để phản hồi)
    message     text                                   NOT NULL,  -- Nội dung tin nhắn
    is_read     boolean     DEFAULT false              NOT NULL,  -- Admin đã đọc chưa
    created_at  timestamptz DEFAULT now()              NOT NULL,

    CONSTRAINT contact_messages_pkey            PRIMARY KEY (id),
    CONSTRAINT contact_messages_email_format    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT contact_messages_name_not_empty  CHECK (char_length(trim(name))    > 0),
    CONSTRAINT contact_messages_msg_not_empty   CHECK (char_length(trim(message)) > 0)
);

COMMENT ON TABLE  public.contact_messages           IS 'Tin nhắn liên hệ từ khách hàng/nhà tuyển dụng gửi qua form trên website.';
COMMENT ON COLUMN public.contact_messages.name      IS 'Tên người gửi, không được để trống.';
COMMENT ON COLUMN public.contact_messages.email     IS 'Email của người gửi, dùng để admin phản hồi.';
COMMENT ON COLUMN public.contact_messages.message   IS 'Nội dung tin nhắn đầy đủ.';
COMMENT ON COLUMN public.contact_messages.is_read   IS 'TRUE nếu admin đã đọc tin nhắn này. Mặc định FALSE.';
COMMENT ON COLUMN public.contact_messages.created_at IS 'Thời điểm gửi tin nhắn (UTC).';

-- Index: Lọc nhanh tin nhắn chưa đọc trong dashboard admin
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read
    ON public.contact_messages (is_read)
    WHERE is_read = false;

-- Index: Tìm kiếm tin nhắn theo email người gửi
CREATE INDEX IF NOT EXISTS idx_contact_messages_email
    ON public.contact_messages (email);

-- Index: Sắp xếp theo thời gian (tin nhắn mới nhất hiện đầu)
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
    ON public.contact_messages (created_at DESC);


-- ============================================================
-- SECTION 2: ROW LEVEL SECURITY (RLS)
-- Chính sách bảo mật: ai được đọc/ghi dữ liệu gì.
-- ============================================================

-- Bật RLS cho tất cả bảng public
ALTER TABLE public.profile          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- --- profile ---
-- Công khai: ai cũng có thể đọc profile
CREATE POLICY "profile_public_read"
    ON public.profile FOR SELECT
    USING (true);

-- Chỉ user đã xác thực mới được sửa
CREATE POLICY "profile_auth_write"
    ON public.profile FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- --- cv ---
CREATE POLICY "cv_public_read"
    ON public.cv FOR SELECT
    USING (true);

CREATE POLICY "cv_auth_write"
    ON public.cv FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- --- site_settings ---
CREATE POLICY "site_settings_public_read"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "site_settings_auth_write"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- --- skills ---
CREATE POLICY "skills_public_read"
    ON public.skills FOR SELECT
    USING (true);

CREATE POLICY "skills_auth_write"
    ON public.skills FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- --- projects ---
CREATE POLICY "projects_public_read"
    ON public.projects FOR SELECT
    USING (true);

CREATE POLICY "projects_auth_write"
    ON public.projects FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- --- contact_messages ---
-- Khách: chỉ được INSERT (gửi tin nhắn)
CREATE POLICY "contact_messages_public_insert"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

-- Admin: đọc và sửa (đánh dấu đã đọc)
CREATE POLICY "contact_messages_auth_read_update"
    ON public.contact_messages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- SECTION 3: TRIGGER — Auto-update `updated_at`
-- Tự động cập nhật cột updated_at mỗi khi bản ghi được sửa.
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Áp dụng trigger cho các bảng có cột updated_at
CREATE OR REPLACE TRIGGER trg_profile_updated_at
    BEFORE UPDATE ON public.profile
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_cv_updated_at
    BEFORE UPDATE ON public.cv
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- ============================================================
-- SECTION 4: SEED DATA — Dữ liệu mẫu thực tế
-- Dữ liệu này phản ánh đúng thông tin thật của developer.
-- ============================================================

-- --- Profile ---
INSERT INTO public.profile (id, full_name, title, bio, goal, avatar_url, email, github, linkedin, created_at, updated_at)
VALUES (
    '9587459d-e5f4-4193-b0f7-b1a4a5155611',
    'Vuong Ngoc Gia Bao',
    'Fullstack Developer',
    'Sinh viên ngành Software Engineering với niềm đam mê xây dựng các ứng dụng web hiện đại. Tôi yêu thích việc biến ý tưởng thành sản phẩm thực tế từ frontend đến backend.',
    'Trở thành một Fullstack Developer chuyên nghiệp, đóng góp vào các sản phẩm có tác động tích cực đến người dùng.',
    'https://res.cloudinary.com/ddfxi9d4l/image/upload/c_fill,g_face,w_500,h_500,f_auto,q_auto/avatars/pnewelee2caf1y56xrle',
    'giabao080804@gmail.com',
    'https://github.com/BaoVuong150',
    'https://www.linkedin.com/in/vuong-ngoc-gia-bao-86335033b/',
    '2026-02-06 07:14:51.235542+00',
    '2026-02-28 11:18:56.824+00'
)
ON CONFLICT (id) DO NOTHING;


-- --- CV ---
INSERT INTO public.cv (id, title, summary, file_url, updated_at)
VALUES (
    '25820fc6-2590-4e39-8214-0038cbf01851',
    'Curriculum Vitae — Vuong Ngoc Gia Bao',
    'Sinh viên ngành Software Engineering, định hướng Fullstack Developer. Có kinh nghiệm với React, Node.js, PostgreSQL và Supabase.',
    'https://lhrqbwqsdzxaqwqodpfg.supabase.co/storage/v1/object/public/cvs/public/my-cv.pdf',
    '2026-02-28 12:04:09.1+00'
)
ON CONFLICT (id) DO NOTHING;


-- --- Site Settings ---
INSERT INTO public.site_settings (id, site_name, footer_text, seo_title, seo_description, updated_at)
VALUES (
    'dc2b537f-6490-4ffb-97db-947ef185a153',
    'Gia Bao Portfolio',
    '© 2026 Vuong Ngoc Gia Bao. All rights reserved.',
    'Gia Bảo | Fullstack Developer',
    'Portfolio cá nhân của Vuong Ngoc Gia Bao — Fullstack Developer chuyên về React, Node.js và PostgreSQL.',
    '2026-02-26 12:56:31.906+00'
)
ON CONFLICT (id) DO NOTHING;


-- --- Skills ---
INSERT INTO public.skills (id, name, level, category, created_at) VALUES
    ('8edcf9b7-d790-4073-bea2-5cc4d9d444ac', 'JavaScript',  80, 'Frontend',  '2026-02-06 07:15:08.975648+00'),
    ('84998d7e-1ef2-400e-b5db-2bdffb00fd9f', 'ReactJS',     75, 'Frontend',  '2026-02-06 07:15:08.975648+00'),
    ('1237f23f-ddc5-42b0-a331-59e19e5c9820', 'Node.js',     70, 'Backend',   '2026-02-06 07:15:08.975648+00'),
    ('e6ed768d-8e34-425a-aeb1-1288e27e9cf6', 'ExpressJS',   70, 'Backend',   '2026-02-06 07:15:08.975648+00'),
    ('7b028c5f-23d3-4925-9c6a-f849510855fd', 'Java OOP',    70, 'Backend',   '2026-03-01 18:59:22.202986+00'),
    ('0bcd7b4a-ab5f-4b69-b9f4-62abb338fc47', 'PHP Laravel', 60, 'Backend',   '2026-03-01 18:58:19.954902+00'),
    ('95cb63eb-ef0f-4a29-8d45-b6239139599c', 'PostgreSQL',  65, 'Database',  '2026-02-06 07:15:08.975648+00'),
    ('03a4b04b-1998-4f63-8c90-445973605880', 'Supabase',    70, 'Database',  '2026-02-06 07:15:08.975648+00'),
    ('191fbeca-25cc-4920-b762-c324f933c12f', 'MongoDB',     70, 'Database',  '2026-03-01 18:58:46.368311+00'),
    ('d72f18c2-afef-49fc-8a43-c5d8f6290f57', 'SQL Server',  55, 'Database',  '2026-03-01 19:00:08.03556+00'),
    ('48a76d94-9017-4b37-9eca-ce8d6018a5a6', 'OOP',         65, 'Other',     '2026-02-14 17:03:26.831974+00'),
    ('6b8ef2dc-fa32-479d-94c0-1102d1b0eb74', 'Git / GitHub',75, 'Other',     '2026-02-26 12:35:15.087469+00')
ON CONFLICT (id) DO NOTHING;


-- --- Projects ---
INSERT INTO public.projects (id, title, description, tech_stack, image_url, demo_url, github_url, is_featured, created_at)
VALUES (
    '816d0f9e-a86f-4272-8624-6c59df42f392',
    'Task Management App',
    'Ứng dụng quản lý công việc cá nhân với giao diện hiện đại. Hỗ trợ tạo, chỉnh sửa, xoá task, phân loại theo trạng thái và deadline. Được triển khai trên Vercel.',
    '{React,JavaScript,CSS,HTML}',
    'https://res.cloudinary.com/ddfxi9d4l/image/upload/f_auto,q_auto,w_800/projects/y3l8uf08nweiiuccetqz',
    'https://taskmanagement-app-plop.vercel.app/',
    'https://github.com/BaoVuong150/taskmanagement-app',
    true,
    '2026-02-06 07:15:24.11764+00'
)
ON CONFLICT (id) DO NOTHING;

-- Ví dụ dự án thứ 2 (Portfolio website chính này)
INSERT INTO public.projects (id, title, description, tech_stack, image_url, demo_url, github_url, is_featured, created_at)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Portfolio Fullstack Website',
    'Website portfolio cá nhân full-stack với hệ thống admin dashboard để quản lý nội dung: dự án, kỹ năng, CV, và tin nhắn liên hệ. Backend sử dụng Supabase (PostgreSQL + Storage + Auth).',
    '{Next.js,TypeScript,Supabase,PostgreSQL,Tailwind CSS,Cloudinary}',
    NULL,
    NULL,
    'https://github.com/BaoVuong150/portfolio-fullstack',
    true,
    '2026-02-20 00:00:00+00'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- END OF FILE
-- ============================================================
-- Ghi chú:
--   - File này là "clean schema" dành cho mục đích tham khảo
--     và portfolio. Không chứa thông tin nhạy cảm.
--   - File backup đầy đủ (bao gồm schema Supabase nội bộ như
--     auth, storage, realtime) được lưu tại: backup_portfolio.sql
--   - Để restore trên Supabase mới: Chạy file này trong SQL Editor.
-- ============================================================
