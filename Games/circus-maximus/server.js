/**
 * Simple HTTP server for Circus Maximus game
 * Run: node server.js
 * Then open http://localhost:8000/index.html
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Remove leading slash and resolve path
    const filePath = path.join(__dirname, pathname);

    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Read file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        // Get MIME type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Set headers with cache control for development
        const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        };
        
        // Disable caching for JS/CSS files during development
        if (ext === '.js' || ext === '.css' || ext === '.html') {
            headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            headers['Pragma'] = 'no-cache';
            headers['Expires'] = '0';
        }
        
        res.writeHead(200, headers);
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Circus Maximus server running at http://localhost:${PORT}/`);
    console.log(`Open http://localhost:${PORT}/index.html in your browser`);
    console.log(`Press Ctrl+C to stop the server`);
});
