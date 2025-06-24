"""
usage: python3 templates/render.py

Looks for template files in the same directory as this script
and outputs html to the current working directory (where it was run from).
WARNING: it will overwrite existing files in the working directory.
"""


import django
from django.conf import settings
from django.template import Template, Context
from pathlib import Path

template_dir = Path(__file__).parent

settings.configure(
    TEMPLATES = [{
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [template_dir],
    }]
)
django.setup()

pages = {
    # url : template_filename
    "/index.html" : "index.html",
    "/about.html" : "about.html",
    "/contact.html" : "contact.html",
    "/equipment.html" : "equipment.html",
    "/history.html" : "history.html",
    "/services/lighting.html" : "lighting.html",
}


for url, template_filename in pages.items():
    template = None

    try:
        with open(template_dir / template_filename) as template_file:
            template = Template(template_file.read())
    except FileNotFoundError:
        print(f'Could not find the template: {template_filename}. Skipping this page.')
        continue

    html = template.render(Context())
    
    with open(Path('.' + url), 'w') as dest_file:
        dest_file.write(html)
    
    print(f'Successfully rendered {url}')