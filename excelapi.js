function excel2api(modelflag) {
    var environmentStringExcel2Api = location.hostname;
    var excelrapiurl;
    var environment;
    if (environmentStringExcel2Api.indexOf("qa") >= 0) {
        excel2apiurl =
            'https://o8yzfphaza.execute-api.us-east-1.amazonaws.com/qa/71202C/calculate';
        environment = 'qa';
    }
    else if (environmentStringExcel2Api.indexOf("qc") >= 0) {
        excel2apiurl =
            'https://x2gi8xxxe0.execute-api.us-east-1.amazonaws.com/qc/71202C/calculate';
        environment = 'qc';
    }
    else if (environmentStringExcel2Api.indexOf("127.0.0.1") >= 0) {
        excel2apiurl =
            'https://o8yzfphaza.execute-api.us-east-1.amazonaws.com/qa/71202C/calculate';
        environment = 'rs';
    }
    else if (environmentStringExcel2Api.indexOf("localhost") >= 0) {
        excel2apiurl =
            'https://o8yzfphaza.execute-api.us-east-1.amazonaws.com/qa/71202C/calculate';
        environment = 'localhost';
    }
    else {
        excel2apiurl =
            'https://7rltzf59a3.execute-api.us-east-1.amazonaws.com/prod/71202C/calculate';
        environment = 'production';
    }

    var excelfilename = 'calc';


    var cd = {};

    // Screen inputs

    //cd['input_DataAsOfDt'] = $("#dateHead").val();
    //cd['input_relo'] = $("#dateHead").val();

    cd['input_dmedplan'] = $("#dmedplan").val();
    cd['input_dmedcov'] = $("#dmedcov").val();
    cd['input_dhsacontee'] = ($("#dmedplan").val().indexOf("HSA") >= 0) ? parseFloat(cleanInput($("#dhsacontee").val())) : 0;
    cd['input_ddenplan'] = 'DENTAL PLAN';   // hardcoded because we don't have a screen input
    cd['input_ddencov'] = $("#ddencov").val();
    cd['input_deepesprate'] = $("#deepesprate").val();




    // Data inputs

    var datainput = null;

    if (sessionStorage.getItem('SSOData')) {
        datainput = JSON.parse(sessionStorage.getItem('SSOData')).input_data;
    }


    // Data inputs
    cd['input_BASESAL'] = parseFloat(datainput['input_BASESAL']);
    cd['input_DataAsOfDt'] = datainput['input_DataAsOfDt'];
    //cd['input_EEID'] = datainput['input_EEID'];
    cd['input_CARALLOW'] = parseFloat(datainput['input_CARALLOW']) || 0;
    cd['input_CELLSUB'] = parseFloat(datainput['input_CELLSUB']);
    cd['input_COMMTARG'] = parseFloat(datainput['input_COMMTARG']);
    cd['input_COMPCAR'] = parseFloat(datainput['input_COMPCAR']);
    cd['input_NQDC'] = parseFloat(datainput['input_NQDC']);
    cd['input_RELO'] = parseFloat(datainput['input_RELO']);
    cd['input_SHIFTDIFF'] = parseFloat(datainput['input_SHIFTDIFF']);
    cd['input_SIGNON'] = parseFloat(datainput['input_SIGNON']);
    cd['input_STATE'] = datainput['input_STATE'];
    cd['input_TARGBONUS'] = parseFloat(datainput['input_TARGBONUS']);
    cd['input_TBPCT'] = parseFloat(datainput['input_TBPCT']);
    cd['input_TECHSUB'] = parseFloat(datainput['input_TECHSUB']);
    cd['input_partfullind'] = datainput['input_partfullind'];

    // end Data inputs


    // console.log('API Input: ' + JSON.stringify(cd));

    //console.log('myurl: ' + excel2apiurl);

    $.ajax({
        'type': 'POST',
        'url': excel2apiurl,
        'data': JSON.stringify(cd),
        'success': function (data, status) {
            //console.log('API Output:' + JSON.stringify(data));
            sessionStorage.setItem('Output', JSON.stringify(data));

            showResults(modelflag);

            $('#load').hide();

        },
        'complete': function () {
            //$('.ajax_loader').hide();
        },
        'error': function (jqXHR, textStatus, errorThrown) {
            console.log('request failed: status: ' + jqXHR.status + " | text: " + textStatus + " | error: " + errorThrown);
        },
        'failure': function (errMsg) {
            alert(errMsg);
        }
    });
}


