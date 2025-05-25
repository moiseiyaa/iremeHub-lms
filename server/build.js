const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building TypeScript files...');

try {
  // Run TypeScript compiler
  execSync('npx tsc', { stdio: 'inherit' });
  
  console.log('TypeScript compilation successful!');
  
  // Copy non-TypeScript files to dist directory
  const copyNonTsFiles = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const srcPath = path.join(dir, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        copyNonTsFiles(srcPath);
      } else if (!item.endsWith('.ts') && !item.endsWith('.js')) {
        const relativePath = path.relative(__dirname, dir);
        const destDir = path.join(__dirname, 'dist', relativePath);
        const destPath = path.join(destDir, item);
        
        // Create destination directory if it doesn't exist
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Copy the file
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
  };
  
  // Copy package.json to dist
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  packageJson.main = 'server.js'; // Update main entry point
  fs.writeFileSync(
    path.join(__dirname, 'dist', 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  console.log('Copied package.json to dist/');
  
  // Copy .env file if it exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, path.join(__dirname, 'dist', '.env'));
    console.log('Copied .env file to dist/');
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} 