
// ==========================================
// ClauseShield - Audit Page JavaScript
// ==========================================

// Get the audit form from audit.html
const auditForm = document.getElementById("auditForm");

// Get the audit button
const auditButton = document.querySelector(".run-audit");

// ==========================================
// 1. CREATE RESULTS SECTION
// ==========================================

// This section will display the audit results
// after the user submits the form.

const resultsSection = document.createElement("section");

resultsSection.id = "auditResults";
resultsSection.style.marginTop = "30px";

auditForm.insertAdjacentElement("afterend", resultsSection);


// ==========================================
// 2. TAB SWITCHING
// ==========================================

// Get all tab buttons
const tabButtons = document.querySelectorAll(".tab-btn");

// Get all input panels
const inputPanels = document.querySelectorAll(".input-panel");

tabButtons.forEach((button) => {

    button.addEventListener("click", () => {

        // Remove active class from all buttons
        tabButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        // Add active class to clicked button
        button.classList.add("active");

        // Get the panel connected to this button
        const targetPanel = button.dataset.tab;

        // Hide all panels
        inputPanels.forEach((panel) => {
            panel.hidden = true;
        });

        // Display selected panel
        const selectedPanel = document.getElementById(targetPanel);

        if (selectedPanel) {
            selectedPanel.hidden = false;
        }

    });

});


// ==========================================
// 3. DISPLAY AUDIT RESULTS
// ==========================================

function displayAuditResults(data) {

    // Clear previous results
    resultsSection.innerHTML = "";

    // Create heading
    const heading = document.createElement("h2");
    heading.textContent = "Your Agreement Audit Results";

    resultsSection.appendChild(heading);


    // Display general message
    const message = document.createElement("p");
    message.textContent = data.message || "Your audit has been completed.";

    resultsSection.appendChild(message);


    // Display number of findings
    const count = document.createElement("p");

    count.textContent =
        `Potential concerns identified: ${data.findings.length}`;

    resultsSection.appendChild(count);


    // ======================================
    // DISPLAY EACH FINDING
    // ======================================

    if (data.findings.length === 0) {

        const noFindings = document.createElement("p");

        noFindings.textContent =
            "No potential concerns were identified by the current keyword checks. This does not guarantee that the agreement is legally compliant.";

        resultsSection.appendChild(noFindings);

    } else {

        data.findings.forEach((finding, index) => {

            // Create one box for each finding
            const findingBox = document.createElement("div");

            findingBox.style.border = "1px solid #999";
            findingBox.style.padding = "18px";
            findingBox.style.margin = "15px 0";
            findingBox.style.borderRadius = "8px";


            // Finding number and title
            const title = document.createElement("h3");

            title.textContent =
                `${index + 1}. ${finding.title}`;

            findingBox.appendChild(title);


            // Severity
            const severity = document.createElement("p");

            severity.textContent =
                `Severity: ${finding.severity}`;

            findingBox.appendChild(severity);


            // Matched wording
            if (finding.matchedText) {

                const matched = document.createElement("p");

                matched.textContent =
                    `Matched wording: "${finding.matchedText}"`;

                findingBox.appendChild(matched);

            }


            // Explanation
            const explanation = document.createElement("p");

            explanation.textContent =
                finding.explanation;

            findingBox.appendChild(explanation);


            // Legal reference
            if (finding.legalReference) {

                const legalReference = document.createElement("p");

                legalReference.textContent =
                    `Legal reference: ${finding.legalReference}`;

                findingBox.appendChild(legalReference);

            }


            // Legal note
            if (finding.legalNote) {

                const legalNote = document.createElement("p");

                legalNote.textContent =
                    finding.legalNote;

                findingBox.appendChild(legalNote);

            }


            resultsSection.appendChild(findingBox);

        });

    }


    // ======================================
    // DISCLAIMER
    // ======================================

    const disclaimer = document.createElement("p");

    disclaimer.textContent =
        data.disclaimer ||
        "Disclaimer: ClauseShield provides preliminary informational assistance, not legal advice. Findings are based on limited keyword checks and should be verified against the full agreement and applicable local law.";

    disclaimer.style.marginTop = "20px";
    disclaimer.style.fontSize = "14px";

    resultsSection.appendChild(disclaimer);


    // ======================================
    // LINK TO REBUTTAL PAGE
    // ======================================

    const rebuttalLink = document.createElement("a");

    rebuttalLink.href = "rebuttal.html";
    rebuttalLink.textContent = "Generate Your Rebuttal";

    rebuttalLink.style.display = "inline-block";
    rebuttalLink.style.marginTop = "15px";
    rebuttalLink.style.padding = "12px 20px";
    rebuttalLink.style.backgroundColor = "#000018";
    rebuttalLink.style.color = "white";
    rebuttalLink.style.textDecoration = "none";
    rebuttalLink.style.borderRadius = "5px";

    resultsSection.appendChild(rebuttalLink);

}


// ==========================================
// 4. SUBMIT AUDIT FORM
// ==========================================

auditForm.addEventListener("submit", async (event) => {

    // Prevent normal page reload
    event.preventDefault();


    // Clear previous results
    resultsSection.innerHTML = "";


    // Disable button while audit is running
    auditButton.disabled = true;

    const originalButtonText = auditButton.textContent;

    auditButton.textContent = "Analyzing...";


    try {

        // Collect all form fields and files
        const formData = new FormData(auditForm);


        // Send form data to Express backend
        const response = await fetch("/api/audit", {

            method: "POST",

            body: formData

        });


        // Convert response into JavaScript object
        const data = await response.json();


        // Check whether backend returned an error
        if (!response.ok) {

            throw new Error(
                data.error || "Something went wrong during the audit."
            );

        }


        // Save audit ID for the rebuttal page
        if (data.auditId) {

            sessionStorage.setItem("auditId", data.auditId);

        }


        // Display results
        displayAuditResults(data);


        // Scroll to results
        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        // Display error message
        resultsSection.innerHTML = "";

        const errorHeading = document.createElement("h3");

        errorHeading.textContent = "Audit could not be completed";

        const errorMessage = document.createElement("p");

        errorMessage.textContent = error.message;

        resultsSection.appendChild(errorHeading);

        resultsSection.appendChild(errorMessage);


    } finally {

        // Enable button again
        auditButton.disabled = false;

        auditButton.textContent = originalButtonText;

    }

});
