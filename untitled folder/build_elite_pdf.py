import os
import markdown
from xhtml2pdf import pisa

ELITE_CSS = """
@page {
    size: A4;
    margin: 1.8cm 1.5cm 2.2cm 1.5cm;
    @frame header_frame {
        -pdf-frame-content: header_content;
        left: 1.5cm; width: 18cm; top: 0.6cm; height: 1cm;
    }
    @frame footer_frame {
        -pdf-frame-content: footer_content;
        left: 1.5cm; width: 18cm; top: 28cm; height: 1.2cm;
    }
}

@page cover_page {
    size: A4;
    margin: 2cm 2cm 2cm 2cm;
    @frame header_frame {
        -pdf-frame-content: empty_header;
        left: 0; width: 0; top: 0; height: 0;
    }
    @frame footer_frame {
        -pdf-frame-content: cover_footer;
        left: 2cm; width: 17cm; top: 28cm; height: 1cm;
    }
}

body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.45;
    color: #1e293b;
}

/* Cover Page Styles */
.cover-container {
    text-align: center;
    padding-top: 3.5cm;
}
.cover-icon {
    width: 65px;
    height: 65px;
    background-color: #2563eb;
    color: #ffffff;
    font-size: 26pt;
    font-weight: bold;
    line-height: 65px;
    border-radius: 32px;
    margin: 0 auto 1.5cm auto;
    text-align: center;
}
.cover-title {
    font-size: 24pt;
    font-weight: bold;
    color: #0f172a;
    margin-bottom: 8pt;
    letter-spacing: -0.5px;
}
.cover-subtitle {
    font-size: 13pt;
    color: #2563eb;
    font-style: italic;
    margin-bottom: 2.5cm;
}
.cover-divider {
    width: 100px;
    height: 3px;
    background-color: #3b82f6;
    margin: 0 auto 2.5cm auto;
}
.cover-meta-table {
    width: 90%;
    margin: 0 auto;
    border: none;
    text-align: left;
    font-size: 10.5pt;
}
.cover-meta-table td {
    border: none;
    padding: 6px 10px;
}

/* Content Headings */
h1 {
    font-size: 16pt;
    color: #0f172a;
    background-color: #f1f5f9;
    border-left: 5px solid #2563eb;
    padding: 6px 10px;
    margin-top: 22pt;
    margin-bottom: 12pt;
    page-break-after: avoid;
}

h2 {
    font-size: 12.5pt;
    color: #1e293b;
    border-bottom: 1.5px solid #cbd5e1;
    padding-bottom: 3px;
    margin-top: 16pt;
    margin-bottom: 8pt;
    page-break-after: avoid;
}

h3 {
    font-size: 11pt;
    color: #334155;
    margin-top: 12pt;
    margin-bottom: 5pt;
    page-break-after: avoid;
}

p {
    margin-bottom: 8pt;
    text-align: justify;
}

ul, ol {
    margin-top: 3pt;
    margin-bottom: 10pt;
    padding-left: 18pt;
}

li {
    margin-bottom: 4pt;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10pt;
    margin-bottom: 14pt;
    page-break-inside: auto;
}

tr {
    page-break-inside: avoid;
    page-break-after: auto;
}

th, td {
    border: 0.5px solid #cbd5e1;
    padding: 7px 9px;
    text-align: left;
    vertical-align: top;
    font-size: 8.5pt;
}

th {
    background-color: #1e293b;
    color: #ffffff;
    font-weight: bold;
}

tr:nth-child(even) {
    background-color: #f8fafc;
}

/* Callout Boxes */
blockquote {
    border-left: 4px solid #2563eb;
    background-color: #eff6ff;
    padding: 8pt 12pt;
    margin: 10pt 0;
    font-style: italic;
    color: #1e40af;
}

pre, code {
    font-family: Courier, monospace;
    background-color: #f1f5f9;
}

code {
    padding: 1.5px 4px;
    font-size: 9pt;
    color: #0f172a;
}

pre {
    padding: 10pt;
    border: 0.5px solid #e2e8f0;
    font-size: 8.5pt;
    page-break-inside: avoid;
}

/* Visual Bar Charts */
.chart-container {
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    padding: 12pt;
    margin: 14pt 0;
    page-break-inside: avoid;
}
.chart-title {
    font-size: 11pt;
    font-weight: bold;
    color: #0f172a;
    margin-bottom: 8pt;
    text-align: center;
}
.bar-row {
    margin-bottom: 6pt;
}
.bar-label {
    font-size: 9pt;
    font-weight: bold;
    color: #334155;
    margin-bottom: 2pt;
}
.bar-track {
    background-color: #e2e8f0;
    height: 12px;
    width: 100%;
}
.bar-fill {
    background-color: #2563eb;
    height: 12px;
}
.bar-fill-teal {
    background-color: #0d9488;
    height: 12px;
}

hr {
    border: 0;
    border-top: 0.5px solid #cbd5e1;
    margin: 14pt 0;
}
"""

