import csv
import zipcodes
from geopy.geocoders import Nominatim
import pickle
import time

from pyzipcode import ZipCodeDatabase
newdict={}
with open('bayareapincodes.csv', mode ='r',encoding='utf-8-sig')as file:
    csvFile = csv.reader(file) 
    next(csvFile)
    for lines in csvFile:
        a=(zipcodes.matching(lines[0])[0])
        geolocator = Nominatim(user_agent="png")
        location = geolocator.reverse(str(a['lat'])+","+str(a['long']))
        parts = location.address.split(', ')
        address=", ".join(parts[:2])
        newdict[lines[0]]=address
        print(lines[0],address)
        print("\n")
with open('./storage/zipcodeAddress.pkl', 'wb') as f:
    pickle.dump(newdict, f)

