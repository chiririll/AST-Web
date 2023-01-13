function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let checked = false;
let q = 0;
if (!isNaN(Number(window.location.href.split('?')[1])))
    q = Number(window.location.href.split('?')[1]);
if (q >= questions.length)
    q = 0;

$(document).ready(setData);


/* Making test */
function setData() {
    checked = false;
    $("#qid").text(q+1);
    $("#qcnt").text(questions.length);

    let progress = Math.floor(q/questions.length*100) + "%";
    $("#greenBar").text(Math.floor(q/questions.length*100) + "%");
    $("#greenBar").css('width', q/questions.length*100 + "%");
    
    $("#Q").text(questions[q]["task"]);
    $("#S").text(questions[q]["question"]);

    $(document).on('keypress',function(e) { if (e.which == '13') check(); });

    switch (questions[q]["type"]) {
        case "single":
        case "many":
            setSingleMany();
            break;
        case "enter":
            setInput();
            break
        case "compliance":
            setCompliance();
            break;
        case "order":
            setOrder();
            break;
        default:
            justDisplay();
    }
}

function setSingleMany() {
    var vars = questions[q]["opts"].sort(function(){
        return Math.random() - 0.5;
    });
    var type = questions[q]["type"] == "single" ? "radio" : "checkbox";
    vars.forEach(function(v, i) {
        el_class = v[1] ? "right" : "wrong";
        $("#answers").append(
            `<p class="${el_class}"><label><input type="${type}"` + (type == 'radio' ? ' onclick="check()"' : '') + `/>${v[0]}</label></p>`
        );
    });
}

function setInput() {
    $("#answers").append('<p id="varInp"><input id="vInp" type="text"/></p>');
    $("#answers").append('<p class="rAnswHide">Right answers:</p><ul id="answersInp" class="rAnswHide"></ul>');
    
    questions[q]["opts"].forEach(function(opt){
        $("#answersInp").append(`<li>${opt}</li>`);
    })
}

function toTitleCase(str)
{
    return str.charAt(0).toUpperCase() + str.substr(1);
}

function setCompliance()
{
    $("#answers").append(`<table id="ansTable"></table>`);
    
    let opts = questions[q]["opts"].sort(function(){
        return Math.random() - 0.5;
    });

    opts.forEach(function(opt, i) {
        $("#ansTable").append(`<tr><td>${i + 1}. ${toTitleCase(opt[0])}</td><td class="hidden-block">${opt[1]}</td></tr>`);
    });
}

function setOrder()
{
    let opts = questions[q]["opts"].sort(function(){
        return Math.random() - 0.5;
    });

    opts.forEach(function(opt){
        $("#answers").append(`<p><span class="hidden-block">${opt[0]}.</span> ${opt[1]}</p>`);
    });
}

function justDisplay() {
    questions[q]["opts"].forEach(function(opt) {
        $("#answers").append(`<p>${opt}</p>`);
    });
}
/* =========== */

/* Checking */
function checkInput() {
    let val = $("#vInp").val();
    if (!val) return false;

    let match = false;
    questions[q]['opts'].forEach(function(opt) {
        opt = opt.replaceAll('*', '.?').replaceAll("#$#", '.*');
        try {
            let re = new RegExp(opt, 'i');
            match = match || re.test(val);
        } catch (err) {}
    });
    return match;
}

function checkBox() {
    let match = true;
    let checked = 0;
    $("input:radio, input:checkbox").each(function() {
        if (this.checked) {
            if ($(this).parent().attr('class') == "right")
                match = match && true;
            else
                match = false;
            checked++;
        } else if ($(this).parent().attr('class') == "right")
            match = false;
    })
    if (checked == 0) return false;
    return match;
}
/* ======== */

/* Saving results */
function writeCookies(key, val) {
    document.cookie = key + '=' + val + '; max-age=604800';
}
/* ============== */

/* Buttons */
function check() {
    $("input").each(function () {
        $(this).attr('disabled', true);
    });
    
    if (questions[q]["type"] != "compliance" && questions[q]["type"] != "order")
    {
        let answ = checkInput() || checkBox();
        $("#vInp").css('background-color', answ ? "yellowgreen" : "palevioletred")
        writeCookies(q, answ);
    }

    $(".right").each(function () {
        $(this).css('background-color', 'yellowgreen');
    });
    $(".wrong").each(function () {
        $(this).css('background-color', 'palevioletred');
    });
    $(".rAnswHide").each(function () {
        $(this).css('display', 'block');
    });

    $(".hidden-block").removeClass("hidden-block");

    $("#check").prop('disabled', true);

    $("#next").prop('disabled', false);

    checked = true;
}

function next() {
    if (!checked)
        check();
    else
        window.location.href = "?" + (q < questions.length-1 ? q + 1 : 0);
}

function back()
{
    window.location.replace("?" + (q > 0 ? q - 1 : 0));
}

function rand() {
    window.location.href = "?" + randInt(0, questions.length);
}
function results() {
    window.location.replace("analyze.html?" + q);
}
/* ======= */
