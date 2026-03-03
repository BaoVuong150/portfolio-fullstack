<div align="center">
  <h1 align="center">🚀 Elite Portfolio CMS Full-Stack</h1>
  <p align="center">
    A state-of-the-art Personal Portfolio seamlessly integrated with a powerful Admin Dashboard (CMS), showcasing engineering excellence, advanced UI/UX patterns, and a commanding grasp of AI-driven software development.
  </p>
  <div align="center">
    <img src="https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white" alt="Cloudinary" />
  </div>
</div>

<br />

---

<!-- ![Desktop View](./screenshots/desktop.png) -->

## ✨ What Makes It Elite? (Detailed Feature Showcase)

### 🏎️ Horizontal Discovery (Native-App Scroll Mechanics)
Instead of forcing users to scroll vertically through long, fatiguing grids of items, this portfolio employs an optimized Horizontal Discovery layout for **Projects** and **Skills**.
- **Why it’s elite**: Recruiters can effortlessly swipe through 20+ projects in mere seconds without spatial disorientation or layout shifts.
- **The UX Magic**: Custom implementations of `snap-x snap-mandatory` along with sub-component `flex-shrink-0` lock items into place seamlessly. It combines Desktop drag-to-scroll features with a momentum-based Mobile touch feel (`-webkit-overflow-scrolling: touch`), emulating the fluid physics of a native app.

### 🛡️ Ironclad Unified Admin Dashboard
A hidden, centralized command base securely managing CV uploads, dynamic Projects, Skill metrics, and Profile details.
- **Why it’s elite**: It goes beyond a simple CRUD interface. It features **Real-time Statistics**, a dark-mode styled "System Widget" measuring up-time logic, and "Quick Action" buttons. The UI employs translucent gradients and hover micro-animations (`hover:-translate-y-1` and shadow expansion) usually reserved for premium SaaS products.

### 🌐 Smart Contact Routing System
Forms are often an afterthought. Here, the messaging system actively stores the visitor’s incoming data securely in Supabase.
- **Why it’s elite**: (Upcoming integration ready) Designed to easily extend into storing Location/IP Metadata via request headers to map out and analyze an incoming client base geographically. It enforces strict Type-checking dynamically in the browser before ever hitting the server.

---

## 🛠️ Deep Dives & Technical Challenges

Developing high-quality software requires tackling profound technical hurdles. Here are the core challenges successfully bypassed in this project:

### 1. Defeating the "Dead Scroll" Anomaly
When implementing the Horizontal Scroll, a common CSS flaw triggered where cards would crush horizontally rather than pushing the overflow container outwards, basically breaking the layout.
- **Solution**: Traced the DOM cascade down correctly. Applied `flex-shrink-0` to the individual map items (Cards), preserving their strict container boundaries (`w-[85vw] sm:w-[350px]`). Then, applying `whitespace-nowrap` on a perfectly scoped `flex overflow-x-auto` wrapper bypassed the line-breaking nature of flexbox, completing the seamless Horizontal Track.

### 2. Solving React "Ref during Render" Reactivity 
During aggressive React strict-mode re-rendering, instantiating the Supabase client blindly pushed instances that invoked `Cannot access refs during render` violations.
- **Solution**: Refactored the architecture instantly to lazy-load singletons OUTSIDE the component's render phase:
```typescript
let supabaseInstance: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(URL, KEY);
  }
  return supabaseInstance
}
```

### 3. The Security Audit: Whitelist Middleware
Initial setups of standard auth flows are fundamentally risky if configured broadly.
- **Solution**: Directed an immediate security audit. Instead of solely relying on checking if `user === true`, a hardcoded Edge-Middleware Whitelist was deployed inside `middleware.ts` acting as an invisible bouncer locking down every API route and Admin Page to only accept tokens specifically linked to `giabao@gmail.com`. Invalid actors are redirected via HTTP 403 dynamically.

---

## 🗄️ Database & Storage Architecture

