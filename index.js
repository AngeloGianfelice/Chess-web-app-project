console.log('Initializing server ...');
const express=require('express');
const app=express();
app.use(express.json());
const port = process.env.PORT || 8080;
app.use(express.static(__dirname));
app.use(express.static("public"));

app.get('/', (req,res)=>{
    res.sendFile("index.html"); 
})

app.listen(port,(error)=>{
    if(error){
        console.log("Errore nell'inizializzazione del server");
    }else{
    console.log("listening on port: ",port);
    }
})