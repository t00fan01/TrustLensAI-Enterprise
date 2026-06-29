document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const btn = document.getElementById('analyzeBtn');
    const resultDiv = document.getElementById('result');
    const scoreEl = document.getElementById('riskScore');
    const reasonsEl = document.getElementById('reasons');

    // Change button state while loading
    btn.textContent = "Scanning... 🧠";
    btn.disabled = true;
    resultDiv.style.display = 'none';

    // Grab the current active tab in Chrome
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        let currentTab = tabs[0];
        let currentUrl = currentTab.url;

        // Execute a tiny script on the webpage to grab the text content
        chrome.scripting.executeScript(
            {
                target: { tabId: currentTab.id },
                // Grab the first 1500 characters of the webpage to send to the AI
                func: () => { return document.body.innerText.substring(0, 1500); }
            },
            async (injectionResults) => {
                let pageText = "";
                if (injectionResults && injectionResults[0] && injectionResults[0].result) {
                    pageText = injectionResults[0].result;
                }

                // HARDCODED TO BULKHEAD SERVER 2 (MANUAL SCANNER)
                const apiUrl = "https://trustlens-manual-api.onrender.com/analyze";

                try {
                    // Send the URL and page text to selected backend
                    const response = await fetch(apiUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            url: currentUrl,
                            text_content: pageText
                        })
                    });

                    const data = await response.json();

                    // Update the UI with the results
                    resultDiv.style.display = 'block';
                    scoreEl.textContent = `Risk Score: ${data.risk_score}/100`;

                    // Reset classes and apply the correct color
                    resultDiv.className = '';
                    if (data.classification === "Scam" || data.classification === "High Risk") {
                        resultDiv.classList.add("high-risk");
                    } else if (data.classification === "Warning") {
                        resultDiv.classList.add("warning");
                    } else {
                        resultDiv.classList.add("safe");
                    }

                    // Format the reasons into bullet points
                    reasonsEl.innerHTML = data.reasons.map(r => `• ${r}`).join('<br><br>');

                } catch (error) {
                    // Handle connection errors
                    resultDiv.style.display = 'block';
                    resultDiv.className = 'high-risk';
                    scoreEl.textContent = "Connection Error ⚠️";
                    reasonsEl.innerHTML = "Cannot reach the Render server. If it just woke up, try scanning again in 30 seconds!";
                } finally {
                    // Reset the button
                    btn.textContent = "Scan This Page 🚀";
                    btn.disabled = false;
                }
            }
        );
    });
});