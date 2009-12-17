ack = {"message":"ok"}

def error(msg, type=None):
    err = {"error":msg}
    if type:
        err["type"] = type
    return err

def value(obj):
    attr = hasattr(obj, "toDict")
    if attr:
        return obj.toDict()
    else:
        return obj

def data(obj):
    if type(obj) == list:
        obj = [value(item) for item in obj]
    else:
        obj = value(obj)
    return {"data":obj}

def message(msg):
    return {"message":msg}
