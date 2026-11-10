require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Render/Vercel-style hosts sit behind one proxy; this lets rate limiting see the real client IP.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((o) => o.trim()) }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', require('./routes/stats'));

app.use('/api', notFound);
app.use(errorHandler);

if (require.main === module) {
  connectDB()
    .then(() => app.listen(process.env.PORT || 5000, () => console.log('Server running')))
    .catch((e) => { console.error(e.message); process.exit(1); });
}

module.exports = app;
