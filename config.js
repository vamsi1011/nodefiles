var self = module.exports = {
    //npm i dateformat chalk url puppeteer request-promise body-parser fs-extra randomstring path
    dateFormat: require('dateformat'),
    now: new Date(),
    request: require('request'),
    HTTP_PORTS: [8140, 8121, 8122, 8123, 8124, 8125],
    width: 1366,
    check: async function checker(obj, str) {
        try {
            let allKeys = Object.keys(obj);
            for (let index = 0; index < allKeys.length; index++) {
                const element = allKeys[index];
                if (element.indexOf(str) >= 0 || str.indexOf(element) >= 0) {
                    return str.replace(element, obj[element]);
                }

            }
            return str
        } catch (error) {
            return str
        }
    },
    usStates: {
        'Alabama': 'AL',
        'Alaska': 'AK',
        'American Samoa': 'AS',
        'Arizona': 'AZ',
        'Arkansas': 'AR',
        'California': 'CA',
        'Colorado': 'CO',
        'Connecticut': 'CT',
        'Delaware': 'DE',
        'District Of Columbia': 'DC',
        'Federated States Of Micronesia': 'FM',
        'Florida': 'FL',
        'Georgia': 'GA',
        'Guam': 'GU',
        'Hawaii': 'HI',
        'Idaho': 'ID',
        'Illinois': 'IL',
        'Indiana': 'IN',
        'Iowa': 'IA',
        'Kansas': 'KS',
        'Kentucky': 'KY',
        'Louisiana': 'LA',
        'Maine': 'ME',
        'Marshall Islands': 'MH',
        'Maryland': 'MD',
        'Massachusetts': 'MA',
        'Michigan': 'MI',
        'Minnesota': 'MN',
        'Mississippi': 'MS',
        'Missouri': 'MO',
        'Montana': 'MT',
        'Nebraska': 'NE',
        'Nevada': 'NV',
        'New Hampshire': 'NH',
        'New Jersey': 'NJ',
        'New Mexico': 'NM',
        'New York': 'NY',
        'North Carolina': 'NC',
        'North Dakota': 'ND',
        'Northern Mariana Islands': 'MP',
        'Ohio': 'OH',
        'Oklahoma': 'OK',
        'Oregon': 'OR',
        'Palau': 'PW',
        'Pennsylvania': 'PA',
        'Puerto Rico': 'PR',
        'Rhode Island': 'RI',
        'South Carolina': 'SC',
        'South Dakota': 'SD',
        'Tennessee': 'TN',
        'Texas': 'TX',
        'Utah': 'UT',
        'Vermont': 'VT',
        'Virgin Islands': 'VI',
        'Virginia': 'VA',
        'Washington': 'WA',
        'West Virginia': 'WV',
        'Wisconsin': 'WI',
        'Wyoming': 'WY'
    },
    height: 768,
    C_HEADELESS: true,
    C_SLOWMOTION: 0,
    chalk: require('chalk'),
    log: function log(start, url, msg) {
        console.info(new Date() + ' [' + (Date.now() - start) + ' ms] ' + msg + ': ' + url);
    },
    URL: require('url'),
    puppeteer: require('puppeteer'),
    roundround: require('roundround'),
    rp: require('request-promise'),
    bodyParser: require('body-parser'),
    fse: require('fs-extra'),
    randomstring: require('randomstring'),
    path: require('path'),
    nanoid: require("nanoid"),
    _: require('lodash'),
    local_uri: 'mongodb://localhost:27017',
    server_uri: 'mongodb://admin:jobiak@3.18.238.8:28015/admin',
    MongoClient: require('mongodb').MongoClient,
    http: require('http'),
    stringSimilarity: require('string-similarity'),
    servers: [
        // 'http://34.221.8.108',
        // 'http://54.201.250.85',
        'http://34.219.200.19',
        'http://54.185.163.132',
        'http://54.187.1.8',
        'http://54.190.133.207',
        'http://34.209.119.176',
        'http://54.214.143.211',
        'http://34.218.210.46',
        'http://34.219.248.226',
        'http://34.208.177.185',
        'http://34.221.26.170',
        'http://34.217.51.100',
        'http://34.220.16.139',
        'http://54.213.92.88',
        'http://54.202.251.82',
        'http://34.216.237.121',
        'http://54.203.6.108',
        'http://34.211.193.74',
        'http://35.162.187.168'
    ],
    bigmlAllLabels: ['http://prod-bigml-java-service-1746202486.us-east-1.elb.amazonaws.com/predict/labels'],
    titleunwanted: ['FULL TIME/PART TIME', ' Job', 'Full-Time', '1st Shift', 'Fee for Service', ' FULL TIME AND PART TIME', 'Salary', 'Bonus', '- Remote', 'Night shift', "Day shift", 'Day/Evening', '3rd shift', '2nd shift', 'Part-time', " Day ", 'Nights', 'Evening', 'AVAILABLE', 'Permanent', 'Per Diem', 'PRN', 'Hourly', 'Afternoon', "Multiple Openings",
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
        'Position',
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
        ' Shift',
        'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday',
        ' USA',
        "available in", 'Part Time', '2nd Shift', 'Full-time'
    ],
    ATS_List: ['Taleo',
        'Jobvite',
        'iCims',
        'Greenhouse',
        'SAP',
        'ADP',
        'WorKDay',
        'SmartRecruiters',
        'Lever',
        'CareerBuilder',
        'PeopleSoft',
        'castone',
        'Monster',
        'ConerStone on Demand',
        'Comeet',
        'Kronos',
        'Workable',
        'Jobscore',
        'reezyHR',
        'Avature',
        'Compass',
        'Prevue',
        'PrismHR Hiring',
        'Healthcaresource.com',
        'ApplicantPro',
        'ApplicantStack',
        'RecruiterBox',
        'CareerPlug',
        'Gallo Winery',
        'Paycom',
        'JobDiva',
        'Njoyn',
        'SnagAJob',
        'TeamWorkOnline',
        'Symphony Talent',
        'gr8 People',
        'Hirebridge',
        'iApplicants',
        'PageUp People',
        'SmartSearch',
        'ApplicantPool.com',
        'ApplicantPool',
        'Hireology',
        'HospitalityOnline',
        'Applicant Manager',
        'Jazz HR',
        'Simplicant',
        'Paychex',
        'appone',
        'PeopleFluent',
        'Lumesse',
        'PCRecruiter',
        'Technomedia',
        'Recruitee',
        'Rullion Solutions',
        'SilkRoad',
        'Ceridian',
        'Geebo',
        'Job Info',
        'State Farm Agent'
    ],
    nextButtonSelectors: [
        '//a[@class="paginationLink paginationLinkNext"]',
        '//li[@class="pagination__next"]',
        "//div[@id='jobs-main']/div[1]/div[2]/span[2]/button[3]",
        '//a[@class="paginate_button next"]',
        '//button[@class="page-nav-caret p-icon-right-cursor next p-bg-hv-grey70"]',
        "//input[@id='cphBody_btnPageNext']",
        '//li[@class="next_link arrow_links"]/a',
        '//a/span[@class="css-6s8faq e1wiielh4"]',
        '//div[@class="pager-container-normal"]//ul/li/a[@aria-label="Go to Page 2"]',
        '//a[@aria-label="Go to Page 2"]',
        '//div[@class="pager-container-normal"]//li[@class="PagedList-skipToNext"]/a[@aria-label="Go to Next Page"]',
        "//a[@class='jp-next']",
        '//a[@id="next"]',
        '//span[@class="jtable-page-number-next-mobile ui-button ui-state-default"]',
        '//li[@id="company-pages-list_next"]/a',
        "//a[@onclick='listPagination(next)']",
        '//a[@class="next paginate_button"]',
        '//input[@class="pagebuttonnext"]',
        '//a[@class="next page-numbers"]',
        "//div[@id='content']/div/p[1]/a[@class='paginationItem ']",
        "//div[@class='sf-c-pagination']/a[@name='btn-next']",
        "//div[@class='jobs_pagination_main']/div[1]/ul/li[8]/a",
        "//button[@class='mat-paginator-navigation-next mat-icon-button']",
        "//a[@class='next']",
        "//div[@class='right_content']/p[22]//a",
        "//a[@id='showMoreJobs']",
        '//input[@class="rdpPageNext"]',
        "//input[@id='__Next']",
        '//input[@name="ctl00$cphBody$btnPageNext"]',
        "//div[@id='search-results']/div/div[1]//a[@class='page-nav next']",
        '//div[@class="row footer"]/div[3]/input',
        '//a[@class="next"]',
        '//a[@class="googlePaging next"]',
        '//a[@title="Go to the next page"]',
        '//input[@id="cphBody_btnPageNext"]',
        '//section[@class="jr-row jr-th jr-sel"]//a[@title="Next"]',
        '//a[@class="next"]',
        '//input[@id="__Next" and not(contains(@disabled,"disabled"))]',
        '//input[@id="cphBody_btnPageNext"]',
        '//button[@class="next hireology-button btn hireology-button--medium hireology-button--outline"]',
        "//input[contains(@onclick,'submitNextPage')]",
        '//a[@class="showMoreJobs UnderLineLink ng-binding"]',
        '//a[@class="jv-pagination-next"]',
        '//div[@class="reinvent-pagination-next-container"]/a[@class="next-page-btn"]',
        "//div[@class='centerbox-results']/form/h3[1]/span[@class='small-results']/a",
        '//a[@class="sf-c-arrow-btn btn btn-default right-arrow"]',
        '//a[@class="searchresultlist__paging__link searchresultlist__paging__link--right "]',
        '//div[@class="e961-9 x-column x-sm x-1-3"]/a',
        '//a[@id="joblist_next"]',
        "//div[@id='divR1']/div/div/table/tbody/tr[23]//a",
        "//div[@class='pagination paging-btm']/a[2]",
        "//div[@class='jobs-container']/div[1]/div[2]/div/a[@class='jp-next']",
        '//div[@class="ats_pagination_block"]/a[@id="j_id0:j_id1:atsForm:j_id152"]',
        '//button[@class="next hireology-button btn hireology-button--medium hireology-button--outline"]',
        '//button[@id="Jobs_PagedJobList_NextLink"]',
        "//div[@id='layout_content']/div[2]/div[1]/ul/li[@class='pagination_next']",
        '//div[@id="ctl00_ContentPlaceHolder1_pnlResults"]//table//a[@id="ctl00_ContentPlaceHolder1_grdOpenJobs_ctl01_btnNext"]',
        '//div[@class="pageContent"]/div/div[2]/div[2]//a[@id="textLink"]',
        '//li[@class="next"]',
        '//button[@class="mat-paginator-navigation-next mat-icon-button"]',
        "//html//body//form/table[3]/tbody/tr[13]/td/a",
        '//div[@class="pagination-next"]/a',
        "//a[@id='40:_next']",
        "//span[@class='current next']",
        "//li[@class='next']/a",
        '//div[@class="bottomPagerbar clearfix"]//div[@class="pages"]/a[@id="JobSearchResults:j_id137:j_id138:enhancedSearch:j_id231"]',
        "//div[@class='pagination-container']/ul/li[1]/a",
        '//a[@class="paginate_disabled_next"]',
        "//li[@class='next']",
        '//a[@class="PHPLinkPagination nextbtn"]',
        '//div[@class="pagination mobile"]/a[@class="next pagination-button "]',
        "//a[@id='next-page']",
        "//li[@class='pager-next last']/a",
        "//a[@class='next tracking-added active']",
        "//div[@id='main-content']/div[2]/div/table/tbody/tr[3]/td/table/tbody/tr[3]//input[@title='Next Page']",
        "//td[@id='ATSPageNext']/a",
        "//div[@class='pagingPanel']/a[1]",
        '//a[@class="next pagination-button "]',
        '//a[@class="page-link"] /span[contains(text(), "›")]',
        '//a[@class="page-link"] /span[contains(text(), "Next")]',
        "//a[@id='psjobstable_next']",
        "//a[@id='joblist_next']",
        '//div[@id="jobListSummary"]/div[4]/input',
        '//a[@class="prev-next hidden-phone"]',
        '//a[@aria-label="Next Page"]',
        '//div[@class="pager"]/a[@class="pager-next"]',
        '//li[@class="pagination-next page-item"]/a[@class="page-link"]',
        '//a[@aria-label="Go to Next Page"]',
        '//a[@class="showMoreJobs UnderLineLink ng-binding"]',
        '//div[@id="pager_container"]/a[@class="SMALLFONTBold"]',
        '//input[@id="cphBody_btnPageNext"]',
        '//a[@class="pagination-item-link pagination-item-link--next"]',
        '//button[@class="next hireology-button btn hireology-button--medium hireology-button--outline"]',
        '//td[@class="resultsHeaderPaginator"]//div/ul/li[@class="sfPaginatorArrowContainer paginationArrowContainer next"]/a',
        '//span[@class="current next"]',
        '//a[@class="next"]',
        '//li[@class="pagination-next"]/a[@aria-label="Next page"]',
        '//a[@ng-click="setPage(currentPage + 1)"]',
        '//a[@class="next page-numbers"]',
        '//li[@class="next"]/a',
        '//div[@class="bottomPagerbar clearfix"]/div/a[@title="Next"]',

        '//ul[@class="pagination"]//a[@id="pagination1"]',
        '//a[@class="PHPLinkPagination nextbtn"]',
        '//a[@id="nextButton"]',
        '//div[@id="ctl00_ctl00_ContentContainer_mainContent_ctl00_VacancyPager2"]//a[8]',
        '//div[@class="pagination pagination--bottom clearfix"]/a[5]',
        '//a[@id="next-page"]',
        '//*[@aria-label="Next page"]',
        '//a[@title="Go to next page"]',
        '//a[@title="Go To Next Page"]',
        '//a[@title="Next page"]',
        '//a[@title="Next"]',
        '//a[@aria-label="Next"]',
        '//a[@id="next"]',
        '//a[@class="next_page"]',
        '//a[@class="paginate_button next"]',
        '//i[@class="page-next fa fa-angle-right"]',
        '//a[@aria-label="Next »"]',
        '//button[@class="btn btn-outline next"]',
        '//a[@id="psjobstable_next"]',
        '//button[@aria-label="Next page"]',
        '//a[@id="NextPageArrow"]',
        '//div[@class="paging__pages"]/button[@class="page"]',
        '//a[@class="next-page-caret"]',
        '//i[@class="fa fa-arrow-right"]',
        '//a[@class="paginate_enabled_next"]',
        '//li[@class="pager__item pager__item--next"]/a',
        '//li[@class="jrp-desktop-next-page-element"]/a',
        '//a[@class="next tracking-added active"]',
        '//a[@class="paginate_disabled_next"]',
        '//a[@class="next pagination-button "]',
        'input[class="pagination-current"]',
        '//a[@class="h-padding-large next-button-link"]',
        'span[aria-label=\"Next page\"]',
        '//div[@class="page"]/input[@id="page_"]',
        '//div[@class="k-pager-wrap k-grid-pager k-widget k-floatwrap"]/a[@title="Next"]',
        '//div[@class="jobInfo"]',
        '//a[@class="page-link next"]',
        '//div[@class="careers-welcome"]/ol[@class="H2L2-ol"]/li',
        '//span[@id="direct_moreLessLinks_listingDiv"]',
        '//div[@class="more-button"]/a[@class="button load-more-jobs"]',
        '//tr[@class="data-row clickable"]',
        '//a[@class="jv-pagination-next"]',
        '//a[@aria-label="Go to the next page of results."]',
        '//a[@class="rh-pager__link--arrow"]',
        '//button[@class="pagination--page pagination--next"]',
        '//section/div/a[@class="next"]',
        '//a[@aria-label="next"]',
        '//a[@ng-click="selectPage(page + 1, $event)"]',
        '//span[@aria-label="Next page"]',
        '//div[@class="pagination"]//li/a/i[@class="icon-angle-right"]',
        "//a[contains(text(), 'next')]",
        '//div[@class="pagerpanel"]/span/span/a[@id="next"]',
        '//div[@class="yui-pg-container"]/a[@class="yui-pg-next"]',
        '//a/span[@class="ui-icon ui-icon-circle-arrow-e"]',
        '//div[@class="pagingButtons"]/a[@class="normalanchor ajaxable scroller scroller_movenext buttonEnabled"]',
        '//div[@class="pagination-paging"]/a[@class="next"]',
        '//div[@id="tm_paging"]/span/div/a[@class="next_page"]',
        '//section[@id="content-main"]/div/section/section[3]/div[2]/a',
        '//div[@id="jobListingList"]/nav/ul/li[9]/a',
        "//span/a[contains(text(), 'Next')]",
        '//li/a[@title="Go to next page"]',
        '//div[@class="pager"]/a[@class="pager-next-arrow"]',
        '//ul[@class="pager"]/li/a[@class="pageSelector"]',
        '//span[@title="Next page of results"]',
        "//button[contains(text(), 'Next')]",
        "//a[contains(text(), 'Next >')]",

        '//span[@class="jtable-page-number-next-mobile ui-button ui-state-default"]',
        "//span[contains(text(), 'Next')]",
        '//a[@class=\"paginationItemLast\"]',
        '//a[@aria-label="View Next page"]',

        "//a[contains(text(), 'Next Page')]",
        "//span[contains(text(), 'Next Page')]",
        "//a[contains(., 'NEXT')]",
        "//a[contains(., 'Next')]",
        '//a[contains(text(), ">")]',
        '//a[contains(text(), "»")]',
        '//a[contains(text(), ">>")]',
        '//div[@class="ats_pagination_block"]//a[3]',
    ],
    loadMoreSelector: [
        '//button[@class="btn-default btn deafult"]/descendant::span[1]',
        '//a[@class="load_more_jobs" and not(contains(@style,"display: none"))]',
        '//h5[contains(@data-bind,"visible") and not(contains(@style,"display: none"))]/descendant::a[1]',
        '//button[@class="btn btn-outline-primary btn-block"]',
        '//p[@class="load-more-data ng-binding" and not(contains(@style,"display: none"))]',
        '//a[@class="awsm-load-more awsm-load-more-btn"]',
        '//div[@id="recent-jobs"]//a[@class="more-link button"]',
        '//button[@class="btn-default btn deafult"]',
        '//button[@class="btn-default btn deafult"]',
        "//a[@id='LoadMoreJobs']",
        "//button[@id='tile-more-results']",
        "//button[@class='btn btn-outline-primary']",
        "//p[@class='load-more-data ng-binding']",
        "//a[@class='load_more_jobs']",
        '//p[@class="load-more-data ng-binding"]',
        "//a[@id='load-more']",
        "//li[@class='pager__item']/a",
        '//div[@id="recent-jobs"]/p/a[@class="more-link button"]',
        "//a[@id='button_moreJobs']",
        '//button[@class="alm-load-more-btn more"]',
        '//button[@class="overview-container__showmore"]',
        "//button[@class='more']",
        '//a[@class="load_more_jobs"]',
        '//a[@id="button_moreJobs"]',
        '//button[@class="btn btn-default btn-block search-card-container__btn-load-more w-100"]',
        "//button[@class='btn btn-outline-primary btn-block']",
        "//button[@id='load-more']",
        '//a[@id="load-more"]',
        "//div[@id='bottomBranding']/div[1]/p/a",
        '//a[@class="next-posts-link load_more_jobs"]',
        "//a[@id='loadMore']",
        "//button[@class='button-red button-expand js-trigger-expand see-more-insights']",
        "//div[@class='btn']",
        "//span[@class='button lazy']",
        "//input[@id='loadMoreButton']",
        '//a[@aria-label="Go to Next Page"]',
        '//div[@id="Opportunities"]/div[4]/div/h5/a[@id="LoadMoreJobs"]',
        '//div[@class="blog-pagination1"]/a[@class="next-posts-link load_more_jobs"]',
        '//div[@id="listings"]/span/div/button',
        '//div[@class="searchResults"]//input[@class="button"]',
        '//button[@class="btn btn-outline-primary btn-block"]',
        '//div[@class="center bloc"]/a[@class="btn btn-clear btn-clear-blue b-i"]',
        '//div[@class="jobs-btn-wrap"]/button',
        '//button[@id="loadMore"]',
        '//div[@class="JobPagerButton"]/div/a[@class="primaryButton"]',

        '//div[@id="careers"]/a[@id="load-more"]',
        '//div[@id="bottomBranding"]/div[1]/p/a[@class="view-all-health"]',
        '//a[@id="LoadMoreJobs"]',
        '//span[@class="loadMore"]',
        '//a[@class="button-secondary button-secondary--red job-board__job-list__load-more"]',
        '//li[@class="pager-show-more-next first last"]/a',
        '//a[@class="load_more_jobs"]/strong',
        '//div[@id="show-more-button"]/a',
        '//div[@id="load-jobs-btn"]/a/button',
        '//a[@class="c-button js-filter-careers"]',
        '//p[@class="load-more-data ng-binding"]',
        '//div[@class="jtable-bottom-panel ui-state-default"]//span[@aria-label="Search results pagination"]/span[@class="jtable-page-number-next ui-button ui-state-default"]',
        '//div[@class="job_listings"]/a[@class="load_more_jobs"]',
        '//a[@title="More Jobs"]',
        '//input[@class="button"]',
        "//span[contains(text(), 'Load More')]",
        "//button[contains(text(), 'LOAD MORE')]",
        "//a[contains(text(), 'Load More')]",
        "//a[contains(text(), 'Show More')]",
        "//span[contains(text(), 'Show More')]",
        "//*[contains(text(), 'Load more')]"
        // "//a[contains(text(), 'More')]",
        // "//a[contains(text(), 'Load')]",
    ],
    paginationSelectors_in_Urls: ['from=', '?pager=', '&pageno=', '&beg=', '?page=', '/Page-', 'page_job=', 'page_jobs=', '||d-ASC|', 'page_jobs=', '/page/', '/page', '&pagenum=', '&pageNum=', '?pageNum=', 'pages=', "jobpage=",
        'jobOffset=', '?spage=',
        '?folderOffset=', '&page=', '&paged=', '?projectOffset=',
        '#page-', '?pg=', 'PGNO=', 'Page-', 'Page=', 'page=', '?spage=', 'page/', '&startrow=', 'page-', 'startRow=', 'startrow=', '#||||', '|||||', 'p=', 'offset=', 'pagenumber=', 'Pagenumber=', 'pageNumber=', '/page'
    ],
    exceptionDomain: ['nescoresource.com', 'stcharlesinc.org', 'jobsearch.sherwin.com',
        'cameloteducation.atsondemand.com', 'cutteraviation.com',
        'northpointsearchgroup.com', 'www.merraine.com', 'www.huxley.com', 'www.realstaffing.com', 'jobs.netflix.com', 'prestigehealthcare.vikus.net', 'www.progressiverecruitment.com', 'nexionhealth.vikus.net', 'karriere.fresenius.de', 'sites.hireology.com', 'www.tscti.com', 'www1.jobdiva.com', 'www.governmentjobs.com', 'careers.precast.com', 'www.pike.com', 'usatodaynetworkcareers.com', 'www.snyderslance.com'
    ],
    pageStructure: async function pageStructure(page, blockResources = []) {
        // var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
        //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        //     'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
        //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
        // ];
        // let userAgt= Useragents[Math.floor(Math.random() * Useragents.length)]
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
        );

        if (blockResources instanceof Array && blockResources.length >= 1) {
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const url = request.url();
                const filters = [
                    'livefyre',
                    'moatad',
                    'analytics',
                    'controltag',
                    'chartbeat',
                    'livetracks', 'https://www.googletagmanager.com', 'https://v1.addthisedge.com/', 'https://maps.googleapis.com'
                ];
                const type = request.resourceType();
                const shouldAbort = filters.some((urlPart) => url.includes(urlPart));
                if (shouldAbort || blockResources.indexOf(type) >= 0) request.abort();
                else request.continue();
            });
        }
        page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.dismiss();
            await browser.close();
        });
        await page.setViewport({
            width: 1366,
            height: 768
        })
        page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.dismiss();
        });
        return page;
    },

    formGoogleUrl: async function formGoogleUrl(title, location, company, statusBit) {
        var tempTitle = title.replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
        var tempLocation = location.replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
        var tempCompany = company.replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
        // console.log(temptitle);

        if (statusBit != 1) {
            return "https://www.google.com/search?q=" + tempTitle + "+in+" + tempLocation + "+&ibp=htl;jobs#fpstate=tldetail&htilrad=300.0&htivrt=jobs"
        }
        return "https://www.google.com/search?q=" + tempTitle + "+in+" + tempLocation + '+' + tempCompany + "+&ibp=htl;jobs#fpstate=tldetail&htilrad=300.0&htivrt=jobs"
    },
    delay: async function delay(time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    },
    get_page_number: async function get_page_number(url, selector) {
        try {
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
        } catch (error) {
            log("error in get_page_number ==" + error);
            return '';
        }


    },
    formingUrls: async function formingUrls(start, careerLink, type, pagePattern, pageLimit = 200) {
        if (type === 'icims') {
            const Parsedurl = self.URL.parse(careerLink);
            var ICIMS_urls = [],
                incr = 0;
            while (incr < pageLimit) {
                const FormedURL = Parsedurl.protocol + "//" + Parsedurl.host + "/jobs/search?pr=" + incr
                ICIMS_urls[incr] = FormedURL
                incr = incr + 1;
            }
            return ICIMS_urls;
        } else {
            let UrlFormation = [];
            let matchUrl = pagePattern.matchUrl;
            let pattern = pagePattern.pattern;

            let numberAfterPattern = await self.get_page_number(matchUrl, pattern)
            if (numberAfterPattern == '' || (matchUrl.toLowerCase().indexOf('perpage=') >= 0 && matchUrl.toLowerCase().indexOf('currentpage='))) {
                return [];
            }

            var StringToChange = pattern + parseInt(numberAfterPattern);

            var incr = 0,
                numb = 0;
            while (incr < pageLimit) {
                if (pattern == 'jobOffset=') {
                    var NewValue = pattern + numb
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                    incr = incr + 1
                    let page_number_value = 5
                    numb = numb + page_number_value

                } else if (pattern == '?folderOffset=' || (pattern == 'from=' && parseInt(numberAfterPattern) == 20)) {
                    var NewValue = pattern + numb
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                    incr = incr + 1
                    let page_number_value = 20
                    numb = numb + page_number_value

                } else if (pattern.toLowerCase().includes('startrow=') || pattern.toLowerCase().includes('?projectoffset=')) {

                    var NewValue = pattern + numb
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                    incr = incr + 1
                    let page_number_value = 25
                    numb = numb + page_number_value

                } else if (parseInt(numberAfterPattern) == 10 && pattern.toLowerCase().includes("offset=")) {
                    var NewValue = pattern + numb
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                    let page_number_value = 10
                    numb = numb + page_number_value
                    incr = incr + 1
                } else if (pattern.toLowerCase() == 'from=') {
                    if (parseInt(numberAfterPattern) == 10) {
                        var NewValue = pattern + numb
                        UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                        let page_number_value = 10
                        numb = numb + page_number_value
                        incr = incr + 1
                    } else if (parseInt(numberAfterPattern) == 50) {
                        var NewValue = pattern + numb
                        UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                        let page_number_value = 50
                        numb = numb + page_number_value

                        incr = incr + 1
                    } else {

                        UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                        var NewValue = pattern + numb;
                        numb = numb + 1
                        incr = incr + 1
                    }
                } else if ((parseInt(numberAfterPattern) > 0 && parseInt(numberAfterPattern) % 2 == 0 || parseInt(numberAfterPattern) === 1)) {
                    var NewValue = pattern + (numb + 1);
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                    incr = incr + 1
                    numb = numb + 1

                } else {
                    var NewValue = pattern + numb;
                    numb = numb + 1
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null', '').trim());
                    incr = incr + 1
                }

            }
            return UrlFormation;
        }

    },
    compareForSame: async function compareForSame(arrayOne, arrayTwo) {
        if (arrayOne.length > arrayTwo.length) {
            //console.log("into if");
            //console.log(arrayOne.length);
            //console.log(arrayTwo.length);

            var count = 0;
            for (let index1 = 0; index1 < arrayTwo.length; index1++) {
                const element1 = arrayTwo[index1];
                for (let index2 = 0; index2 < arrayOne.length; index2++) {
                    const element2 = arrayOne[index2];
                    if (element2.Link === element1.Link) {
                        //console.log("Increamenting " + count);
                        count = count + 1
                    }

                }
                //console.log(count);
                if (count == arrayTwo.length) {
                    //console.log(count);
                    return true;
                }

            }
            //console.log(count);
            return false;
        } else {
            //console.log("into else");
            //console.log(arrayOne.length);
            //console.log(arrayTwo.length);
            var count = 0;
            for (let index1 = 0; index1 < arrayOne.length; index1++) {
                const element1 = arrayOne[index1];
                for (let index2 = 0; index2 < arrayTwo.length; index2++) {
                    const element2 = arrayTwo[index2];
                    if (element2.Link === element1.Link) {
                        //console.log("Increamenting " + count);
                        count = count + 1
                    }

                }

                if (count == arrayOne.length) {
                    //console.log(count);
                    return true;
                }

            }
            //console.log(count);
            return false;
        }


    },
    getSelector: async function getSelector(page, selectors) {
        try {
            for (var index = 0; index < selectors.length; index++) {
                const data = selectors[index]
                const linkHandlers = await page.$x(data);
                if (linkHandlers.length > 0) {
                    //console.log(data + " Found")
                    return data;
                }
            };
            return "";
        } catch (error) {
            console.log("error:" + error);
            return "";
        }
    },
    shuffle: function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    },
    randomIntFromInterval: function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    paramsCheck: async function paramsCheck(params) {
        const condition = params && params instanceof Object && params.joburl && params.joburl != null && params.joburl != "";
        return condition ? true : false;
    },

    navigationLimitCheck: async function navigationLimitCheck(params) {
        let value = params.navigationLimit
        //console.log(value)
        const condition = value && typeof (value) == "number" && value != 0;
        return condition ? true : false;
    },
    jobSelectors: [
        'jobID=',
        'jobPostId',
        '/careerportal/',
        '/jobseekers/',
        'JobBoard',
        'VacancyID=',
        'Detail',
        '/AroghiaGroup/',
        '/jobs#!/', '/BYYOURSIDEAutismTherapyServices/',
        'req=',
        'http://bradleyharris.net/',
        '/x/detail/',
        'reqGK=',
        '/jobopenings/',
        '/us-en/careers/jobdetails?',
        '/job-openings/',
        'job-',
        '/details/',
        'ref_id=',
        '/en-us/details/',
        'refId=',
        '/view/',
        '/career/',
        '/Careers/',
        'ams-careers.com/',
        '/jobs?keyword=',
        '/indeed-jobs/',
        '/jobs?search',
        '/career-opportunities/',
        '/job-details-page?',
        '.com/o/',
        '.com/apply/',
        '/jb/',
        '/show-job-listing/',
        '/OpportunityDetail?',
        '/search-and-apply/',
        '/jobdetails/',
        '/en-US/job/',
        '/careers/jobdetails/',
        '/careeropportunities/',
        '.applytojob.com/apply/',
        '.hr/p/',
        '/findjobs-details.php?',
        '/positions/',
        '/epostings/index.cfm?',
        '/j/',
        '/search-jobs/JobDetails/',
        '/epostings/index.cfm?fuseaction=app.jobinfo&jobid=',
        '/hr/ats/Posting/',
        '/careers/v2/viewRequisition?org=',
        '/careers/apply/',
        '/x/detail',
        '/employment/',
        '/current-positions/',
        '/JobDetails.aspx?__ID=',
        '/JobDetails.aspx?job=',
        '/MainInfoReq.asp?R_ID=',
        '/jobs/ViewJobDetails?job=',
        '/jobs.html?hireology_job_id=',
        '/administration-jobs/',
        '/find-jobs/',
        '?jobID=',
        '/careersection/rgi_external/jobdetail.ftl?job=',
        '/employment/job-opening.php?req=',
        '/career/JobIntroduction.action?clientId=',
        '/careers/all-openings/',
        '/OpportunityDetail?opportunityId=',
        '/search/jobdetails/',
        '/careers/openings?',
        '/viewRequisition?org=',
        'job_details.cfm&cJobId=',
        '/bullhorn-career-portal/',
        '/careers/discover-openings/vacancy/',
        '/job.aspx?job_id=',
        '/jobdetails.aspx?jid=',
        '/ViewJob.aspx?JobID=',
        '/PublicJobs/controller.cfm?jbaction=JobProfile&Job_Id=',
        '/jobs?pos=',
        '/jobs/view.php?id=',
        '/job_postings/',
        '/job_board_form?op=view&JOB_ID=',
        '/hot-jobs/',
        '/career-portal/',
        '/search-jobs/',
        '/careersite/JobDetails.aspx?id=',
        '/pJobDetails.aspx?',
        '/info/ItemID/',
        '/details.aspx?jobnum=',
        '/job-detail/#job_id=',
        '/viewjob?t=',
        '/it-jobs-careers/',
        '/Openings/',
        '/careers/requisition.jsp?org=',
        '/pages/career-opportunities',
        '/careers/PipelineDetail/',
        '/jobs/individual-position/?gh_jid=',
        '/careers/?p=job/',
        '/careers-listing/',
        '/Jobs/Details/',
        '/careers?gh_jid=',
        '/jobSearch.jsp?org=',
        '/jobs/search?',
        '/job-seeker/jobs/',
        '/Jobsbridge1/',
        'careers/vacancies/',
        '/careers/job/?job_id=',
        '/open-opportunities/job-details/?jobcode=',
        '/jobdetail/?id=',
        '/career-details/?jobid=',
        '/job-description/',
        '/content/about/',
        '/careers?p=job/',
        '/job-seeker/job-details/JobCode/',
        '/jobs.html?gh_jid=',
        '/careers/current-openings/?p=job/',
        '/search-jobs/details/?job_id=',
        '/job-detail/',
        '/?page_id=',
        '/careersite/1/home/requisition/',
        '/job_listings.html?gh_jid=',
        '/jobs?gh_jid=',
        '/available-positions?gh_jid=',
        '/career-details?job=',
        '/apply/jobs/details/',
        '/job-details/',
        '/employment-opportunities/',
        '/index.jsp?POSTING_ID=',
        '/job-description.html?',
        '/careers/positions/co/data/',
        '/careers-at-inteleos/',
        '/jobDesc.asp?JobID=',
        '/PostingDetails.aspx?pid=',
        '/job_details_page.php?id=',
        '/current-job-openings&B_ID=',
        '/jobdetail.ftl?job=',
        '/career-detail/',
        '/vacancies/',
        '/careers/FolderDetail/',
        '/ShowJob/Id/',
        '/Job-Postings/',
        '/job-openings#op-',
        '/our-careers/',
        '/employment-ir/',
        '/JobDetails.asp?JO=',
        '/content/employment.asp',
        '/PublicJobs/',
        '/Portals/Portals/JobBoard/JobDetail.aspx?JobIDs=',
        '/careers.asp',
        '/job-seekers/',
        '/job_detail/',
        '/JobDescription.asp',
        '&JobNumber=',
        '/jobs/',
        '/job/',
        '/job?',
        '/Posting/',
        '/JD/',
        '/GetJob/ViewDetails/',
        '/JobDetail/',
        '/DashJobDetail/',
        '?quickFind=',
        '/job-description-page/',
        '?job_id=',
        '/rc/clk?/jobdetail.ftl',
        '/ViewJobDetails',
        '/careers/opportunity/',
        '/ts2__JobDetails?jobId=',
        '/ts2__JobDetails',
        '/jobs/ViewJobDetails',
        '/ShowJob/',
        '/MainInfoReq.asp',
        '/jobdetail',
        '/myjobs/',
        '/myjobs/openjob',
        '/JobPosting/',
        '/careers/detail/',
        '/Search/Apply/all/',
        '/search/job',
        '/DistrictJobPosting/',
        '/epostings/',
        '-jobs-',
        '-job-',
        '/viewRequisition?',
        '.showJob',
        '/position-details/?job_id=',
        '/position-details/',
        '/careers/development/',
        '/careers/partner-co-investor-relations/',
        '/careers/onsite-property-management/',
        '/careers/finance-capital-markets/',
        '/careers/human-resources/',
        '/careers/compliance/',
        '/career-center/?RequirementId=',
        '/jobboard.aspx?action=detail&recordid=',
        '&recordid=',
        '/postings/',
        '/Views/Applicant/VirtualStepPositionDetails.aspx',
    ]
}