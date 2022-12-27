function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let q = 0;
if (!isNaN(Number(window.location.href.split('?')[1])))
    q = Number(window.location.href.split('?')[1]);
if (q >= questions.length)
    q = 0;

$(document).ready(setData);


/* Making test */
function setData() {
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
        default:
            justDisplay();
    }
}

function setSingleMany() {
    var vars = questions[q]["vars"].sort(function(){
        return Math.random() - 0.5;
    });
    var type = questions[q]["type"] == "single" ? "radio" : "checkbox";
    vars.forEach(function(v, i) {
        text = v.split(':')[1].trim();
        el_class = v.split(':')[0].trim() == '+' ? "right" : "wrong";
        $("#answers").append(
            `<p class="${el_class}"><input type="${type}"` + (type == 'radio' ? ' onclick="check()"' : '') + `/>${text}</p>`
        );
    });
}

function setInput() {
    $("#answers").append('<p id="varInp"><input id="vInp" type="text"/></p>');
    $("#answers").append('<p class="rAnswHide">Right answers:</p><ul id="answersInp" class="rAnswHide"></ul>');

    for (i = 0; i < questions[q]["vars"].length / 2; i++) {
        $("#answersInp").append(`<li>${questions[q]["vars"][i].split(':')[1].trim()}</li>`);
    }
}

function setCompliance()
{
    $("#answers").append(`<table id="ansTable"></table>`);
    //$("#leftCol").append(`<details id="Ls"><summary>Left</summary></details>`);
    //$("#rigthCol").append(`<details id="Rs"><summary>Right</summary></details>`);

    lS = [];
    rS = [];

    questions[q]["vars"].forEach(function(v) {
        if (v[0] == 'R')
            rS.push(v);
        else if (v[0] == 'L')
            lS.push(v);
        else
            $("#answers").append(`<p>${v}</p>`);
    });

    for (let i = 0; i < Math.max(lS.length, rS.length); i++)
    {
        $("#ansTable").append(`<tr>` + `<td>` + (i < lS.length ? lS[i] : "") + `</td>` + `<td class="left-compliance">` + (i < rS.length ? rS[i] : "") + `</td>` + `</tr>`);
    }
}

function justDisplay() {
    questions[q]["vars"].forEach(function(v) {
        $("#answers").append(`<p>${v}</p>`);
    });
}
/* =========== */

/* Checking */
function checkInput() {
    let val = $("#vInp").val();
    if (!val) return false;

    let match = false;
    questions[q]['vars'].forEach(function(v) {
        v = v.split(':')[1].trim().replaceAll('*', '.?').replaceAll("#$#", '.*');
        try {
            let re = new RegExp(v, 'i');
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
    
    if (questions[q]["type"] != "compliance")
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

    $(".left-compliance").removeClass("left-compliance");
}

function next() {
    window.location.replace("?" + (q < questions.length-1 ? q + 1 : 0));
}

function rand() {
    window.location.replace("?" + randInt(0, questions.length));
}
function results() {
    window.location.replace("analyze.html?" + q);
}
/* ======= */
