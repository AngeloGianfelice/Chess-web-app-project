console.log('Initializing server ...');
const express=require('express');
const path=require('path');
const puppeteer=require('puppeteer');

const app=express();
app.use(express.json());
const port = process.env.PORT || 8080;
const ejs = require("ejs");

//package cifratura password
const bcrypt = require('bcrypt');
const saltRounds = 12;

//database packages
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://lewis:cjb07@cluster0.ysajr.mongodb.net/databaseUtenti", { useUnifiedTopology: true, useNewUrlParser: true });

/*****************FORNISCO AL CLIENT SOLO I FILE STATICI(cartella public) E I ********************
*********************** PACCHETTI NPM CHE MI SERVONO(tramite redirect) ***************************/
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,"/public")));
app.use('/bootstrap',express.static(path.join(__dirname,"/node_modules/bootstrap")));
app.use('/jquery',express.static(path.join(__dirname,"/node_modules/jquery")));
app.use('/chess.js',express.static(path.join(__dirname,"/node_modules/chess.js")));
app.use('/chessboardjs',express.static(path.join(__dirname,"/node_modules/@chrisoakman/chessboardjs")));
app.use(express.static(path.join(__dirname,"/views")));

const schemaUtente = {
    username: String,
    password: String,
    datiPartite: Array
}
const utente = mongoose.model("User", schemaUtente);

app.get("/", (req, res) => {
    res.render("index.ejs", { erroreReg: false, erroreLogin: false });
});

app.post("/registrazione", verificaRegistrazione, async (req, res) => {
    const { password, username } = req.body;
    await bcrypt.hash(password, saltRounds, async function (err, hash) {
        if (err) console.log(err);

        const user = new utente({
            username: username,
            password: hash,
            datiPartite: [
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 },
                { vittorie: 0, sconfitte: 0, pareggi: 0 }
            ]
        });
        user.save()
            .then((val) => {
                // utente.find({}).then((val)=>{console.log("primaStampa:",val)});
                return res.redirect(`/logged/${username}?query=1`);
            });
    });

});
//query al db per registrare e per controllare se esiste gia
async function verificaRegistrazione(req, res, next) {
    let username = req.body.username;

    const query = await utente.find({ username: username });
    console.log(query);
    //se la query va a buon fine  
    if (query.length === 0) return next();
    //altrimenti
    res.render("index.ejs", { erroreReg: true, erroreLogin: false });
};
//1a route quando viene inviato il form del login 
app.post("/login", verificaLogin, (req, res) => {
    //verifichiamo se c'è il match
    const { username } = req.body;
    res.redirect(`/logged/${username}`);
});
//query al db per verificare il login
async function verificaLogin(req, res, next) {

    const { username, password } = req.body;
    //prova a cercare l'username nel database
    const query = await utente.findOne({ username: username });

    //se username sbagliato
    if (!query) return res.render("index.ejs", { erroreReg: false, erroreLogin: true });

    //se username giusto controlla la password e confrontala con quella hashata
    const hashPws = query.password;
    const verificaLogin = await bcrypt.compare(password, hashPws);

    //se giusta prosegui
    if (verificaLogin) return next();

    //altrimenti ritorna errore login
    res.render("index.ejs", { erroreReg: false, erroreLogin: true })
}
//2a route del login per reindirizzare l'utente in caso di esito positivo e dopo la registrazione
app.get("/logged/:username", verificaLog, async (req, res) => {

    const { username } = req.params;
    const { datiPartite } = await utente.findOne({ username: username });
    const winsPercentage = [];
    for (livello of datiPartite) {
        let calcolo = (livello.sconfitte+livello.vittorie+livello.pareggi);
        console.log(calcolo);
        if (calcolo === 0){
         winsPercentage.push(0);
         continue;
        }
        winsPercentage.push(Math.floor(livello.vittorie/calcolo*100));
    }
    res.render("logged.ejs", { erroreReg: false, username: username, erroreLogin: false, statistiche: datiPartite, winsPercentage:winsPercentage });
});
async function verificaLog(req, res, next) {
    const { username } = req.params;
    const { query: num } = req.query;
    const query = await utente.findOne({ username: username });
    if (query || num == 1) {
        return next();
    } else {
        res.send("sei un limit tester, mi piace la tua personalita");
    }
}

app.get("/game", (req, res) => {
    const { username } = req.query;
    res.render("game.ejs", { username: username })
});

//aggiornamento statistiche alla fine di ogni partita classificata
//TODO
app.post("/updateStats", async (req, res) => {
    const { username } = req.query;
    const { livello, risultato } = req.body;

    //visualizziamo le vittorie/sconfitte correnti
    const rigaDaAggiornare = `datiPartite.${livello}.${risultato}`;
    const dati = await utente.findOneAndUpdate({ username: username }, { $inc: { [rigaDaAggiornare]: 1 } }, { new: true });
    console.log(dati);
});

app.post('/', (req,res)=>{
    res.sendFile(path.join(__dirname,"public/config/openings_data.json"));
})

app.post('/fide', async (req,res)=>{
    const scraped = await scrapesite("https://www.fide.com/news").catch(err => {
        console.log(err);
});
    res.json(scraped);
})

app.listen(port,(error)=>{
    if(error){
        console.log("Errore nell'inizializzazione del server");
    }else{
    console.log("listening on port: ",port);
    }
})
async function scrapesite(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const [e1]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[1]/a/img");
    const [e2]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[2]/a/img");
    const [e3]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[1]/a/div[1]/img");
    const [e4]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[2]/a/div[1]/img");
    const [e5]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[3]/a/div[1]/img");
    const [l1]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[1]/a");
    const [l2]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[2]/a");
    const [l3]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[1]/a");
    const [l4]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[2]/a");
    const [l5]= await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[3]/a");

    const param1= await getproperties(e1,l1);
    const param2= await getproperties(e2,l2);
    const param3= await getproperties(e3,l3);
    const param4= await getproperties(e4,l4);
    const param5= await getproperties(e5,l5);

    const srcTxt1=param1.srcTxt;
    const titleTxt1=param1.titleTxt;
    const link1=param1.linkTxt;
    const srcTxt2=param2.srcTxt;
    const titleTxt2=param2.titleTxt;
    const link2=param2.linkTxt;
    const srcTxt3=param3.srcTxt;
    const titleTxt3=param3.titleTxt;
    const link3=param3.linkTxt;
    const srcTxt4=param4.srcTxt;
    const titleTxt4=param4.titleTxt;
    const link4=param4.linkTxt;
    const srcTxt5=param5.srcTxt;
    const titleTxt5=param5.titleTxt;
    const link5=param5.linkTxt;
    browser.close();
    return {srcTxt1,titleTxt1,srcTxt2,titleTxt2,srcTxt3,titleTxt3,srcTxt4,titleTxt4,srcTxt5,titleTxt5,link1,link2,link3,link4,link5};
}
async function getproperties(Xpath,Lpath){
    const src=await Xpath.getProperty("src");
    const title= await Xpath.getProperty("title");
    const link= await Lpath.getProperty("href");
    const srcTxt=await src.jsonValue();
    const titleTxt=await title.jsonValue();
    const linkTxt=await link.jsonValue();
    return {srcTxt,titleTxt,linkTxt};

}