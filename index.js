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
const { type } = require('jquery');
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
    const { username, password } = req.body;
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
        const { datiPartite } = await utente.findOne({ username: username });
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
    console.log("pws:",password,"username:",username);
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
    console.log(query);
    if (!query) return res.send("sei un limit tester, mi piace il tuo carattere");
    res.render("game.ejs", { username: username })
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
    const scraped = await scrapesite("https://www.fide.com/news").catch(err => {
        console.log(err);
    });
    res.json(scraped);
})

async function scrapesite(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const [e1] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[1]/a/img");
    const [e2] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[2]/a/img");
    const [e3] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[1]/a/div[1]/img");
    const [e4] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[2]/a/div[1]/img");
    const [e5] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[3]/a/div[1]/img");
    const [l1] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[1]/a");
    const [l2] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[2]/app-client-news-general[2]/a");
    const [l3] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[1]/a");
    const [l4] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[2]/a");
    const [l5] = await page.$x("/html/body/app-root/app-client/app-news/app-client-news-top/section/div[1]/div/div[3]/app-client-news-blog[3]/a");

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

app.listen(port, (error) => {
    if (error) {
        console.log("Errore nell'inizializzazione del server");
    } else {
        console.log("listening on port: ", port);
    }
})