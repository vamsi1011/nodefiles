var firstarr = [];
var temparr = [];

var MongoClient = require('mongodb').MongoClient;
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
call()
async function call() {
    for (let index = 0; index < 111; index++) {
        await process()

    }
}



async function process() {
    let connection = await getConnection(server_uri)
    if (connection.connStatus) {
        var client = connection.client,
            db = await client.db('stage_jobs'),
            // db1 = await client.db('data_cleansing');
            firstarr = await db.collection('big_recheck').find({
                'status': 0
            }).limit(100).toArray()
        try {
            await Promise.all(firstarr.map(async Element => {
                console.log(Element.url)

                await db.collection('unique_urls_1000').update({
                    'URL': Element.url
                }, {
                    $set: {
                        'jobType': Element.jobType
                    }

                })
                await db.collection('big_recheck').update({
                    'url': Element.url
                }, {
                    $set: {
                        'status': 1
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