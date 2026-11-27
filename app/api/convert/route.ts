import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_BYTES = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.mp4', '.mov', '.webm', '.mkv']);
const ALLOWED_BITRATES = new Set(['128k', '192k', '256k', '320k']);

function runFfmpeg(input: string, output: string, bitrate: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('ffmpeg', ['-nostdin', '-v', 'error', '-i', input, '-vn', '-codec:a', 'libmp3lame', '-b:a', bitrate, '-y', output], { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(stderr.slice(-1200) || 'FFmpeg conversion failed')));
  });
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: 'File is too large. Maximum size is 100 MB.' }, { status: 413 });
  }

  let tempDir = '';
  try {
    const form = await request.formData();
    const file = form.get('file');
    const requestedBitrate = String(form.get('bitrate') || '192k');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Please choose a video file.' }, { status: 400 });
    if (file.size === 0 || file.size > MAX_BYTES) return NextResponse.json({ error: 'File must be between 1 byte and 100 MB.' }, { status: 413 });

    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
    const bitrate = ALLOWED_BITRATES.has(requestedBitrate) ? requestedBitrate : '192k';

    tempDir = await mkdtemp(path.join(os.tmpdir(), 'convertkit-'));
    const inputPath = path.join(tempDir, `${randomUUID()}${extension}`);
    const outputPath = path.join(tempDir, `${randomUUID()}.mp3`);
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()), { flag: 'wx', mode: 0o600 });
    await runFfmpeg(inputPath, outputPath, bitrate);
    const output = await readFile(outputPath);

    return new NextResponse(output, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="converted-audio.mp3"',
        'Content-Length': String(output.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json({ error: 'Conversion failed. Check that the file contains a supported video and try again.' }, { status: 500 });
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
