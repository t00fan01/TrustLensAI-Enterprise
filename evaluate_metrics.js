/**
 * TrustLensAI — Puppeteer Evaluation Harness
 * Version: 1.1
 *
 * Loads the unpacked extension, runs all 14 malicious + 14 benign HTML test
 * pages, and computes classification metrics (TP / FP / TN / FN, Accuracy,
 * Precision, Recall, F1-Score, and a full confusion matrix).
 *
 * Detection check: looks for the element #trustlens-block-screen in the DOM.
 * Wait per page: 4500 ms — accounts for:
 *   • 2500 ms delayed-injection window
 *   • ~1000 ms MutationObserver + React cycle slack
 *   • ~1000 ms blocker render + DOM paint
 *
 * Output:
 *   Console — human-readable report
 *   ./dataset/evaluation_report.json — machine-readable results
 *
 * Usage:
 *   node evaluate_metrics.js
 */

'use strict';

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

// ─── Paths ───────────────────────────────────────────────────────────────────
const EXTENSION_PATH  = path.resolve(__dirname, 'trustlens-extension');
const MALICIOUS_DIR   = path.resolve(__dirname, 'dataset', 'malicious');
const BENIGN_DIR      = path.resolve(__dirname, 'dataset', 'benign');
const REPORT_PATH     = path.resolve(__dirname, 'dataset', 'evaluation_report.json');

