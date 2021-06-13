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

function setCompliance() {
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
        console.log(v);
        try {
            let re = new RegExp(v, 'i');
            match = match || re.test(val);
        } catch (err) {}
    });
    return match;
}
/* ======== */

/* Buttons */
function check() {
    $("input").each(function () {
        $(this).attr('disabled', true);
    });
    
    $("#vInp").css('background-color', checkInput() ? "yellowgreen" : "palevioletred")

    $(".right").each(function () {
        $(this).css('background-color', 'yellowgreen');
    });
    $(".wrong").each(function () {
        $(this).css('background-color', 'palevioletred');
    });
    $(".rAnswHide").each(function () {
        $(this).css('display', 'block');
    });
}

function next() {
    window.location.replace("?" + (q < questions.length-1 ? q + 1 : 0));
}

function rand() {
    window.location.replace("?" + randInt(0, questions.length));
}
/* ======= */
