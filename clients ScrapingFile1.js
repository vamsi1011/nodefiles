const puppeteer = require('puppeteer');
const MongoClient = require('mongodb').MongoClient;
var mailer = require("nodemailer");
var _ = require('lodash');
var clientsDataSetFile = require("./clientsData.js");
// const server_uri = 'mongodb://localhost:27017/atsCompanies';

const server_uri = 'mongodb://jobiak:jobiak@18.223.47.109:28015/data_cleansing'
const width = 1366,
    height = 768,
    C_HEADELESS = false;
var clientsData = clientsDataSetFile.clientsData;
var employerIdList = _.uniq(_.map(clientsData, 'employerId'))

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
(async () => {
    var employerId = process.argv[2];
    console.log("---------------------------------------------------------------");
    console.log("Given employer ID:" + employerId);
    if (employerIdList.indexOf(employerId) <= -1) {
        console.log("-----------------------------------------------------------");
        console.log("please Enter the valid employerId from below:");
        console.log(employerIdList);
        console.log("-----------------------------------------------------------");
    } else {
        // var clientData = _.find(clientsData, {
        //     employerId
        // });
        //console.log(clientData);

        const browser = await puppeteer.launch({
            headless: C_HEADELESS,
            ignoreHTTPSErrors: true,
            args: ['--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list', "--disable-web-security", `--window-size=${width},${height}`
            ]
        });
        const page = await pageStructure(await browser.newPage());
        var client = await getConnection(server_uri);
        var db = await client.db('data_cleansing')
        var clientData = _.find(clientsData, {
            employerId
        });
        var start = Date.now(),
            finalResponse = [],
            collectionName = 'ETL_Scraping_Data';
        switch (employerId) {
            case '5d446f0a7eae53350566ddae':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await tephraJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await tephraLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d40720f4d769319d5523d00':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await networkStaffingJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await networkStaffingLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d8dce56a780b202985e2639':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await activityroboticsJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await activityroboticsLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d925642a780b23908946ea9':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await scientificRoboJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await scientificRoboLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d9252dda780b23908946ea6':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await artificialAccessJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await artificialAccessLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d924a47a780b23908946ea3':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await techGlobalJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await techGlobalLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d9214ada780b2367dcc60c7':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await neverEndingJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await neverEndingLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d95b7c9a780b2268c67beb9':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await openWideCareersJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await openWideCareersLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d9af1417eae5375171045b4':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await jobiakJobs(page, clientData.source);
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(await jobiakLabels(page, nonDbData));
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d96ff16a780b23fc6c9aaa9':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await simulationProcessJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await simulationProcessLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d9702a0a780b23fc6c9aaaf':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await aiDreamJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await aiDreamLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }

                break;
            case '5db2f773a780b24beb2c1924':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await andOverJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await andOverLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }

                break;
            case '5db2f560a780b24beb2c191f':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await excelCarsJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await excelCarsLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5db68080a780b24beb2c1928':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await peripheralVascularJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await peripheralVascularLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5d9225484d76933651dfaf8c':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await flexProfessionalsJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await flexProfessionalsLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5dc113fea780b20da53571d3':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await dataOrgJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await dataOrgLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5dc116cba780b20da53571d6':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await marioJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await marioLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;

            case '5cdeacac4d7693416bc48de4':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await cengageJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await cengageLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;
            case '5dca5018a780b209e7300068':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await bestboxingclubJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await bestboxingclubLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;

            case '5dca5018a780b209e7300068':
                console.log("---------------------------------------------------");
                log(start, "Started Getting Jobs of :" + clientData.company);
                var response = await bestboxingclubJobs(
                    page,
                    clientData.source
                );
                //console.log(response);
                log(start, "Got all the Jobs of :" + clientData.company);

                log(start, "Started Check DB for Previous Data " + clientData.company);
                // await db.collection(collectionName).deleteMany({});
                var dbChecker = await previousData(db, collectionName, response, employerId);
                log(start, "Got the New Set of oldJobs and New jobs and Expired Jobs of " + clientData.company);
                var dbData = dbChecker.dbData,
                    nonDbData = dbChecker.nonDbData,
                    expiredData = dbChecker.expiredData;
                //console.log(dbChecker);
                log(start, "Started Getting All Labels of :" + clientData.company);
                if (response.length >= 1) {
                    finalResponse = finalResponse.concat(
                        await bestboxingclubLabels(page, nonDbData)
                    );
                    if (dbData.length >= 1)
                        finalResponse = finalResponse.concat(dbData)
                    finalResponse = await merge(clientData, finalResponse)
                    //console.log(finalResponse);
                    log(start, "Got all the All Labels of :" + clientData.company);
                    if (finalResponse.length >= 1)
                        await db.collection(collectionName).insertMany(finalResponse);
                    log(start, "Inserted New Jobs in the DB" + clientData.company);
                    await emailSending(clientData.company, finalResponse.length, dbData.length, nonDbData.length, expiredData, collectionName)
                    console.log("email sent for " + clientData.company);
                    console.log("---------------------------------------------------------------");
                } else {
                    log(start, "Sorry Could not get Any Job for :" + clientData.company);
                    console.log("---------------------------------------------------");
                }
                break;

        }
        await closeConnection(client);
        setTimeout(() => browser.close(), 10000);
    }

})();