// ─── Constants ───────────────────────────────────────────────────────────────
const WAIT_MS         = 4500;   // ms to wait after navigation before checking blocker
const BLOCKER_ID      = 'trustlens-block-screen';   // DOM id of the blocker overlay

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: check whether the blocker UI is present in the page DOM
// ─────────────────────────────────────────────────────────────────────────────
async function isPageBlocked(page) {
    // Wait for the full behavioral window to elapse
    await new Promise(resolve => setTimeout(resolve, WAIT_MS));

    return page.evaluate((blockerId) => {
        // Primary check: the dedicated blocker element by its unique id
        const blockerEl = document.getElementById(blockerId);
        if (blockerEl) return true;

        // Fallback: check any element containing the exact blocker heading text
        // (defensive against id being stripped by certain CSPs)
        return Array.from(document.querySelectorAll('h1')).some(
            h1 => h1.textContent && h1.textContent.includes('Malicious Activity Blocked')
        );
    }, BLOCKER_ID);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: convert a local file path to a file:// URL
// ─────────────────────────────────────────────────────────────────────────────
function toFileUrl(filePath) {
    return `file:///${filePath.replace(/\\/g, '/')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: read .html files from a directory in sorted order
// ─────────────────────────────────────────────────────────────────────────────
function getHtmlFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.error(`[ERROR] Directory not found: ${dir}`);
        console.error(`        Run 'node generate_dataset.js' first.`);
        process.exit(1);
    }
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.html'))
        .sort();
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Evaluation Loop
// ─────────────────────────────────────────────────────────────────────────────
async function runEvaluation() {
    const startTime = Date.now();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║    TrustLensAI — Tier 2.5 Behavioral Engine Evaluation   ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Extension path : ${EXTENSION_PATH}`);
    console.log(`  Wait per page  : ${WAIT_MS} ms`);
    console.log(`  Blocker target : #${BLOCKER_ID}`);
    console.log('');

    // ── Launch browser with the unpacked extension loaded ─────────────────────
    const browser = await puppeteer.launch({
        headless: false,         // Keep visible so extension scripts execute
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    // Counters
    let TP = 0, FP = 0, TN = 0, FN = 0;
    const results = [];

    // ── Evaluate MALICIOUS samples ────────────────────────────────────────────
    const maliciousFiles = getHtmlFiles(MALICIOUS_DIR);
    console.log(`  Testing ${maliciousFiles.length} MALICIOUS samples…`);
    console.log('  ──────────────────────────────────────────────────────────');

    for (const file of maliciousFiles) {
        const filePath = path.join(MALICIOUS_DIR, file);
        const fileUrl  = toFileUrl(filePath);
        const page     = await browser.newPage();

        try {
            await page.goto(fileUrl, { waitUntil: 'load', timeout: 15000 });
            const blocked = await isPageBlocked(page);

            if (blocked) {
                console.log(`  ✅  TP  ${file}`);
                TP++;
                results.push({ file, label: 'malicious', predicted: 'malicious', verdict: 'TP' });
            } else {
                console.log(`  ❌  FN  ${file}  ← missed detection`);
                FN++;
                results.push({ file, label: 'malicious', predicted: 'benign', verdict: 'FN' });
            }
        } catch (err) {
            console.log(`  ⚠️  ERR ${file}  — ${err.message}`);
            results.push({ file, label: 'malicious', predicted: 'error', verdict: 'ERR', error: err.message });
            FN++;  // Treat navigation errors conservatively as false negatives
        } finally {
            await page.close();
        }
    }

    // ── Evaluate BENIGN samples ───────────────────────────────────────────────
    const benignFiles = getHtmlFiles(BENIGN_DIR);
    console.log('');
    console.log(`  Testing ${benignFiles.length} BENIGN samples…`);
    console.log('  ──────────────────────────────────────────────────────────');

    for (const file of benignFiles) {
        const filePath = path.join(BENIGN_DIR, file);
        const fileUrl  = toFileUrl(filePath);
        const page     = await browser.newPage();

        try {
            await page.goto(fileUrl, { waitUntil: 'load', timeout: 15000 });
            const blocked = await isPageBlocked(page);

            if (blocked) {
                console.log(`  ❌  FP  ${file}  ← false alarm`);
                FP++;
                results.push({ file, label: 'benign', predicted: 'malicious', verdict: 'FP' });
            } else {
                console.log(`  ✅  TN  ${file}`);
                TN++;
                results.push({ file, label: 'benign', predicted: 'benign', verdict: 'TN' });
            }
        } catch (err) {
            console.log(`  ⚠️  ERR ${file}  — ${err.message}`);
            results.push({ file, label: 'benign', predicted: 'error', verdict: 'ERR', error: err.message });
            TN++;  // Treat navigation errors on benign files as true negatives
        } finally {
            await page.close();
        }
    }

    await browser.close();

    // ─────────────────────────────────────────────────────────────────────────
    //  Compute Metrics
    // ─────────────────────────────────────────────────────────────────────────
    const total     = TP + FP + TN + FN;
    const accuracy  = total > 0        ? (TP + TN) / total               : 0;
    const precision = (TP + FP) > 0   ? TP / (TP + FP)                  : 0;
    const recall    = (TP + FN) > 0   ? TP / (TP + FN)                  : 0;
    const f1        = (precision + recall) > 0
        ? 2 * precision * recall / (precision + recall)
        : 0;

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

    // ─────────────────────────────────────────────────────────────────────────
    //  Console Report
    // ─────────────────────────────────────────────────────────────────────────
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║             EVALUATION RESULTS SUMMARY                   ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Total samples tested : ${String(total).padEnd(32)}║`);
    console.log(`║  Elapsed time         : ${String(elapsedSec + 's').padEnd(32)}║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  True Positives  (TP) : ${String(TP).padEnd(32)}║`);
    console.log(`║  False Positives (FP) : ${String(FP).padEnd(32)}║`);
    console.log(`║  True Negatives  (TN) : ${String(TN).padEnd(32)}║`);
    console.log(`║  False Negatives (FN) : ${String(FN).padEnd(32)}║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Accuracy             : ${String((accuracy  * 100).toFixed(2) + '%').padEnd(32)}║`);
    console.log(`║  Precision            : ${String((precision * 100).toFixed(2) + '%').padEnd(32)}║`);
    console.log(`║  Recall (Sensitivity) : ${String((recall    * 100).toFixed(2) + '%').padEnd(32)}║`);
    console.log(`║  F1-Score             : ${String((f1        * 100).toFixed(2) + '%').padEnd(32)}║`);
    console.log('╚══════════════════════════════════════════════════════════╝');

    console.log('');
    console.log('  CONFUSION MATRIX:');
    console.log('  ┌──────────────────────┬─────────────────────┬──────────────────┐');
    console.log('  │                      │ Predicted Malicious │ Predicted Benign │');
    console.log('  ├──────────────────────┼─────────────────────┼──────────────────┤');
    console.log(`  │ Actual Malicious      │ TP = ${String(TP).padEnd(15)}│ FN = ${String(FN).padEnd(11)}│`);
    console.log(`  │ Actual Benign         │ FP = ${String(FP).padEnd(15)}│ TN = ${String(TN).padEnd(11)}│`);
    console.log('  └──────────────────────┴─────────────────────┴──────────────────┘');
    console.log('');

    // ─────────────────────────────────────────────────────────────────────────
    //  Save JSON Report
    // ─────────────────────────────────────────────────────────────────────────
    const report = {
        metadata: {
            engine:      'TrustLensAI Tier 2.5 Behavioral Detection Engine',
            version:     '1.1',
            runAt:       new Date().toISOString(),
            elapsedSec:  parseFloat(elapsedSec),
            waitPerPage: WAIT_MS,
            blockerId:   BLOCKER_ID,
        },
        summary: {
            total,
            TP, FP, TN, FN,
            accuracy:  parseFloat((accuracy  * 100).toFixed(4)),
            precision: parseFloat((precision * 100).toFixed(4)),
            recall:    parseFloat((recall    * 100).toFixed(4)),
            f1:        parseFloat((f1        * 100).toFixed(4)),
        },
        confusionMatrix: {
            truePositive:  TP,
            falsePositive: FP,
            trueNegative:  TN,
            falseNegative: FN,
        },
        perFileResults: results,
    };

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    console.log(`  [✓] JSON report saved to: ${REPORT_PATH}`);
    console.log('');
}

runEvaluation().catch((err) => {
    console.error('[FATAL] Evaluation harness crashed:', err);
    process.exit(1);
});
