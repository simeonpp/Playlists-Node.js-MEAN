$( document ).ready(function() {
    var $sortBy = $('#sortBy');

    $sortBy.on('change', function () {
        var $this = $(this),
            val = $this.val();

        window.location.href = window.location.href + "?sortBy=" + val;
    })
});