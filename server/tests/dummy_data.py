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

fakebob = {
    "userName": "fakebob",
    "fullName": {
        "first":"Fake",
        "last": "Bob"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakebob"
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
            },
        "summary": "A really cool shift!",
        "content": {
            "position": {"x":100, "y":200},
            "text": "A really cool note!"
            }
        }

def groupJson():
    return {
        "longName": "FooBar Fans",
        "shortName": "fbf",
        "tagLine": "A really cool group for fans of foo!",
        "url": "http://foobar.org",
        }