FEASIBILITY_CHART_HTML = """
<div class="chart-container">
    <div class="chart-title">Figure 3: Feasibility Assessment Summary (Score out of 5.0)</div>
    <table style="border: none; margin: 0; width: 100%;">
        <tr style="background: none;"><td style="border: none; width: 30%; font-weight: bold;">Technical Feasibility (4.8/5.0)</td><td style="border: none; width: 70%;"><div class="bar-track"><div class="bar-fill" style="width: 96%;"></div></div></td></tr>
        <tr style="background: none;"><td style="border: none; width: 30%; font-weight: bold;">Economic Feasibility (5.0/5.0)</td><td style="border: none; width: 70%;"><div class="bar-track"><div class="bar-fill-teal" style="width: 100%;"></div></div></td></tr>
        <tr style="background: none;"><td style="border: none; width: 30%; font-weight: bold;">Operational Feasibility (4.5/5.0)</td><td style="border: none; width: 70%;"><div class="bar-track"><div class="bar-fill" style="width: 90%;"></div></div></td></tr>
        <tr style="background: none;"><td style="border: none; width: 30%; font-weight: bold;">Schedule Feasibility (4.5/5.0)</td><td style="border: none; width: 70%;"><div class="bar-track"><div class="bar-fill" style="width: 90%;"></div></div></td></tr>
        <tr style="background: none;"><td style="border: none; width: 30%; font-weight: bold;">Legal / Ethical (4.8/5.0)</td><td style="border: none; width: 70%;"><div class="bar-track"><div class="bar-fill-teal" style="width: 96%;"></div></div></td></tr>
    </table>
</div>
"""

CAPABILITY_CHART_HTML = """
<div class="chart-container">
    <div class="chart-title">Figure 5: Existing vs Proposed System — Capability Benchmark (Score 0 to 5.0)</div>
    <table style="border: none; margin: 0; width: 100%;">
        <tr style="background: none;"><td style="border: none; width: 35%; font-weight: bold;">Real-Time Stock/Review Visibility</td><td style="border: none; width: 65%;"><div class="bar-track"><div class="bar-fill" style="width: 100%;"></div></div><span style="font-size: 7.5pt; color: #64748b;">SentixAI: 5.0 | Star Ratings: 4.0 | Single BERT: 3.0 | Lexicons: 1.0</span></td></tr>
        <tr style="background: none;"><td style="border: none; width: 35%; font-weight: bold;">ABSA Aspect Granularity</td><td style="border: none; width: 65%;"><div class="bar-track"><div class="bar-fill-teal" style="width: 100%;"></div></div><span style="font-size: 7.5pt; color: #64748b;">SentixAI: 5.0 | Raw LLM: 4.5 | Single BERT: 1.0 | Lexicons: 0.0</span></td></tr>
        <tr style="background: none;"><td style="border: none; width: 35%; font-weight: bold;">Spam & Review-Bombing Shield</td><td style="border: none; width: 65%;"><div class="bar-track"><div class="bar-fill" style="width: 100%;"></div></div><span style="font-size: 7.5pt; color: #64748b;">SentixAI: 5.0 | Raw LLM: 2.0 | Star Ratings: 1.0 | Lexicons: 0.0</span></td></tr>
        <tr style="background: none;"><td style="border: none; width: 35%; font-weight: bold;">Inference Speed & Low Latency</td><td style="border: none; width: 65%;"><div class="bar-track"><div class="bar-fill-teal" style="width: 96%;"></div></div><span style="font-size: 7.5pt; color: #64748b;">SentixAI: 4.8 | Lexicons: 5.0 | Single BERT: 4.0 | Raw LLM: 1.0</span></td></tr>
        <tr style="background: none;"><td style="border: none; width: 35%; font-weight: bold;">Compute Cost Efficiency</td><td style="border: none; width: 65%;"><div class="bar-track"><div class="bar-fill" style="width: 100%;"></div></div><span style="font-size: 7.5pt; color: #64748b;">SentixAI: 5.0 | Lexicons: 5.0 | Single BERT: 4.0 | Raw LLM: 1.0</span></td></tr>
    </table>
</div>
"""

