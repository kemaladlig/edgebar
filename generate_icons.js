const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create pure minimal PNG without dependencies
function createPNG(size) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      // Calculate normalized coordinates (-1 to 1)
      const nx = (x / (width - 1)) * 2 - 1;
      const ny = (y / (height - 1)) * 2 - 1;
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Rounded rectangle mask
      const cornerRadius = 0.4;
      const qx = Math.max(Math.abs(nx) - (1 - cornerRadius), 0);
      const qy = Math.max(Math.abs(ny) - (1 - cornerRadius), 0);
      const outsideCorner = Math.sqrt(qx * qx + qy * qy);

      if (outsideCorner > cornerRadius) {
        // Transparent
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      } else {
        // Dark background #131418 with subtle gradient
        let r = 19 + Math.floor((1 - ny) * 8);
        let g = 20 + Math.floor((1 - ny) * 8);
        let b = 24 + Math.floor((1 - ny) * 12);
        let a = 255;

        // Draw left strip bar (Vivaldi/Arc dock indicator)
        if (nx >= -0.75 && nx <= -0.45 && ny >= -0.65 && ny <= 0.65) {
          // Indigo/violet glow #818cf8
          r = 129;
          g = 140;
          b = 248;
        } else if (nx >= -0.3 && nx <= 0.65 && ny >= -0.65 && ny <= 0.65) {
          // Inner panel area #23252e with border
          if (nx <= -0.25 || nx >= 0.6 || ny <= -0.6 || ny >= 0.6) {
            r = 60;
            g = 65;
            b = 85;
          } else {
            r = 35;
            g = 37;
            b = 46;
          }
        }

        rawData[offset++] = r;
        rawData[offset++] = g;
        rawData[offset++] = b;
        rawData[offset++] = a;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcVal = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crcVal >>> 0, 8 + len);
  return chunk;
}

// CRC32 table & function
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const png = createPNG(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Generated icon${size}.png`);
});