// page Structure
async function pageStructure(page) {
    await page.setViewport({
        width: width,
        height: height
    });
    var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
        'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    ];
    await page.setUserAgent(
        Useragents[Math.floor(Math.random() * Useragents.length)]
    );
    await page.setRequestInterception(true);
    page.on('request', request => {
        const type = request.resourceType();
        if (type === 'image')
            request.abort();
        else
            request.continue();
    });
    return page;
}
//Delay time for loading
async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
//DB Connections
async function getConnection(mongoUrl) {
    var client = await MongoClient.connect(
        mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
    return client;
}
async function closeConnection(client) {
    await client.close();
    console.log("DB Session Ended");
    return "Session Closed";
}
//email Sending
async function emailSending(company, count, dbCount, nonDbCount, expired, collectioName) {
    if (count >= 1) {
        var smtpTransport = mailer.createTransport({
            service: "Gmail",
            auth: {
                user: "noreply@jobiak.ai",
                pass: "hydhub@123"
            }
        });
        var mailOptions = {
            from: "noreply@jobiak.ai",
            to: "madhuprakash.behara@jobiak.com,hameed@jobiak.ai,sunil@jobiak.ai,nagavarma@jobiak.ai",
            // to: "mohan.pitta@jobiak.ai",
            subject: "Jobiak ETL Jobs Extraction Alert for " + company,
            text: company + " Jobs Extraction done - Total Jobs dumped: " + count + " Updated at " + new Date(),
            html: "<p style='font-family:Tahoma, Geneva, sans-serif'>Hi Team,<br><br>" + company + " Jobs Extraction done<br><br>Collection Name:<b>" + collectioName + "</b><br><br>Total Jobs dumped: <b>" + count + " Jobs</b><br><br>Older Jobs:" + dbCount + "<br><br>New Jobs:" + nonDbCount + "<br><br>Expired Jobs:<b>" + expired.length + "</b><br><br>Updated at " + new Date() + "<br><br>Thanks and Regards<br><b>Jobiak Bot</b></p>"
        };

        smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error while sending mail: ' + error);
            } else {
                console.log('Message sent: %s', info.messageId);
            }
            smtpTransport.close();
        });

        return "email Sent";
    }
    return "No Jobs for Sending email";

}
//log function
function log(start, msg) {
    console.info(new Date() + ' [' + (Date.now() - start) + ' ms] ' + msg);
}
//Frames loading
async function framesLoading(page) {
    return page.evaluate(() => {
        try {
            for (const frame of document.querySelectorAll("iframe")) {
                try {
                    const frameDocument =
                        frame.contentDocument ||
                        frame.contentWindow.document;
                    const div = document.createElement("div");
                    for (const attr of frame.attributes) {
                        if (
                            attr.name !== "src" &&
                            attr.name !== "srcdoc" &&
                            attr.name !== "sandbox"
                        ) {
                            div.setAttribute(
                                attr.name,
                                attr.value
                            );
                        }
                    }
                    div.innerHTML =
                        frameDocument.documentElement.innerHTML;
                    frame.parentNode.replaceChild(div, frame);
                } catch (error) {

                }

            }
        } catch (error) {

        }

    });
}
//merge
async function merge(clientData, labelsResponse) {
    var finalResponse = []
    try {
        delete clientData["collectionName"];
        console.log("updating the time:" + new Date());
        clientData['createdAt'] = new Date();
        labelsResponse.forEach(element => {
            finalResponse.push(_.merge(element, clientData))
        });
        return finalResponse;
    } catch (error) {
        console.log("error in the merge:" + error);
        return [];
    }

}
//checking for the previous data
async function previousData(db, collectionName, response, employerId) {
    var dbData = [],
        expiredData = [],
        nonDbData = [];
    try {
        if (response.length >= 1) {
            var srcData = await db.collection(collectionName).find({
                'employerId': employerId
            }).project({
                "createdAt": 0,
                '_id': 0
            }).toArray();
            console.log("total DB data with src is " + srcData.length);
            dbData = dbData.concat(await _.intersectionBy(srcData, response, 'url'));
            nonDbData = nonDbData.concat(await _.differenceBy(response, srcData, 'url'));
            expiredData = expiredData.concat(await _.differenceBy(srcData, response, 'url'))
            console.log("previousData=" + dbData.length + " new Data=" + nonDbData.length + " Expired Jobs=" + expiredData.length);
            if (expiredData.length >= 1)
                await updateData(db, collectionName, expiredData, {
                    'expiredStatus': 1
                });
            await db.collection(collectionName).deleteMany({
                'employerId': employerId,
                'expiredStatus': {
                    $exists: false,
                    $ne: 1
                }
            })
            return {
                dbData,
                nonDbData,
                expiredData
            }
        } else {
            return {
                dbData,
                nonDbData,
                expiredData
            }
        }
    } catch (error) {
        console.log("error in the previousData:" + error);
        return {
            dbData,
            nonDbData,
            expiredData
        }
    }
} //updateData
async function updateData(db, collectionName, dataSet, params) {
    try {
        await Promise.all(
            dataSet.map(async element => {
                await db.collection(collectionName).updateMany({
                    'url': element.url
                }, {
                    $set: params
                })
            }));
        return true;
    } catch (error) {
        console.log("error in the updateData:" + error);
        return false
    }
}
//---------
async function tephraJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page)
        return await page.evaluate(() => {
            var required_apply_link = []
            var evenBlock = document.documentElement.querySelectorAll('tr[class="evenTableRow"]');
            var oddBlock = document.documentElement.querySelectorAll('tr[class="oddTableRow"]');
            for (var index = 0; index < evenBlock.length; index++) {
                const element = evenBlock[index];
                var jobId = element.children[0].innerText;
                var title = element.children[1].innerText;
                var jobUrl = new window.URL(element.children[1].querySelector('a').getAttribute('href'), window.document.URL).toString();
                var location = element.children[2].innerText;
                required_apply_link.push({
                    'jobId': jobId,
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }

            for (var index = 0; index < oddBlock.length; index++) {
                const element = oddBlock[index];
                var jobId = element.children[0].innerText;
                var title = element.children[1].innerText;
                var jobUrl = new window.URL(element.children[1].querySelector('a').getAttribute('href'), window.document.URL).toString();
                var location = element.children[2].innerText;
                required_apply_link.push({
                    'jobId': jobId,
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }

            return required_apply_link;
        })
    } catch (error) {
        console.log("error in tephraJobs:" + error);
        return [];
    }

}
async function tephraLabels(page, response) {
    try {
        var jobs = []
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page)
                try {
                    element['description'] = await page.evaluate(() => {
                        return document.documentElement.querySelectorAll('div[id="descriptive"]')[0].outerHTML;
                    });
                } catch (error) {
                    console.log("error in the tephra description:" + error);
                }
                jobs.push(element)
            } catch (error) {
                console.log("error while page loading:" + error);
            }

        }
        return jobs;
    } catch (error) {
        console.log("error in the tephraLabels:" + error);
        return []
    }
}
//----------
async function networkStaffingJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        var LoadMoreSelectors = '//p[@class="load-more-data ng-binding"]';
        if (LoadMoreSelectors != "") {
            var LoadMoreSelectorsCount = await page.$x(LoadMoreSelectors);
            var limit = 0
            while (LoadMoreSelectorsCount.length !== 0) {
                await page.waitFor(1000);
                LoadMoreSelectorsCount = await page.$x(LoadMoreSelectors);
                try {
                    if (LoadMoreSelectorsCount.length > 0) {
                        await LoadMoreSelectorsCount[0].click();
                        //console.log('next button Clicked going to Page')
                        await page.waitFor(3000);
                    }
                } catch (e) {
                    console.log("Have an Error--->" + e)
                    break;
                }
            }
        }
        return await page.evaluate(() => {
            var finalDataSet = []
            try {
                var jobCard = document.documentElement.querySelectorAll('a[class="card slide-up-item"]')

                for (var index = 0; index < jobCard.length; index++) {
                    try {
                        const element = jobCard[index];
                        var title = element.querySelectorAll('span[class="card-title ng-binding"]')[0].innerText
                        var location = element.querySelectorAll('span[class="card-location ng-binding"]')[0].innerText
                        var datePosted = element.querySelectorAll('span[class="card-date ng-binding ng-scope"]')[0].innerText.replace('Added - ', '').trim();
                        var jobUrl = new window.URL(element.getAttribute('href'), window.document.URL).toString();
                        finalDataSet.push({
                            'title': title,
                            'location': location,
                            'datePosted': datePosted,
                            'url': jobUrl
                        })
                    } catch (error) {

                    }
                }
            } catch (error) {
                console.log("error in the job getting networkStaffingJobs" + error);
            }
            return finalDataSet;
        })
    } catch (error) {
        console.log("error in networkStaffingJobs:" + error);
        return [];
    }
}
async function networkStaffingLabels(page, response) {
    try {
        var jobs = []
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page)
                try {
                    element['description'] = await page.evaluate(() => {
                        return document.documentElement.querySelectorAll('div[class="job-details ng-binding"]')[0].outerHTML;
                    });
                    jobs.push(element)
                } catch (error) {
                    console.log("error in the tephra description:" + error);
                }

            } catch (error) {
                console.log("error while page loading:" + error);
            }

        }
        return jobs;
    } catch (error) {
        console.log("error in the networkStaffingLabels:" + error);
        return []
    }
}
//----------

