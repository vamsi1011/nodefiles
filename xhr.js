var xhr = require("xhr")

xhr({
    method: "post",
    body: someJSONString,
    uri: "/foo",
    headers: {
        "Content-Type": "application/json"
    }
}, function (err, resp, body) {
    console.log(resp.form)

})