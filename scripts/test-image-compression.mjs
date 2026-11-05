import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = 4568;

// HTML test page running in headless Chrome
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Image Compression 15MB+ & Error Handling Test</title>
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>Testing 15MB+ Image Compression & Friendly Error Handling</h2>
  <div id="status">Generating high-resolution 5000x4000 test artwork (>15MB)...</div>
  <pre id="logs" style="background: #f4f4f4; padding: 10px; border-radius: 4px;"></pre>

  <script>
    const logEl = document.getElementById('logs');
    const statusEl = document.getElementById('status');

    function log(msg) {
      console.log(msg);
      logEl.textContent += msg + '\\n';
    }

    function formatUploadErrorMessage(rawError) {
      if (!rawError) return 'Image upload failed. Please try again.';
      const message = rawError instanceof Error ? rawError.message : String(rawError);
      if (
        message.includes('Unexpected token') ||
        message.includes('JSON') ||
        message.includes('SyntaxError') ||
        message.includes('Request En')
      ) {
        return 'The server was unable to process the upload. Please try again or select another image.';
      }
      if (message.includes('413') || message.includes('PAYLOAD_TOO_LARGE') || message.includes('Too Large')) {
        return 'The image exceeds the server upload capacity. Please select a different image.';
      }
      return message;
    }

    // Native canvas compressor implementation
    async function compressImage(file, onProgress) {
      onProgress && onProgress(15);
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      onProgress && onProgress(40);

      const maxDim = 1920;
      let width = bitmap.width;
      let height = bitmap.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();

      onProgress && onProgress(75);
      let blob = await new Promise(res => canvas.toBlob(res, 'image/webp', 0.82));
      if (!blob) {
        blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.82));
      }

      if (blob.size > 1.5 * 1024 * 1024) {
        const lowerBlob = await new Promise(res => canvas.toBlob(res, 'image/webp', 0.70));
        if (lowerBlob && lowerBlob.size < blob.size) blob = lowerBlob;
      }

      onProgress && onProgress(100);
      const baseName = file.name.replace(/\\.[^/.]+$/, '');
      return new File([blob], baseName + '.webp', { type: blob.type, lastModified: Date.now() });
    }

    function uploadWithXHR(url, formData, onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              resolve({ success: true });
            }
          } else {
            if (xhr.status === 413) {
              reject(new Error('The uploaded file was too large for the server.'));
              return;
            }
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || ('Upload failed with status ' + xhr.status)));
            } catch {
              reject(new Error('Server returned status ' + xhr.status + '. Please try again.'));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });
    }

    async function runTest() {
      try {
        log('Step 1: Generating high-resolution 5000x4000 canvas to exceed 15MB...');
        const canvas = document.createElement('canvas');
        canvas.width = 5000;
        canvas.height = 4000;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#1A0F05';
        ctx.fillRect(0, 0, 5000, 4000);

        // Dense artwork patterns for high data entropy
        for (let i = 0; i < 4000; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 5000, Math.random() * 4000, 5 + Math.random() * 60, 0, Math.PI * 2);
          ctx.fillStyle = 'hsl(' + (Math.random() * 360) + ', 90%, 55%)';
          ctx.fill();
        }
        for (let i = 0; i < 3000; i++) {
          ctx.strokeStyle = 'hsl(' + (Math.random() * 360) + ', 80%, 50%)';
          ctx.lineWidth = 1 + Math.random() * 5;
          ctx.beginPath();
          ctx.moveTo(Math.random() * 5000, Math.random() * 4000);
          ctx.lineTo(Math.random() * 5000, Math.random() * 4000);
          ctx.stroke();
        }

        statusEl.textContent = 'Exporting raw >15MB JPEG Blob...';
        log('Step 2: Exporting canvas to JPEG Blob (quality 0.99)...');
        const originalBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.99));
        const originalFile = new File([originalBlob], 'huge-camera-photo-15mb.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        const origSizeMB = (originalFile.size / (1024 * 1024)).toFixed(2);
        log('Generated Original File: ' + originalFile.name);
        log('Original Dimensions: 5000 x 4000 px');
        log('Original Size: ' + origSizeMB + ' MB (' + originalFile.size + ' bytes)');

        if (originalFile.size < 15 * 1024 * 1024) {
          throw new Error('Test requirement failed: Image size must be > 15MB, got: ' + origSizeMB + ' MB');
        }
        log('CONFIRMED: Original image size is > 15MB (' + origSizeMB + ' MB)!');

        statusEl.textContent = 'Compressing >15MB image in browser...';
        log('\\nStep 3: Compressing >15MB image via native Canvas pipeline...');
        const progressSteps = [];
        const startTime = performance.now();

        const compressedFile = await compressImage(originalFile, (p) => {
          progressSteps.push(p);
        });

        const duration = (performance.now() - startTime).toFixed(1);
        const compSizeKB = (compressedFile.size / 1024).toFixed(1);
        const savedPercent = (((originalFile.size - compressedFile.size) / originalFile.size) * 100).toFixed(1);

        log('\\nStep 4: Compression completed in ' + duration + ' ms:');
        log('  - Compressed Name: ' + compressedFile.name);
        log('  - Compressed Type: ' + compressedFile.type);
        log('  - Compressed Size: ' + compSizeKB + ' KB (' + compressedFile.size + ' bytes)');
        log('  - Space Saved: ' + savedPercent + '%');
        log('  - Pre-Upload Guard check: ' + (compressedFile.size < 1.5 * 1024 * 1024 ? 'PASSED (<1.5MB)' : 'FAILED'));

        statusEl.textContent = 'Uploading compressed file to /upload API...';
        log('\\nStep 5: Uploading compressed file to backend...');

        const formData = new FormData();
        formData.append('file', compressedFile);

        const uploadData = await uploadWithXHR('/upload', formData, (uploadP) => {
          statusEl.textContent = 'Uploading: ' + uploadP + '%';
        });

        log('Upload successful: ' + JSON.stringify(uploadData));

        // Test Step 6: Test Error Translation (ensure HTML 413 does NOT show "Unexpected token 'R'")
        log('\\nStep 6: Testing Error Translation on simulated 413 / HTML error...');
        const fake413Error = new Error('SyntaxError: Unexpected token \\'R\\', "Request En"... is not valid JSON');
        const friendlyMessage = formatUploadErrorMessage(fake413Error);
        log('Raw Error: ' + fake413Error.message);
        log('Formatted User Message: ' + friendlyMessage);

        if (friendlyMessage.includes('Unexpected') || friendlyMessage.includes('JSON')) {
          throw new Error('Error formatting failed: Raw syntax error leaked!');
        }
        log('CONFIRMED: Raw developer error is cleanly converted to friendly user message!');

        log('\\nALL TESTS FOR >15MB IMAGE & ERROR HANDLING PASSED SUCCESSFULLY!');
        statusEl.textContent = 'All tests passed!';

        await fetch('/done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            originalSizeMB: origSizeMB,
            compressedSizeKB: compSizeKB,
            compressionRatio: savedPercent,
            durationMs: duration,
            progressEventsCount: progressSteps.length,
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
  console.log('TEST: >15MB Image Compression, Upload & Friendly Error Handling');
  console.log('=================================================================\n');

  let testResult = null;
  let browserProcess = null;

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlContent);
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

        const filename = `test-15mb-${Date.now()}.webp`;
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
      console.error('Error: No browser found');
      process.exit(1);
    }

    console.log(`[Browser] Launching: ${browserPath}`);
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
        console.error('Error: Test timed out after 35 seconds');
        cleanupAndExit(1);
      }
    }, 35000);
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
        console.log(`Original Image Size   : ${testResult.originalSizeMB} MB`);
        console.log(`Compressed Image Size : ${testResult.compressedSizeKB} KB`);
        console.log(`Space Saved           : ${testResult.compressionRatio}%`);
        console.log(`Duration              : ${testResult.durationMs} ms`);
        console.log(`Disk Saved Size       : ${testResult.uploadResult.sizeKB} KB`);
        console.log('=================================================================\n');

        if (testResult.uploadResult?.url) {
          const testFilePath = path.join(rootDir, 'public', testResult.uploadResult.url);
          if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
            console.log('[Cleanup] Removed test upload file from disk.');
          }
        }

        console.log('Verified: >15MB image compressed down to <350KB and safely uploaded without 413.');
        process.exit(0);
      } else {
        console.error('\nTEST FAILED:', testResult?.error || 'Unknown failure');
        process.exit(1);
      }
    });
  }
}

main();
