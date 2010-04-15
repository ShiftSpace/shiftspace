from server.utils.utils import *
from server.utils.errors import *
from server.utils.decorators import *
from server.utils.returnTypes import *
from server.models.shift import Shift
from server.models.group import Group

class UtilitiesController():
    def __init__(self, dispatcher=None):
        if dispatcher:
            self.routes(dispatcher)

    def routes(self, d):
        d.connect(name='utilAutocomplete', route='autocomplete', controller=self, action='autocomplete')
        return d

    @jsonencode
    def autocomplete(self, type="user", query=None):
        """
        Helper for autocompletion of user names, group short names,
        and tags.
        """
        import server.models.core
        from server.utils.returnTypes import data
        from server.setup import AutocompleteByUser, AutocompleteByGroup, AutocompleteByTag
        db = core.connect()
        if type == "group":
            view = AutocompleteByGroup
        elif type == "tag":
            view = AutocompleteByTag
        else:
            view = AutocompleteByUser
        rows = core.values(view(db, start_key=query, end_key=("%sZ" % query)))
        matches = [{"_id": x["_id"],
                    "name": x.get("userName") or x.get("shortName") or x.get("string"),
                    "gravatar": x.get("gravatar"),
                    "type": x["type"]}
                   for x in rows if x["userName"] != "shiftspace"]
        return data(matches)

