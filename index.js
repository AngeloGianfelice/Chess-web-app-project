console.log('Initializing server ...');
const express=require('express');
const path=require('path');
const puppeteer=require('puppeteer');

const app=express();
app.use(express.json());
const port = process.env.PORT || 8080;

/*****************FORNISCO AL CLIENT SOLO I FILE STATICI(cartella public) E I ********************
*********************** PACCHETTI NPM CHE MI SERVONO(tramite redirect) ***************************/
app.use(express.static(path.join(__dirname,"/public")));
app.use('/bootstrap',express.static(path.join(__dirname,"/node_modules/bootstrap")));
app.use('/jquery',express.static(path.join(__dirname,"/node_modules/jquery")));
app.use('/chess.js',express.static(path.join(__dirname,"/node_modules/chess.js")));
app.use('/chessboardjs',express.static(path.join(__dirname,"/node_modules/@chrisoakman/chessboardjs")));


app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname,"public/index.html")); 
})
 
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