/**
 * Created by Igbalajobi Jamiu on 4/11/17.
 */
(function () {
    'use strict';

    var MAX_NUM_ROOM = 5;
    var MAX_CHILD_AGE = 17;


    var roomCount = 1;
    var adultCount = 2;
    var childCount = 0;


    var typingTimer, doneTypingInterval = 500, nationalitySearchDOM = $("#nationalitySearch");
    // nationalitySearchDOM.on('keyup keyenter paste', function () {
    //     typingTimer = setTimeout(searchNationality, doneTypingInterval);
    // });

    // nationalitySearchDOM.on('keydown', function () {
    //     clearTimeout(typingTimer);
    // });

    function searchNationality() {
        var $this = nationalitySearchDOM;
        if ($this.val().length >= 2) {
            $.ajax({
                url: '/api/suggest/nationality',
                method: 'GET',
                data: {
                    search: $this.val()
                },
                beforeSend: function () {
                    $(".fa-spinner").remove();
                    // $('<span class="fa fa-spinner fa-spin"></span>').appendTo($this);
                    $("#ul-nationality").html('');
                },
                success: function (resp, status, xhr) {
                    var dpDown = $('#nationality-dropdown');
                    dpDown.removeClass('hide');
                    $("#ul-nationality").html('');
                    if (xhr.status === 200 && resp.length > 0) {
                        var active = "";
                        $.each(resp, function (i, obj) {
                            // active = i === 0 ? "active" : "";
                            var dpListHtml = "<li data-nationalityId=\"" + obj.id + "\" class=\"selectNationality\">" + obj.nationality + "</li>";
                            $(dpListHtml).appendTo($("#ul-nationality"));
                        });
                        selectNationalityXhr();
                    } else {
                        $("<li>No nationality found for " + $this.val() + "</li>").appendTo($("#ul-nationality"));
                    }
                }
            })
        }
    }

    function selectNationalityXhr() {
        $(".selectNationality").on('click', function () {
            var nationalityId = $(this).attr('data-nationalityId');
            $('input[name=nationalityId]').attr('value', nationalityId);
            var selectedName = $(this).html();
            $("#nationalitySearch").attr('value', selectedName);
        });
    }

    /*
     * JQuery AutoComplete for Destination Search
     */
    var destinationAutoSuggDOM = $('input[name=cityTitle]');
    var destinationAutoSuggDOM = $('input[name=cityTitle]');
    destinationAutoSuggDOM.on('keyup keyenter paste', function () {
        var $this = $(this);
        // setTimeout(function () {
        $this.autocomplete({
            serviceUrl: '/api/suggest/destination',
            paramName: 'search',
            type: 'GET',
            minChar: 3,
            preventBadQueries: true,
            noSuggestionNotice: "<strong>Sorry, not result found for" + $this.val() + "</strong>",
            transformResult: function (response) {
                return {
                    suggestions: $.map(JSON.parse(response), function (dataItem) {
                        return {value: dataItem.cityName + ", " + dataItem.countryName, data: dataItem.id};
                    })
                };
            },
            onSelect: function (suggestion) {
                $('input[name=cityId]').attr('value', suggestion.data);
            }
        });
        // }, 500);
        $this.focus();
    });

    nationalitySearchDOM.on('keyup keyenter paste', function () {
        var $this = $(this);
        $this.autocomplete({
            serviceUrl: '/api/suggest/nationality',
            paramName: 'search',
            type: 'GET',
            minChar: 3,
            preventBadQueries: true,
            noSuggestionNotice: "<strong>Sorry, not result found for" + $this.val() + "</strong>",
            transformResult: function (response) {
                return {
                    suggestions: $.map(JSON.parse(response), function (dataItem) {
                        return {value: dataItem.countryId + ", " + dataItem.countryName, data: dataItem.id};
                    })
                };
            },
            onSelect: function (suggestion) {
                $('input[name=nationalityId]').attr('value', suggestion.data);
            }
        });
        $this.focus();
    });


    /*
     * End of AutoComplete for Destination Search
     */


    $('#controlQty button').on('click', function () {
        var _this = $('#controlQty'), _butt = $(this), qty = _this.find('input').attr('value');
        var qtys;
        if (_butt.hasClass('btn-plus')) {
            qtys = parseInt(qty) + 1;
            if (qtys <= MAX_NUM_ROOM) {
                _this.find('input').attr('value', qtys);
                addRoomDOM(qtys);
            } else $.growl.error({
                title: "Limit Exceeded",
                message: "Sorry, you cannot search more than " + MAX_NUM_ROOM + " room at a time"
            });
        } else {
            qtys = parseInt(qty) - 1;
            qtys = (qtys <= 1) ? 1 : qtys;
            _this.find('input').attr('value', qtys);
            removeRoomDOM(qtys + 1);
        }
        return false;
    });
    childAgeModifyDOM($("select[name=room1NoOfChild]"), 1);

    function childAgeModifyDOM($this, roomIndex) {
        $this.on('change', function () {
            var noOfChild = parseInt($this.val());
            var html = '';
            if (noOfChild <= 0) $('.chdAgeDIV').html(''); else {
                for (var i = 1; i <= noOfChild; i++) {
                    html += '<div class="col-sm-6">';
                    html += '<div class="form-group">';
                    html += '<label>Child ' + i + ' Age</label>';
                    html += '<select class="selector" name="room' + roomIndex + 'child' + i + 'age" style="width:100%;">';
                    for (var age = 0; age <= MAX_CHILD_AGE; age++) {
                        html += '<option' + ' value="' + age + '">' + age + '</option>';
                    }
                    html += '</select>';
                    html += '</div>';
                    html += '</div>';
                }
                $('.chdAgeDIV' + roomIndex).html(html);
                //Re-apply the JQuery Select2 Plugin
                $("select.selector").select2();
            }

        });
    }

    function addRoomDOM(roomIndex) {
        var html = '<li id="roomDIV' + roomIndex + '">';
        html += '<div class="form-group-room-title">ROOM ' + roomIndex + '</div>';
        html += '<div class="row gutter5">';
        html += '<div class="col-sm-6">';
        html += '<div class="form-group">';
        html += '<label>Adults (+18)</label>';
        html += '<select class="selector" name="room' + roomIndex + 'NoOfAdult" style="width:100%;">';
        html += '<option value="1">1</option>';
        html += '<option value="2" selected>2</option>';
        html += '<option value="3">3</option>';
        html += '<option value="4">4</option>';
        html += '</select></div></div>';

        html += '<div class="col-sm-6">';
        html += '<div class="form-group">';
        html += '<label>Children (0-17)</label>';
        html += '<select class="selector" name="room' + roomIndex + 'NoOfChild" style="width:100%;">';
        html += '<option value="0" selected>0</option>';
        html += '<option value="1">1</option>';
        html += '<option value="2">2</option>';
        html += '</select></div></div>';

        html += '</div>';
        html += '<div class="row gutter5 chdAgeDIV' + roomIndex + '"></div>';
        html += '</li>';
        $(html).appendTo($(".form-group-room"));
        //Re-apply the JQuery Select2 Plugin
        $("select.selector").select2();
        childAgeModifyDOM($("select[name=room" + roomIndex + "NoOfChild]"), roomIndex);
    }

    function removeRoomDOM(roomIndex) {
        $("#roomDIV" + roomIndex).remove();
    }


    function customRange(dates) {
        if (this.id == 'dateCheckin') {
            $('#dateCheckout').datepick('option', 'minDate', dates[0] || null);
        } else {
            $('#dateCheckin').datepick('option', 'maxDate', dates[0] || null);
        }
    }

    $('#dateCheckin,#dateCheckout').on('focus', function () {
        $(this).closest('.has-icon').addClass('dropdown-open');
        $('.dropdown-room').removeClass('open');
    });

    $('#dateCheckin,#dateCheckout').datepick({
        alignment: 'top',
        onSelect: customRange,
        minDate: $.datepick.today(),
        monthsToShow: 2,
        changeMonth: false,
        popupContainer: '.calendardaten',
        nextText: '',
        prevText: '',
        showAnim: '',
        onClose: function () {
            $('.has-icon').removeClass('dropdown-open');
        }
    });

    var msg = "";

    function searchEngineValidation($this) {
        var isValid = false;
        var cityId = $this.find('input[name=cityId]');
        var cityTitle = $this.find('input[name=cityTitle]');
        var nationalityId = $this.find('input[name=nationalityId]');
        var checkIn = $this.find('input[name=checkIn]');
        var checkOut = $this.find('input[name=checkOut]');
        var errorColor = '#d9534f';
        if (cityId.val() === 'undefined' || cityId.val() === '') {
            msg = "Please search and select a destination city";
            cityTitle.css({'border-color': '1px solid ' + errorColor});
            isValid = false;
        } else if (nationalityId.val() === 'undefined' || nationalityId.val() === '') {
            msg = "Residual nationality country is required.";
            nationalityId.css({'border-color': '1px solid ' + errorColor});
            isValid = false;
        } else if (checkIn.val() === 'undefined' || checkIn.val() === '') {
            msg = "Check-in date is required";
            checkIn.css({'border-color': '1px solid ' + errorColor});
            isValid = false;
        } else if (checkOut.val() === 'undefined' || checkOut.val() === '') {
            msg = "Check-out date is required";
            checkOut.css({'border-color': '1px solid ' + errorColor});
            isValid = false;
        } else {
            isValid = true;
            cityId.removeAttr('style');
            cityTitle.removeAttr('style');
            checkIn.removeAttr('style');
            checkOut.removeAttr('style');
            msg = "";

        }
        return isValid;
    };

    $.fn.queryHotelXhr = function (url, data, btn, isHotel, funcResponse) {
        // (function () {
        $.ajax({
            url: url,
            data: data,
            dataType: 'JSON',
            type: 'GET',
            // async: false,
            cache: false,
            beforeSend: function () {
                btn.addClass('disabled');
            },
            success: function (response) {
                if (response.rewriteKeyCount <= response.completeRewriteKeyCount) {
                    funcResponse(response)
                } else
                    return $(this).queryHotelXhr(url, data, btn, isHotel, funcResponse);
            },
            complete: function () {
                btn.removeClass('disabled');
            },
            error: function () {
                NProgress.done();
                return false;
            }
        });
        // })()
    }

    $("form[name=hotelSearch]").on('submit', function (e) {
        //perform validation to ensure the user selected the right fields.
        var data = $(this).serialize();
        if (searchEngineValidation($(this))) {
            var btn = $(this).find('button[type=submit]');
            btn.html('<i class="fa fa-spinner fa-spin"></i> Loading...');
            btn.removeClass('arrow-right');
            $('body').focus();
            //query the web-service API
            NProgress.start();
            $(this).queryHotelXhr(HOTEL_SEARCH_API, data, btn, false, function (response) {
                btn.addClass('arrow-right');
                btn.html("FIND HOTELS");
                console.log(response);
                window.location.href = "/hotel/search-result?" + data;
            });
            btn.removeClass('disabled');
            btn.html('FIND HOTELS');
            btn.addClass('arrow-right');
        } else {
            $.growl.error({
                title: "Field Required",
                message: msg
            });
        }
        return false;
    });


})();