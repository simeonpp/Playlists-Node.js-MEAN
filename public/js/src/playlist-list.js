$( document ).ready(function() {
    var $sortBy = $('#sortBy');

    $sortBy.on('change', function () {
        var $this = $(this),
            val = $this.val();

        var currentUrl = window.location.href,
            parsedUrl = new URI(currentUrl);

        if (parsedUrl.hasQuery("sortBy", true)) {
            parsedUrl.removeSearch("sortBy");
        }

        parsedUrl.addQuery("sortBy", val);
        window.location.href = parsedUrl.toString();
    });

    // Read a page's GET URL variables and return them as an associative array.
    function getUrlVars()
    {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
});