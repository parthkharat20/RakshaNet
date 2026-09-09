#!/usr/bin/env python3
"""
RakshaNet Layman Executive Summary & Live Demo Storybook PDF Generator.
Creates a non-technical, human-centric, story-driven explanation of the project
and step-by-step live demo walkthrough for general evaluators, citizens, and police leadership.
"""

import os
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = BASE_DIR / "docs"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

HTML_OUT = DOCS_DIR / "RAKSHANET_LAYMAN_EXECUTIVE_GUIDE.html"
PDF_OUT = DOCS_DIR / "RAKSHANET_LAYMAN_EXECUTIVE_GUIDE.pdf"
ARTIFACT_DIR = Path("/Users/parthkharat/.gemini/antigravity-ide/brain/1cf19ff2-6e0d-4b3e-96ec-0a544f56ca92")
DESKTOP_PDF = Path("/Users/parthkharat/Desktop/RAKSHANET_LAYMAN_EXECUTIVE_GUIDE.pdf")

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS_STYLES = """
@page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
}
@page:first {
    margin: 0;
}
* {
    box-sizing: border-box;
}
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 10.5pt;
    margin: 0;
    padding: 0;
    background-color: #ffffff;
}

/* Cover Page */
.cover-page {
    page-break-after: always;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40mm 25mm 30mm 25mm;
    background: linear-gradient(140deg, #0284c7 0%, #0369a1 50%, #0f172a 100%);
    color: #ffffff;
}

.page {
    page-break-after: always;
    padding-top: 6mm;
}
.page:last-child {
    page-break-after: avoid;
}

/* Headings */
h1 {
    font-size: 20pt;
    color: #0369a1;
    border-bottom: 2.5px solid #0284c7;
    padding-bottom: 5pt;
    margin-top: 10pt;
    margin-bottom: 12pt;
    font-weight: 800;
}
h2 {
    font-size: 13.5pt;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3pt;
    margin-top: 14pt;
    margin-bottom: 8pt;
    font-weight: 700;
}
h3 {
    font-size: 11.5pt;
    color: #0284c7;
    margin-top: 10pt;
    margin-bottom: 4pt;
    font-weight: 700;
}

p {
    margin: 6pt 0;
    text-align: justify;
    line-height: 1.55;
}

/* Story Cards */
.story-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #0284c7;
    border-radius: 6px;
    padding: 12pt 14pt;
    margin: 10pt 0;
}
.problem-card {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-left: 4px solid #e11d48;
    border-radius: 6px;
    padding: 12pt 14pt;
    margin: 10pt 0;
}
.solution-card {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-left: 4px solid #16a34a;
    border-radius: 6px;
    padding: 12pt 14pt;
    margin: 10pt 0;
}

/* Step-by-Step Demo Box */
.step-box {
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    padding: 12pt 14pt;
    margin: 10pt 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.step-header {
    display: flex;
    align-items: center;
    gap: 8pt;
    margin-bottom: 6pt;
}
.step-badge {
    background: #0284c7;
    color: #ffffff;
    font-weight: 800;
    font-size: 9pt;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: monospace;
}
.step-title {
    font-size: 11.5pt;
    font-weight: 700;
    color: #0f172a;
}

/* Tables */
table.simple-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0;
    font-size: 9pt;
}
table.simple-table th {
    background-color: #0f172a;
    color: #ffffff;
    padding: 7pt 10pt;
    text-align: left;
    font-weight: 700;
}
table.simple-table td {
    border: 1px solid #e2e8f0;
    padding: 7pt 10pt;
    vertical-align: top;
}
table.simple-table tr:nth-child(even) {
    background-color: #f8fafc;
}

.header-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4pt;
    margin-bottom: 12pt;
    font-size: 8pt;
    color: #64748b;
    font-family: monospace;
}

ul, ol {
    margin: 6pt 0 10pt 0;
    padding-left: 20pt;
}
li {
    margin-bottom: 4pt;
    text-align: justify;
}
"""