async function activityroboticsJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('div[class="col-sm-12"] tbody tr');
            for (let index = 1; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.children[0].innerText;
                let jobUrl = new window.URL(element.children[0].querySelector('a').getAttribute('href'), window.document.URL).toString();
                let location = element.children[1].innerText;
                let datePosted = element.children[2].innerText;
                required_apply_link.push({
                    'datePosted': datePosted,
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }
            return required_apply_link;
        })
    } catch (error) {
        console.log("error in activityroboticsJobs:" + error);
        return [];
    }
}
async function activityroboticsLabels(page, response) {
    try {
        var jobs = []
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page)
                try {
                    const response = await page.evaluate(() => {
                        try {
                            const description = document.documentElement.querySelectorAll('td[id="reg5_td_dx9"]')[0].outerHTML;
                            const jobType = document.documentElement.querySelectorAll('td[id="reg5_td_dx18"]')[0].innerText.replace(/\t/g, ' ').replace(/ /g, ' ')
                            return {
                                'description': description,
                                'jobType': jobType
                            };
                        } catch (error) {

                            return {
                                'description': "",
                                'jobType': ""
                            };
                        }


                    });
                    element.description = response.description;
                    element.jobType = response.jobType;
                    jobs.push(element)
                } catch (error) {
                    console.log("error in the activityrobotics description:" + error);
                }

            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the activityroboticsLabels:" + error);
        return []
    }
}
//---------
async function scientificRoboJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var joburlBlock = document.querySelectorAll("#main > div.wrapper-joblist > table > tbody > tr > td:nth-child(1) > a");

            for (let index = 0; index < joburlBlock.length; index++) {
                try {
                    const element = joburlBlock[index];
                    let jobUrl = element.getAttribute('href');
                    required_apply_link.push({
                        "url": jobUrl
                    })
                } catch (error) {

                }
            }
            return required_apply_link;
        })
    } catch (error) {
        console.log("error in scientificRoboJobs:" + error);
        return [];
    }
}
async function scientificRoboLabels(page, response) {
    try {
        var jobs = []
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page)
                try {
                    const response = await page.evaluate(() => {
                        try {
                            let title = document.querySelector("article > header > h1").innerText;
                            const description = document.documentElement.querySelector("article > div").outerHTML;
                            let location = document.querySelector("article > header > span").innerText
                            return {
                                'title': title,
                                'location': location,
                                'description': description,
                            };
                        } catch (error) {

                            return {
                                'title': "",
                                'location': "",
                                'description': "",
                            };
                        }


                    });
                    element.title = response.title;
                    element.location = response.location;
                    element.description = response.description;
                    jobs.push(element)
                } catch (error) {
                    console.log("error in the scientificRoboLabels description:" + error);
                }

            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the scientificRoboLabels:" + error);
        return []
    }
}
//--------
async function artificialAccessJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var joburlBlock = document.querySelectorAll("#main > div.wrapper-joblist > table > tbody > tr > td:nth-child(1) > a");

            for (let index = 0; index < joburlBlock.length; index++) {
                try {
                    const element = joburlBlock[index];
                    let jobUrl = element.getAttribute('href');
                    required_apply_link.push({
                        "url": jobUrl
                    })
                } catch (error) {

                }
            }
            return required_apply_link;
        })
    } catch (error) {
        console.log("error in artificialAccessJobs:" + error);
        return [];
    }
}
async function artificialAccessLabels(page, response) {
    try {
        var jobs = []
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page)
                try {
                    const response = await page.evaluate(() => {
                        try {
                            let title = document.querySelector("article > header > h1").innerText;
                            const description = document.documentElement.querySelector("article > div").outerHTML;
                            let location = document.querySelector("article > header > span").innerText
                            return {
                                'title': title,
                                'location': location,
                                'description': description,
                            };
                        } catch (error) {

                            return {
                                'title': "",
                                'location': "",
                                'description': "",
                            };
                        }


                    });
                    element.title = response.title;
                    element.location = response.location;
                    element.description = response.description;
                    jobs.push(element)
                } catch (error) {
                    console.log("error in the scientificRoboLabels description:" + error);
                }

            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the artificialAccessLabels:" + error);
        return []
    }
}
//-----
async function techGlobalJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('div[class="col-sm-12"] tbody tr');
            for (let index = 1; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.children[0].innerText;
                let jobUrl = new window.URL(element.children[0].querySelector('a').getAttribute('href'), window.document.URL).toString();
                let location = element.children[1].innerText;
                let datePosted = element.children[2].innerText;
                required_apply_link.push({
                    'datePosted': datePosted,
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }
            return required_apply_link;
        })
    } catch (error) {
        console.log("error in techGlobalJobs:" + error);
        return [];
    }
}
async function techGlobalLabels(page, response) {
    try {
        var jobs = []
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page)
                try {
                    const response = await page.evaluate(() => {
                        try {
                            const description = document.documentElement.querySelectorAll('td[id="reg5_td_dx9"]')[0].outerHTML;
                            const jobType = document.documentElement.querySelectorAll('td[id="reg5_td_dx18"]')[0].innerText.replace(/\t/g, ' ').replace(/ /g, ' ')
                            return {
                                'description': description,
                                'jobType': jobType
                            };
                        } catch (error) {

                            return {
                                'description': "",
                                'jobType': ""
                            };
                        }


                    });
                    element.description = response.description;
                    element.jobType = response.jobType;
                    jobs.push(element)
                } catch (error) {
                    console.log("error in the activityrobotics description:" + error);
                }

            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the techGlobalLabels:" + error);
        return []
    }
}
//------
//------
async function neverEndingJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var joburlBlock = document.querySelectorAll("#main > div.wrapper-joblist > table > tbody > tr > td:nth-child(1) > a");

            for (let index = 0; index < joburlBlock.length; index++) {
                try {
                    const element = joburlBlock[index];
                    let jobUrl = element.getAttribute('href');
                    required_apply_link.push({
                        "url": jobUrl
                    })
                } catch (error) {

                }
            }
            return required_apply_link;
        })
    } catch (error) {
        console.log("error in neverEndingJobs:" + error);
        return [];
    }
}
async function neverEndingLabels(page, response) {
    try {
        var jobs = []
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page)
                try {
                    const response = await page.evaluate(() => {
                        try {
                            let title = document.querySelector("article > header > h1").innerText;
                            const description = document.documentElement.querySelector("article > div").outerHTML;
                            let location = document.querySelector("article > header > span").innerText
                            return {
                                'title': title,
                                'location': location,
                                'description': description,
                            };
                        } catch (error) {

                            return {
                                'title': "",
                                'location': "",
                                'description': "",
                            };
                        }


                    });
                    element.title = response.title;
                    element.location = response.location;
                    element.description = response.description;
                    jobs.push(element)
                } catch (error) {
                    console.log("error in the scientificRoboLabels description:" + error);
                }

            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the neverEndingLabels:" + error);
        return []
    }
}
//----------
async function openWideCareersJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var joburlBlock = document.querySelectorAll("#main > div.wrapper-joblist > table > tbody > tr > td:nth-child(1) > a");

            for (let index = 0; index < joburlBlock.length; index++) {
                try {
                    const element = joburlBlock[index];
                    let jobUrl = element.getAttribute('href');
                    required_apply_link.push({
                        "url": jobUrl
                    })
                } catch (error) {

                }
            }
            return required_apply_link;
        })
    } catch (error) {
        console.log("error in openWideCareersJobs:" + error);
        return [];
    }
}
async function openWideCareersLabels(page, response) {
    try {
        var jobs = []
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page)
                try {
                    const response = await page.evaluate(() => {
                        try {
                            let title = document.querySelector("article > header > h1").innerText;
                            const description = document.documentElement.querySelector("article > div").outerHTML;
                            let location = document.querySelector("article > header > span").innerText
                            return {
                                'title': title,
                                'location': location,
                                'description': description,
                            };
                        } catch (error) {

                            return {
                                'title': "",
                                'location': "",
                                'description': "",
                            };
                        }


                    });
                    element.title = response.title;
                    element.location = response.location;
                    element.description = response.description;
                    jobs.push(element)
                } catch (error) {
                    console.log("error in the scientificRoboLabels description:" + error);
                }

            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the openWideCareersLabels:" + error);
        return []
    }
}
//----------
async function jobiakJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var jobBlocks = document.documentElement.querySelectorAll('div[class = "mpc-post--vertical-wrap"] div[class = "mpc-post__content mpc-transition"] h3 a');
            let jobs = []
            for (let index = 0; index < jobBlocks.length; index++) {
                try {
                    const element = jobBlocks[index];
                    let title = element.innerText;
                    let jobUrl = new window.URL(element.getAttribute('href'), window.document.URL).toString();
                    // let datePosted = element.querySelectorAll('span[class="mpc-date__inline"]')[0].innerText
                    jobs.push({
                        'title': title,
                        'url': jobUrl,
                        // 'datePosted': datePosted
                    })
                } catch (error) {

                }
            };
            return jobs
        })
    } catch (error) {
        console.log("error in jobiakJobs:" + error);
        return [];
    }
}
async function jobiakLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                try {
                    const text = await page.evaluate(() => {
                        // $x() is not a JS standard -
                        // this is only sugar syntax in chrome devtools
                        // use document.evaluate()
                        let datePosted = document.documentElement.querySelectorAll(
                            'time[class="mk-publish-date"]'
                        )[0].innerText;
                        let jobDesc = document.documentElement.querySelectorAll(
                            'div[class="vc_col-sm-8 wpb_column column_container    _ height-full mpc-column"] div[id="text-block-3"]'
                        )[0].outerHTML;
                        let locXpath =
                            "//strong[contains(text(),'Location')]/following::text()[1]";
                        const featureArticle = document.evaluate(
                            locXpath,
                            document,
                            null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE,
                            null
                        ).singleNodeValue;
                        return {
                            location: featureArticle.textContent,
                            datePosted: datePosted,
                            jobDesc: jobDesc
                        };
                    });

                    element.location = text.location.replace(": ", " ").trim();
                    element.jobDescription = text.jobDesc;
                    element.datePosted = text.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the jobiakLabels:" + error);
        return [];
    }
}
//----------
async function simulationProcessJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('*[class="joblist"] tr');
            for (let index = 1; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.children[0].innerText;
                let location = element.children[2].innerText;
                let jobUrl = new window.URL(element.children[0].querySelector('a').getAttribute('href'), window.document.URL).toString();
                required_apply_link.push({
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }
            return required_apply_link;
        });
    } catch (error) {
        console.log("error in the simulationProcessJobs:" + error);
        return [];
    }
}
async function simulationProcessLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                try {
                    const pageDetails = await page.evaluate(() => {
                        let datePosted = "";
                        let jobDesc = document.documentElement.querySelectorAll('*[class="entry-content"]')[0].outerHTML;


                        return {

                            'description': jobDesc,
                            'datePosted': datePosted
                        };
                    });

                    element.description = pageDetails.description;
                    element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the simulationProcessLabels:" + error);
        return [];
    }
}
//----------
async function aiDreamJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('*[class="joblist"] tr');
            for (let index = 1; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.children[0].innerText;
                let location = element.children[2].innerText;
                let jobUrl = new window.URL(element.children[0].querySelector('a').getAttribute('href'), window.document.URL).toString();
                required_apply_link.push({
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }
            return required_apply_link;
        });
    } catch (error) {
        console.log("error in the aiDreamJobs:" + error);
        return [];
    }
}
async function aiDreamLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                try {
                    const pageDetails = await page.evaluate(() => {
                        let datePosted = "";
                        let jobDesc = document.documentElement.querySelectorAll('*[class="entry-content"]')[0].outerHTML;


                        return {
                            'description': jobDesc,
                            'datePosted': datePosted
                        };
                    });

                    element.description = pageDetails.description;
                    element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the aiDreamLabels:" + error);
        return [];
    }
}
//-----------
async function andOverJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('*[class="joblist"] tr');
            for (let index = 1; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.children[0].innerText;
                let location = element.children[2].innerText;
                let jobUrl = new window.URL(element.children[0].querySelector('a').getAttribute('href'), window.document.URL).toString();
                required_apply_link.push({
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }
            return required_apply_link;
        });
    } catch (error) {
        console.log("error in the andOverJobs:" + error);
        return [];
    }
}
async function andOverLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                try {
                    const pageDetails = await page.evaluate(() => {
                        let datePosted = "";
                        let jobDesc = document.documentElement.querySelectorAll('*[class="entry-content"]')[0].outerHTML;


                        return {

                            'description': jobDesc,
                            'datePosted': datePosted
                        };
                    });

                    element.description = pageDetails.description;
                    element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the andOverLabels:" + error);
        return [];
    }
}
//-----------
async function excelCarsJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('*[class="joblist"] tr');
            for (let index = 1; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.children[0].innerText;
                let location = element.children[2].innerText;
                let jobUrl = new window.URL(element.children[0].querySelector('a').getAttribute('href'), window.document.URL).toString();
                required_apply_link.push({
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }
            return required_apply_link;
        });
    } catch (error) {
        console.log("error in the excelCarsJobs:" + error);
        return [];
    }
}
async function excelCarsLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                try {
                    const pageDetails = await page.evaluate(() => {
                        let datePosted = "";
                        let jobDesc = document.documentElement.querySelectorAll('*[class="entry-content"]')[0].outerHTML;


                        return {

                            'description': jobDesc,
                            'datePosted': datePosted
                        };
                    });

                    element.description = pageDetails.description;
                    element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the excelCarsLabels:" + error);
        return [];
    }
}
//-----------
async function peripheralVascularJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('*[class="joblist"] tr');
            for (let index = 1; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.children[0].innerText;
                let location = element.children[2].innerText;
                let jobUrl = new window.URL(element.children[0].querySelector('a').getAttribute('href'), window.document.URL).toString();
                required_apply_link.push({
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }
            return required_apply_link;
        });
    } catch (error) {
        console.log("error in the peripheralVascularJobs:" + error);
        return [];
    }
}
async function peripheralVascularLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                try {
                    const pageDetails = await page.evaluate(() => {
                        let datePosted = "";
                        let jobDesc = document.documentElement.querySelectorAll('*[class="entry-content"]')[0].outerHTML;


                        return {

                            'description': jobDesc,
                            'datePosted': datePosted
                        };
                    });

                    element.description = pageDetails.description;
                    element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the peripheralVascularLabels:" + error);
        return [];
    }
}
//------------
async function flexProfessionalsJobs(page, joburl) {
    try {
        let dataSet = []
        for (let index = 1; index < 6; index++) {
            try {
                const joburl = "https://www.flexprofessionalsllc.com/jobs/#!/search?page=" + index;
                await page.goto(joburl, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                let data = await page.evaluate(() => {
                    var required_apply_link = []
                    var blocks = document.documentElement.querySelectorAll('div[class="jb--job-listing ng-scope"]');
                    for (let index = 0; index < blocks.length; index++) {
                        const element = blocks[index];
                        let title = element.querySelectorAll('div[class="jb--title"] a')[0].innerText;
                        let location = element.querySelectorAll('div[class="jb--location ng-binding"]')[0].innerText;
                        let jobUrl = new window.URL(element.querySelectorAll('div[class="jb--title"] a')[0].getAttribute('href'), window.document.URL).toString();
                        let datePosted = element.querySelectorAll('div[class="jb--date-posted ng-binding"]')[0].innerText;
                        required_apply_link.push({
                            'title': title,
                            'url': jobUrl,
                            'location': location,
                            'datePosted': datePosted
                        })
                    }
                    return required_apply_link;
                });
                dataSet = dataSet.concat(data);
            } catch (error) {

            }

        }
        return dataSet
    } catch (error) {
        console.log("error in the peripheralVascularLabels:" + error);
        return [];
    }
}
async function flexProfessionalsLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(4000);
                await framesLoading(page);
                try {
                    const pageDetails = await page.evaluate(() => {
                        let jobType = "",
                            salary = "",
                            jobId = "";
                        let jobDesc = document.documentElement.querySelectorAll('section[class="jb--content"]')[0].outerHTML;
                        let jobTypeBlock = document.documentElement.querySelectorAll('div[ng-if="displayJobType && job.jobType"]');
                        if (jobTypeBlock.length >= 1) {
                            jobType = jobTypeBlock[0].children[1].innerText
                        }
                        let salaryBlock = document.documentElement.querySelectorAll('div[ng-if="displaySalary && hasSalary()"]');
                        if (salaryBlock.length >= 1) {
                            salary = salaryBlock[0].children[1].innerText
                        }
                        let jobIdBlock = document.documentElement.querySelectorAll('div[ng-if="displayJobId && job.externalId"]');
                        if (jobIdBlock.length >= 1) {
                            jobId = jobIdBlock[0].children[1].innerText
                        }
                        return {
                            'jobType': jobType,
                            'description': jobDesc,
                            'salary': salary,
                            'jobId': jobId
                        };
                    });
                    element.jobType = pageDetails.jobType;
                    element.description = pageDetails.description;
                    element.salary = pageDetails.salary;
                    element.jobId = pageDetails.jobId;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the flexProfessionalsLabels:" + error);
        return [];
    }
}
//-----------
async function dataOrgJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('*[class="joblist"] tr');
            for (let index = 1; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.children[0].innerText;
                let location = element.children[2].innerText;
                let jobUrl = new window.URL(element.children[0].querySelector('a').getAttribute('href'), window.document.URL).toString();
                required_apply_link.push({
                    'title': title,
                    'url': jobUrl,
                    'location': location
                })
            }
            return required_apply_link;
        });
    } catch (error) {
        console.log("error in the dataOrgJobs:" + error);
        return [];
    }
}
async function dataOrgLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                try {
                    const pageDetails = await page.evaluate(() => {
                        let datePosted = "";
                        let jobDesc = document.documentElement.querySelectorAll('*[class="entry-content"]')[0].outerHTML;

                        return {

                            'description': jobDesc,
                            'datePosted': datePosted
                        };
                    });

                    element.description = pageDetails.description;
                    element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the dataOrgLabels:" + error);
        return [];
    }
}
//-----------
async function marioJobs(page, joburl) {
    try {
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        await page.waitFor(1000);
        await framesLoading(page);
        return await page.evaluate(() => {
            var required_apply_link = []
            var blocks = document.documentElement.querySelectorAll('div[class="main-content text-center"]');
            for (let index = 0; index < blocks.length; index++) {
                const element = blocks[index];
                let title = element.querySelectorAll('h2[class="page-header h1"]')[0].innerText;
                let location = element.querySelectorAll('*[class="post-meta"]')[0].children[1].innerText;
                let datePosted = element.querySelectorAll('*[class="post-meta"] a')[0].innerText;
                let jobUrl = new window.URL(element.querySelectorAll('*[class="post-meta"] a')[0].getAttribute('href'), window.document.URL).toString();
                required_apply_link.push({
                    'title': title,
                    'url': jobUrl,
                    'location': location.replace(/Location:/, '').replace(/\s+/g, ' ').trim(),
                    'datePosted': datePosted.replace(/Posted On:/, '').replace(/\s+/g, ' ').trim()
                })
            }
            return required_apply_link;
        });
    } catch (error) {
        console.log("error in the marioJobs:" + error);
        return [];
    }
}
async function marioLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(1000);
                await framesLoading(page);
                try {
                    const pageDetails = await page.evaluate(() => {
                        //let datePosted = "";
                        let jobDesc = document.documentElement.querySelectorAll('article[class="col-md-9"] div[class="single-entry-summary"]')[0].outerHTML;
                        return {

                            'description': jobDesc,
                            //'datePosted': datePosted
                        };
                    });

                    element.description = pageDetails.description;
                    //element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the jobiakLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the marioLabels:" + error);
        return [];
    }
}
//-----------
async function cengageJobs(page, joburl) {
    try {
        let dataSet = []
        var GetLastpage = await Pagination(page, joburl);
        var lastPage = 1;
        if (GetLastpage.length > 0) {
            var Limit = await get_page_number(GetLastpage[0], '/search?pr=');
            let pagelimit = parseInt(Limit) + 1;
            lastPage = pagelimit
        }
        console.log("No of Pages:" + lastPage);

        for (let index = 0; index <= lastPage; index++) {
            var Url = `https://careers-cengage.icims.com/jobs/search?pr=${index}`;
            await page.goto(Url, {
                networkIdle2Timeout: 80000,
                waitUntil: "networkidle2",
                timeout: 80000
            });
            await delay(3000);
            await framesLoading(page);
            var result = await page.evaluate(() => {
                var Urls = []
                let els = document.documentElement.querySelectorAll('li[class="row"]')
                for (let index = 0; index < els.length; index++) {
                    const element = els[index];
                    Urls.push({
                        'title': element.querySelector('div[class="col-xs-12 title"] a').children[1].innerText,
                        'location': element.querySelector('div[class="col-xs-6 header left"]').children[1].innerText,
                        'url': element.querySelector('a').getAttribute('href'),
                        'datePosted': element.querySelector('div[class="col-xs-6 header right"]').children[1].getAttribute('title'),
                        'jobId': element.querySelector('dd[class="iCIMS_JobHeaderData"]').innerText,

                    })
                }
                return Urls;
            });
            //console.log(result);

            dataSet = dataSet.concat(result)
        }
        return dataSet;
    } catch (error) {
        console.log("error in the cengageJobs:" + error);
        return [];
    }
}

