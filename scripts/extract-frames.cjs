const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegStatic);

const INPUT  = path.resolve(__dirname, '../src/assets/hero.mp4');
const OUTPUT = path.resolve(__dirname, '../public/frames');

if (!fs.existsSync(INPUT)) {
  console.error('hero.mp4 not found at', INPUT);
  process.exit(1);
}

if (!fs.existsSync(OUTPUT)) {
  fs.mkdirSync(OUTPUT, { recursive: true });
}

console.log('Extracting frames from hero.mp4 at 30fps...');
console.log('Output:', OUTPUT);

ffmpeg(INPUT)
  .outputOptions([
    '-vf', 'fps=30,scale=1920:-2',
    '-q:v', '3',
    '-f', 'image2',
  ])
  .output(path.join(OUTPUT, 'frame-%04d.jpg'))
  .on('start', (cmd) => console.log('Running:', cmd))
  .on('progress', (p) => {
    if (p.frames) process.stdout.write(`\rFrames extracted: ${p.frames}`);
  })
  .on('end', () => {
    const frames = fs.readdirSync(OUTPUT).filter(f => f.endsWith('.jpg'));
    console.log(`\nDone! ${frames.length} frames extracted to public/frames/`);
  })
  .on('error', (err) => {
    console.error('\nFFmpeg error:', err.message);
    process.exit(1);
  })
  .run();
