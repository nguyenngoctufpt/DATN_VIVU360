import 'dotenv/config';
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { runMigration } from './db/migrate.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import plansRouter from './routes/plans.js';
import publicRouter from './routes/public.js';
import sessionsRouter from './routes/sessions.js';
import vexereRouter from './routes/vexere.js';
import healthRouter from './routes/health.js';
import mcpRouter from './routes/mcp.js';
import activitiesRouter from './routes/activities.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

runMigration();

const app = express();
app.use(express.json({ limit: '2mb' }));

// Mobile App API routes
app.post('/api/users/sync', (req, res) => res.json({ status: 'ok', success: true, user: req.body }));
app.all('/api/app-data/*', (_req, res) => res.json({ status: 'ok', success: true, data: {} }));
app.get('/api/posts/feed', (_req, res) => res.json({ status: 'ok', posts: [] }));
app.get('/api/social-notifications', (_req, res) => res.json({ status: 'ok', notifications: [] }));
app.get('/api/friendships', (_req, res) => res.json({ status: 'ok', friends: [] }));
app.get('/api/posts/user/*', (_req, res) => res.json({ status: 'ok', posts: [] }));

// Core API routes
app.use('/api/auth', authRouter);
app.use('/api/plans', plansRouter);
app.use('/api/public', publicRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/vexere-link', vexereRouter);
app.use('/api/health', healthRouter);
app.use('/api', activitiesRouter);
app.use('/api/admin', activitiesRouter);
app.use('/mcp', mcpRouter);

// Serve Map HTML directly on localhost:3000 web
const getMapHtmlPath = () => {
    const candidates = [
        join(__dirname, '../../../src/map/vietnam-travel-map.html'),
        join(__dirname, '../../src/map/vietnam-travel-map.html'),
        join(process.cwd(), '../src/map/vietnam-travel-map.html'),
        join(process.cwd(), 'src/map/vietnam-travel-map.html'),
        join(process.cwd(), 'Vivu360/src/map/vietnam-travel-map.html')
    ];
    for (const p of candidates) {
        if (existsSync(p)) return p;
    }
    return null;
};

const mapHtmlFile = getMapHtmlPath();
if (mapHtmlFile) {
    const mapDir = dirname(mapHtmlFile);
    app.use(express.static(mapDir));
    app.get('/map', (_req, res) => res.sendFile(mapHtmlFile));
    app.get('/vietnam-travel-map.html', (_req, res) => res.sendFile(mapHtmlFile));
    app.get('/', (_req, res) => res.sendFile(mapHtmlFile));
}

// Serve static build outputs in production
// In dev, Vite dev servers handle the frontends separately
if (process.env.NODE_ENV === 'production') {
    const staticRoot = join(__dirname, '../static');
    const adminDir = join(staticRoot, 'admin');
    const publicDir = join(staticRoot, 'public');

    // Assets có hash trong tên file (JS/CSS từ Vite) → cache vĩnh viễn
    // HTML entry points → no-cache (phải revalidate sau mỗi deploy)
    const staticOptions = {
        etag: true,
        lastModified: true,
        setHeaders: (res: express.Response, filePath: string) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            } else {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        },
    };

    if (existsSync(adminDir)) {
        app.use('/admin', express.static(adminDir, staticOptions));
        app.get('/admin/*', (_req, res) => {
            res.setHeader('Cache-Control', 'no-cache');
            res.sendFile(join(adminDir, 'index.html'));
        });
    }

    if (existsSync(publicDir)) {
        app.use(express.static(publicDir, staticOptions));
        app.get('*', (_req, res) => {
            res.setHeader('Cache-Control', 'no-cache');
            res.sendFile(join(publicDir, 'index.html'));
        });
    }
}

app.use(errorHandler);

const PORT = Number(process.env.PORT || 7321);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