async function cengageLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(3000);
                await framesLoading(page);
                try {
                    element.description = await page.evaluate(() => {
                        try {

                            function cleanup(node, type) {
                                let els = node.querySelectorAll(type);
                                for (let i = els.length - 1; i >= 0; i--) {
                                    els[i].parentNode.removeChild(els[i]);
                                }
                                return "done";
                            }
                            cleanup(document.documentElement, 'li[class="row"]');
                            cleanup(document.documentElement, 'div[class="iCIMS_JobOptions"]');
                            cleanup(document.documentElement, 'img[src]');
                            cleanup(document.documentElement, 'script');
                            cleanup(document.documentElement, 'div[class="iCIMS_Logo"]')


                            if (document.documentElement.querySelector('div[class="iCIMS_JobContent"]')) {
                                return document.documentElement.querySelector('div[class="iCIMS_JobContent"]').innerHTML;
                            }
                            return null;
                        } catch (error) {
                            return null;
                        }

                    });
                    //element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the cengageLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the cengageLabels:" + error);
        return [];
    }

}
async function Pagination(page, joburl) {
    try {

        await page.goto(joburl, {
            networkIdle2Timeout: 5000,
            waitUntil: "networkidle2",
            timeout: 0
        });
        await page.waitFor(5000);
        await framesLoading(page);
        const [elementHandle] = await page.$x('//div[@class="iCIMS_Paginator_Bottom"]//a[contains(., "Last")]');
        const propertyHandle = await elementHandle.getProperty('href');
        const propertyValue = await propertyHandle.jsonValue();
        return [propertyValue];
    } catch (e) {
        console.log(e);
        return []
    }
}

