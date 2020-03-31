import queue
import random
from threading import Thread

import requests
import pymongo
from flask import *
from requests.utils import requote_uri
import time
app = Flask(__name__)

@app.route('/',methods = ['POST', 'GET'])
def RelatedJobs():
    myclient = pymongo.MongoClient()
    mydb = myclient["admin"]
    collection = mydb["hyd_glassdoor"]
    TitlesDataset = collection.find({'status':0}).skip(60).limit(50)

    for TitleSet in TitlesDataset:
        try:
            Title=TitleSet['job_title']
            print(Title)
            URL="http://localhost:4490/?title="+Title
            r = requests.get(url=URL)
            data = r.json()
            print(data)
            if(len(data['occupation_category'])):
                collection.update_one({'_id':TitleSet['_id']},{'$set':{'occupation_category':data['occupation_category'],'LDJSON':data['LdJson'],'status':100}})
            else:
                collection.update_one({'_id':TitleSet['_id']},{'$set':{'status':404}})
        except:
            pass
    return "Done"
if __name__ == '__main__':
 app.run(host='127.0.0.1',port=7667)
