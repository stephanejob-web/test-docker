const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Storage Strategy
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Safe filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    // Limits
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté. (JPEG, PNG, WEBP uniquement)'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Endpoint
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier envoyé' });
        }
        // Return full URL relative to server root
        // Assuming server serves static files from root/uploads
        // Note: Client might need to adjust URL if behind Nginx proxy without host forwarding
        // For simplicity: Return relative path or absolute if we know domain. 
        // Returning path relative to API base URL is safest if frontend constructs full URL.
        // But here we return absolute URL assuming standard Docker networking or localhost.
        // Better: Return `/uploads/filename` and let frontend prepend API_URL if needed.
        // Actually, simplest is full URL if we trust req.get('host').
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.json({
            message: 'Upload réussi',
            url: fileUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'upload' });
    }
});

module.exports = router;
