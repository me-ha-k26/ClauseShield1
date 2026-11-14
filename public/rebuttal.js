
// ==========================================
// ClauseShield - Rebuttal Page JavaScript
// ==========================================

// Get existing HTML elements
const generateButton = document.querySelector(".generate-btn");
const responseDocument = document.querySelector(".response-document");
const statusMessage = document.querySelector(".output-status p");

const copyButton = document.querySelector(".copy-btn");
const downloadButton = document.querySelector(".download-btn");

const disputeType = document.getElementById("disputeType");
const landlordMessage = document.getElementById("landlordMessage");
const tenantExplanation = document.getElementById("tenantExplanation");


// ==========================================
// 1. GENERATE REBUTTAL
// ==========================================

generateButton.addEventListener("click", async () => {

    // Read values entered by the tenant
    const selectedDispute = disputeType.value;
    const landlordText = landlordMessage.value.trim();
    const tenantText = tenantExplanation.value.trim();

    // Validate inputs
    if (!selectedDispute) {
        statusMessage.textContent = "Please select a dispute type.";
        return;
    }

    if (!landlordText && !tenantText) {
        statusMessage.textContent =
            "Please enter the landlord's message or explain your situation.";
        return;
    }

    // Disable button while generating
    generateButton.disabled = true;

    const originalButtonText = generateButton.textContent;

    generateButton.textContent = "Generating...";

    statusMessage.textContent = "Preparing your rebuttal...";

    try {

        // Send information to Express backend
        const response = await fetch("/api/rebuttal", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                // Retrieve the audit ID saved by audit.js
                auditId: sessionStorage.getItem("auditId"),

                disputeType: selectedDispute,

                landlordMessage: landlordText,

                tenantExplanation: tenantText

            })

        });


        // Convert backend response into JavaScript object
        const data = await response.json();


        // Check for backend errors
        if (!response.ok) {

            throw new Error(
                data.error || "Unable to generate the rebuttal."
            );

        }


        // Display generated rebuttal
        responseDocument.textContent = data.rebuttal;

        responseDocument.style.whiteSpace = "pre-wrap";


        // Update status
        statusMessage.textContent =
            "Your rebuttal has been generated successfully. Please review it before sending.";


    } catch (error) {

        statusMessage.textContent = error.message;

    } finally {

        // Enable button again
        generateButton.disabled = false;

        generateButton.textContent = originalButtonText;

    }

});


// ==========================================
// 2. COPY REBUTTAL
// ==========================================

copyButton.addEventListener("click", async () => {

    const rebuttalText = responseDocument.innerText.trim();

    if (!rebuttalText) {

        statusMessage.textContent =
            "There is no rebuttal to copy.";

        return;

    }

    try {

        await navigator.clipboard.writeText(rebuttalText);

        statusMessage.textContent =
            "Rebuttal copied to clipboard.";

    } catch (error) {

        statusMessage.textContent =
            "Unable to copy. Please select and copy the text manually.";

    }

});


// ==========================================
// 3. DOWNLOAD REBUTTAL
// ==========================================

downloadButton.addEventListener("click", () => {

    const rebuttalText = responseDocument.innerText.trim();

    if (!rebuttalText) {

        statusMessage.textContent =
            "There is no rebuttal to download.";

        return;

    }

    // Create a text file
    const file = new Blob(
        [rebuttalText],
        { type: "text/plain" }
    );

    // Create temporary download URL
    const fileURL = URL.createObjectURL(file);

    // Create download link
    const downloadLink = document.createElement("a");

    downloadLink.href = fileURL;

    downloadLink.download = "ClauseShield-Rebuttal.txt";

    // Start download
    document.body.appendChild(downloadLink);

    downloadLink.click();

    // Clean up
    downloadLink.remove();

    URL.revokeObjectURL(fileURL);

    statusMessage.textContent =
        "Your rebuttal has been downloaded.";

});