The backend infrastructure is 100% Serverless, deeply relying on Supabase (PostgreSQL) and Cloudinary.

| Table Name | Purpose | Key Complexity |
| :--- | :--- | :--- |
| `profile` | Developer identity | Singleton record. Feeds the Hero, About, and Header sections with name, bio, avatar, GitHub, LinkedIn and email. |
| `projects` | Showcase work | `is_featured` flag toggles Hero visibility. `tech_stack text[]` enables dynamic badge rendering without joins. `demo_url` & `github_url` serve as dual call-to-action links. |
| `skills` | Tool proficiency | Grouped on the frontend via `category` (Frontend / Backend / Database / Other). Integer `level` (1-100) drives animated progress bars. |
| `contact_messages` | Guest submissions | Visitor emails/messages from the Contact form. `is_read` boolean enables an unread-badge counter in the Admin dashboard. Indexed for fast unread queries. |
| `cv` | Resume management | Singleton linking to the PDF stored in Supabase Storage. `file_url` updated atomically on each upload. |
| `site_settings` | Global config | SEO `<title>` & `<meta description>` tags, footer text, and logo URL — all editable at runtime from the Admin panel. |

> 📄 Full DDL with indexes, RLS policies, column comments and seed data: [`database/schema.sql`](./database/schema.sql)

### 🚀 Cloudinary On-The-Fly Interceptor
Rather than saving 5 versions of an image, the backend saves a single raw file string. A custom Regex/Split Transformer (`getAdminListThumbnailUrl`) intercepts that URL across the app to dynamically append:
- `c_fill, w_400, h_225`: Hard-locking 16:9 aspect ratios preventing CLS (Cumulative Layout Shift).
- `q_auto, f_auto`: Allowing Cloudinary servers to aggressively compress bytes relative to the client’s screen size, serving WebP/AVIF formats silently.

---

## 🤖 AI Collaboration Diary: The Prompt Engineering Process

This portfolio deeply illustrates my competency as an **AI-First Developer** navigating complex architectures through deliberate **Prompt Engineering**. 

Working synchronously with **Antigravity** (an autonomous AI coding agent), I steered the SDLC in record time:
1. **The Tactical Audit**: I supplied strict context boundaries requesting an aggressive "Senior Level Deep Source Code Audit." I challenged the AI to hunt down obscure Type `any` leaks, identify API Session Validation flaws, and root out dormant console logs left by prototype coding.
2. **Deterministic UI Instructions**: Instead of vaguely asking to "make it look better", I prompted with extreme specificity: *"Tối ưu hóa hiệu ứng cuộn ngang cho mượt mà (smooth) và thêm cơ chế tự động dính (scroll-snap)"*, identifying exactly which CSS properties (`snap-mandatory`, `overscroll-behavior-x`) I required for a targeted emotional response from the UI.
3. **Complex Logic Extraction**: I supervised and guided the AI to decouple logic—such as rewriting a purely horizontal drag interaction (`useDragScroll` hook)—into highly isolated custom React components. My prompts enforced Clean Code paradigms at every stage.

This demonstrates the core reality of modern engineering: **It is not merely about writing lines of syntax, but orchestrating intelligent systems to multiply developer output by 10x while maintaining pristine architectural standards.**

---

## ⚙️ Installation & Environment

Want to run this yourself? Follow these exact steps to spin up the local environment in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/BaoVuong150/portfolio-fullstack.git

# 2. Install dependencies
npm install

# 3. Environment Configuration
# Duplicate the local example file
cp .env.example .env.local
```

**Inside your `.env.local`**, provide keys for your backend services:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # Warning: Keep secret!

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
```

```bash
# 4. Start the Development Server
npm run dev
```

Your system will boot instantly at `localhost:3000`. Navigate to `/admin` utilizing your whitelisted credentials to explore the CMS Engine.

---
> *Conceptualized, Prompted, and Deployed by [Gia Bao].*
