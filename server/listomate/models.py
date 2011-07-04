from google.appengine.ext import db
from google.appengine.api import users

class Location(db.Model):
    id = db.IntegerProperty(required=True)
    author = db.UserProperty(required=True)
    version = db.IntegerProperty()
    created = db.IntegerProperty(required=True)
    edited = db.IntegerProperty(required=True)
    deleted = db.BooleanProperty()

    nickname = db.StringProperty()
    address = db.PostalAddressProperty(required=True) ## "1600 Ampitheater Pkwy., Mountain View, CA")
    geo_pt = db.GeoPtProperty() ## looks like: "47.150300000000001,-55.299500000000002"
    lat = db.FloatProperty()
    lon = db.FloatProperty()


class Person(db.Model):
    id = db.StringProperty(required=True)
    author = db.UserProperty(required=True)
    version = db.IntegerProperty()
    created = db.IntegerProperty(required=True)
    edited = db.IntegerProperty(required=True)
    deleted = db.BooleanProperty()

    name = db.StringProperty(required=True)
    nickname = db.StringProperty()
    phone = db.PhoneNumberProperty()
    website = db.LinkProperty()
    photourl = db.LinkProperty()
    email = db.StringProperty() # "foo@bar.com, bar@foo.com"
    fbid = db.IntegerProperty()

    tag = db.StringProperty()
    location = db.ReferenceProperty(Location)

class Note(db.Model):
    id = db.StringProperty(required=True)
    author = db.UserProperty(required=True)
    version = db.IntegerProperty()

    created = db.IntegerProperty(required=True)
    edited = db.IntegerProperty(required=True)
    deleted = db.BooleanProperty()

    contents = db.TextProperty(required=True)
    tags = db.StringProperty()
    type = db.StringProperty(choices=set(["note", "bookmark", "todo", "reminder"]))
    reminder = db.IntegerProperty()

    location = db.ReferenceProperty(Location)
