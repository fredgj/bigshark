import json

def jsonify(obj, *fields, **kwargs):
    """serialize obj with a subset of its fields to a JSON formatted string.
       If single is set to False (or not set at all) in the kwargs then obj is 
       a list of objects."""
    one_obj = kwargs.get('single')
    if one_obj:
        obj = [{field: getattr(obj, field) for field in fields}]
        return json.dumps(obj)
    obj = [{field: getattr(o, field) for field in fields} for o in obj]
    return json.dumps(obj)