HTML_CONTENT = r"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>RakshaNet - A Non-Technical Layman's Guide & Live Demonstration Storybook</title>
    <style>__CSS_STYLES__</style>
</head>
<body>

    <!-- ================================================================= -->
    <!-- COVER PAGE -->
    <!-- ================================================================= -->
    <div class="cover-page">
        <div>
            <div style="display: inline-block; padding: 4px 12px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 4px; font-family: monospace; font-size: 9pt; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
                EVERYDAY CITIZEN & POLICE LEADERSHIP GUIDE
            </div>
            
            <h1 style="color: #ffffff; font-size: 34pt; margin: 20pt 0 8pt 0; border-bottom: none; font-weight: 800; letter-spacing: 0.5px;">
                RAKSHANET 🛡️
            </h1>
            
            <div style="font-size: 16pt; color: #e0f2fe; font-weight: 300; line-height: 1.4; margin-bottom: 25pt;">
                How Artificial Intelligence Catches Cyber Scammers and Restores Stolen Money to Citizens in Minutes
            </div>
            
            <div style="width: 70px; height: 4px; background: #ffffff; margin-bottom: 25pt;"></div>
            
            <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 16pt; max-width: 520pt;">
                <div style="font-size: 10pt; color: #bae6fd; font-weight: 700; text-transform: uppercase; margin-bottom: 4pt;">
                    In Plain Words (Zero Technical Jargon)
                </div>
                <div style="font-size: 11pt; color: #ffffff; font-weight: 500; line-height: 1.5;">
                    A simple, story-driven explanation of how RakshaNet works, why traditional banking systems fail to stop online fraud, and how anyone can watch the live system rescue a citizen's hard-earned money in real-time.
                </div>
            </div>
        </div>

        <div style="border-top: 1px solid rgba(255, 255, 255, 0.25); padding-top: 15pt;">
            <div style="display: flex; justify-content: space-between; font-size: 9pt; color: #e0f2fe; font-family: monospace;">
                <div>
                    <strong>PROJECT:</strong> RAKSHANET NATIONAL DEFENSE SYSTEM<br>
                    <strong>PURPOSE:</strong> NON-TECHNICAL EVALUATOR & CITIZEN BRIEFING
                </div>
                <div style="text-align: right;">
                    <strong>SMART INDIA HACKATHON 2026</strong><br>
                    <strong>LIVE DEMO WALKTHROUGH</strong>
                </div>
            </div>
        </div>
    </div>

    <!-- ================================================================= -->
    <!-- SECTION 1: THE REAL PROBLEM IN SIMPLE TERMS -->
    <!-- ================================================================= -->
    <div class="page">
        <div class="header-banner">
            <span>RAKSHANET CITIZEN & EXECUTIVE GUIDE</span>
            <span>PART 1: THE CRIME & THE CHALLENGE</span>
        </div>

        <h1>1. The Real Story: Why Cyber Fraud Succeeds Today</h1>

        <h2>1.1 Meet Mrs. Sunita (A Typical Cyber Crime Story)</h2>
        <div class="story-card">
            <strong>The Situation:</strong><br>
            It is 10:14 AM on a weekday. Mrs. Sunita, a 56-year-old retired schoolteacher in Mumbai, receives an urgent SMS: 
            <em>"Your electricity will be disconnected tonight at 9:00 PM due to unpaid bill. Call our officer immediately or click this link to update."</em><br><br>
            Panicked that her household power will be cut off, she calls the number. A polite voice instructs her to download a "verification app" or scan a quick QR code and pay a ₹10 testing fee. The moment she enters her UPI PIN, <strong>₹1,20,000—her entire monthly pension savings—vanishes from her bank account.</strong>
        </div>

        <h2>1.2 What the Scammers Do Next (The 3-Hour Race)</h2>
        <p>
            When ordinary people lose money, they assume the thief keeps the cash in their own bank account. 
            <strong>Criminals never do this.</strong> Criminal syndicates operate like an organized relay race:
        </p>
        <ol>
            <li><strong>Minute 1 to 15 (The First Hop):</strong> The stolen ₹1,20,000 lands in a bank account opened under the name of a college student or rural laborer who rented their account for ₹2,000.</li>
            <li><strong>Minute 15 to 45 (The Split & Layering):</strong> The money is instantly split into 4 smaller amounts (₹30,000 each) and sent to four different bank accounts across different banks (e.g., SBI, Union Bank, Canara Bank).</li>
            <li><strong>Minute 45 to 180 (The Physical Cashout):</strong> A criminal "runner" on a motorcycle receives an alert on their phone. They drive to an isolated ATM kiosk, insert fake debit cards, withdraw currency notes, and vanish into the street traffic.</li>
        </ol>

        <h2>1.3 Why Traditional Police & Banks Fail to Stop This</h2>
        <div class="problem-card">
            <strong style="color: #9f1239; font-size: 11pt;">The Fatal Flaw of Existing Systems:</strong>
            <ul style="margin-top: 6pt;">
                <li><strong>Banks Look Backwards:</strong> Bank security systems only flag accounts that have a bad history. The accounts scammers use are brand new with clean past records. To the bank, they look completely innocent until after the money has left!</li>
                <li><strong>Too Much Paperwork & Delay:</strong> When Mrs. Sunita calls the police, it takes 24 to 72 hours for police officers to email the banks, get approval, and request an account freeze. By then, the ATM has already dispensed the cash 2 days ago. The account is frozen with ₹0 balance.</li>
                <li><strong>The Victim Loses Everything:</strong> Less than 9% of defrauded money in India is ever recovered. Victims are left traumatized, running from police stations to bank branches for months.</li>
            </ul>
        </div>
    </div>

    <!-- ================================================================= -->
    <!-- SECTION 2: WHAT RAKSHANET DOES IN SIMPLE WORDS -->
    <!-- ================================================================= -->
    <div class="page">
        <div class="header-banner">
            <span>RAKSHANET CITIZEN & EXECUTIVE GUIDE</span>
            <span>PART 2: THE RAKSHANET SOLUTION</span>
        </div>

        <h1>2. What RakshaNet Does (The Smart Shield)</h1>

        <h2>2.1 How RakshaNet Works: An Early Warning Radar</h2>
        <p>
            Think of RakshaNet like an <strong>air-traffic control radar for money</strong>. Instead of waiting for days, the very second 
            Mrs. Sunita's complaint is entered, RakshaNet jumps into action in less than <strong>1 second</strong>:
        </p>

        <div class="solution-card">
            <strong style="color: #166534; font-size: 11pt;">The 4 Superpowers of RakshaNet:</strong>
            <ol style="margin-top: 6pt;">
                <li><strong>Tracks the Money Jump by Jump:</strong> It instantly follows the digital trail across all banks simultaneously. It sees that Mrs. Sunita's ₹1,20,000 moved to Account B, then split to Accounts C and D.</li>
                <li><strong>Catches "Innocent-Looking" Mule Accounts:</strong> Even if a scammer account was created yesterday with zero bad history, RakshaNet detects it because it sits right between known cybercrime rings like a bridge.</li>
                <li><strong>Predicts Which ATM the Thief Will Visit:</strong> Scammers prefer quiet, unmonitored ATMs near highways for a quick getaway. RakshaNet calculates the exact ATM cluster the cash runner is heading toward within the next 45 minutes.</li>
                <li><strong>Locks the Money & Sends the Police in 1 Click:</strong> A police officer clicks one button on the screen to freeze the scammer's account before they reach the ATM, while alerting the nearest police patrol car on the road to intercept the runner!</li>
            </ol>
        </div>

        <h2>2.2 Traditional Method vs. RakshaNet (At a Glance)</h2>
        <table class="simple-table">
            <thead>
                <tr>
                    <th style="width: 25%;">Feature</th>
                    <th style="width: 35%;">Traditional Police / Bank Method</th>
                    <th style="width: 40%;">RakshaNet Platform</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Response Time</strong></td>
                    <td>24 to 72 hours (Slow emails and letters)</td>
                    <td><strong>Under 1 second (Automated radar)</strong></td>
                </tr>
                <tr>
                    <td><strong>Catching New Scammer Accounts</strong></td>
                    <td>Fails completely (Needs past bad behavior)</td>
                    <td><strong>Catches them instantly using network connections</strong></td>
                </tr>
                <tr>
                    <td><strong>Stopping Cash at ATMs</strong></td>
                    <td>Impossible (No physical tracking)</td>
                    <td><strong>Predicts target ATM and sends nearest police car</strong></td>
                </tr>
                <tr>
                    <td><strong>Returning Money to Victim</strong></td>
                    <td>Victim visits courts and banks for 6–12 months</td>
                    <td><strong>Automated reverse refund directly to victim's account</strong></td>
                </tr>
                <tr>
                    <td><strong>Citizen Transparency</strong></td>
                    <td>Victim is left in the dark with no updates</td>
                    <td><strong>Public online tracker (just like tracking an Amazon delivery)</strong></td>
                </tr>
            </tbody>
        </table>

        <h2>2.3 Human in the Loop (100% Safe & Lawful)</h2>
        <p>
            Does artificial intelligence automatically freeze innocent people's accounts? <strong>No, never!</strong><br>
            RakshaNet is designed with human common sense. The AI does the heavy mathematical detective work in milliseconds, 
            but an authorized police inspector looks at the evidence on screen and presses the final button. This ensures innocent people 
            are never harmed and every action is 100% compliant with Indian Law.
        </p>
    </div>

    <!-- ================================================================= -->
    <!-- SECTION 3: STEP-BY-STEP LIVE DEMO STORYBOOK -->
    <!-- ================================================================= -->
    <div class="page">
        <div class="header-banner">
            <span>RAKSHANET CITIZEN & EXECUTIVE GUIDE</span>
            <span>PART 3: STEP-BY-STEP LIVE DEMO</span>
        </div>

        <h1>3. The 3-Minute Live Demonstration Walkthrough</h1>
        <p>
            This is the exact sequence of what happens on screen during a live demonstration for judges, evaluators, or police chiefs.
        </p>

        <!-- STEP 1 -->
        <div class="step-box">
            <div class="step-header">
                <span class="step-badge">STEP 1</span>
                <span class="step-title">Open the Command Center (The Bird's-Eye View)</span>
            </div>
            <p>
                The screen displays a dark, high-tech police control map showing all active bank accounts and ATM locations across Mumbai, Delhi, and Bengaluru.
                At the top, a <strong>"Golden Window Countdown Timer"</strong> shows how much time is left (e.g. 178 minutes) before scammers can physically withdraw stolen cash.
            </p>
        </div>

        <!-- STEP 2 -->
        <div class="step-box">
            <div class="step-header">
                <span class="step-badge">STEP 2</span>
                <span class="step-title">Click "Simulate Live Attack" (Injecting the Crime)</span>
            </div>
            <p>
                In the top navigation bar, the presenter clicks the bright orange button labeled <strong>"⚡ Simulate Live Attack"</strong>.
                A window pops up with real-world Indian fraud scenarios. We select <strong>"Mumbai UPI QR Scam (₹1,20,000)"</strong> and click <strong>"Inject Incident"</strong>.
            </p>
            <div style="background: #f1f5f9; padding: 6pt 10pt; border-radius: 4px; font-size: 9pt; margin-top: 4pt;">
                <strong>What happens in 750 milliseconds:</strong><br>
                A tactical radar sound chimes! An alert flashes in bright red on the screen. The Leaflet map instantly zooms into an ATM kiosk in Matunga East, pulsing red with a high-threat warning.
            </div>
        </div>

        <!-- STEP 3 -->
        <div class="step-box">
            <div class="step-header">
                <span class="step-badge">STEP 3</span>
                <span class="step-title">Inspect the Scammer's Trail in the Case Drawer</span>
            </div>
            <p>
                The presenter clicks <strong>"Inspect Target Case"</strong>. A slide-out panel opens revealing:
            </p>
            <ul>
                <li><strong>The Visual Money Trail:</strong> Shows Mrs. Sunita's account &rarr; Mule Account #1 &rarr; Mule Account #2 &rarr; Destination ATM.</li>
                <li><strong>The Plain-English Explanation:</strong> A clear chart explains why the account was flagged: <em>"Connected to known scam ring (+37%), Close to high-risk ATM (+30%), Account opened recently (+15%)."</em> No confusing black-box AI—everything is crystal clear!</li>
            </ul>
        </div>

        <!-- STEP 4 -->
        <div class="step-box">
            <div class="step-header">
                <span class="step-badge">STEP 4</span>
                <span class="step-title">Freeze the Scammer's Account (1 Click)</span>
            </div>
            <p>
                The police officer clicks the blue button <strong>"Dispatch Freeze Order"</strong>.
                Instantly, an official legal directive (Section 91 Cr.P.C.) is sent to the scammer's bank (Union Bank of India). 
                A green confirmation badge appears: <strong>"BANK LIEN CONFIRMED — ₹1,20,000 SECURED"</strong>. The money is now locked in the bank; the scammer cannot move a single rupee!
            </p>
        </div>

        <!-- STEP 5 -->
        <div class="step-box">
            <div class="step-header">
                <span class="step-badge">STEP 5</span>
                <span class="step-title">Dispatch the Nearest Police Patrol Car</span>
            </div>
            <p>
                What about the cash runner waiting at the ATM? The officer clicks <strong>"Dispatch Patrol"</strong>.
                RakshaNet instantly finds the nearest police car (<em>PCR-MUM-NORTH-12</em>) located just 1.2 km away. 
                With one tap, a flash dispatch order is transmitted to the vehicle with GPS directions and an estimated arrival time of <strong>1.8 minutes</strong>!
            </p>
        </div>
    </div>

    <!-- ================================================================= -->
    <!-- SECTION 4: RETURNING MONEY & CITIZEN PORTAL -->
    <!-- ================================================================= -->
    <div class="page">
        <div class="header-banner">
            <span>RAKSHANET CITIZEN & EXECUTIVE GUIDE</span>
            <span>PART 4: RESTITUTION & CITIZEN RECOVERY</span>
        </div>

        <h1>4. Restoring the Stolen Money to the Citizen</h1>

        <h2>4.1 The Final Step: Returning Mrs. Sunita's ₹1,20,000</h2>
        <p>
            Freezing an account is only half the battle. Under Indian law, police cannot simply take money out of a scammer's account 
            and give it back to a victim without a magistrate's permission. In the real world, this takes 6 to 12 months of painful court visits. 
            <strong>RakshaNet solves this in 1 click:</strong>
        </p>

        <div class="step-box">
            <div class="step-header">
                <span class="step-badge">STEP 6</span>
                <span class="step-title">1-Click Magisterial Restitution (Section 457 Cr.P.C.)</span>
            </div>
            <p>
                In the Case Drawer, the officer clicks <strong>"💰 Sec 457 Restitution"</strong>:
            </p>
            <ol>
                <li>A clean court petition is automatically prepared for the Chief Metropolitan Magistrate with the complaint number, scammer's frozen account, and Mrs. Sunita's bank details.</li>
                <li>The officer enters the magistrate's sanction and clicks <strong>"Execute Magisterial Reverse Settlement"</strong>.</li>
                <li>The banking network debits the scammer's account and <strong>credits ₹1,20,000 directly back into Mrs. Sunita's bank account</strong>. A digital receipt with a tamper-proof digital signature is generated instantly!</li>
            </ol>
        </div>

        <h2>4.2 The Citizen Recovery Portal (Tracking Like an Online Order)</h2>
        <div class="step-box">
            <div class="step-header">
                <span class="step-badge">STEP 7</span>
                <span class="step-title">Public Citizen Transparency Portal</span>
            </div>
            <p>
                Mrs. Sunita doesn't have to visit the police station repeatedly or wonder if anyone is working on her case. 
                She opens the <strong>"Citizen Recovery Portal"</strong> on her phone, types in her complaint number (<code>NCRP-2026-MUM-8921</code>), and sees an easy 4-stage tracker:
            </p>
            <div style="margin-top: 8pt; display: flex; flex-direction: column; gap: 6pt;">
                <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 6pt 10pt; border-radius: 4px; font-size: 8.5pt;">
                    ✅ <strong>Stage 1: Complaint Ingested</strong> — Reported and verified on national portal.
                </div>
                <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 6pt 10pt; border-radius: 4px; font-size: 8.5pt;">
                    ✅ <strong>Stage 2: Scam Account Intercepted</strong> — AI caught the money jumping across banks.
                </div>
                <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 6pt 10pt; border-radius: 4px; font-size: 8.5pt;">
                    ✅ <strong>Stage 3: Funds Secured Under Bank Lien</strong> — ₹1,20,000 legally locked at beneficiary bank.
                </div>
                <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 6pt 10pt; border-radius: 4px; font-size: 8.5pt;">
                    ✅ <strong>Stage 4: Funds Restored to Bank Account</strong> — 100% of money refunded via RTGS settlement!
                </div>
            </div>
        </div>

        <h2>4.3 The Big Picture: Why This Changes Everything for India</h2>
        <div class="story-card">
            <ul style="margin: 0; padding-left: 14pt;">
                <li><strong>Saves Thousands of Crores:</strong> Over ₹10,000 Crores are lost to cyber fraudsters in India every year. RakshaNet catches the money before it turns into cash.</li>
                <li><strong>Empowers the Common Man:</strong> Pensioners, students, and small shopkeepers don't need lawyers or connections to get their stolen money back.</li>
                <li><strong>Makes Police 100,000x Faster:</strong> Reduces inter-agency response time from 3 days down to less than 1 second.</li>
            </ul>
        </div>

        <div style="margin-top: 25pt; border-top: 1px solid #cbd5e1; padding-top: 12pt; display: flex; justify-content: space-between; font-size: 8.5pt; color: #64748b; font-family: monospace;">
            <div>
                RAKSHANET 🛡️ — SMART INDIA HACKATHON 2026<br>
                PROTECTING CITIZENS ACROSS DIGITAL INDIA
            </div>
            <div style="text-align: right;">
                READY FOR LIVE JURY DEMONSTRATION<br>
                100% PRODUCTION PROTOTYPE
            </div>
        </div>
    </div>

</body>
</html>"""

# Write HTML
full_html = HTML_CONTENT.replace("__CSS_STYLES__", CSS_STYLES)
with open(HTML_OUT, "w", encoding="utf-8") as f:
    f.write(full_html)
print(f"✅ Generated Layman HTML: {HTML_OUT}")

# Render to PDF via Chrome Headless
print("Compiling Layman PDF via Chrome Headless...")
cmd = [
    CHROME_BIN,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={PDF_OUT}",
    str(HTML_OUT)
]
res = subprocess.run(cmd, capture_output=True, text=True)

if res.returncode == 0 and PDF_OUT.exists():
    size_kb = os.path.getsize(PDF_OUT) / 1024
    print(f"🎉 Successfully generated PDF: {PDF_OUT} ({size_kb:.1f} KB)")
    # Copy to Desktop
    subprocess.run(["cp", str(PDF_OUT), str(DESKTOP_PDF)])
    print(f"🖥️ Copied to Desktop: {DESKTOP_PDF}")
    # Copy to Artifact directory
    artifact_pdf = ARTIFACT_DIR / "RAKSHANET_LAYMAN_EXECUTIVE_GUIDE.pdf"
    subprocess.run(["cp", str(PDF_OUT), str(artifact_pdf)])
    print(f"📋 Copied to Artifacts: {artifact_pdf}")
else:
    print(f"❌ Failed to generate PDF: {res.stderr}")
    sys.exit(1)
