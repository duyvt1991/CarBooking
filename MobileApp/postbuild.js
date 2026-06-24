const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Node.js Postbuild & Deploy Started ===');

// 1. Load environment variables from .env manually
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value.trim();
            }
        });
    }
}
loadEnv();

// 2. Create deploy directory if not exists
const deployDir = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployDir)) {
    console.log('Creating deploy directory...');
    fs.mkdirSync(deployDir, { recursive: true });
}

// 3. Delete deploy/build.zip if exists
const zipPath = path.join(deployDir, 'build.zip');
if (fs.existsSync(zipPath)) {
    console.log('Cleaning old build.zip...');
    fs.unlinkSync(zipPath);
}

// 4. Delete build/index.html if exists
const indexHtmlPath = path.join(__dirname, 'build', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    console.log('Cleaning build/index.html...');
    fs.unlinkSync(indexHtmlPath);
}

// 5. Zip the build directory
const isWindows = process.platform === 'win32';
if (isWindows) {
    console.log('Detected Windows. Zipping build directory with PowerShell...');
    // We zip build/* to deploy/build.zip
    const cmd = `powershell -Command "Compress-Archive -Path build\\* -DestinationPath deploy\\build.zip -Force"`;
    execSync(cmd, { stdio: 'inherit' });
} else {
    console.log('Detected Non-Windows. Zipping build directory with zip command...');
    const cmd = `cd build && zip -r ../deploy/build.zip .`;
    execSync(cmd, { stdio: 'inherit' });
}

// 6. Deploy build.zip to the server via API
async function deploy() {
    const deployUrl = process.env.REACT_APP_DEPLOY_URL;
    const secret = process.env.DAT_PHONG_KEY_DEPLOY;

    if (!deployUrl) {
        console.error('Error: REACT_APP_DEPLOY_URL is not defined in .env');
        process.exit(1);
    }

    if (!fs.existsSync(zipPath)) {
        console.error(`Error: Zip file not found at ${zipPath}`);
        process.exit(1);
    }

    console.log(`Deploying build.zip to ${deployUrl}...`);
    
    // Check if fetch is supported globally (Node 18+)
    if (typeof fetch === 'undefined') {
        console.log('fetch is not defined. Falling back to curl command...');
        try {
            const curlCmd = `curl -X POST "${deployUrl}" -F "path=bookcarmobile" -F "secret=${secret || ''}" -F "file=@deploy/build.zip"`;
            execSync(curlCmd, { stdio: 'inherit' });
            console.log('Deployment via curl successful!');
            process.exit(0);
        } catch (error) {
            console.error('Deployment via curl failed:', error.message);
            process.exit(1);
        }
    }

    const formData = new FormData();
    formData.append('path', 'datxe');
    formData.append('secret', secret || '');
    
    const fileBuffer = fs.readFileSync(zipPath);
    const blob = new Blob([fileBuffer], { type: 'application/zip' });
    formData.append('file', blob, 'build.zip');
    
    try {
        const response = await fetch(deployUrl, {
            method: 'POST',
            body: formData
        });
        
        const responseText = await response.text();
        console.log(`Response Status: ${response.status}`);
        console.log(`Response: ${responseText}`);
        
        if (response.ok) {
            console.log('Deployment via Node fetch successful!');
        } else {
            console.error('Deployment failed.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Deployment error:', error);
        process.exit(1);
    }
}

console.log('=== Postbuild Finished: build.zip created ===');
// deploy(); // Commented out so npm run build only builds/zips, does not deploy.
