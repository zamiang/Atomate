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
from dbinterface import DBInterface

_DEBUG = True


class MainPage(webapp.RequestHandler):
    def get(self):
        #user = users.GetCurrentUser()
        #if not user:
        #    self.redirect(users.CreateLoginURL(self.request.uri))
        #    return

        template_values = {
            "login_url": users.CreateLoginURL(self.request.uri),
            "logout_url": users.CreateLogoutURL(self.request.uri),
            }

        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))

application = webapp.WSGIApplication([
        ('/', MainPage),
          ('/data', DBInterface),
          ('/requestGoogleAuthToken', RequestGoogleAuthToken),
          ('/requestTokenCallback', RequestTokenCallback),
          ], debug=_DEBUG)

def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()
