fetchnews().catch(err => {
    console.log(err);
});

async function fetchnews() {
    //fetch news 
    const response = await fetch("/fide", { method: "POST", body: "application/json"});
    const file = await response.json();

    //aggiorno titoli e foto
    $('#foto1').attr('src', file.srcTxt1);
    $('#titolo1').text(file.titleTxt1);
    $('#foto2').attr('src', file.srcTxt2);
    $('#titolo2').text(file.titleTxt2);
    $('#foto3').attr('src', file.srcTxt3);
    $('#titolo3').text(file.titleTxt3);
    $('#foto4').attr('src', file.srcTxt4);
    $('#titolo4').text(file.titleTxt4);
    $('#foto5').attr('src', file.srcTxt5);
    $('#titolo5').text(file.titleTxt5);
    //aggiorno link
    $('#link1').attr('href', file.link1);
    $('#link2').attr('href', file.link2);
    $('#link3').attr('href', file.link3);
    $('#link4').attr('href', file.link4);
    $('#link5').attr('href', file.link5);
    $('.loader').css("display", "none");

    //fetch ratings 
    const rating_table= await fetch('/ratings', { method: "POST", body: "application/json"});
    const file_table = await rating_table.json();
    //#1 riga
    $('.table td').eq(1).html(file_table.primo[0]);
    $('#img1').attr('src',file_table.primo[1])
    $('#text1').text(file_table.primo[2]);
    $('.table td').eq(3).html(file_table.primo[3]);
    //#2 riga
    $('.table td').eq(5).html(file_table.secondo[0]);
    $('#img2').attr('src',file_table.secondo[1])
    $('#text2').text(file_table.secondo[2]);
    $('.table td').eq(7).html(file_table.secondo[3]);
    //#3 riga
    $('.table td').eq(9).html(file_table.terzo[0]);
    $('#img3').attr('src',file_table.terzo[1])
    $('#text3').text(file_table.terzo[2]);
    $('.table td').eq(11).html(file_table.terzo[3]);
    //#4 riga
    $('.table td').eq(13).html(file_table.quarto[0]);
    $('#img4').attr('src',file_table.quarto[1])
    $('#text4').text(file_table.quarto[2]);
    $('.table td').eq(15).html(file_table.quarto[3]);
    //#5 riga 
    $('.table td').eq(17).html(file_table.quinto[0]);
    $('#img5').attr('src',file_table.quinto[1])
    $('#text5').text(file_table.quinto[2]);
    $('.table td').eq(19).html(file_table.quinto[3]);
    //#6 riga
    $('.table td').eq(21).html(file_table.sesto[0]);
    $('#img6').attr('src',file_table.sesto[1])
    $('#text6').text(file_table.sesto[2]);
    $('.table td').eq(23).html(file_table.sesto[3]);
    //#7 riga
    $('.table td').eq(25).html(file_table.settimo[0]);
    $('#img7').attr('src',file_table.settimo[1])
    $('#text7').text(file_table.settimo[2]);
    $('.table td').eq(27).html(file_table.settimo[3]);
    //#8 riga
    $('.table td').eq(29).html(file_table.ottavo[0]);
    $('#img8').attr('src',file_table.ottavo[1])
    $('#text8').text(file_table.ottavo[2]);
    $('.table td').eq(31).html(file_table.ottavo[3]);
    //#9 riga 
    $('.table td').eq(33).html(file_table.nono[0]);
    $('#img9').attr('src',file_table.nono[1])
    $('#text9').text(file_table.nono[2]);
    $('.table td').eq(35).html(file_table.nono[3]);
    //#10 riga
    $('.table td').eq(37).html(file_table.decimo[0]);
    $('#img10').attr('src',file_table.decimo[1])
    $('#text10').text(file_table.decimo[2]);
    $('.table td').eq(39).html(file_table.decimo[3]);
    $('.mini').css("display", "none");

}


