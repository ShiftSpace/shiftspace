import re
from lxml.html import fromstring, tostring

class LinkProcessor:
    def parse(self, html_doc):
        self.root = fromstring(html_doc)

    def set_url(self, url):
        patt = re.compile(r"(.+\/)(.+$)?")
        current_dir_url = re.match(patt, url, re.I).groups()[0]
        print current_dir_url
        self.base_url = current_dir_url

    def get_dom(self):
        self.root.make_links_absolute(self.base_url, resolve_base_href=True)
        #html_doc = tostring(self.root)
        return self.root
