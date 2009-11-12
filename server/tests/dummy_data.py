fakemary = {
    "userName": "fakemary",
    "fullName": {
        "first":"Fake",
        "last": "Mary"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakemary",
}

fakejohn = {
    "userName": "fakejohn",
    "fullName": {
        "first":"Fake",
        "last": "John"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakejohn"
}

def shiftJson():
    return {
        "source": {
            "server":"http://localhost:5984/",
            "database":"shiftspace"
            },
        "href": "http://google.com/images",
        "space": {
            "name":"Notes",
            "version": "0.1"
            }
        }

def groupJson():
    return {
        "longName": "FooBar Fans",
        "shortName": "fbf",
        "tagLine": "A really cool group for fans of foo!",
        "url": "http://foobar.org",
        }
