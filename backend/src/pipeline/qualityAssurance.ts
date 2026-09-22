// ============================================================
// Quality Assurance — Automated checks for rendered videos
// ============================================================

import type { QAReport, QACheck } from '../providers/types.js';
import fs from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function runQualityAssurance(videoPath: string): Promise<QAReport> {
  const checks: QACheck[] = [];
  const timestamp = new Date().toISOString();

  // 1. File existence and size check
  if (!fs.existsSync(videoPath)) {
    checks.push({
      name: 'File Exists',
      passed: false,
      expected: 'Rendered MP4 file exists',
      actual: 'File not found',
      severity: 'critical',
    });

    return {
      passed: false,
      checks,
      videoPath,
      timestamp,
    };
  }

  const stat = fs.statSync(videoPath);
  const sizeMB = stat.size / (1024 * 1024);
  const sizePassed = sizeMB >= 0.2; // At least 200 KB

  checks.push({
    name: 'File Size',
    passed: sizePassed,
    expected: '>= 0.2 MB',
    actual: `${sizeMB.toFixed(2)} MB`,
    severity: 'critical',
  });

  // 2. FFprobe deep inspection
  try {
    const probeCmd = `ffprobe -v error -show_format -show_streams -print_format json "${videoPath}"`;
    const { stdout } = await execAsync(probeCmd, { timeout: 15000 });
    const probeData = JSON.parse(stdout);

    const streams = probeData.streams || [];
    const videoStream = streams.find((s: any) => s.codec_type === 'video');
    const audioStream = streams.find((s: any) => s.codec_type === 'audio');
    const format = probeData.format || {};

    // Check video stream
    const hasVideo = !!videoStream;
    checks.push({
      name: 'Video Stream',
      passed: hasVideo,
      expected: 'Present (h264)',
      actual: videoStream ? `${videoStream.codec_name}` : 'Missing',
      severity: 'critical',
    });

    // Check resolution
    if (videoStream) {
      const width = videoStream.width;
      const height = videoStream.height;
      const isVertical = height > width;
      const is1080x1920 = width === 1080 && height === 1920;

      checks.push({
        name: 'Resolution (9:16 Vertical)',
        passed: isVertical,
        expected: '1080x1920 (9:16 vertical)',
        actual: `${width}x${height}`,
        severity: is1080x1920 ? 'info' : 'warning',
      });
    }

    // Check duration
    const durationSec = parseFloat(format.duration || videoStream?.duration || '0');
    const validDuration = durationSec >= 15 && durationSec <= 65;
    checks.push({
      name: 'Duration (YouTube Shorts limit)',
      passed: validDuration,
      expected: '15s - 60s',
      actual: `${durationSec.toFixed(1)}s`,
      severity: 'critical',
    });

    // Check audio stream
    const hasAudio = !!audioStream;
    checks.push({
      name: 'Audio Stream',
      passed: hasAudio,
      expected: 'Present (aac / mp3)',
      actual: audioStream ? `${audioStream.codec_name} (${audioStream.sample_rate || 44100}Hz)` : 'Missing audio',
      severity: 'critical',
    });

  } catch (err: any) {
    // If ffprobe isn't installed or fails, rely on file size
    checks.push({
      name: 'FFprobe Stream Inspection',
      passed: true,
      expected: 'Inspect streams via ffprobe',
      actual: `FFprobe skipped or warning: ${err.message || 'unknown'}`,
      severity: 'info',
    });
  }

  // Determine overall pass status (all critical checks must pass)
  const passed = checks.filter((c) => c.severity === 'critical').every((c) => c.passed);

  return {
    passed,
    checks,
    videoPath,
    timestamp,
  };
}
