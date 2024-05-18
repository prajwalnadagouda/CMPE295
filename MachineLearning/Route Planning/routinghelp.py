import pickle
import zipcodes
import math 
import pandas as pd

#given area , get list of pincodes that belong that area.
def getpincode(area):
    with open('./storage/pincode_dictionary.pkl', 'rb') as f:
        pincode_dict = pickle.load(f)
    return(pincode_dict[area])


#give address based on zipcode
def getaddress(zipcode):
    try:
        zipcode=str(zipcode)
        zipInfo=zipcodes.matching(str(zipcode))[0]
        lat=zipInfo['lat']
        long=zipInfo['long']
        
        try:
            with open('./storage/zipcodeAddress.pkl', 'rb') as f:
                zipcodeAddress = pickle.load(f)
            address=(zipcodeAddress[zipcode])
        except Exception as e:
            address=str(zipcode)
        return(str(address),str(lat),str(long))

    except Exception as e:
        print(e)
        return str(zipcode)


def betweenpoints(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
    mid_lat = (lat1 + lat2) / 2
    mid_lon = (lon1 + lon2) / 2
    return str(math.degrees(mid_lat)), str(math.degrees(mid_lon))

def  getpath(start,end):
    try:
        mLat,mLong=betweenpoints(start[1],start[2],end[1],end[2])
        q1Lat,q1Long=betweenpoints(start[1],start[2],mLat,mLong)
        q2Lat,q2Long=betweenpoints(mLat,mLong,end[1],end[2])
        return[("near "+start[0],q1Lat,q1Long),("midway "+end[0],mLat,mLong),("near "+end[0],q2Lat,q2Long)]
    except:
        return []

def getstartpincode(area):
    try:
        pincodeList=getpincode(area)
        with open('./storage/weight.pkl', 'rb') as f:
            weights = pickle.load(f)
        weights=weights[0]
        newdict={}
        for pincode in pincodeList:
            newdict[int(pincode)]=weights[int(pincode)]
        newdict=dict(sorted(newdict.items(), key=lambda item: item[1]))
        newlist=list(newdict.keys())
        print([newlist[-1],newlist[-2],newlist[-3],newlist[-4]])
        return [newlist[-1],newlist[-2],newlist[-3],newlist[-4]]
    except Exception as e:
        return []
    

def getpeoplecount(workingdate):
    try:
        df = pd.read_csv("./nextpredict.csv", parse_dates=['Date'], dayfirst=False)
        idx=df.index[df['Date'] == str(workingdate)].tolist()[0]
        countp = df['BusCommuters'].iloc[idx]
        return int(countp)
    except:
        return 100