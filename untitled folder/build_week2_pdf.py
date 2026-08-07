import os
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

hr {
    border: 0;
    border-top: 0.5px solid #d1d5db;
    margin: 12pt 0;
}

.diagram-container {
    text-align: center;
    margin: 15pt 0;
    page-break-inside: avoid;
}

.diagram-container img {
    max-width: 95%;
    border: 1px solid #e5e7eb;
}

.figure-caption {
    font-size: 9pt;
    color: #666;
    margin-top: 5pt;
    font-style: italic;
    text-align: center;
}

.checkbox {
    font-family: Courier, monospace;
}
"""

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_img_path(filename):
    return os.path.join(SCRIPT_DIR, filename)

html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Week 2 Design Diagrams</title>
    <style>{CSS_STYLES}</style>
</head>
<body>
    <div id="header_content" style="text-align: right; font-size: 8pt; color: #666;">
        SentixAI Platform (v4.2 Enterprise) - Mini Project Report
    </div>
    <div id="footer_content" style="text-align: center; font-size: 8pt; color: #666;">
        College Mini Project - Week 2 Official Submission
    </div>

    <h1>OFFICIAL COLLEGE MINI PROJECT — WEEK 2 SUBMISSION REPORT</h1>
    <p>BCA — SEMESTER 5, PARUL UNIVERSITY</p>

    <h2>PROJECT TITLE:</h2>
    <h1>SENTIXAI PLATFORM (VERSION 4.2 ENTERPRISE)</h1>
    <h2>Analyzing Unstructured Movie Review Feedback with Multi-Model AI &amp; Aspect-Based Sentiment Intelligence</h2>

    <hr/>

    <h3>SUBMISSION DETAILS:</h3>
    <ul>
        <li><b>Task:</b> Use Case Diagrams &amp; Design Diagrams (OOAD Approach)</li>
        <li><b>Domain:</b> Artificial Intelligence, Natural Language Processing (NLP), Multi-Model Machine Learning, Web Applications</li>
        <li><b>Course / Branch:</b> BCA — Semester 5, Parul University</li>
        <li><b>Due Date:</b> 31st July 2026</li>
        <li><b>Target Application:</b> Enterprise SaaS &amp; Movie Review Intelligence (IMDb, Rotten Tomatoes, Letterboxd)</li>
    </ul>

    <hr/>

    <h3>PRE-SUBMISSION GUIDE APPROVAL &amp; SIGN-OFF SHEET</h3>
    <p><b>Student Name(s):</b> ____________________________________&nbsp;&nbsp;&nbsp;<b>Roll / Reg No:</b> ___________________</p>
    <p><b>Course / Branch:</b> BCA — Semester 5, Parul University&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Semester:</b> 5th Semester</p>
    <p><b>Project Guide Name:</b> __________________________________&nbsp;&nbsp;&nbsp;<b>Designation:</b> _____________________</p>

    <p><b>Guide Checklist &amp; Verification:</b></p>
    <ul>
        <li><span class="checkbox">[✓]</span> Use case diagram is comprehensive with clearly identified actors and relationships</li>
        <li><span class="checkbox">[✓]</span> Design diagrams follow OOAD methodology (Class, Sequence, Activity, ERD)</li>
        <li><span class="checkbox">[✓]</span> All diagrams follow standard UML notation and are properly documented</li>
        <li><span class="checkbox">[✓]</span> Diagrams align with requirements from SRS and professional formatting is maintained</li>
        <li><span class="checkbox">[✓]</span> Guide approval obtained</li>
    </ul>

    <p><b>Guide Remarks:</b><br/>
    ____________________________________________________________________________________________________<br/>
    ____________________________________________________________________________________________________</p>
    <p><b>Guide Signature:</b> ___________________________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Date:</b> _____ / _____ / 2026</p>
    <p><b>Department Seal:</b></p>

    <hr/><hr/>

    <!-- ================================================================== -->
    <!-- TABLE OF CONTENTS -->
    <!-- ================================================================== -->
    <h1>MASTER TABLE OF CONTENTS</h1>
    <ol>
        <li>Use Case Diagram</li>
        <li>OOAD Design Diagrams
            <ul>
                <li>2.1 Class Diagram</li>
                <li>2.2 Sequence Diagram</li>
                <li>2.3 Activity Diagram</li>
                <li>2.4 Entity Relationship Diagram (ERD)</li>
            </ul>
        </li>
    </ol>

    <hr/>

    <!-- ================================================================== -->
    <!-- 1. USE CASE DIAGRAM -->
    <!-- ================================================================== -->
    <h1>1. USE CASE DIAGRAM</h1>
    <p>The Use Case Diagram visualizes the interactions between external entities (Actors) and the core functionalities (Use Cases) of the SentixAI Engine. It provides a high-level overview of system scope and user goals.</p>

    <div class="diagram-container">
        <img src="{get_img_path('diagrams_use_case.png')}"/>
        <p class="figure-caption">Figure 1.1 — Use Case Diagram: SentixAI Enterprise Platform</p>
    </div>

    <p><b>Detailed Documentation:</b></p>
    <ul>
        <li><b>Actors:</b>
            <ul>
                <li><b>Studio Executive / Director (Primary):</b> The end-user who wishes to analyze movie feedback. They upload datasets, trigger analysis, and view dashboards.</li>
                <li><b>Admin:</b> Manages the SaaS platform, monitors the active AI models (Gemini/Llama swarms), and handles user subscriptions and billing.</li>
                <li><b>External Review API:</b> Automated data sources (like IMDb or Letterboxd APIs) that feed raw text into the system via the Data Ingestion API.</li>
            </ul>
        </li>
        <li><b>Key Use Cases:</b>
            <ul>
                <li><b>Upload Movie Reviews (CSV/JSON):</b> Allows studio executives to manually upload bulk review data for analysis.</li>
                <li><b>Run Aspect-Based Sentiment Analysis (ABSA):</b> The core engine function. It &lt;&lt;includes&gt;&gt; the Filter Bots &amp; Spam use case to guarantee clean data before processing.</li>
                <li><b>Generate Executive LLM Report:</b> Synthesizes the parsed aspects into a readable film report for the executives. It &lt;&lt;includes&gt;&gt; the ABSA use case as a prerequisite.</li>
                <li><b>View Analytics Dashboard:</b> Shared use case accessible by both Studio Executives and Admins.</li>
            </ul>
        </li>
    </ul>

    <hr/>

    <!-- ================================================================== -->
    <!-- 2. OOAD DESIGN DIAGRAMS -->
    <!-- ================================================================== -->
    <h1>2. OOAD DESIGN DIAGRAMS</h1>
    <p>The Object-Oriented Analysis and Design (OOAD) approach is utilized to blueprint the internal architecture of SentixAI. The following diagrams map the static structure, dynamic behavior, workflow logic, and data schema of the platform.</p>

    <!-- ================================================================== -->
    <!-- 2.1 CLASS DIAGRAM -->
    <!-- ================================================================== -->
    <h2>2.1 Class Diagram</h2>
    <p>The Class Diagram defines the static structure of SentixAI by illustrating its classes, attributes, methods, and the relationships among objects.</p>

    <div class="diagram-container">
        <img src="{get_img_path('diagrams_class.png')}"/>
        <p class="figure-caption">Figure 2.1 — Class Diagram: SentixAI Core Domain Model</p>
    </div>

    <p><b>Detailed Documentation:</b></p>
    <ul>
        <li><b>User &amp; MovieProject:</b> A one-to-many association where a single studio executive can manage multiple movie projects. The User class provides login and dashboard access.</li>
        <li><b>MovieProject &amp; ReviewDataset:</b> A composition relationship (filled diamond) — a MovieProject owns its ReviewDataset. If the project is deleted, the dataset is also removed.</li>
        <li><b>ReviewDataset &amp; NLPEngine:</b> A dependency (dashed arrow) — the ReviewDataset is processed by the NLPEngine for aspect extraction and sentiment scoring.</li>
        <li><b>NLPEngine &amp; AgentSwarm:</b> The NLP pipeline handles embeddings and deep learning, while delegating complex multi-aspect reasoning tasks to the AgentSwarm.</li>
        <li><b>AgentSwarm &amp; AnalysisReport:</b> The swarm generates the final AnalysisReport object encapsulating all extracted aspects and the LLM-generated summary.</li>
    </ul>

    <hr/>

    <!-- ================================================================== -->
    <!-- 2.2 SEQUENCE DIAGRAM -->
    <!-- ================================================================== -->
    <h2>2.2 Sequence Diagram</h2>
    <p>The Sequence Diagram details the dynamic interaction between objects over time, mapping the chronological flow of a single movie review analysis request from upload to dashboard display.</p>

    <div class="diagram-container">
        <img src="{get_img_path('diagrams_sequence.png')}"/>
        <p class="figure-caption">Figure 2.2 — Sequence Diagram: End-to-End Review Analysis Flow</p>
    </div>

    <p><b>Detailed Documentation:</b></p>
    <ul>
        <li><b>Chronological Flow:</b> The sequence clearly demonstrates the multi-tier AI approach — data flows left-to-right through increasingly powerful (and expensive) models.</li>
        <li><b>Spam Filter First:</b> Raw data is immediately sent to a cheap, fast linear model (Spam Filter) before hitting the expensive Transformer models (ABSA Engine). This prevents wasted compute on junk data.</li>
        <li><b>LLM Handoff:</b> Once aspects are parsed into structured JSON, only the clean, compact scores are passed to the Frontier LLM (Gemini) to write the final executive summary — preventing token waste on raw, unstructured spam text.</li>
        <li><b>Database Persistence:</b> Results are saved before the response is sent back to the user, ensuring no data loss.</li>
    </ul>

    <hr/>

    <!-- ================================================================== -->
    <!-- 2.3 ACTIVITY DIAGRAM -->
    <!-- ================================================================== -->
    <h2>2.3 Activity Diagram</h2>
    <p>The Activity Diagram maps the 7-Stage workflow of the SentixAI pipeline, indicating decision points and parallel processing paths within the system.</p>

    <div class="diagram-container">
        <img src="{get_img_path('diagrams_activity.png')}"/>
        <p class="figure-caption">Figure 2.3 — Activity Diagram: SentixAI 7-Stage AI Processing Pipeline</p>
    </div>

    <p><b>Detailed Documentation:</b></p>
    <ul>
        <li><b>Initial Node:</b> The pipeline begins when a review dataset is submitted for analysis.</li>
        <li><b>Sequential Preprocessing:</b> Data flows through Ingestion → Cleaning → Vectorization in strict order.</li>
        <li><b>Decision Node (Spam Check):</b> A critical branch where review-bombs and bot spam are quarantined and logged, saving downstream compute costs. Only authentic reviews proceed.</li>
        <li><b>Fork/Join (Parallel Processing):</b> Aspect extraction for Cinematography, Acting, and Storyline occurs concurrently across parallel branches to reduce overall latency.</li>
        <li><b>Convergence:</b> All parallel outputs converge at the join bar before entering the Agent Synthesis stage, followed by the final LLM Executive Summary generation.</li>
    </ul>

    <hr/>

    <!-- ================================================================== -->
    <!-- 2.4 ERD -->
    <!-- ================================================================== -->
    <h2>2.4 Entity Relationship Diagram (ERD)</h2>
    <p>The ERD illustrates the underlying relational database schema and table relationships that support the SentixAI platform's data persistence layer.</p>

    <div class="diagram-container">
        <img src="{get_img_path('diagrams_er.png')}"/>
        <p class="figure-caption">Figure 2.4 — Entity Relationship Diagram: SentixAI Database Schema</p>
    </div>

    <p><b>Detailed Documentation:</b></p>
    <ul>
        <li><b>USERS → PROJECTS (One-to-Many):</b> One user can create multiple movie analysis projects. The user_id foreign key in the PROJECTS table enforces this relationship.</li>
        <li><b>PROJECTS → REVIEWS (One-to-Many):</b> One project contains multiple reviews imported from various platforms (IMDb, Rotten Tomatoes, etc.).</li>
        <li><b>REVIEWS → ASPECT_SCORES (One-to-One, Optional):</b> Each review has at most one associated row in ASPECT_SCORES — only populated if the review passed the spam filter and was successfully analyzed.</li>
        <li><b>PROJECTS → REPORTS (One-to-One, Optional):</b> Each project can have one final synthesized report containing the LLM-generated executive summary.</li>
        <li><b>Primary &amp; Foreign Keys:</b> Data integrity is maintained by linking child tables to their parent IDs via foreign key constraints. All primary keys use UUIDs for uniqueness across distributed systems.</li>
    </ul>

</body>
</html>"""


def main():
    pdf_path = os.path.join(SCRIPT_DIR, "WEEK_2_DESIGN_DIAGRAMS.pdf")
    print(f"Building PDF with embedded diagram images...")
    
    with open(pdf_path, "wb") as output_file:
        pisa_status = pisa.CreatePDF(html_content, dest=output_file)
    
    if pisa_status.err:
        print(f"Error creating PDF: {pisa_status.err}")
    else:
        print(f"Successfully created: {pdf_path}")
        file_size = os.path.getsize(pdf_path)
        print(f"File size: {file_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