function enablePersistentRewardsTooltip(chart) {
    var activeSlice = null;
    var dismissTimer = null;
    var hideBalloon = chart.hideBalloon;
    var handleMouseDown = chart.handleMouseDown;

    // amCharts cancels mousedown to prevent chart dragging. Let the browser
    // handle presses on tooltip text so users can select and copy it.
    chart.handleMouseDown = function (event) {
        var tooltipNode = chart.balloon.textDiv;
        if (tooltipNode && event && tooltipNode.contains(event.target)) return;
        handleMouseDown.call(chart, event);
    };

    // Keep the native balloon visible when amCharts handles mouseout.
    chart.hideBalloon = function () {
        if (!activeSlice) hideBalloon.call(chart);
    };
    chart.addListener('rollOverSlice', function (event) {
        clearTimeout(dismissTimer);
        activeSlice = event.dataItem.value > 0 ? event.dataItem : null;
        if (activeSlice) dismissTimer = setTimeout(dismissTooltip, 3000);
    });

    function dismissTooltip() {
        clearTimeout(dismissTimer);
        dismissTimer = null;
        activeSlice = null;
        clearTimeout(chart.balloonTO);
        clearTimeout(chart.hoverInt);
        chart.balloon.hide(0);
    }

    function handleClick(event) {
        if (!activeSlice) return;
        var sliceNode = activeSlice.wedge && activeSlice.wedge.node;
        var tooltipNode = chart.balloon.textDiv;
        if ((sliceNode && sliceNode.contains(event.target)) ||
            (tooltipNode && tooltipNode.contains(event.target))) return;
        dismissTooltip();
    }

    function handleKeydown(event) {
        if (event.key === 'Escape') dismissTooltip();
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown);
    chart.disposePersistentTooltip = function () {
        dismissTooltip();
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('keydown', handleKeydown);
        chart.hideBalloon = hideBalloon;
        chart.handleMouseDown = handleMouseDown;
    };
}

function labelRewardsChartSvg(event) {
    var chart = event.chart;
    var svg = chart.chartDiv.querySelector('svg');
    if (!svg) return;

    var title = svg.querySelector('title');
    if (!title) {
        title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        svg.insertBefore(title, svg.firstChild);
    }
    var description = svg.querySelector('desc');
    if (!description) {
        description = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
        svg.appendChild(description);
    }

    title.id = chart.div.id + '-title';
    title.textContent = 'Total rewards in year 1: ' + chart.allLabels[0].text;
    description.id = chart.div.id + '-description';
    description.textContent = chart.dataProvider.map(function (slice) {
        var label = slice.label.charAt(0) + slice.label.slice(1).toLowerCase();
        return label + ': ' + fmtCurrency(slice.value, 0);
    }).join('. ') + '.';
    svg.setAttribute('role', 'img');
    svg.setAttribute('focusable', 'false');
    svg.removeAttribute('tabindex');
    svg.setAttribute('aria-labelledby', title.id);
    svg.setAttribute('aria-describedby', description.id);
}

