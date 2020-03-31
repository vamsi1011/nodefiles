var firstarr = [];
var temparr = [];

var MongoClient = require('mongodb').MongoClient;
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
call()
async function call() {
    for (let index = 0; index < 1; index++) {
        await process()

    }
}



async function process() {
    let connection = await getConnection(server_uri)
    if (connection.connStatus) {
        var client = connection.client,
            db = await client.db('atsCompanies'),
            // db1 = await client.db('data_cleansing');
            firstarr = await db.collection('titlematch').find({
                'status': 1
            }).toArray()
        try {
            await Promise.all(firstarr.map(async Element => {
                if (Element.matches.length == 0) {
                    console.log(Element.matches.length)
                    await db.collection('titlematch').updateOne({
                        '_id': Element._id
                    }, {
                        '$set': {
                            'status': 405
                        }
                    })
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