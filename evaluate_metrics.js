const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const EXTENSION_PATH = path.resolve('./trustlens-extension');
const MALICIOUS_DIR = path.resolve('./dataset/malicious');
const BENIGN_DIR = path.resolve('./dataset/benign');

async function checkIsBlocked(page) {
    // Wait for the behavior to trigger (max timeout in malicious files is 2000ms)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if the blocker is in the DOM
    const isBlocked = await page.evaluate(() => {
        // Our blocker has text 'Critical Threat Blocked'
        return Array.from(document.querySelectorAll('div')).some(div => 
            div.textContent && div.textContent.includes('Critical Threat Blocked')
        );
    });
    
    return isBlocked;
}

async function runEvaluation() {
    console.log("Starting Automated Evaluation...");
    
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`
        ]
    });

    let TP = 0, FP = 0, TN = 0, FN = 0;

    // Test Malicious
    const maliciousFiles = fs.readdirSync(MALICIOUS_DIR).filter(f => f.endsWith('.html'));
    console.log(`\nTesting ${maliciousFiles.length} Malicious Samples...`);
    for (const file of maliciousFiles) {
        const page = await browser.newPage();
        const fileUrl = `file://${path.join(MALICIOUS_DIR, file).replace(/\\/g, '/')}`;
        await page.goto(fileUrl, { waitUntil: 'load' });
        
        const blocked = await checkIsBlocked(page);
        if (blocked) {
            console.log(`✅ TP: ${file} correctly blocked.`);
            TP++;
        } else {
            console.log(`❌ FN: ${file} failed to block.`);
            FN++;
        }
        await page.close();
    }

    // Test Benign
    const benignFiles = fs.readdirSync(BENIGN_DIR).filter(f => f.endsWith('.html'));
    console.log(`\nTesting ${benignFiles.length} Benign Samples...`);
    for (const file of benignFiles) {
        const page = await browser.newPage();
        const fileUrl = `file://${path.join(BENIGN_DIR, file).replace(/\\/g, '/')}`;
        await page.goto(fileUrl, { waitUntil: 'load' });
        
        const blocked = await checkIsBlocked(page);
        if (blocked) {
            console.log(`❌ FP: ${file} incorrectly blocked.`);
            FP++;
        } else {
            console.log(`✅ TN: ${file} correctly ignored.`);
            TN++;
        }
        await page.close();
    }

    await browser.close();

    // Calculate Metrics
    const total = TP + FP + TN + FN;
    const accuracy = ((TP + TN) / total) || 0;
    const precision = (TP / (TP + FP)) || 0;
    const recall = (TP / (TP + FN)) || 0;
    const f1 = (2 * precision * recall) / (precision + recall) || 0;

    console.log("\n==================================================");
    console.log("EVALUATION METRICS (BEHAVIORAL ENGINE)");
    console.log("==================================================");
    console.log(`Total Samples : ${total}`);
    console.log(`True Positives (TP) : ${TP}`);
    console.log(`False Positives (FP): ${FP}`);
    console.log(`True Negatives (TN) : ${TN}`);
    console.log(`False Negatives (FN): ${FN}`);
    console.log("--------------------------------------------------");
    console.log(`Accuracy  : ${(accuracy * 100).toFixed(2)}%`);
    console.log(`Precision : ${(precision * 100).toFixed(2)}%`);
    console.log(`Recall    : ${(recall * 100).toFixed(2)}%`);
    console.log(`F1 Score  : ${(f1 * 100).toFixed(2)}%`);
    console.log("==================================================");
    
    // Confusion Matrix
    console.log("\nConfusion Matrix:");
    console.log("|                  | Predicted Malicious | Predicted Benign |");
    console.log("|------------------|---------------------|------------------|");
    console.log(`| Actual Malicious | ${TP.toString().padEnd(19)} | ${FN.toString().padEnd(16)} |`);
    console.log(`| Actual Benign    | ${FP.toString().padEnd(19)} | ${TN.toString().padEnd(16)} |`);
}

runEvaluation().catch(console.error);
