var firstarr = [];
var temparr = [];
var unique = require('array-unique');

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
            db = await client.db('jobs_count'),
            // db1 = await client.db('data_cleansing');
            firstarr = await db.collection('juju_jobs').find({}).toArray()
        firstarr.forEach(element => {
            temparr.push(element.company)
        });
        try {
            var uniq = unique(temparr)
            uniq.forEach(async element => {
                var uniq_30 = await db.collection('IcimsJan7th').find({
                    'company': element
                }).limit(20).toArray();
                await db.collection('IcimsJan7th_unique').insertMany(uniq_30)
                console.log('completed')
            });
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