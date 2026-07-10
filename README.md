# Welcome to my Portfolio!

I heard somewhere that a portfolio should reflect the personality of the person behind it. And I was like, how do you even do that? I thought about it and landed on this — what's better to explain my character than being at home? So I made it look like one. The color combinations I used are literally the colors I'd want in my house if I ever build one. Warm, cozy, nothing too loud. I don't know if I fully pulled it off, but somewhere in the process I built something that finally felt like me.

Take a look before diving into details! 
**Live:** https://chakravarthi.pages.dev

## Quick things about my portfolio

It has four sections:

1. **Home** — my picture, current reads, what I'm learning, and my skills as chips hanging on a clothesline (yes, a clothesline!)
2. **Projects** — project cards that open into a full detail view with an overview, links, highlights and user stories
3. **Blogs** — a place to read my blogs, with a dedicated reading view built right into the portfolio
4. **About** — my full profile, from skills and education to all my online links

Spent a reasonable amount of time designing this. No template, only my imagination to give it a home-like feeling. Chose the color combination, the animations, every small detail — all of it. Had so much fun building it, hope you find it interesting!

And hey, don't just look at the design — go through my projects too! You might find them interesting.

---

## Tech behind it

**Frontend** — plain HTML, CSS and Vanilla JavaScript. No frameworks, no libraries, just the basics done well.

**Backend** — Cloudflare Workers. Serverless functions that run at the edge, meaning they execute closer to wherever the user is in the world, which makes responses faster. I use Workers to fetch my project data from a Notion database and pull my blog posts from my Medium RSS feed. So when I add a project to Notion or publish a blog on Medium, it just appears on the portfolio automatically. No code changes needed.

**Hosting** — Cloudflare Pages. Since my Workers were already running on Cloudflare, hosting the frontend there too made sense — it cuts down the latency between the frontend and the Workers. Every time I push changes to GitHub, Cloudflare Pages picks it up and redeploys automatically.

**CMS** — Notion. I maintain a simple database with all my project details — title, description, tags, links, highlights and user stories. The Worker fetches this and serves it as JSON to the frontend.

**Analytics** — Google Analytics, to track visits, session duration and outbound clicks.

**Audience Mode Switching** — a small but interesting trick. The portfolio adapts based on a URL parameter. Just add `?mode=tech` or `?mode=pm` to the end of the link and the portfolio changes what it shows — different projects, different skills emphasis, different typewriter roles. No login, no settings, just the URL.

  - `https://chakravarthi.pages.dev` — default, shows everything
  - `https://chakravarthi.pages.dev?mode=pm` — PM/BA focused view, shows non-tech projects, highlights methods and tools, user stories visible
  - `https://chakravarthi.pages.dev?mode=tech` — tech focused view, shows only tech projects, highlights core skills, user stories hidden

  How it works — one line of JavaScript reads the URL parameter on page load and sets the mode. The content JSON files (`pm.json` and `tech.json` in the static folder) hold the different content for each mode. The frontend just loads the right one. Simple, no backend needed for this part.

---

## What I learned

- How Cloudflare Workers work and why serverless edge computing is genuinely cool
  - Workers are great for lightweight tasks like fetching data from APIs, transforming responses, handling authentication, or routing requests. They spin up in milliseconds and scale automatically. But they are not built for everything. If you need long-running processes, heavy computation, file system access, or a persistent database connection, Workers are not the right tool. They have execution time limits and are stateless by design, so think of them as fast middlemen, not full servers.

- How to connect a Notion database to a live website using the Notion API
  - Create a Notion integration from notion.so/my-integrations, give it access to your database, and it hands you an API token. Share your database with the integration, grab the database ID from the URL, and then call the Notion API from your Worker using those two things. It returns your database rows as JSON and you map them to whatever shape your frontend needs. That's genuinely all there is to it!

- How to parse an RSS feed and render it as a clean reading experience

- How Cloudflare Pages handles CI/CD straight from GitHub
  - You connect your GitHub repo to Cloudflare Pages once from the dashboard, pick the branch you want to deploy from (usually main), and that's it. Every time you push to that branch, Cloudflare detects the change, pulls the latest code, builds it if needed, and deploys it. No manual steps, no extra config. Bob's your uncle!

- That building something from scratch, with no template and no shortcuts, teaches you more than any tutorial ever could

---