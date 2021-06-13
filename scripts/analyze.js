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

        if (res[1].trim() == 'false' && !inArr(themes, theme))
            themes.push(theme);
    });
    displayThemes();
}

function displayThemes() {
    themes.forEach(function(theme){
        $("#mistakes").append(`<li>${theme}</li>`);
    });
}
/*if () {
    $("#cityContainer").append($("#businessCityTarget option:selected").text() + "<br>");
    citySet.push($("#businessCityTarget option:selected").text());
}*/