function get_page_number(url, selector) {

    var page_number = -1;
    page_number = url.lastIndexOf(selector);
    if (page_number != -1) {
        page_number = page_number + selector.length;
    }
    var number_string_value = url.substring(page_number, page_number + 5);
    if (number_string_value.match(/\d/g)) {
        return number_string_value.match(/\d/g).join('').toString();
    } else {
        return '';
    }

}

//----------------------
async function bestboxingclubJobs(page, joburl) {
    try {
        let dataSet = []
        var GetLastpage = await bestboxingPagination(page, joburl);
        var lastPage = await page.evaluate(() => {
            var last = document.querySelectorAll("div > a.page-numbers")
            var lastnum = parseInt(last[last.length - 2].innerText)
            return lastnum
        })
        console.log("No of Pages:" + lastPage);

        for (let index = 1; index <= lastPage; index++) {
            var Url = `https://bestboxingclub.com/jobs/page/${index}/`;
            await page.goto(Url, {
                networkIdle2Timeout: 80000,
                waitUntil: "networkidle2",
                timeout: 80000
            });
            await delay(3000);
            //await framesLoading(page);
            var result = await page.evaluate(() => {
                var Urls = []
                let els = document.documentElement.querySelectorAll('#blog > div.page-area > div > div > div > article')
                for (let index = 0; index < els.length; index++) {
                    const element = els[index];
                    Urls.push({
                        'title': element.querySelector('h2').innerText,
                        'location': element.querySelector('.post-meta').innerText.split('Location: ')[1],
                        'url': element.querySelector('a').href,
                        'datePosted': element.querySelector('.posted-on').innerText.split(':')[1],
                        'jobId': element.querySelector('a').href.match(/(\d+)\/?$/)[1],

                    })
                }
                return Urls;
            });
            //console.log(result);

            dataSet = dataSet.concat(result)
        }
        return dataSet;
    } catch (error) {
        console.log("error in the cengageJobs:" + error);
        return [];
    }
}

