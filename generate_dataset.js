const fs = require('fs');
const path = require('path');

const maliciousDir = path.join(__dirname, 'dataset', 'malicious');
const benignDir = path.join(__dirname, 'dataset', 'benign');

fs.mkdirSync(maliciousDir, { recursive: true });
fs.mkdirSync(benignDir, { recursive: true });

const malicious_templates = [
    `<!DOCTYPE html><html><head><title>Malicious 1</title></head><body><h1>Welcome</h1><script>setTimeout(() => { const iframe = document.createElement('iframe'); iframe.style.opacity = '0'; iframe.src = 'http://evil.com/exfiltrate'; document.body.appendChild(iframe); }, 1000);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 2</title></head><body><h1>Login</h1><script>setTimeout(() => { const form = document.createElement('form'); form.innerHTML = '<input type="text" name="user"><input type="password" name="pass">'; document.body.appendChild(form); }, 1500);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 3</title></head><body><h1>Claim Airdrop</h1><script>setTimeout(() => { const iframe = document.createElement('iframe'); iframe.width = '1'; iframe.height = '1'; document.body.appendChild(iframe); }, 500);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 4</title></head><body><h1>Verify Account</h1><script>setTimeout(() => { const p = document.createElement('input'); p.type = 'password'; document.body.appendChild(p); }, 2000);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 5</title></head><body><h1>Hidden Tracker</h1><script>setTimeout(() => { const iframe = document.createElement('iframe'); iframe.style.display = 'none'; document.body.appendChild(iframe); }, 1000);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 6</title></head><body><h1>Confirm Transaction</h1><script>setTimeout(() => { const div = document.createElement('div'); div.innerHTML = '<input type="password">'; document.body.appendChild(div); }, 800);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 7</title></head><body><h1>Script Injection</h1><script>setTimeout(() => { const s = document.createElement('script'); s.src = 'data:text/javascript,console.log(1)'; document.body.appendChild(s); }, 1200);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 8</title></head><body><h1>Multi Attack</h1><script>setTimeout(() => { const iframe = document.createElement('iframe'); iframe.style.visibility = 'hidden'; document.body.appendChild(iframe); const inp = document.createElement('input'); inp.type = 'password'; document.body.appendChild(inp); }, 1500);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 9</title></head><body><h1>Stealth Login</h1><script>setTimeout(() => { const form = document.createElement('form'); const p = document.createElement('input'); p.setAttribute('type', 'password'); form.appendChild(p); document.body.appendChild(form); }, 1100);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Malicious 10</title></head><body><h1>Invisible Frame</h1><script>setTimeout(() => { const f = document.createElement('iframe'); f.style.opacity = '0'; document.body.appendChild(f); }, 900);</script></body></html>`
];

const benign_templates = [
    `<!DOCTYPE html><html><head><title>Benign 1</title></head><body><h1>Hello</h1><script>setTimeout(() => { const div = document.createElement('div'); div.innerText = 'Content loaded'; document.body.appendChild(div); }, 1000);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 2</title></head><body><h1>Safe SPA</h1><script>setTimeout(() => { const img = document.createElement('img'); img.src = 'safe.jpg'; document.body.appendChild(img); }, 1500);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 3</title></head><body><form><input type="password"></form></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 4</title></head><body><iframe src="https://youtube.com"></iframe></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 5</title></head><body><h1>Loading...</h1><script>setTimeout(() => { document.body.innerHTML += '<h2>Done</h2>'; }, 500);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 6</title></head><body><h1>Comments</h1><script>setTimeout(() => { const p = document.createElement('p'); p.innerText = 'Nice post!'; document.body.appendChild(p); }, 2000);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 7</title></head><body><script src="app.js"></script></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 8</title></head><body><h1>Dashboard</h1><script>setTimeout(() => { const btn = document.createElement('button'); btn.innerText = 'Click me'; document.body.appendChild(btn); }, 1000);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 9</title></head><body><h1>News</h1><script>setTimeout(() => { const ul = document.createElement('ul'); ul.innerHTML = '<li>Article 1</li>'; document.body.appendChild(ul); }, 1500);</script></body></html>`,
    `<!DOCTYPE html><html><head><title>Benign 10</title></head><body><h1>Static site</h1><p>Welcome to my site.</p></body></html>`
];

malicious_templates.forEach((html, i) => {
    fs.writeFileSync(path.join(maliciousDir, 'malicious_' + (i + 1) + '.html'), html);
});

benign_templates.forEach((html, i) => {
    fs.writeFileSync(path.join(benignDir, 'benign_' + (i + 1) + '.html'), html);
});

console.log('Created 20 dataset files successfully.');