def generate_elite_pdf():
    md_path = "WEEK_1_COMPLETE_SUBMISSION_REPORT.md"
    pdf_path = "SENTIXAI_WEEK_1_SUBMISSION_ELITE.pdf"
    
    print(f"Building Elite PDF: {pdf_path}...")
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()
        
    # Convert body markdown to html
    html_body = markdown.markdown(
        md_text,
        extensions=['tables', 'fenced_code', 'toc', 'nl2br']
    )
    
    # Inject our visual charts right into the HTML where appropriate
    # Inject Feasibility Chart right before Section 3
    if "<h1>3. REQUIREMENT GATHERING" in html_body:
        html_body = html_body.replace("<h1>3. REQUIREMENT GATHERING", FEASIBILITY_CHART_HTML + "<h1>3. REQUIREMENT GATHERING")
    elif "<h1 id=\"3-requirement-gathering--analysis\">" in html_body:
        html_body = html_body.replace("<h1 id=\"3-requirement-gathering--analysis\">", FEASIBILITY_CHART_HTML + "<h1 id=\"3-requirement-gathering--analysis\">")
        
    # Inject Capability Chart right before Section 4.4
    if "<h2>4.4 Existing Systems" in html_body:
        html_body = html_body.replace("<h2>4.4 Existing Systems", CAPABILITY_CHART_HTML + "<h2>4.4 Existing Systems")
    elif "<h2 id=\"44-existing-systems--advantages--disadvantages\">" in html_body:
        html_body = html_body.replace("<h2 id=\"44-existing-systems--advantages--disadvantages\">", CAPABILITY_CHART_HTML + "<h2 id=\"44-existing-systems--advantages--disadvantages\">")
    
    full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SentixAI Platform - Week 1 Submission (Parul University)</title>
    <style>{ELITE_CSS}</style>
</head>
<body>
    <div id="header_content" style="text-align: right; font-size: 8pt; color: #64748b; font-weight: bold;">
        SentixAI Platform (v4.2 Enterprise) — BCA Semester 5, Parul University
    </div>
    <div id="footer_content" style="text-align: center; font-size: 8.5pt; color: #475569; border-top: 0.5px solid #cbd5e1; padding-top: 4px;">
        Page <pdf:pagenumber> of <pdf:pagecount> — Official Mini Project Submission (Task 1 & Task 2)
    </div>
    <div id="empty_header"></div>
    <div id="cover_footer" style="text-align: center; font-size: 8.5pt; color: #64748b;">
        Parul University — Faculty of IT & Computer Science — July 2026
    </div>

    <!-- COVER PAGE -->
    <pdf:nextpage name="cover_page" />
    <div class="cover-container">
        <div class="cover-icon">AI</div>
        <div class="cover-title">SentixAI Platform</div>
        <div style="font-size: 15pt; font-weight: bold; color: #1e293b; margin-bottom: 6pt;">Version 4.2 Enterprise</div>
        <div class="cover-subtitle">Analyzing Unstructured Movie Review Feedback with Multi-Model AI & ABSA Intelligence</div>
        <div class="cover-divider"></div>
        
        <div style="font-size: 12pt; font-weight: bold; color: #0f172a; margin-bottom: 14pt;">
            FEASIBILITY STUDY, REQUIREMENT ANALYSIS & SYSTEM COMPARISON
        </div>
        <div style="font-size: 10pt; color: #475569; margin-bottom: 1.8cm;">
            Submitted in partial fulfillment of the requirements for Mini Project (Task 1 & Task 2)<br>
            <b>Bachelor of Computer Applications (BCA) — Semester 5</b><br>
            Parul University, Vadodara, Gujarat
        </div>
        
        <table class="cover-meta-table" style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12pt;">
            <tr>
                <td style="width: 35%; font-weight: bold; color: #0f172a;">Student Name(s):</td>
                <td style="width: 65%;">___________________________________________</td>
            </tr>
            <tr>
                <td style="font-weight: bold; color: #0f172a;">Roll / Reg. Number:</td>
                <td>___________________________________________</td>
            </tr>
            <tr>
                <td style="font-weight: bold; color: #0f172a;">Academic Course:</td>
                <td>BCA — Semester 5 (Mini Project Submission)</td>
            </tr>
            <tr>
                <td style="font-weight: bold; color: #0f172a;">Project Guide Name:</td>
                <td>___________________________________________</td>
            </tr>
            <tr>
                <td style="font-weight: bold; color: #0f172a;">Submission Due Date:</td>
                <td>17th July 2026 / 20th July 2026</td>
            </tr>
        </table>
    </div>
    
    <pdf:nextpage />
    {html_body}
</body>
</html>"""
    
    with open(pdf_path, "wb") as output_file:
        pisa_status = pisa.CreatePDF(full_html, dest=output_file)
    
    if pisa_status.err:
        print(f"Error creating PDF {pdf_path}: {pisa_status.err}")
    else:
        print(f"Successfully created: {pdf_path}")

if __name__ == "__main__":
    generate_elite_pdf()
