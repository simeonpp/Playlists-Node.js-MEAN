$( document ).ready(function() {
    var $addNewYRLBtn = $('#addNewYRLBtn'),
        $addNewURLsDiv = $('#addNewURLsDiv'),
        $privateCheckBoxBtn = $('#privateBtn'),
        $privateUsersThatCanView = $('#privateUsersThatCanView'),
        $addNewPrivateViewUser = $('#addNewPrivateViewUser'),
        $addNewPrivateViewUsersDiv = $('#addNewPrivateViewUsersDiv'),
        videoUrlCounter = 2,
        privateUsersCounter = 2;

    $privateCheckBoxBtn.prop('checked', false);

    $addNewYRLBtn.on('click', function () {
        var $label,
            $input,
            $br = $('<br>');

        if (videoUrlCounter > 10 && ableToUnlimitedVideoURLs) {
            alert('You are not able to add more than 10 videos per playlist. You should first give 10 ratings to other playlists.');
            return;
        }

        $label = $('<label>')
            .attr('for', 'videoURL_' + videoUrlCounter)
            .text('Youtube video URL #' + videoUrlCounter);

        $input = $('<input>')
            .attr('id', 'videoURL_' + videoUrlCounter)
            .addClass('form-control')
            .attr('type', 'text')
            .attr('name', 'videoURL_' + videoUrlCounter)
            .attr('placeholde', 'Youtube videoUrlCounter URL');

        $addNewURLsDiv.append($label);
        $addNewURLsDiv.append($input);
        videoUrlCounter++;
    });

    $privateCheckBoxBtn.change(function() {
        if(this.checked) {
            $privateUsersThatCanView.show(250);
        } else {
            $privateUsersThatCanView.hide(250);
        }
    });

    $addNewPrivateViewUser.on('click', function () {
        var $label,
            $input,
            $br = $('<br>');

        $label = $('<label>')
            .attr('for', 'private_user_can_view_' + privateUsersCounter)
            .text('Username that is able to view #' + privateUsersCounter);

        $input = $('<input>')
            .attr('id', 'private_user_can_view_' + privateUsersCounter)
            .addClass('form-control')
            .attr('type', 'text')
            .attr('name', 'private_user_can_view_' + privateUsersCounter)
            .attr('placeholder', 'Username');

        $addNewPrivateViewUsersDiv.append($label);
        $addNewPrivateViewUsersDiv.append($input);
        privateUsersCounter++;
    })
});