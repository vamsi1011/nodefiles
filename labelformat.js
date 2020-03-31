var firstarr = [];
var temparr = [];

var MongoClient = require('mongodb').MongoClient;
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
call()
async function call() {
    for (let index = 0; index < 1068; index++) {
        await process()

    }
}



async function process() {
    let connection = await getConnection(server_uri)
    if (connection.connStatus) {
        var client = connection.client,
            db = await client.db('stage_jobs'),
            db1 = await client.db('data_cleansing');
        firstarr = await db.collection('unique_urls_1000').find({
            'status': 3
        }).limit(500).toArray()

        var d = new Date();
        var n = d.toISOString();
        try {
            await Promise.all(firstarr.map(async Element => {
                console.log(Element.URL)

                await db1.collection('1k_dec30_labels').insertOne({
                    "date": 'ISODate("' + n + '")',
                    "url": Element.URL,
                    "html": Element.HTML,
                    "plaintext": Element.PlainText,
                    "expected_values": {
                        "title": Element.title,
                        "location": Element.location,
                        "company": Element.company,
                        "salary": Element.salary,
                        "jobtype": Element.jobType,
                        "jobid": Element.jobId,
                        "posteddate": Element.postedDate,
                        "expirydate": Element.expirationDate
                    },
                    'predicted_values': {
                        "v4_6": {
                            "title": Element.Bigml_title,
                            "location": Element.Bigml_location,
                            "company": Element.Bigml_company,
                            "salary": Element.Bigml_salary,
                            "jobtype": Element.Bigml_jobType,
                            "jobid": Element.Bigml_jobId,
                            "posteddate": Element.Bigml_postedDate,
                            "expirydate": Element.Bigml_expirationDate
                        }
                    }


                })
                await db.collection('unique_urls_1000').updateOne({
                    '_id': Element._id
                }, {
                    $set: {
                        'status': 4
                    }
                })



            }))
        } catch (error) {
            console.log(error)
        }


    }
}

async function getConnection(mongoUrl) {
    try {
        var client = await MongoClient.connect(
            mongoUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        return {
            'connStatus': 1,
            client
        }
    } catch (error) {
        console.error("error while connecting to mongo:" + error);
        return {
            'connStatus': 0
        }
    }

}
async function closeConnection(client) {
    await client.close();
    console.log("DB Session Ended");
    return "Session Closed";
}