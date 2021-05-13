var board1=ChessBoard("myBoard1",'start');
var board2=ChessBoard("myBoard2",'start');
var board3=ChessBoard("myBoard3",'start');
function display_opening(id){
    catchdata(id).catch(error =>{
        console.log(error);
    });
}
async function catchdata(id){
    const response = await fetch("/",{method:"POST", body:"application/json"});
    const text= await response.text();
    var file= JSON.parse(text);
    const nome=document.getElementById(id).value;
    const fen=file.aperture[nome].fen;
    if(id==='#1.e4'){
        board1.position(fen);
        $('.h21').css("display","block");
        $('#nome1').text(nome);
        $('#nome1').css("display","block");
        $('#descrizione1').text(file.aperture[nome].descrizione);
        $('#descrizione1').css("display","block");
    }else if(id==='#1.d4'){
        board2.position(fen);
        $('.h22').css("display","block");
        $('#nome2').text(nome);
        $('#nome2').css("display","block");
        $('#descrizione2').text(file.aperture[nome].descrizione);
        $('#descrizione2').css("display","block");
    }
    else{
        board3.position(fen);
        $('.h23').css("display","block");
        $('#nome3').text("nome");
        $('#nome3').css("display","block");
        $('#descrizione3').text(file.aperture[nome].descrizione);
        $('#descrizione3').css("display","block");
    }
}
function svuota_scacchiera(id){
    if(id==='#1.e4'){
        board1.start();
        $('.h21').css("display","none");
        $('#nome1').css("display","none");
        $('#descrizione1').css("display","none");
    }else if(id==='#1.d4'){
        board2.start();
        $('.h22').css("display","none");
        $('#nome2').css("display","none");
        $('#descrizione2').css("display","none");
    }
    else{
        board3.start();
        $('.h23').css("display","none");
        $('#nome3').css("display","none");
        $('#descrizione3').css("display","none");
    }

}
    

