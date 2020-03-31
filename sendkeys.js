const puppeteer = require('puppeteer');


(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('http://preprod.jobiak.ai/marketing-tool/');
    await page.waitFor(2000)
    await page.type('input[name=career_url]', 'https://careers.ibm.com/ListJobs/All/Search/Country/AT//?lang=en', {
        delay: 20
    })

    page.keyboard.press('Enter')
    // await browser.close();
})();