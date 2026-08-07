import markdown
import sys

def main():
    with open('WEEK_2_DESIGN_DIAGRAMS.md', 'r') as f:
        md_text = f.read()
    
    # We want mermaid blocks to become <div class="mermaid">...</div>
    # The markdown parser will put them in <pre><code class="language-mermaid">...</code></pre>
    html_body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'toc', 'nl2br'])
    
    # Replace the fenced code blocks for mermaid
    html_body = html_body.replace('<pre><code class="language-mermaid">', '<div class="mermaid">')
    html_body = html_body.replace('</code></pre>', '</div>')

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Week 2 Design Diagrams</title>
    <style>
        body {{ font-family: Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #222222; max-width: 800px; margin: 0 auto; padding: 2cm; }}
        h1 {{ font-size: 16pt; color: #111827; border-bottom: 1.5px solid #3b82f6; padding-bottom: 4px; margin-top: 18pt; margin-bottom: 10pt; }}
        h2 {{ font-size: 13pt; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-top: 14pt; margin-bottom: 8pt; }}
        h3 {{ font-size: 11pt; color: #374151; margin-top: 10pt; margin-bottom: 4pt; }}
        p {{ margin-bottom: 8pt; text-align: justify; }}
        .mermaid {{ display: flex; justify-content: center; margin: 20px 0; }}
        /* Make sure it breaks pages nicely when printing */
        @media print {{
            body {{ padding: 0; }}
            h1, h2 {{ page-break-after: avoid; }}
            .mermaid {{ page-break-inside: avoid; }}
        }}
    </style>
    <!-- Include Mermaid.js -->
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({{ startOnLoad: true }});
    </script>
</head>
<body>
    {html_body}
</body>
</html>"""

    with open('WEEK_2_DESIGN_DIAGRAMS.html', 'w') as f:
        f.write(html_content)
    print("Created HTML file!")

if __name__ == "__main__":
    main()
