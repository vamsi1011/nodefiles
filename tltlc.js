var firstarr = [];
var temparr = [];

var MongoClient = require('mongodb').MongoClient;
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
call()
async function call() {
    for (let index = 0; index < 3; index++) {
        await process()

    }
}



async function process() {
    let connection = await getConnection(server_uri)
    if (connection.connStatus) {
        var client = connection.client,
            db = await client.db('atsCompanies'),
            // db1 = await client.db('data_cleansing');
            firstarr = await db.collection('SR_unique_TLC').find({
                'matchFound': 0
            }).limit(500).toArray()
        try {
            await Promise.all(firstarr.map(async Element => {

                var tlarr = await db.collection('SR_unique_TL').find({
                    'jobUrl': Element.jobUrl
                }).toArray()
                if (tlarr[0].matchFound == 1) {
                    console.log(tlarr[0].jobUrl)

                }
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