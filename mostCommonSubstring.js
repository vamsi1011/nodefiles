var URL = require("url");
var _ = require("underscore");
var chalk = require("chalk");
var testingArray1 = require('./mostCommonSubstringVariables.js');
var jslrs = require("js-longest-repeated-substring");


let pathArray = [],
  urlString = "",
  splitVal = [],
  paginationSelector = "&beg=";
(async () => {
  let start = Date.now();
  console.log(chalk.blue("--------------------------------------------"));
  console.log(chalk.blue(Date.now() - start + " (ms)Start "));
  //const urlParse = URL.parse(testingArray1[0]);
  //console.log(urlParse);
  await Promise.all(
    testingArray1.map(async url => {
      const urlParse = URL.parse(url);
      if (url.indexOf(paginationSelector) <= -1)
        pathArray.push(urlParse.path);
      //console.log("path=" + urlParse.pathname);
    })
  );
  pathArray = await spliting(pathArray);
  pathArray = Array.prototype.concat.apply([], pathArray);
  pathArray = await pathArray.filter(function (el) {
    return el != null && el != "";
  });
  let mostRepeated = _.chain(pathArray)
    .countBy()
    .pairs()
    .max(_.last)
    .head()
    .value();

  pathArray = _.countBy(pathArray);
  let pathString = []
  let myStrings = []
  // console.log(pathArray);
  for (let [key, value] of Object.entries(pathArray)) {
    pathString.push({
      "str": `${key}`,
      "value": value
    })

    // console.log(`${value}`)

  }
  pathString.sort(function (a, b) {
    return b.value - a.value
  })


  // console.log(pathString)
  // return

  topValue = pathString[0].value
  for (ele of pathString) {
    // console.log((ele.value / topValue) * 100)
    if (((ele.value / topValue) * 100) > 66.8) {
      myStrings.push(ele.str)

      // console.log(ele.str)
      // console.log(((ele.value / topValue) * 100))
    }
  }
  var longest = myStrings.sort(function (a, b) {
    return b.length - a.length;
  })[0]
  var longest_new = ""
  let longest_final = longest.slice(0, -1);
  // console.log(chalk.yellow(longest_final))
  // console.log(chalk.yellow(longest))
  for (el of pathString) {

    if (el.str.includes(longest_final)) {
      // console.log(chalk.blue(el.str) + "-----------------")
      if (el.str.length == longest.length) {
        longest_new = longest
      } else {
        longest_new = longest_final
      }
    }
  }
  console.log(longest_new.replace(/\d+$/, ""))
  // console.log(await pathArray.toString())
  let valueToSearch = pathArray[mostRepeated];
  console.log(chalk.red("--------------------------------------------"));

  // console.log(mostRepeated);
  console.log(chalk.blue(Date.now() - start + " (ms)Finished "));
})();

async function spliting(arrayVal) {
  let data = [];
  // console.log("--------------------------------------------");
  for (let index = 0; index < arrayVal.length; index++) {
    const val = arrayVal[index];
    let valArray = val.split("");
    finalStringLen = valArray.length;
    let i = 0;
    while (i !== finalStringLen + 1) {
      let stringData = await valArray.slice(0, i).join("");
      if (stringData.length > 1)
        data.push(stringData);
      i = i + 1;
    }
  };
  // console.log("--------------------------------------------");
  console.log("returing");
  return data;

}