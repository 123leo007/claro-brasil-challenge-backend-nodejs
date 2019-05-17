

$(document).ready(() => {
    var template = '';
    var tplOptions = '';

    function addToTemplate(temp) {
        template += temp;
    }
    function getTemplate() {
        return template;
    }

    $.ajax({
        url: "http://localhost:3000/retrieveUsers",
        dataType: "json",
        context: document.body
    }).done(function (data) {
        console.log('success' + data);

        data.forEach(element => {
            addToTemplate('<button class="dropdown-item" type="button" id="' + element.login + '" onClick="setDropName(' + element.login + ')">' + element.login + '</button>');
        });
        $('#dropUsers').html(getTemplate());
    });
});

function setDropName(name) {
    $('#dropdownMenu2').html("User: " + name);
    $('#login').val(name);
    $.ajax({
        url: "http://localhost:3000/retrieveDevices/" + name,
        dataType: "json",
        type: "get",
        context: document.body
    }).done(function (response) {
        template = '';
        tplOptions = '<option value="None">none</option>';
        console.log('success' + response);
        //output
        response.forEach(element => {
            template += '<tr>';
            template += '<td>' + element.name + '</td>' +
                '<td>' + element.model + '</td>' +
                '<td>' + element.macAddress + '</td>' +
                '<td><button class="btn btn-danger" type="button" id="' + element.macAddress + '" onClick="removeDevice(\'' + element.macAddress + '\')">' + 'X' + '</button>' + '</td>';
            template += '</tr>';
            tplOptions += '<option value="' + element.macAddress + '">' + element.name + '  ' + element.macAddress + '</option>';
        });

        $('#output').html(template);
        $('#changeDeviceOption').html(tplOptions);
    });
}

function removeDevice(macAddress) {
    $.ajax({
        type: "post",
        url: "http://localhost:3000/removeDevice",
        data: JSON.stringify({ MAC: macAddress }),
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        success: deviceRemoved
    }).done(function (response) {
        console.log('success' + response);

    });
}

function deviceRemoved(data) {
    if (data.result.login === undefined) {
        $('#alert').html('<div class="container-fluid alert alert-warning" role="alert">' +
            data.arrayOfMessage[0] +
            '</div>');
    } else {
        setDropName(data.result.login);
        $('#alert').html('<div class="container-fluid alert alert-warning" role="alert">' +
            data.arrayOfMessage[0] +
            '</div>');
    }
    console.log('success' + data.arrayOfMessage[0]);
}

function addDevice() {
    var sliced = $('#addChangeForm').serialize().split("&");
    var makeJson = '{';
    sliced.forEach(el => {
        makeJson += '"' + el.split("=")[0] + '":"' + el.split("=")[1] + '",';
    });
    makeJson = makeJson.substr(0, makeJson.length - 1) + '}';

    $.ajax({
        type: "post",
        url: "http://localhost:3000/addDevice",
        data: makeJson,
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        success: deviceAdded
    }).done(function (response) {
        console.log('success' + response);
        setDropName($('#login').val());

    });
}

function deviceAdded(data) {
    if (data.result.login === undefined) {
        $('#alert').html('<div class="container-fluid alert alert-warning" role="alert">' +
            data.arrayOfMessage[0] +
            '</div>');
    } else {
        $('#alert').html('<div class="container-fluid alert alert-warning" role="alert">' +
            data.arrayOfMessage[0] +
            '</div>');
    }
    console.log('success' + data.arrayOfMessage[0]);
}

function changeDevice() {
    var sliced = $('#addChangeForm').serialize().split("&");
    var makeJson = '{';
    sliced.forEach(el => {
        makeJson += '"' + el.split("=")[0] + '":"' + el.split("=")[1] + '",';
    });
    makeJson = makeJson.substr(0, makeJson.length - 1) + '}';

    //JSON.parse(teste);
    $.ajax({
        type: "post",
        url: "http://localhost:3000/changeDevice",
        data: makeJson,
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        success: deviceChanged
    }).done(function (response) {
        console.log('success' + response);
        setDropName($('#login').val());
    });
}

function deviceChanged(data) {
    if (data.result.login === undefined) {
        $('#alert').html('<div class="container-fluid alert alert-warning" role="alert">' +
            data.arrayOfMessage[0] +
            '</div>');
    } else {
        $('#alert').html('<div class="container-fluid alert alert-warning" role="alert">' +
            data.arrayOfMessage[0] +
            '</div>');
        setDropName(data.result.login);
    }
    console.log('success' + data.arrayOfMessage[0]);
}



