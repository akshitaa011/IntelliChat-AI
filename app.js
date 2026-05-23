require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

const chatRoutes = require('./routes/chatRoutes');
const imageRoutes = require('./routes/imageRoutes');
const generateRoutes = require('./routes/generateRoutes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));

app.use('/api/chat', chatRoutes);
app.use('/api/analyze', imageRoutes);
app.use('/api/generate', generateRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`IntelliChat running on http://localhost:${PORT}`));