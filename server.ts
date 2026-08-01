import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory mock data
  let urls = [
    {
      id: 1,
      originalUrl: 'https://example.com/long-url',
      shortUrl: 'ex1',
      clickCount: 15,
      createdDate: new Date().toISOString(),
      username: 'testuser'
    }
  ];

  // API Routes
  app.post('/api/v1/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'testuser' && password === 'password') {
      res.json({ token: 'mock-jwt-token', username });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  app.post('/api/v1/auth/register', (req, res) => {
    res.json({ message: 'User registered' });
  });

  app.get('/api/v1/urls', (req, res) => {
    res.json(urls);
  });

  app.post('/api/v1/urls/shorten', (req, res) => {
    const { originalUrl } = req.body;
    const shortUrl = Math.random().toString(36).substring(2, 7);
    const newUrl = {
      id: urls.length + 1,
      originalUrl,
      shortUrl,
      clickCount: 0,
      createdDate: new Date().toISOString(),
      username: 'testuser'
    };
    urls.push(newUrl);
    res.json(newUrl);
  });

  app.put('/api/v1/urls/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;
    const { originalUrl } = req.body;
    const urlIndex = urls.findIndex(u => u.shortUrl === shortUrl);
    if (urlIndex !== -1) {
      urls[urlIndex].originalUrl = originalUrl;
      res.json(urls[urlIndex]);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  });

  app.delete('/api/v1/urls/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;
    urls = urls.filter(u => u.shortUrl !== shortUrl);
    res.json({ message: 'Deleted successfully' });
  });

  app.get('/api/v1/urls/total-clicks', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    res.json({
      [today]: 15
    });
  });

  app.get('/api/v1/urls/:shortUrl/analytics', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    res.json([{ clickDate: today, count: 15 }]);
  });

  // Short URL Redirect endpoint
  app.get('/:shortUrl', (req, res, next) => {
    const { shortUrl } = req.params;
    const url = urls.find(u => u.shortUrl === shortUrl);
    if (url) {
      url.clickCount++;
      res.redirect(url.originalUrl);
    } else {
      next(); // fallback to static serving / react router
    }
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
