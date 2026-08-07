import os
import markdown
from xhtml2pdf import pisa

CSS_STYLES = """
@page {
    size: A4;
    margin: 1.5cm;
    @frame header_frame {
        -pdf-frame-content: header_content;
        left: 1.5cm; width: 18cm; top: 0.5cm; height: 1cm;
    }
    @frame footer_frame {
        -pdf-frame-content: footer_content;
        left: 1.5cm; width: 18cm; top: 28cm; height: 1cm;
    }
}

body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.4;
    color: #222222;
}

h1 {
    font-size: 16pt;
    color: #111827;
    border-bottom: 1.5px solid #3b82f6;
    padding-bottom: 4px;
    margin-top: 18pt;
    margin-bottom: 10pt;
}

h2 {
    font-size: 13pt;
    color: #1f2937;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 3px;
    margin-top: 14pt;
    margin-bottom: 8pt;
}

h3 {
    font-size: 11pt;
    color: #374151;
    margin-top: 10pt;
    margin-bottom: 4pt;
}

p {
    margin-bottom: 8pt;
    text-align: justify;
}

ul, ol {
    margin-top: 2pt;
    margin-bottom: 8pt;
    padding-left: 15pt;
}

li {
    margin-bottom: 3pt;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8pt;
    margin-bottom: 12pt;
}

th, td {
    border: 0.5px solid #d1d5db;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
    font-size: 8.5pt;
}

th {
    background-color: #f3f4f6;
    color: #111827;
    font-weight: bold;
}

blockquote {
    border-left: 3px solid #3b82f6;
    background-color: #eff6ff;
    padding: 6pt 10pt;
    margin: 8pt 0;
    font-style: italic;
    color: #1e40af;
}

pre, code {
    font-family: Courier, monospace;
    background-color: #f3f4f6;
}

code {
    padding: 1px 3px;
    font-size: 9pt;
}

pre {
    padding: 8pt;
    border: 0.5px solid #e5e7eb;
    font-size: 8.5pt;
}

hr {
    border: 0;
    border-top: 0.5px solid #d1d5db;
    margin: 12pt 0;
}
"""

def convert_md_to_pdf(md_file_path, pdf_file_path):
    print(f"Converting {md_file_path} to {pdf_file_path}...")
    with open(md_file_path, "r", encoding="utf-8") as f:
        md_content = f.read()
    
    # Convert markdown to html
    html_body = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'toc', 'nl2br']
    )
    
    full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>College Mini Project Report</title>
    <style>{CSS_STYLES}</style>
</head>
<body>
    <div id="header_content" style="text-align: right; font-size: 8pt; color: #666;">
        SentixAI Platform (v4.2 Enterprise) - Mini Project Report
    </div>
    <div id="footer_content" style="text-align: center; font-size: 8pt; color: #666;">
        College Mini Project - Week 1 Official Submission
    </div>
    {html_body}
</body>
</html>"""
    
    with open(pdf_file_path, "wb") as output_file:
        pisa_status = pisa.CreatePDF(full_html, dest=output_file)
    
    if pisa_status.err:
        print(f"Error creating PDF {pdf_file_path}: {pisa_status.err}")
    else:
        print(f"Successfully created: {pdf_file_path}")

if __name__ == "__main__":
    files_to_convert = [
        ("WEEK_1_COMPLETE_SUBMISSION_REPORT.md", "WEEK_1_COMPLETE_SUBMISSION_REPORT.pdf"),
        ("WEEK_1_TASK_1_FEASIBILITY_AND_REQUIREMENTS.md", "WEEK_1_TASK_1_FEASIBILITY_AND_REQUIREMENTS.pdf"),
        ("WEEK_1_TASK_2_COMPARISON_AND_ADVANTAGES.md", "WEEK_1_TASK_2_COMPARISON_AND_ADVANTAGES.pdf"),
        ("SENTIXAI_PROJECT_MEMORY.md", "SENTIXAI_PROJECT_MEMORY.pdf")
    ]
    
    for md_file, pdf_file in files_to_convert:
        if os.path.exists(md_file):
            convert_md_to_pdf(md_file, pdf_file)
        else:
            print(f"Warning: {md_file} not found.")
