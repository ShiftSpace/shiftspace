from couchdb.client import Database, View
import couchdb.http as http


class LuceneDatabase(Database):
    def fti(self, name, wrapper=None, **options):
        pass


class LuceneIndex(object):
    """Abstract representation of a Lucene query."""

    def __init__(self, uri, wrapper=None, http=None):
        self.resource = http.Resource(http, None)
        self.wrapper = wrapper

    def __call__(self, **options):
        return LuceneIndexResults(self, options)

    def __iter__(self):
        return self()

    def _exec(self, options):
        status, msg, response = self.resource.get_json(**options)
        return response


class LuceneIndexResults(object):

    def __init__(self, view, options):
        self.view = view
        self.options = options
        self._rows = self._total_rows = self._offset = None

    def __repr__(self):
        return '<%s %r %r>' % (type(self).__name__, self.view, self.options)

    def __iter__(self):
        wrapper = self.view.wrapper
        for row in self.rows:
            if wrapper is not None:
                yield wrapper(row)
            else:
                yield row

    def __len__(self):
        return len(self.rows)

    def _fetch(self):
        data = self.view._exec(self.options)
        self._rows = [Row(row) for row in data['rows']]
        self._total_rows = data.get('total_rows')
        self._offset = data.get('offset', 0)

    @property
    def rows(self):
        if self._rows is None:
            self._fetch()
        return self._rows

    @property
    def total_rows(self):
        if self._rows is None:
            self._fetch()
        return self._total_rows

    @property
    def offset(self):
        if self._rows is None:
            self._fetch()
        return self._offset