async function bestboxingclubLabels(page, response) {
    try {
        var jobs = [];
        for (var index = 0; index < response.length; index++) {
            const element = response[index];
            try {
                await page.goto(element.url, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 90000
                });
                await page.waitFor(3000);
                await framesLoading(page);
                try {
                    element.description = await page.evaluate(() => {
                        try {

                            if (document.querySelector("#blog > div.page-area > div.container.main-container > div > article > div > div.single-content > div")) {
                                return document.querySelector("#blog > div.page-area > div.container.main-container > div > article > div > div.single-content > div").innerHTML;
                            }
                            return null;
                        } catch (error) {
                            return null;
                        }

                    });
                    //element.datePosted = pageDetails.datePosted;
                    jobs.push(element);
                } catch (error) {
                    console.log("error in the cengageLabels description:" + error);
                }
            } catch (error) {
                console.log("error while page loading:" + error);
            }
        }
        return jobs;
    } catch (error) {
        console.log("error in the cengageLabels:" + error);
        return [];
    }

}
async function bestboxingPagination(page, joburl) {
    try {

        await page.goto(joburl, {
            networkIdle2Timeout: 5000,
            waitUntil: "networkidle2",
            timeout: 0
        });
        await page.waitFor(5000);
        await framesLoading(page);

        const [elementHandle] = await page.$x('//*[@id="blog"]/div[2]/div/div/div/nav/div/a[2]');
        const propertyHandle = await elementHandle.getProperty('href');
        const propertyValue = await propertyHandle.jsonValue();
        return [propertyValue];
    } catch (e) {
        console.log(e);
        return []
    }
}