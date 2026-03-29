import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Redirect logic
  app.use((req, res, next) => {
    if (req.headers.host === 'ugrasena-educum.vercel.app') {
      return res.redirect(301, `https://www.ugrasenaedu.in${req.url}`);
    }
    next();
  });

  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Dynamic Favicon & Logo Routes for SEO
  app.get(['/favicon.ico', '/logo.png'], async (req, res) => {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_URL') {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.from('company_info').select('logo_url').eq('id', 1).single();
        
        if (data && data.logo_url) {
          // Redirect to the actual image URL stored in Supabase
          return res.redirect(302, data.logo_url);
        }
      }
    } catch (error) {
      console.error('Error fetching dynamic logo:', error);
    }
    
    // Fallback transparent 1x1 pixel if no logo is found
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': transparentPixel.length
    });
    res.end(transparentPixel);
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
