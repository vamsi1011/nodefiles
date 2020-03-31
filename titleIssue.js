var _ = require("underscore");
var rp = require('request-promise')
var MongoClient = require("mongodb").MongoClient;
var local_uri = "mongodb://localhost:27017";
var server_uri = "mongodb://admin:jobiak@3.18.238.8:28015/admin";
let db;
var start = new Date().getTime();
let titleunwantedString = [
    "FULL TIME/PART TIME",
    " Job",
    "Full-Time",
    "1st Shift",
    "Fee for Service",
    " FULL TIME AND PART TIME",
    "Salary",
    "Bonus",
    "- Remote",
    "Night shift",
    "Day shift",
    "Day/Evening",
    "3rd shift",
    "2nd shift",
    "Part-time",
    " Day ",
    "Nights",
    "Part-Time",
    "Full-Time",
    "Evening",
    "AVAILABLE",
    "Permanent",
    "Per Diem",
    "PRN",
    "Hourly",
    "Afternoon",
    "Multiple Openings",
    "Off Campus Drive",
    "Hiring",
    "Looking for experienced",
    "Recruitment For",
    "JobID",
    "Hiring for large town",
    " Platform",
    "Job in",
    "Mobile Apps, Google Nest",
    "Remote ",
    "Years Of Experience",
    "Opening for",
    "Position",
    "Urgently required",
    "Part Time Jobs",
    "Full Time Jobs",
    "Part Time",
    "Full Time",
    "freshers",
    "Government Jobs",
    "FT Days",
    "urgent hiring for",
    "Hiring for",
    "Contract ",
    " for ",
    " In ",
    " in ",
    "needed in",
    "Female only",
    "Male only",
    "Wanted",
    " At ",
    "Walk-in",
    "Need",
    "Employees needed",
    "Chance",
    "Urgent Need",
    "needed at",
    "based on experience",
    "Required",
    "REQUIRMENTS",
    "RECRUITING",
    "IMMEDIATELY",
    "Daily work",
    "WANTED",
    "IMMEDIATELY ALL OVER",
    "per day by",
    " Earn",
    " job ",
    "rupees",
    "urgent requirement",
    "jobs",
    "Needed",
    "hurry for a job",
    "part time from home",
    "no investment",
    "job opportunity",
    "work from home",
    "Role",
    "without any",
    "Variable Shift",
    "Great Benefits!",
    "Immediate openings",
    "Opening!",
    "an hour!",
    "Healthcare ",
    "Sign on",
    "Relcoation",
    "Hotel​",
    "Must be",
    "Eligible",
    "Rotating",
    "Hour",
    "Shifts",
    " with",
    " Shift",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thrusday",
    "Friday",
    "Saturday",
    " USA",
    "available in",
    "Part Time",
    "2nd Shift",
    "Full-time"
];
(async () => {
    db = await getCollection(server_uri);
    let finalDataSet = await db
        .collection("IcimsJan9_TL")
        .find({
            'issueStatus': {
                $exists: false
            }
        })
        .toArray();
    console.log(finalDataSet)
    console.log("total Records:" + finalDataSet.length);

    let issue = []
    await Promise.all(
        finalDataSet.map(async element => {
            // console.log(element)
            let title = element.title;
            let location = element.location;
            let company = element.company;
            try {
                var dataSet = {
                    'titleissue': await titleCheck(title, location, company),
                    'locationissue': await locationAPI(location),
                    // 'companyissue': await companyIssues(company)
                }
                // console.log(dataSet.companyissue)
                // dataSet.companyissue = JSON.parse(dataSet.companyissue)
                // if (dataSet.companyissue.itemListElement[0] != undefined) {
                //     if (dataSet.companyissue.itemListElement[0].resultScore >= 100)
                //         dataSet.companyissue = 0
                // } else
                //     dataSet.companyissue = 1
                if (dataSet.titleissue.titleissue == 1) {
                    dataSet.titleissue = 1
                } else {
                    dataSet.titleissue = 0
                }


                if (dataSet.locationissue.status == true)
                    dataSet.locationissue = 0
                else {
                    dataSet.locationissue = 1
                    console.log('location : ' + location)
                }
                if (dataSet.titleissue == 1 || dataSet.locationissue == 1)
                    dataSet.issueStatus = 1
                else
                    dataSet.issueStatus = 0
                issue.push(dataSet)
            } catch (error) {
                console.log("error in function " + error)
            }
            // console.log(element.jobUrl)
            await db.collection("IcimsJan9_TL").updateOne({
                'jobUrl': element.jobUrl
            }, {
                $set: {
                    'titleIssue': dataSet.titleissue,
                    'locationIssue': dataSet.locationissue,
                    'issueStatus': dataSet.issueStatus
                }
            });
        }));
    // console.log(issue);

    console.log("Issues length:" + issue.length);


})();

async function getCollection(mongoUrl) {
    let client = await MongoClient.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return client.db("atsCompanies");
}

async function titleCheck(title, location, company) {
    let titleunwanted = titleunwantedString;
    titleunwanted.push(company)
    titleunwanted.push(location)

    for (let index = 0; index < titleunwanted.length; index++) {
        var element = titleunwanted[index];

        if (element != null && element != "") {
            if (element.length <= 3) {
                element = " " + element + " "
            }

            let Status1 = element.toLowerCase().indexOf(title.toLowerCase());
            let Status2 = title.toLowerCase().indexOf(element.toLowerCase());
            if (Status1 >= 0 || Status2 >= 0) {
                return {
                    title: title,
                    titleissue: 1,
                    titleIssueMatch: element
                };
            }
        }
    }
    return {
        title: title,
        titleissue: 0,
        titleIssueMatch: ""
    };
}

async function locationAPI(location) {
    var params = {
        'loc': location
    };
    var requestOpts = {
        encoding: 'utf8',
        uri: 'https://support.jobiak.ai:8095/api/v1/platform/misc/post-location',
        method: 'POST',
        timeout: 1000000,
        json: true,
        body: params
    };

    return rp(requestOpts);
}

async function companyIssues(company) {

    var requestOpts = {
        encoding: 'utf8',
        uri: 'https://kgsearch.googleapis.com/v1/entities:search?query=' + encodeURIComponent(company) + '&key=AIzaSyDcnTKD5kAGsdFWMTSY8K9vzFMiF5WUnNw&limit=1&indent=True',
        method: 'GET'
    };

    return rp(requestOpts);
}