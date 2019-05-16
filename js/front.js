
var Page = {

    init: function teste() {

        var template = '<button class="dropdown-item" type="button">Action</button>' +
            '<button class="dropdown-item" type="button">Another action</button>' +
            '<button class="dropdown-item" type="button">Something else here</button>';
        $('dropUsers').html($(template));
            //$(Dash__Outage.wrapper).html($(template).hide().fadeIn(1000));
    }
}

module.exports = Page;