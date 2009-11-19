from copy import deepcopy
from inspect import getsource
from itertools import groupby
from operator import attrgetter
from textwrap import dedent
from types import FunctionType


__all__ = ['LuceneDefinition']
__docformat__ = 'restructuredtext en'


class LuceneDefinition(object):

    def __init__(self, design, name, defaults="{\"store\":\"yes\"}", index_fun,
                 language='javascript', wrapper=None, **defaults):
        if design.startswith('_design/'):
            design = design[8:]
        self.design = design
        self.name = name
        self.defaults = dedent(defaults.lstrip('\n'))
        self.index_fun = dedent(reduce_fun.lstrip('\n'))
        self.language = language
        self.wrapper = wrapper
        self.defaults = defaults

    def __call__(self, db, **options):
        merged_options = self.defaults.copy()
        merged_options.update(options)
        return db.fti('/'.join([self.design, self.name]),
                      wrapper=self.wrapper, **merged_options)

    def __repr__(self):
        return '<%s %r>' % (type(self).__name__, '/'.join([
            '_design', self.design, '_view', self.name
        ]))

    def get_doc(self, db):
        return db.get('_design/%s' % self.design)

    def sync(self, db):
        type(self).sync_many(db, [self])

    @staticmethod
    def sync_many(db, views, remove_missing=False, callback=None):
        docs = []

        for design, views in groupby(views, key=attrgetter('design')):
            doc_id = '_design/%s' % design
            doc = db.get(doc_id, {'_id': doc_id})
            orig_doc = deepcopy(doc)
            languages = set()

            missing = list(doc.get('views', {}).keys())
            for view in views:
                funcs = {'map': view.map_fun}
                if view.reduce_fun:
                    funcs['reduce'] = view.reduce_fun
                doc.setdefault('views', {})[view.name] = funcs
                languages.add(view.language)
                if view.name in missing:
                    missing.remove(view.name)

            if remove_missing and missing:
                for name in missing:
                    del doc['views'][name]
            elif missing and 'language' in doc:
                languages.add(doc['language'])

            if len(languages) > 1:
                raise ValueError('Found different language views in one '
                                 'design document (%r)', list(languages))
            doc['language'] = list(languages)[0]

            if doc != orig_doc:
                if callback is not None:
                    callback(doc)
                docs.append(doc)

        db.update(docs)


def _strip_decorators(code):
    retval = []
    beginning = True
    for line in code.splitlines():
        if beginning and not line.isspace():
            if line.lstrip().startswith('@'):
                continue
            beginning = False
        retval.append(line)
    return '\n'.join(retval)
