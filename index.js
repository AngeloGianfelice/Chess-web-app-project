console.log('Initializing server ...');

const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

//packages vari
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require("ejs");

//package cifratura password
const bcrypt = require('bcrypt');
const saltRounds = 12;

//database packages
const mongoose = require("mongoose");
const { allowedNodeEnvironmentFlags } = require('process');
mongoose.connect("mongodb+srv://lewis:cjb07@cluster0.ysajr.mongodb.net/databaseUtenti", { useUnifiedTopology: true, useNewUrlParser: true });
const schemaUtente = {
    username: String,
    password: String,
    datiPartite: Array
}
const utente = mongoose.model("User", schemaUtente);

/*****************FORNISCO AL CLIENT SOLO I FILE STATICI(cartella public) E I ********************
*********************** PACCHETTI NPM CHE MI SERVONO(tramite redirect) ***************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use('/bootstrap', express.static(path.join(__dirname, "/node_modules/bootstrap")));
app.use('/jquery', express.static(path.join(__dirname, "/node_modules/jquery")));
app.use('/chess.js', express.static(path.join(__dirname, "/node_modules/chess.js")));
app.use('/chessboardjs', express.static(path.join(__dirname, "/node_modules/@chrisoakman/chessboardjs")));
app.use(express.static(path.join(__dirname, "/views")));

//route
app.get("/", (req, res) => {
    res.render("index.ejs", { erroreReg: false, erroreLog: false });
});

//route utilizzata per il fetch delle aperture
app.post('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/config/openings_data.json"));
});

//route principale che gestisce registrazione e login nonché il flusso dell'applicazione
app.post("/accesso", async (req, res) => {
    //contrlla di che tipo di richiesta si tratta attraverso parametro di query
    const { typ } = req.query;
    const { username } = req.body;
    console.log("tipo richiesta:", typ);
    let risultato;
    if (typ === "registrazione") {
        risultato = await checkAndRegister(req, res);
    } else if (typ === "login") {
        risultato = await checkLogin(req, res);
    } else {
        return res.send("sei un limit tester, mi piace la tua personalita");
    }
    //se i dati sono stati inseriti correttamente (registrazione o login)
    if (risultato === true) {
        //calcolo della percentuale delle vittorie di un'utente se non ci sono stati errori
        const { datiPartite, password } = await utente.findOne({ username: username });
        const winsPercentage = calcolaWinPercentage(datiPartite);
        return res.render("logged.ejs", { username: username, password: password, statistiche: datiPartite, winsPercentage: winsPercentage });
    } else {
        //se esiste un'errore viene ritornata una stringa con il tipo di errore
        res.redirect(`/errore?error=${risultato}`);
    }
});

async function checkAndRegister(req, res) {
    /**
     * controlla se l'username gia esiste
     * e ritorna una stringa di errore, altrimenti
     *  effettua la registrazione con l'username indicato
     */
    const { password, username } = req.body;
    console.log("pws:", password, "username:", username);
    if (!password || !username) return "erroreReg";
    //controllo se esiste gia:
    const query = await utente.findOne({ username: username });
    //se username esiste gia
    if (query) return "erroreReg";
    //creazione password hashata
    const hashPws = await bcrypt.hash(password, saltRounds)

    const newUser = new utente({
        username: username,
        password: hashPws,
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
    await newUser.save();

    return true;
};

//route chiamata se l'utente inserisce dati sbagliati
app.get("/errore", (req, res) => {
    const paramQuery = req.query.error;
    console.log("errore:", paramQuery);
    if (paramQuery === "erroreLog") res.render("index.ejs", { erroreReg: false, erroreLog: true });
    if (paramQuery === "erroreReg") res.render("index.ejs", { erroreReg: true, erroreLog: false });
});

function calcolaWinPercentage(datiPartite) {
    /**  calcola percentuale vittorie a partire da un'array "datiPartite" 
    costituito da oggettiLetterali che hanno come chiave sconfitte,pareggi,vittorie
    e come valori degli interi */

    const winsPercentage = [];
    for (livello of datiPartite) {
        let calcolo = (livello.sconfitte + livello.vittorie + livello.pareggi);
        if (calcolo === 0) {
            winsPercentage.push(0);
            continue;
        }
        winsPercentage.push(Math.floor(livello.vittorie / calcolo * 100));
    }
    return winsPercentage;
}

async function checkLogin(req, res) {
    /*query al db per verificare il login*/
    const { username, password } = req.body;
    //prova a cercare l'username nel database
    const query = await utente.findOne({ username: username });
    //se username sbagliato
    if (!query) return "erroreLog";

    //se username esiste, controlla la password e confrontala con quella hashata
    const hashPws = query.password;
    const verificaLogin = await bcrypt.compare(password, hashPws);
    //se giusta prosegui
    if (verificaLogin) return true;

    return "erroreLog";
}

app.get("/game", async (req, res) => {
    const { username, password } = req.query;
    const query = await utente.findOne({ username: username, password: password });
    if (!query) return res.send("sei un limit tester, mi piace il tuo carattere");
    res.render("game.ejs", { username: username });
});

app.post("/updateStats", async (req, res) => {
    /*aggiornamento statistiche alla fine di ogni partita classificata*/
    const { username } = req.query;
    const { livello, risultato } = req.body;

    //visualizziamo le vittorie/sconfitte correnti
    const rigaDaAggiornare = `datiPartite.${livello}.${risultato}`;
    const dati = await utente.findOneAndUpdate({ username: username }, { $inc: { [rigaDaAggiornare]: 1 } }, { new: true });
});

app.post('/fide', async (req, res) => {
    //route news scraping
    const scraped = await scrapesite("https://www.fide.com/news").catch(err => {
        console.log(err);
    });  
    res.json(scraped);
});

app.post('/ratings', async (req,res) =>{
    //route ratings scraping
    const data= await scraperatings("https://ratings.fide.com").catch(err => {
        console.log(err);
    });
    res.json(data);
});
 
app.listen(port, (error) => {
    if (error) {
        console.log("Errore nell'inizializzazione del server");
    } else {
        console.log("listening on port: ", port);
    }
});

//funzioni ausiliarie
async function scrapesite(url) {
    //funzione di webscraping
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);
    //scraping immagini
    const [e1] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[1]/a/img");
    const [e2] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[2]/a/img");
    const [e3] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[1]/a/div[1]/img");
    const [e4] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[2]/a/div[1]/img");
    const [e5] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[3]/a/div[1]/img");
    //scraping links
    const [l1] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[1]/a");
    const [l2] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[2]/a");
    const [l3] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[1]/a");
    const [l4] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[2]/a");
    const [l5] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[3]/a");

    //scraping ratings ...
    const param1 = await getproperties(e1, l1);
    const param2 = await getproperties(e2, l2);
    const param3 = await getproperties(e3, l3);
    const param4 = await getproperties(e4, l4);
    const param5 = await getproperties(e5, l5);

    const srcTxt1 = param1.srcTxt;
    const titleTxt1 = param1.titleTxt;
    const link1 = param1.linkTxt;
    const srcTxt2 = param2.srcTxt;
    const titleTxt2 = param2.titleTxt;
    const link2 = param2.linkTxt;
    const srcTxt3 = param3.srcTxt;
    const titleTxt3 = param3.titleTxt;
    const link3 = param3.linkTxt;
    const srcTxt4 = param4.srcTxt;
    const titleTxt4 = param4.titleTxt;
    const link4 = param4.linkTxt;
    const srcTxt5 = param5.srcTxt;
    const titleTxt5 = param5.titleTxt;
    const link5 = param5.linkTxt;
    browser.close();
    return { srcTxt1, titleTxt1, srcTxt2, titleTxt2, srcTxt3, titleTxt3, srcTxt4, titleTxt4, srcTxt5, titleTxt5, link1, link2, link3, link4, link5 };
}