function showResults(modelflag) {

    var lang = "E"; // (selectedUICulture.toLowerCase() == "en-us")?"E":"S";

    var inputdata = JSON.parse(sessionStorage.getItem("SSOData")).input_data;
    var outputdata = JSON.parse(sessionStorage.getItem('Output'));

    //Welcome employee name _AK
    // document.getElementById("txtempName").innerHTML=inputdata.input_FNAME +' '+inputdata.input_LNAME;
    //Welcome employee name added by Ishan
    document.getElementById("bannerGreeting").innerHTML = inputdata.input_FNAME + '!';
    //

    //chart & chart table items
    var slice1 = (lang == "E") ? "TOTAL CASH COMPENSATION" : " ";
    var slice2 = (lang == "E") ? "HEALTH & WELL-BEING" : " ";
    var slice3 = (lang == "E") ? "FINANCIAL SECURITY & SUPPORT" : " ";


    var totalValue = 0;
    var spansubtot_Paydata = Math.round(outputdata.output_ctotcomp);
    var spansubtot_Savdata = Math.round(outputdata.output_ctothealth);
    var spansubtot_Flexdata = Math.round(outputdata.output_ctotinsur);

    var spantot_compdata = Math.round(outputdata.output_ctotrewards);

    document.getElementById('subtotal_Pay_1').innerHTML = fmtCurrency(spansubtot_Paydata, 0);
    document.getElementById('subtotal_Sav_1').innerHTML = fmtCurrency(spansubtot_Savdata, 0);
    document.getElementById('ctotinsur').innerHTML = fmtCurrency(spansubtot_Flexdata, 0);

    var totalInvestment = parseInt(spantot_compdata);
    document.getElementById('totalValue').innerHTML = fmtCurrency(totalInvestment, 0);

    var v1 = parseFloat(spansubtot_Paydata);
    var v2 = parseFloat(spansubtot_Savdata);
    var v3 = parseFloat(spansubtot_Flexdata);
    //var v4 = parseFloat(spansubtot_Retbendata);  // not used
    //var v5 = parseFloat(spansubtot_Reservedata);  // not used
    var totalValue = parseFloat(spantot_compdata);

    data = {
        "chartId": "ytrStatement",
        "label": fmtCurrency(totalValue, 0),
        "data": [{
            label: slice1,
            value: v1,
            class: 'tds-chart-color-1'
        }, {
            label: slice2,
            value: v2,
            class: 'tds-chart-color-2'
        }, {
            label: slice3,
            value: v3,
            class: 'tds-chart-color-3'
        }
        ]
    };

    var _chart = false;
    var _innerRadius = data.innerRadius ? data.innerRadius : "80";

    if (lang == "E") {
        var _balloon = data.format == "%" ? "[[title]]<br/><b>[[value]]%</b>" : "[[title]]<br/><b>$[[value]]</b>";
    } else {
        var _balloon = data.format == "%" ? "[[title]]<br/><b>[[value]] %</b>" : "[[title]]<br/><b>[[value]] $</b>";
    }

    var _initChart = function () {
        var chartElement = document.getElementById(data.chartId);
        _chart = chartElement.rewardsChart;
        if (_chart) {
            _chart.disposePersistentTooltip();
            _chart.clear();
        }
        _chart = AmCharts.makeChart(data.chartId, {
            // In bundled amCharts 3.15.1, brr creates an empty credit anchor
            // on every redraw. Disable it for this rewards chart instance.
            brr: function () {},
            listeners: [{ event: 'drawn', method: labelRewardsChartSvg }],
            type: "pie",
            autoResize: true,
            balloonText: _balloon,
            innerRadius: _innerRadius + "%",
            labelsEnabled: false,
            autoMargins: false,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 5,
            marginRight: 5,
            startDuration: 0,
            pullOutRadius: 0,
            addClassNames: true,
            fontFamily: "Thrive",
            titleField: "label",
            valueField: "value",
            classNameField: "class",
            allLabels: [{
                y: "40%",
                align: "center",
                size: 22,
                text: data.label
            }],
            balloonFunction: function (item, content) {
                if (lang == "E") { return content }
                else {
                    return content.replace(",", " ")
                }
            },
            balloon: {
                fixedPosition: true,
                disableMouseEvents: false,
                borderAlpha: 0,
                borderThickness: 0,
                fillColor: "#ffffff",
                fillAlpha: .9,
                maxWidth: 200,
                fontSize: 14,
                cornerRadius: 10,
                horizontalPadding: 10,
                verticalPadding: 20,
                color: "#36404b"
            },
            dataProvider: data.data
        });
        enablePersistentRewardsTooltip(_chart);
        chartElement.rewardsChart = _chart;
    }
    setTimeout(_initChart, 100);

    document.getElementById('chartext1').innerHTML = v1 == 0 ? '' : slice1;
    document.getElementById('charvalue1').innerHTML = v1 == 0 ? '' : fmtCurrency(v1, 0);
    document.getElementById('chartext2').innerHTML = v2 == 0 ? '' : slice2;
    document.getElementById('charvalue2').innerHTML = v2 == 0 ? '' : fmtCurrency(v2, 0);

    document.getElementById('chartext3').innerHTML = v3 == 0 ? '' : slice3;
    document.getElementById('charvalue3').innerHTML = v3 == 0 ? '' : fmtCurrency(v3, 0);


    // document.getElementById('totalValue').innerHTML= fmtCurrency(totalValue,0) ;


    if (v1 == 0) {
        document.getElementById('val1').style.display = 'none';
    }
    if (v2 == 0) {
        document.getElementById('val2').style.display = 'none';
    }
    if (v3 == 0) {
        document.getElementById('val3').style.display = 'none';
    }

    // end chart & table

    // screen values

    // circles  
    var circle1 = Math.round(outputdata.output_cbencostpctco * 10000) / 100;
    var circle2 = Math.round(outputdata.output_cbencostpctee * 10000) / 100;
    $("#otsPay1").html(circle1 + "%");
    $("#otsPay2").html("<small>" + circle2 + "%" + "</small>");
    // console.log(circle1,circle2)
    if (circle1 >= circle2) {
        $("#centreCircleBig").css("width", "80px");
        $("#centreCircleBig").css("height", "80px");
        $("#otsPay1 small").css("font-size", "100%");
        $("#centreCircleSmall").css("width", 80 - (50 - circle2) + "px");
        $("#centreCircleSmall").css("height", 80 - (50 - circle2) + "px");
        $("#otsPay2 small").css("font-size", 100 - (50 - circle2) + "%");
        $("#otsPayText2").css("margin-top", Math.max(10, Math.min(20, (circle2 - 15))) + "px"); // min/max probably not necessary
    } else {
        $("#centreCircleSmall").css("width", "80px");
        $("#centreCircleSmall").css("height", "80px");
        $("#otsPay2 small").css("font-size", "100%");
        $("#centreCircleBig").css("width", 80 - (50 - circle1) + "px");
        $("#centreCircleBig").css("height", 80 - (50 - circle1) + "px");
        $("#otsPay1 small").css("font-size", 100 - (50 - circle1) + "%");
        $("#otsPayText1").css("margin-top", Math.max(10, Math.min(20, (circle1 - 15))) + "px"); // min/max probably not necessary
    }
    $("#centreCircleBig,#centreCircleSmall").css("border-radius", "100%");

    // Show hide 

    if (outputdata.output_flag_techsub == "hide") {
        $(".TAPStipend.row").hide();
    } else {
        $(".TAPStipend.row").show();
    }

    if (outputdata.output_flag_compcar == "hide") {
        $(".CompanyCarrow.row").hide();
    } else {
        $(".CompanyCarrow.row").show();
    }

    if (outputdata.output_flag_cellsub == "hide") {
        $(".Cellstipend.row").hide();
    } else {
        $(".Cellstipend.row").show();
    }

    if (outputdata.output_flag_shiftdiff == "hide") {
        $(".ShiftDifferentialrow.row").hide();
    } else {
        $(".ShiftDifferentialrow.row").show();
    }

    if (outputdata.output_flag_carallow == "hide") {
        $(".CarAllowance.row").hide();
    } else {
        $(".CarAllowance.row").show();
    }

    if (outputdata.output_flag_signon == "hide") {
        $(".SignOnBonus.row").hide();
    } else {
        $(".SignOnBonus.row").show();
    }

    if (outputdata.output_flag_relo == "hide") {
        $(".Relocation.row").hide();
    } else {
        $(".Relocation.row").show();
    }

    if (outputdata.output_flag_commtarg == "hide") {
        $(".Commisiontarget.row").hide();
    } else {
        $(".Commisiontarget.row").show();
    }

    if (outputdata.output_flag_targbonus == "hide") {
        $(".ShortTermIncentivePlanrow").hide();
    } else {
        $(".ShortTermIncentivePlanrow").show();
    }

    if (outputdata.output_flag_NQDC == "hide") {
        $(".NQDCrow.row").hide();
    } else {
        $(".NQDCrow.row").show();
    }

    if (outputdata.output_flag_chsacont == "hide") {
        $(".HSAccount.row").hide();
    } else {
        $(".HSAccount.row").show();
    }

    // ??
    const output_display = [
        outputdata.output_flag_NQDC,
        outputdata.output_flag_chsacont,
        outputdata.output_flag_targbonus,
        outputdata.output_flag_commtarg,
        outputdata.output_flag_relo,
        outputdata.output_flag_signon,
        outputdata.output_flag_carallow,
        outputdata.output_flag_shiftdiff,
        outputdata.output_flag_cellsub,
        outputdata.output_flag_compcar,
        outputdata.output_flag_techsub,
        inputdata.input_TBPCT
    ];
    //console.table(output_display);
    //console.log("input_tbpct : " + inputdata.input_TBPCT);

    //  show hide data end here



    //console.log("test: ",inputdata)
    $('#txtempName').html(inputdata.input_FNAME + " " + inputdata.input_LNAME);
    $('#greeting').html(inputdata.input_FNAME + " " + inputdata.input_LNAME);
    $("#cbencostco").html(fmtCurrency(Math.round(outputdata.output_cbencostco * 100) / 100, 0));
    var recordDate = new Date(inputdata.input_DataAsOfDt);
    $("#dateHead span").text(recordDate.getMonth() + 1 + "/" + recordDate.getUTCDate() + "/" + recordDate.getFullYear());
    $("#pruPay1").html((Math.round(outputdata.output_cbencostpctco * 10000) / 100) + "%");
    $("#pruPay2").html("<small>" + (Math.round(outputdata.output_cbencostpctee * 10000) / 100) + "%") + "</small>";
    $("#spanPay1").html(fmtCurrency(Math.round(inputdata.input_BASESAL * 100) / 100, 0));
    $(".supppay").html(fmtCurrency(Math.round(outputdata.output_csupppay * 100) / 100, 0));
    $(".cash_co").html(fmtCurrency(Math.round(outputdata.output_ccbcont * 100) / 100, 0));

    //Cash Compensation
    $("#targbonus").html(fmtCurrency(Math.round(inputdata.input_TARGBONUS * 100) / 100, 0));
    $("#tbpct").html(inputdata.input_TBPCT);
    $("#COMMTARG").html(fmtCurrency(Math.round(inputdata.input_COMMTARG * 100) / 100, 0));
    $("#flag_signon").html(fmtCurrency(Math.round(inputdata.input_SIGNON * 100) / 100, 0));
    $("#relo").html(fmtCurrency(Math.round(inputdata.input_RELO * 100) / 100, 0));
    $("#CARALLOW").html(fmtCurrency(Math.round(inputdata.input_CARALLOW * 100) / 100, 0));
    $("#COMPCAR").html(fmtCurrency(Math.round(inputdata.input_COMPCAR * 100) / 100, 0));
    $("#SHIFTDIFF").html(fmtCurrency(Math.round(inputdata.input_SHIFTDIFF * 100) / 100, 0));
    $("#CELLSUB").html(fmtCurrency(Math.round(inputdata.input_CELLSUB * 100) / 100, 0));
    $("#TECHSUB").html(fmtCurrency(Math.round(inputdata.input_TECHSUB * 100) / 100, 0));
    //end Cash Compensation


    //Health Care & Accounts
    $("#cmedcostco").html(fmtCurrency(Math.round(outputdata.output_cmedcostco * 100) / 100, 0));
    $("#cmedcostee").html(fmtCurrency(Math.round(outputdata.output_cmedcostee * 100) / 100, 0));
    $("#output_chsacontco").html(fmtCurrency(Math.round(outputdata.output_chsacontco * 100) / 100, 0));
    $("#output_dhsacontee").html(fmtCurrency(Math.round(outputdata.output_dhsacontee * 100) / 100, 0));
    $("#HSAmedplan").html(inputdata.input_dmedplan);
    $("#HSAmedcov").html(inputdata.output_dmedcov);
    $("#cdencostco").html(fmtCurrency(Math.round(outputdata.output_cdencostco * 100) / 100, 0));
    $("#cdencostee").html(fmtCurrency(Math.round(outputdata.output_cdencostee * 100) / 100, 0));
    $("#ddenplan").html(inputdata.input_ddenplan);
    $("#ddencov").html(inputdata.input_ddencov);




    //  FINANCIAL SECURITY & SUPPORT

    $("#cerpesp").html(fmtCurrency(Math.round(outputdata.output_cerpesp * 100) / 100, 0));
    $("#ceepesp").html(fmtCurrency(Math.round(outputdata.output_ceepesp * 100) / 100, 0));
    $("#NQDC").html(fmtCurrency(Math.round(inputdata.input_NQDC * 100) / 100, 0));
    $("#csocsecco").html(fmtCurrency(Math.round(outputdata.output_csocsecco * 100) / 100, 0));
    $("#csocsecee").html(fmtCurrency(Math.round(outputdata.output_csocsecee * 100) / 100, 0));
    $("#cbaslifaddco").html(fmtCurrency(Math.round(outputdata.output_cbaslifaddco * 100) / 100, 0));
    $(".cbaslifeamt").html(fmtCurrency(Math.round(outputdata.output_cbaslifeamt * 100) / 100, 0));
    $(".cbasaddamt").html(fmtCurrency(Math.round(outputdata.output_cbasaddamt * 100) / 100, 0));
    $(".cbtravcostco").html(fmtCurrency(Math.round(outputdata.output_cbtravcostco * 100) / 100, 0));
    $(".cbtravamt").html(fmtCurrency(Math.round(outputdata.output_cbtravamt * 100) / 100, 0));
    $("#cstdcostco").html(fmtCurrency(Math.round(outputdata.output_cstdcostco * 100) / 100, 0));
    $(".cstd100").html(outputdata.output_cstd100);
    $(".cstd70").html(outputdata.output_cstd70);
    $("#cltdcostco").html(fmtCurrency(Math.round(outputdata.output_cltdcostco * 100) / 100, 0));
    $("#cltdcostee").html(outputdata.output_cltdcostee);
    $(".cltdamttot").html(fmtCurrency(Math.round(outputdata.output_cltdamttot * 100) / 100, 0));


    //  FINANCIAL SECURITY & SUPPORT end here

    $(".container").removeClass("d-none"); // our page is not visible until the API has successfully executed and displayed all results.
    $(".loadingbg").addClass("d-none");

}
