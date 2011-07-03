from google.appengine.ext import db

def geo_converter(geo_str):
    if geo_str:
        lat, lng = geo_str.split(',')
        return db.GeoPt(lat=float(lat), lon=float(lng))
    return None
