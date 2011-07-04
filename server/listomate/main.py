import cgi
import datetime
import os
import re
import sys
import urlparse
import wsgiref.handlers
import logging
from django.utils import simplejson
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.api import datastore
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template, util
from google.appengine.ext.webapp.util import run_wsgi_app, login_required

#local
from googledata import GdataInterface, RequestGoogleAuthToken,RequestTokenCallback
from models import Person, Location, Note

_DEBUG = True


class MainPage(webapp.RequestHandler):
    def get(self):
        #user = users.GetCurrentUser()
        #if not user:
        #    self.redirect(users.CreateLoginURL(self.request.uri))
        #    return

        template_values = {}

        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))


class AtomateDatastore(webapp.RequestHandler):
    def error_response(code, text):
        return self.response.out.write(simplejson.dumps({
                    "success":False,
                    "code":code,
                    "text":text
                    }))

    def success_response(data):
        return self.response.out.write(simplejson.dumps({
                    "data": data,
                    "success": True,
                    }))


    @login_required
    def get(self):
        user = users.GetCurrentUser()
        if not user:
            self.redirect(users.CreateLoginURL(self.request.uri))
            return

        try:
            edited = datetime.datetime.fromtimestamp(int(self.request.get('edited'))/1000)

        except (TypeError, ValueError):
            return self.error_response(100, "input error")

        if not edited:
            return self.error_response(100, "edited is required - epoch time min")

        note = db.Query(Notes).filter('author =', user).filter('deleted', False).filter('edited >', modified).order('-edited')
        people = db.Query(People).filter('author =', user).filter('deleted', False).filter('edited >', modified).order('-edited')

        return self.success_response({"notes": notes.fetch(limit=2000), "people": people.fetch(limit=2000)})

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



application = webapp.WSGIApplication([
          ('/', MainPage),
          ('/data', AtomateDatastore),
          ('/requestGoogleAuthToken', RequestGoogleAuthToken),
          ('/requestTokenCallback', RequestTokenCallback),
          ], debug=_DEBUG)

def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()
