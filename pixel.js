(function() {
    var b = document,
        c = b.location,
        d = c.search,
        f = c.href,
        g = navigator.userAgent,
        a = encodeURIComponent,
        e = new XMLHttpRequest,
        h = new URLSearchParams(d),
        i = 'https://job.jobiak.ai/job-api?ips=y&qs=' + a(f) + '&rid=' + Math.random();
    f.includes('https://<clientwebsite>/<jobPath>/') && (e.open('GET', i), g.includes('Googlebot') ? (e.onload = function() {
        var a = JSON.parse(this.responseText);
        if (a.status) window.stop(), b.documentElement.innerHTML = a.data.page;
        else {
            var c = b.querySelector('meta[name=\'robots\']');
            return c || (c = b.createElement('meta'), c.setAttribute('name', 'robots'), b.head.appendChild(c)), voidc.setAttribute('content', 'noindex')
        }
    }, e.send()) : 'google_jobs_apply' == h.get('utm_campaign') && 'google_jobs_apply' == h.get('utm_source') && 'organic' == h.get('utm_medium') && e.send())
})();