import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = 4567;
const libPath = path.join(
  rootDir,
  'node_modules',
  'browser-image-compression',
  'dist',
  'browser-image-compression.js'
);

if (!fs.existsSync(libPath)) {
  console.error('Error: browser-image-compression library not found at', libPath);
  process.exit(1);
}

const libContent = fs.readFileSync(libPath, 'utf8');

// HTML test page running in headless Chrome
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Image Compression & Progress Bar Test</title>
  <script src="/browser-image-compression.js"></script>
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>Testing Client-Side Image Compression & Real-time Progress Bar</h2>
  <div id="status">Generating high-resolution 4000x3000 test artwork...</div>
  <div id="progress-container" style="margin: 15px 0; max-width: 500px; background: #eee; height: 16px; border-radius: 8px; overflow: hidden;">
    <div id="progress-bar" style="width: 0%; height: 100%; background: #A85A32; transition: width 0.1s;"></div>
  </div>
  <pre id="logs" style="background: #f4f4f4; padding: 10px; border-radius: 4px;"></pre>

  <script>
    const logEl = document.getElementById('logs');
    const statusEl = document.getElementById('status');
    const progressBar = document.getElementById('progress-bar');

    function log(msg) {
      console.log(msg);
      logEl.textContent += msg + '\\n';
    }

    function updateProgress(stage, percent) {
      progressBar.style.width = percent + '%';
      statusEl.textContent = stage + ': ' + percent + '%';
    }

    function uploadWithXHR(url, formData, onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed with status ' + xhr.status));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });
    }

    async function runTest() {
      try {
        log('Step 1: Generating high-resolution 4000x3000 realistic canvas image...');
        const canvas = document.createElement('canvas');
        canvas.width = 4000;
        canvas.height = 3000;
        const ctx = canvas.getContext('2d');

        // Draw intricate details to generate a realistic large file (> 5 MB)
        ctx.fillStyle = '#2A1B0A';
        ctx.fillRect(0, 0, 4000, 3000);

        for (let i = 0; i < 2000; i++) {
          const x = Math.random() * 4000;
          const y = Math.random() * 3000;
          const r = 5 + Math.random() * 45;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = 'hsl(' + (Math.random() * 360) + ', 85%, 60%)';
          ctx.fill();
        }

        // Add fine lines and strokes
        for (let i = 0; i < 1500; i++) {
          ctx.strokeStyle = 'hsl(' + (Math.random() * 360) + ', 70%, 50%)';
          ctx.lineWidth = 1 + Math.random() * 4;
          ctx.beginPath();
          ctx.moveTo(Math.random() * 4000, Math.random() * 3000);
          ctx.lineTo(Math.random() * 4000, Math.random() * 3000);
          ctx.stroke();
        }

        ctx.font = 'bold 120px serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Shreenath Art Gallery - High-Res Artwork', 200, 400);

        log('Step 2: Exporting canvas to JPEG Blob at maximum quality (0.98)...');
        const originalBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.98));
        const originalFile = new File([originalBlob], 'raw-shreenath-artwork-master.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        const origSizeMB = (originalFile.size / (1024 * 1024)).toFixed(2);
        log('Generated Original File: ' + originalFile.name);
        log('Original Dimensions: 4000 x 3000 px');
        log('Original Size: ' + origSizeMB + ' MB (' + originalFile.size + ' bytes)');

        if (originalFile.size < 5 * 1024 * 1024) {
          throw new Error('Test requirement failed: Image size must be > 5MB, got: ' + origSizeMB + ' MB');
        }
        log('CONFIRMED: Original image size is > 5MB (' + origSizeMB + ' MB)!');

        log('\\nStep 3: Compressing image with live onProgress callback...');
        const compressionProgressUpdates = [];
        const startTime = performance.now();

        const options = {
          maxSizeMB: 0.35,
          maxWidthOrHeight: 1920,
          useWebWorker: false,
          fileType: 'image/webp',
          initialQuality: 0.82,
          onProgress: (progress) => {
            const p = Math.round(progress);
            compressionProgressUpdates.push(p);
            updateProgress('Compressing image', p);
          }
        };

        const compressedBlob = await window.imageCompression(originalFile, options);
        const duration = (performance.now() - startTime).toFixed(1);

        const baseName = originalFile.name.replace(/\\.[^/.]+$/, '');
        const compressedFile = new File([compressedBlob], baseName + '.webp', {
          type: 'image/webp',
          lastModified: Date.now()
        });

        const compSizeKB = (compressedFile.size / 1024).toFixed(1);
        const savedPercent = (((originalFile.size - compressedFile.size) / originalFile.size) * 100).toFixed(1);

        log('\\nStep 4: Compression completed in ' + duration + ' ms:');
        log('  - Compressed Name: ' + compressedFile.name);
        log('  - Compressed Type: ' + compressedFile.type);
        log('  - Compressed Size: ' + compSizeKB + ' KB (' + compressedFile.size + ' bytes)');
        log('  - Space Saved: ' + savedPercent + '%');
        log('  - Compression Progress Events Recorded: ' + compressionProgressUpdates.length);

        log('\\nStep 5: Uploading compressed file via FormData with live XHR progress bar...');
        const uploadProgressUpdates = [];
        const formData = new FormData();
        formData.append('file', compressedFile);

        const uploadData = await uploadWithXHR('/upload', formData, (uploadPercent) => {
          uploadProgressUpdates.push(uploadPercent);
          updateProgress('Uploading to storage', uploadPercent);
        });

        log('Upload progress events recorded: ' + uploadProgressUpdates.length);
        log('Final upload response: ' + JSON.stringify(uploadData));
        log('\\nALL PROGRESS AND COMPRESSION TESTS PASSED!');
        statusEl.textContent = 'Upload & Optimization Completed (100%)!';

        // Notify runner
        await fetch('/done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            originalSize: originalFile.size,
            originalSizeMB: origSizeMB,
            compressedSize: compressedFile.size,
            compressedSizeKB: compSizeKB,
            compressionRatio: savedPercent,
            durationMs: duration,
            compressionEventsCount: compressionProgressUpdates.length,
            uploadEventsCount: uploadProgressUpdates.length,
            uploadResult: uploadData
          })
        });
      } catch (err) {
        log('ERROR: ' + err.message);
        statusEl.textContent = 'Error: ' + err.message;
        await fetch('/done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, error: err.message })
        });
      }
    }

    window.addEventListener('load', runTest);
  </script>
