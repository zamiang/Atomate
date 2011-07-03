#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import cgi
import datetime
import os
import re
import sys
import urllib
import urlparse
import wsgiref.handlers
import logging
from django.utils import simplejson
from util.sessions import Session
from google.appengine.api import datastore
from google.appengine.api import datastore_types
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template, util
from google.appengine.ext.webapp.util import run_wsgi_app, login_required
from google.appengine.api import memcache

_DEBUG = True


class Person(db.Model):
    user = db.UserProperty(requred=True)
    id = db.StringProperty(requred=True)
    version = db.IntegerProperty()

    name = db.StringProperty(required=True)
    phone = db.PhoneNumberProperty()
    website = db.LinkProperty()

    created = db.DateTimeProperty(auto_now_add=True)
    edited = db.DateTimeProperty(auto_now_add=True)
    deleted = db.BooleanProperty()

    email1 = db.EmailProperty()
    email2 = db.EmailProperty()
    email3 = db.EmailProperty()

    fbid = IntegerProperty()

    photourl = db.LinkProperty()
    priority = db.StringProperty()
    tag = db.StringProperty()


class Location(db.Model):
    id = db.IntegerProperty()
    author = db.UserProperty(required=True)
    address = db.PostalAddress("1600 Ampitheater Pkwy., Mountain View, CA")
    geo_pt = db.GeoPtProperty() ## looks like: "47.150300000000001,-55.299500000000002"


class Note(db.Model):
    author = db.UserProperty(required=True)
    id = db.StringPropert(required=True)
    version = db.IntegerProperty()

    created = db.DateTimeProperty(auto_now_add=True)
    edited = db.DateTimeProperty(auto_now_add=True)
    deleted = db.BooleanProperty()

    contents = db.TextProperty(multiline=True, required=True)
    tags = db.StringProperty()
    type = db.StringProperty(choices=set(["note", "bookmark", "todo", "reminder"]))
    reminder = db.DateTimeProperty(auto_now_add=False)
    source = db.StringProperty()

    location = db.ReferenceProperty(Location)


class MainPage(webapp.RequestHandler):
    @login_required
    def get(self):
        user = users.getCurrengUser()
        if not user:
            self.redirect(users.CreateLoginURL(self.request.uri))
            return

        people =






class AtomateDatastore(webapp.RequestHandler):
    def error_response(code, text):
        return self.response.out.write(simplejson.dumps({
                    success:False,
                    code:code,
                    text:text
                    }))
    @login_required
    def get(self):
        user = users.getCurrengUser()
        if not user:
            self.redirect(users.CreateLoginURL(self.request.uri))
            return

        try:
            type = self.request.get('type')
            edited = datetime.datetime.fromtimestamp(int(self.request.get('edited'))/1000)

        except (TypeError, ValueError):
            return self.error_response(100, "input error")

        if not edited:
            return self.error_response(100, "edited is required - epoch time min")


        query = db.Query(People) if type == "people" else db.Query(Notes)

        result = query.filter('author = ', user).('deleted', False).('edited >', modified).edited('-edited').ancestor(key)

        self.response.out.write(simplejson.dumps(result.fetch(limit=2000)))

    @login_required
    def post(self):
        if not users.GetCurrentUser():
            self.redirect(users.CreateLoginURL(self.request.uri))
            return

        try:
            type = self.request.post('type')
            edited = datetime.datetime.fromtimestamp(int(self.request.post('edited'))/1000)

        except (TypeError, ValueError):
            return self.error_response(100, "input error")

        args = simplejson.loads(self.request.body)

        ## TODO use bulkloader
        for note in notes:
            NoteInterface.save(note)

        for person in people:
            PersonInterface.save(note)

        self.response.out.write(simplejson.dumps({success:True}))



class NoteInterface(object):
  def __init__(self, name, entity=None):
    self.name = name
    self.entity = entity
    if entity:
      self.content = entity['content']
      if entity.has_key('user'):
        self.user = entity['user']
      else:
        self.user = None
      self.created = entity['created']
      self.modified = entity['modified']
    else:
      # New pages should start out with a simple title to get the user going
      now = datetime.datetime.now()
      self.content = '<h1>' + cgi.escape(name) + '</h1>'
      self.user = None
      self.created = now
      self.modified = now


  def save(self):
    """Creates or edits this page in the datastore."""
    now = datetime.datetime.now()
    if self.entity:
      entity = self.entity
    else:
      entity = datastore.Entity('Note')
      entity['name'] = self.name
      entity['created'] = now
    entity['content'] = datastore_types.Text(self.content)
    entity['modified'] = now

    if users.GetCurrentUser():
      entity['user'] = users.GetCurrentUser()
    elif entity.has_key('user'):
      del entity['user']

    datastore.Put(entity)

  @staticmethod
  def load(name):
    """Loads the page with the given name.

    We always return a Note instance, even if the given name isn't yet in
    the database. In that case, the Note object will be created when save()
    is called.
    """
    query = datastore.Query('Note')
    query['name ='] = name
    entities = query.Get(1)
    if len(entities) < 1:
      return Note(name)
    else:
      return Note(name, entities[0])

  @staticmethod
  def exists(id):
    """Returns true if the page with the given name exists in the datastore."""
    return Note.load(id).entity





def main():
    application = webapp.WSGIApplication([
            ('/', MainPage),
            ('/data', AtomateDatastore),
            ], debug=_DEBUG)
    #wsgiref.handlers.CGIHandler().run(application)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