async function getproperties(Xpath, Lpath) {
    const src = await Xpath.getProperty("src");
    const title = await Xpath.getProperty("title");
    const link = await Lpath.getProperty("href");
    const srcTxt = await src.jsonValue();
    const titleTxt = await title.jsonValue();
    const linkTxt = await link.jsonValue();
    return { srcTxt, titleTxt, linkTxt };

}

async function scraperatings(url){
    //funzione di webscraping
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);

    //scraping nomi
    const nome1=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[1]/td[2]/a',page);
    const nome2=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[2]/td[2]/a',page);
    const nome3=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[3]/td[2]/a',page);
    const nome4=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[4]/td[2]/a',page);
    const nome5=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[5]/td[2]/a',page);
    const nome6=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[6]/td[2]/a',page);
    const nome7=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[7]/td[2]/a',page);
    const nome8=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[8]/td[2]/a',page);
    const nome9=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[9]/td[2]/a',page);
    const nome10=await fetch_nomi('//*[@id="top_rating_div"]/table/tbody/tr[10]/td[2]/a',page);

    //scraping federazione
    const fed1=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[1]/td[3]',page);
    const fed2=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[2]/td[3]',page);
    const fed3=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[3]/td[3]',page);
    const fed4=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[4]/td[3]',page);
    const fed5=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[5]/td[3]',page);
    const fed6=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[6]/td[3]',page);
    const fed7=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[7]/td[3]',page);
    const fed8=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[8]/td[3]',page);
    const fed9=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[9]/td[3]',page);
    const fed10=await fetch_federazione('//*[@id="top_rating_div"]/table/tbody/tr[10]/td[3]',page);

    //scraping rating
    const rating1=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[1]/td[4]',page);
    const rating2=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[2]/td[4]',page);
    const rating3=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[3]/td[4]',page);
    const rating4=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[4]/td[4]',page);
    const rating5=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[5]/td[4]',page);
    const rating6=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[6]/td[4]',page);
    const rating7=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[7]/td[4]',page);
    const rating8=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[8]/td[4]',page);
    const rating9=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[9]/td[4]',page);
    const rating10=await fetch_ratings('//*[@id="top_rating_div"]/table/tbody/tr[10]/td[4]',page);

    browser.close();
    return{
            primo:[nome1,fed1.img_src,fed1.img_text,rating1],
            secondo:[nome2,fed2.img_src,fed2.img_text,rating2],
            terzo:[nome3,fed3.img_src,fed3.img_text,rating3],
            quarto:[nome4,fed4.img_src,fed4.img_text,rating4],
            quinto:[nome5,fed5.img_src,fed5.img_text,rating5],
            sesto:[nome6,fed6.img_src,fed6.img_text,rating6],
            settimo:[nome7,fed7.img_src,fed7.img_text,rating7],
            ottavo:[nome8,fed8.img_src,fed8.img_text,rating8],
            nono:[nome9,fed9.img_src,fed9.img_text,rating9],
            decimo:[nome10,fed10.img_src,fed10.img_text,rating10],
        };
}
async function fetch_nomi(Xpath,page){
    const [name]=await page.$x(Xpath);
    const nametext=await name.getProperty("textContent");
    const nome=await nametext.jsonValue();
    return nome;
}
async function fetch_ratings(Xpath,page){
    const [ratingpath]=await page.$x(Xpath);
    const ratingtext=await ratingpath.getProperty("textContent");
    const rating=await ratingtext.jsonValue();
    return rating;
}
async function fetch_federazione(Xpath,page){
    const [fed]=await page.$x(Xpath+'/img');
    const [fedtext]=await page.$x(Xpath);
    const fed_img_src=await fed.getProperty("src");
    const fed_img_text=await fedtext.getProperty("textContent");
    const img_src=await fed_img_src.jsonValue();
    const img_text=await fed_img_text.jsonValue();
    return {img_src, img_text};
}