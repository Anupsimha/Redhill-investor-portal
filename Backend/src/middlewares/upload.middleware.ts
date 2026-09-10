import multer from 'multer';
import fs from 'fs';
import config from '../config/env.js';

if (!fs.existsSync(config.UPLOADS_DIR)) {
  fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (_req, _file, cb) => {
    cb(null, true);
  },
});
