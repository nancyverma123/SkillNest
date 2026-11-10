require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/users', require('./routes/users'));
app.use((err, req, res, next) => {
  const code = err.name === 'ValidationError' ? 400 : err.name === 'CastError' ? 404 : 500;
  res.status(code).json({ message: code === 500 ? 'Server error' : err.message });
});
connectDB().then(() => app.listen(process.env.PORT || 5000, () => console.log('Server running')))
  .catch((e) => { console.error(e.message); process.exit(1); });
