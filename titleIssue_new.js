var _ = require("underscore");
var MongoClient = require("mongodb").MongoClient;
var local_uri = "mongodb://localhost:27017";
var server_uri = "mongodb://admin:jobiak@3.18.238.8:28015/admin";
let db;
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
        .find({}).toArray();
    console.log("total Records:" + finalDataSet.length);

    let issue = []
    await Promise.all(
        finalDataSet.map(async element => {
            let title = element.title;
            let location = element.location;
            let company = element.company;
            try {
                //console.log(title);
                let dataSet = await titleCheck(title, location, company);
                if (dataSet.titleissue == 1) {
                    issue.push(dataSet);
                }
            } catch (error) {
                console.log("error in titles function " + error)
            }
        }));
    console.log(issue);
    console.log("Issues length:" + issue.length);

    //         let cleanTitle = title;
    //         let cleanLocation = location
    //         let indexVal1 = title.toLowerCase().indexOf("title\n");
    //         let indexVal2 = location.toLowerCase().indexOf("location\n");
    //         if (indexVal1 >= 0) {
    //             cleanTitle = title.substring(indexVal1 + 6);

    //         }
    //         if (indexVal2 >= 0) {
    //             cleanLocation = location.substring(indexVal2 + 9)
    //         }
    //         //console.log(title);
    //         await db.collection("greenHouse_TLC").updateMany({
    //             title: element.title
    //         }, {
    //             $set: {
    //                 cleanTitle: cleanTitle
    //             }
    //         });
    //         await db.collection("greenHouse_TLC").updateMany({
    //             location: element.location
    //         }, {
    //             $set: {
    //                 cleanLocation: cleanLocation
    //             }
    //         });
    //     })
    // );
    // console.log("extracted Data from DB");
    // var uniqueLabelSet = await uniqueLabels(finalDataSet);
    // console.log("------------------------------------");
    // console.log(uniqueLabelSet);
    // console.log("------------------------------------");
    // console.log("done with uniqueLabelSet");
    // titleunwanted = titleunwanted.concat(uniqueLabelSet.location);
    // titleunwanted = titleunwanted.concat(uniqueLabelSet.company);
    // console.log("started with titleIssue");
    // let details = await titleIssue(uniqueLabelSet.title);
    // console.log("Issues length:" + details.length);
    // console.log(details);


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