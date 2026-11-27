'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [quality, setQuality] = useState('192k');

  async function convert() {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('bitrate', quality);
      const response = await fetch('/api/convert', { method: 'POST', body: data });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Conversion failed. Please try another file.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${file.name.replace(/\.[^.]+$/, '') || 'audio'}.mp3`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setBusy(false); }
  }

  return <main className="shell">
    <nav><span className="logo">ConvertKit <b>Tools</b></span><span className="nav-note">Free media tools</span></nav>
    <section className="hero">
      <span className="eyebrow">SIMPLE · PRIVATE · USEFUL</span>
      <h1>Convert video to <em>MP3</em></h1>
      <p>Extract audio from a video file you own or are authorized to convert. No account required.</p>
      <div className="panel">
        <label className="drop">
          <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv" onChange={e => setFile(e.target.files?.[0] || null)} />
          <span className="upload-icon">↑</span>
          <strong>{file ? file.name : 'Choose a video file'}</strong>
          <small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB selected` : 'MP4, MOV, WEBM or MKV · Maximum 100 MB'}</small>
        </label>
        <div className="controls">
          <label>Audio quality
            <select value={quality} onChange={e => setQuality(e.target.value)}>
              <option value="128k">128 kbps</option><option value="192k">192 kbps</option><option value="256k">256 kbps</option><option value="320k">320 kbps</option>
            </select>
          </label>
          <button disabled={!file || busy} onClick={convert}>{busy ? 'Converting…' : 'Convert to MP3 →'}</button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <p className="privacy">Files are processed temporarily and deleted after conversion.</p>
      </div>
      <p className="notice">Only upload content you own or have permission to process. This tool does not download videos from YouTube or other platforms.</p>
    </section>
    <footer>© {new Date().getFullYear()} ConvertKit Tools</footer>
  </main>;
}
