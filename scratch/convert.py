import os
import markdown
from xhtml2pdf import pisa

def convert_md_to_pdf():
    md_path = "/Users/jeyak/accesseasy/docs/production_test_cases_suite.md"
    pdf_path = "/Users/jeyak/accesseasy/docs/production_test_cases_suite.pdf"

    if not os.path.exists(md_path):
        print(f"Error: Markdown file not found at {md_path}")
        return

    # Read Markdown
    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    # Convert to HTML (including tables support)
    html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

    # CSS Template for beautiful styling
    css_styles = """
    @page {
        size: A4;
        margin: 2cm;
    }
    body {
        font-family: Helvetica, Arial, sans-serif;
        color: #2D3748;
        line-height: 1.5;
        font-size: 10pt;
    }
    h1 {
        font-size: 20pt;
        color: #1A365D;
        border-bottom: 2px solid #2B6CB0;
        padding-bottom: 8px;
        margin-top: 24px;
        margin-bottom: 16px;
    }
    h2 {
        font-size: 14pt;
        color: #2B6CB0;
        margin-top: 20px;
        margin-bottom: 12px;
        border-bottom: 1px solid #E2E8F0;
        padding-bottom: 4px;
    }
    h3 {
        font-size: 11pt;
        color: #4A5568;
        margin-top: 14px;
        margin-bottom: 8px;
    }
    h4 {
        font-size: 10pt;
        color: #4A5568;
        font-weight: bold;
        margin-top: 8px;
        margin-bottom: 4px;
    }
    p {
        margin-bottom: 10px;
    }
    ul, ol {
        margin-left: 20px;
        margin-bottom: 10px;
    }
    li {
        margin-bottom: 4px;
    }
    code {
        font-family: Courier, monospace;
        background-color: #F7FAFC;
        padding: 2px 4px;
        font-size: 9pt;
        color: #C53030;
    }
    pre {
        background-color: #F7FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 12px;
    }
    pre code {
        color: #2D3748;
        background-color: transparent;
        padding: 0;
        font-size: 8.5pt;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
        margin-bottom: 16px;
    }
    th {
        background-color: #EDF2F7;
        color: #2D3748;
        font-weight: bold;
        text-align: left;
        border: 1px solid #CBD5E0;
        padding: 6px 10px;
        font-size: 9pt;
    }
    td {
        border: 1px solid #E2E8F0;
        padding: 6px 10px;
        font-size: 9pt;
    }
    tr:nth-child(even) {
        background-color: #F7FAFC;
    }
    hr {
        border: 0;
        border-top: 1px solid #E2E8F0;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    """

    # Wrap compiled markdown in layout template
    full_html = f"""<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            {css_styles}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """

    print("HTML rendering complete. Initializing PDF compilation...")
    # Convert HTML string to PDF file
    with open(pdf_path, "wb") as f_pdf:
        pisa_status = pisa.CreatePDF(full_html, dest=f_pdf)
    
    if not pisa_status.err:
        print(f"Success: PDF generated successfully at {pdf_path}")
    else:
        print(f"Error during PDF compilation: {pisa_status.err}")

if __name__ == "__main__":
    convert_md_to_pdf()
