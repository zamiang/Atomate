import cgi
import datetime
import os
import re
import sys
import logging
from django.utils import simplejson
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import login_required
from google.appengine.api import users
import gdata.gauth
import gdata.docs.client
import gdata.calendar.client
import gdata.contacts.client

SETTINGS = {
    #    'APP_NAME': 'Atomate-server',
    #    'CONSUMER_KEY': 'atomate.me',
    #    'CONSUMER_SECRET': 'RlNMW1U0oyK79k6IrD4gBjxI',

    'APP_NAME': 'Atomate-server',
    'CONSUMER_KEY': 'listomate.appspot.com',
    'CONSUMER_SECRET': 'ZFl4A2x7pzrO7nebG1dLTGMj',

    'SCOPES': ["http://www.google.com/calendar/feeds/",
               "http://www.google.com/calendar/feeds/default/allcalendars/full",
               "https://www.google.com/m8/feeds/",
               "https://www.google.com/m8/feeds/contacts/default/full"]
    }

gd_client = gdata.docs.client.DocsClient(source = SETTINGS['APP_NAME'])
calendar_client = gdata.calendar.client.CalendarClient(source = SETTINGS['APP_NAME'])
gcontacts = gdata.contacts.client.ContactsClient(source = SETTINGS['APP_NAME'])


class GdataInterface(webapp.RequestHandler):
    def _get_contact(entry):
        email1, email2, email3 = ""

        for email in entry.email:
            if email.primary and email.primary == 'true':
                email1 = email.address
            elif not email2:
                email2 = email.address
            else:
                email3 = email.address

        return {
            name: entry.name.full_name.text,
            content: entry.content,
            email1: email1,
            email2: email2,
            email3: email3,
            }

    def _get_doc(entry):
        author = "@%s" % entry.author.name.split(' ').join('')
        content = "%s #%s #%s %s" % (entry.title.text.encode('UTF-8'), entry.GetDocumentType(), entry.resource_id.text, author)
        return {
            id: entry.id,
            content: content,
            modified: entry.updated,
            created: entry.published,
            tags: "#%s, #%s, %s" % (entry.GetDocumentType(), entry.resource_id.text, author)
            }

    def _get_event(event, calendar_name, calendar_name_tag, calendar_link):
        if entry.getTimes()[0]:
            start = datetime.datetime.fromtimestamp(entry.getTimes()[0].getStartTime().date)
            end = datetime.datetime.fromtimestamp(entry.getTimes()[0].getEndTime().date);

            link = entry.getHtmlLink() if entry.getHtmlLink().getHref() else ""
            contents = "%s #gcal #%s" % (entry.getTitle().getText(), calendarNameTag)

            return {
                id: entry.id,
                version:0,
                created: now,
                modified: 0,
                contents: contents,
                tags: "#gcal #%s" % calendarNameTag,
                type: 'event',
                source: 'Google',
                reminder: start,
                }
        else:
            return None


    def getCal(self):
        feed = calendar_client.GetAllCalendarsFeed()
        start_date='2007-01-01'
        end_date='2007-07-01'
        results = []

        for i, calendar in enumerate(feed.entry):
            print '\t%s. %s' % (i, calendar.title.text,)
            calendar_name = calendar.title.text;
            calendar_name_tag = calendar_name.split(' ').join('').toLowerCase().replace("/[\.,-\/#!$%\^&\*;:{}=\-_@`'~()]/g","");
            calendar_link = calendar.getLink().href;

            query = gdata.calendar.client.CalendarEventQuery(calendar.content.src)
            query.start_min = start_date
            query.start_max = end_date
            feed = calendar_client.GetCalendarEventFeed(q=query)

            for i, event in enumerate(feed.entry):
                results.push(self._get_event(event, calendar_name, calendar_name_tag, calendar_link))

        return reults


    def getDocs(self):
        feed = gd_client.GetDocumentListFeed()
        return [self._get_doc(contact) for contact in feed]


    def getContacts(self):
        feed = self.gd_client.GetContacts()
        return [self._get_contact(contact) for contact in feed]


class RequestGoogleAuthToken(webapp.RequestHandler):
    @login_required
    def get(self):
        """This handler is responsible for fetching an initial OAuth
        request token and redirecting the user to the approval page."""

        current_user = users.get_current_user()

        # We need to first get a unique token for the user to
        # promote.
        #
        # We provide the callback URL. This is where we want the
        # user to be sent after they have granted us
        # access. Sometimes, developers generate different URLs
        # based on the environment. You want to set this value to
        # "http://localhost:8080/step2" if you are running the
        # development server locally.
        scopes = SETTINGS['SCOPES']
        oauth_callback = 'http://%s/step2' % self.request.host
        consumer_key = SETTINGS['CONSUMER_KEY']
        consumer_secret = SETTINGS['CONSUMER_SECRET']
        request_token = gdocs.get_oauth_token(scopes, oauth_callback,
                                              consumer_key, consumer_secret)

        # Persist this token in the datastore.
        request_token_key = 'request_token_%s' % current_user.user_id()
        gdata.gauth.ae_save(request_token, request_token_key)

        # Generate the authorization URL.
        approval_page_url = request_token.generate_authorization_url()
        self.response.out.write(approval_page_url)



class RequestTokenCallback(webapp.RequestHandler):
    @login_required
    def get(self):
        """When the user grants access, they are redirected back to this
        handler where their authorized request token is exchanged for a
        long-lived access token."""

        current_user = users.get_current_user()
        if not current_user:
            self.redirect(users.CreateLoginURL(self.request.uri))
            return

        # Remember the token that we stashed? Let's get it back from
        # datastore now and adds information to allow it to become an
        # access token.
        request_token_key = 'request_token_%s' % current_user.user_id()
        request_token = gdata.gauth.ae_load(request_token_key)
        gdata.gauth.authorize_request_token(request_token, self.request.uri)

        # We can now upgrade our authorized token to a long-lived
        # access token by associating it with gdocs client, and
        # calling the get_access_token method.
        gd_client.auth_token = gd_client.get_access_token(request_token)
        calendar_client.auth_token = calendar_client.get_access_token(request_token)
        gcontacts.auth_token = gcontacts.get_access_token(request_token)


        # Note that we want to keep the access token around, as it
        # will be valid for all API calls in the future until a user
        # revokes our access. For example, it could be populated later
        # from reading from the datastore or some other persistence
        # mechanism.
        access_token_key = 'access_token_%s' % current_user.user_id()
        gdata.gauth.ae_save(request_token, access_token_key)


        #def bulk_save_play_count(updated):
        #    db.put(updated)
        #   db.run_in_transaction(bulk_save_play_count,updated)

        db.put_async(GdataInterface.getCal())
        db.put_async(GdataInterface.getDocs())
        db.put_async(GdataInterface.getContacts())