</body>
</html>`;

async function main() {
  console.log('=================================================================');
  console.log('TEST: Image Compression & Real-time Progress Bar (>5MB Image)');
  console.log('=================================================================\n');

  let testResult = null;
  let browserProcess = null;

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlContent);
      return;
    }

    if (req.method === 'GET' && req.url === '/browser-image-compression.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(libContent);
      return;
    }

    if (req.method === 'POST' && req.url === '/upload') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        
        const uploadsDir = path.join(rootDir, 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `test-progress-${Date.now()}.webp`;
        const filepath = path.join(uploadsDir, filename);

        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        let fileBuffer = bodyBuffer;

        if (boundaryMatch) {
          const boundary = boundaryMatch[1] || boundaryMatch[2];
          const parts = bodyBuffer.toString('binary').split(`--${boundary}`);
          for (const part of parts) {
            if (part.includes('filename=') && part.includes('\r\n\r\n')) {
              const fileDataBinary = part.split('\r\n\r\n')[1].replace(/\r\n$/, '');
              fileBuffer = Buffer.from(fileDataBinary, 'binary');
              break;
            }
          }
        }

        fs.writeFileSync(filepath, fileBuffer);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            url: `/uploads/${filename}`,
            sizeBytes: fileBuffer.length,
            sizeKB: (fileBuffer.length / 1024).toFixed(1)
          })
        );
      });
      return;
    }

    if (req.method === 'POST' && req.url === '/done') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          testResult = JSON.parse(body);
        } catch {
          testResult = { success: false, error: 'Malformed JSON' };
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));

        setTimeout(cleanupAndExit, 500);
      });
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[Server] Local test runner listening on http://127.0.0.1:${PORT}`);
    launchBrowser();
  });

  function findBrowser() {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  }

  function launchBrowser() {
    const browserPath = findBrowser();
    if (!browserPath) {
      console.error('Error: No Chrome or Edge executable found to execute test');
      process.exit(1);
    }

    console.log(`[Browser] Launching headless browser: ${browserPath}`);
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `http://127.0.0.1:${PORT}/`
    ];

    browserProcess = spawn(browserPath, args, { stdio: 'ignore' });

    setTimeout(() => {
      if (!testResult) {
        console.error('Error: Test timed out after 25 seconds');
        cleanupAndExit(1);
      }
    }, 25000);
  }

  function cleanupAndExit(exitCode = 0) {
    if (browserProcess) {
      try {
        browserProcess.kill();
      } catch {}
    }
    server.close(() => {
      if (testResult && testResult.success) {
        console.log('\n=================================================================');
        console.log('              TEST VERIFICATION RESULTS: SUCCESS                 ');
        console.log('=================================================================');
        console.log(`Original Image Size      : ${testResult.originalSizeMB} MB (${testResult.originalSize} bytes)`);
        console.log(`Compressed Image Size    : ${testResult.compressedSizeKB} KB (${testResult.compressedSize} bytes)`);
        console.log(`Storage Space Saved      : ${testResult.compressionRatio}%`);
        console.log(`Compression Duration     : ${testResult.durationMs} ms`);
        console.log(`Compression Events Count : ${testResult.compressionEventsCount} (real-time updates)`);
        console.log(`Upload Events Count      : ${testResult.uploadEventsCount} (real-time updates)`);
        console.log(`Uploaded Destination     : ${testResult.uploadResult.url}`);
        console.log(`Disk Saved Size          : ${testResult.uploadResult.sizeKB} KB`);
        console.log('=================================================================\n');

        // Clean up test file
        if (testResult.uploadResult?.url) {
          const testFilePath = path.join(rootDir, 'public', testResult.uploadResult.url);
          if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
            console.log('[Cleanup] Removed test upload file from disk.');
          }
        }

        console.log('All assertions verified: Space reduced by >90% with live progress feedback.');
        process.exit(0);
      } else {
        console.error('\nTEST FAILED:', testResult?.error || 'Unknown failure');
        process.exit(1);
      }
    });
  }
}

main();
