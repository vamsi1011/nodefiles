const getUrls = require('get-urls');
var pc_links = ["https://www.ibm.com/in-en"]

await Promise.all(pc_links.map(async element => {
    htmlPlainText(element.url)
    // console.log(chalk.green("requesting to : ") + ht_url())
    async function htmlPlainText(url) {
        return await new Promise((resolve, reject) => {
            var formData = {
                "joburl": url,
            }
            var options = {
                url: ht_url(),
                method: 'POST',
                json: true,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: formData
            };
            async function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    // console.log("================DATA HTML API=====================");
                    console.log(body)
                    var data = body.jobBody
                    // await console.log(data)
                    await hp_arr.push({
                        text: data,
                        url: element.url
                    })

                    resolve(data);

                } else {
                    resolve({
                        'error': error
                    })
                }
                print_hp()
            }
            var response = request(options, callback);

        });
    }



}))


getUrls(text);