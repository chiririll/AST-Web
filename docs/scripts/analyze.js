let q = 0;
if (!isNaN(Number(window.location.href.split('?')[1])))
    q = Number(window.location.href.split('?')[1]);
if (q >= questions.length)
    q = 0;

function inArr(arr, el) {
    arr.forEach(function(arrEl) {
        if (arrEl == el)
            return true;
    });
    return false;
}


let themes = new Array;

$(document).ready(appendThemes);

function appendThemes() {
    document.cookie.split(';').forEach(function(kv) {
        let res = kv.split('=');
        let q = Number(res[0]);
        let theme = questions[q]['theme'];

        if (res[1].trim() == 'false' && !inArr(themes, theme)) {
            themes.push(`<a href="index.html?${q}">${q+1}).</a> ${theme}`);
        }
    });
    displayThemes();
}

function displayThemes() {
    themes.forEach(function(theme){
        $("#mistakes").append(`<li>${theme}</li>`);
    });
}

function returnTest() {
    window.location.replace("index.html?" + q);
}