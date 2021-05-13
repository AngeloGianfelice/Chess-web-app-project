fetchnews().catch(err =>{
    console.log(err);
});
async function fetchnews(){
    const response = await fetch("/fide",{method:"POST", body:"application/json"});
    const text= await response.text();
    var file= JSON.parse(text);
    $('#foto1').attr('src',file.srcTxt1);
    $('#titolo1').text(file.titleTxt1);
    $('#foto2').attr('src',file.srcTxt2);
    $('#titolo2').text(file.titleTxt2);
    $('#foto3').attr('src',file.srcTxt3);
    $('#titolo3').text(file.titleTxt3);
    $('#foto4').attr('src',file.srcTxt4);
    $('#titolo4').text(file.titleTxt4);
    $('#foto5').attr('src',file.srcTxt5);
    $('#titolo5').text(file.titleTxt5);
    //titolo
    $('#link1').attr('href',file.link1);
    $('#link2').attr('href',file.link2);
    $('#link3').attr('href',file.link3);
    $('#link4').attr('href',file.link4);
    $('#link5').attr('href',file.link5);
    $('.loader').css("display","none");
}

