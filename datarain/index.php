<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>EUROTALES - Tracce Linguistiche</title>
        <link href="../parallelo/futura/style.css" rel="stylesheet" media="all">
    <link rel="stylesheet" href="styles/styles.css" type="text/css" charset="utf-8" />
    <script src="js/jquery-1.11.0.min.js"></script>
    </head>
    <body onselectstart="return false">
      <div id="container"></div>
      
        <script type="text/javascript" src="js/d3.min.js"></script>
        <script type="text/javascript" src="js/d3-selection-multi.min.js"></script>
        <script src="js/liquidfill.min.js"></script>
        <script src="js/datarain.js" ></script>
         <script src="js/json.js" ></script>
        <script type="text/javascript">

            document.oncontextmenu =new Function("return false;")
            

            var dropsdata = [];
            data.forEach(function(d) {
                
      

     let drop = {
                   "id": d.id,  
                   "title": d.Titolo,  
                   "sottotitolo": d.Sottotitolo, 
                   "Type": d.Type, 
                   "Image": d.Image, 
                   "content": d.Descrizione,
                   "content2": d.Descrizione2,
                   "datibox": d.Dati_box,
                   "biblio": d.Bibliografia,
                   "Crediti": d.Crediti,
                   "Autore": d.Autore,           
                   "Mappa": d.Mappa,
                   "File": d.File,
                   "firma": d.Firma
                }

                dropsdata.push(drop)
            });

            //console.log(dropsdata)
            makeitrain(dropsdata)

      //d3.json("assets/rain.json", function(data) {
          //console.log(data);
      //    makeitrain(data)
      //});
         $(document).ready(function() {
      $("#Focus1").click(function(){
                $("#bubble_red").scrollTop(0);
          $("#bubble_red1").scrollTop(0);
           $("#bubble_red2").scrollTop(0);
           $("#bubble_red3").scrollTop(0);
           $("#bubble_red4").scrollTop(0);
           $("#crediti_bubble").scrollTop(0);
      
       $("#bubble_red").removeClass('hide');
        $("#bubble_red").addClass('bubble_red');
         $("#bubble_red1").addClass('hide');
          $("#bubble_red2").addClass('hide');
           $("#bubble_red3").addClass('hide');
            $("#bubble_red4").addClass('hide');
             $("#bubble_red").scrollTop(0);
             $("#crediti_bubble").addClass('hide');

      });

      $("#Focus2").click(function(){
        
         $("#bubble_red").scrollTop(0);
          $("#bubble_red1").scrollTop(0);
           $("#bubble_red2").scrollTop(0);
           $("#bubble_red3").scrollTop(0);
           $("#bubble_red4").scrollTop(0);
            $("#crediti_bubble").scrollTop(0);
      
       $("#bubble_red1").removeClass('hide');
        $("#bubble_red1").addClass('bubble_red');
         $("#bubble_red").addClass('hide');
          $("#bubble_red2").addClass('hide');
           $("#bubble_red3").addClass('hide');
            $("#bubble_red4").addClass('hide');
            $("#crediti_bubble").addClass('hide');
            
        });
            $("#Focus3").click(function(){
                       $("#bubble_red").scrollTop(0);
          $("#bubble_red1").scrollTop(0);
           $("#bubble_red2").scrollTop(0);
           $("#bubble_red3").scrollTop(0);
           $("#bubble_red4").scrollTop(0);
            $("#crediti_bubble").scrollTop(0);
      $("#bubble_red2").scrollTop(0);
       $("#bubble_red2").removeClass('hide');
        $("#bubble_red2").addClass('bubble_red');
         $("#bubble_red1").addClass('hide');
          $("#bubble_red").addClass('hide');
           $("#bubble_red3").addClass('hide');
            $("#bubble_red4").addClass('hide');
            $("#crediti_bubble").addClass('hide');

      });
      $("#Focus4").click(function(){
                 $("#bubble_red").scrollTop(0);
          $("#bubble_red1").scrollTop(0);
           $("#bubble_red2").scrollTop(0);
           $("#bubble_red3").scrollTop(0);
           $("#bubble_red4").scrollTop(0);
            $("#crediti_bubble").scrollTop(0);

      $("#bubble_red3").scrollTop(0);
       $("#bubble_red3").removeClass('hide');
        $("#bubble_red3").addClass('bubble_red');
         $("#bubble_red1").addClass('hide');
          $("#bubble_red2").addClass('hide');
           $("#bubble_red").addClass('hide');
            $("#bubble_red4").addClass('hide');
            $("#crediti_bubble").addClass('hide');

      });
                        $("#Focus5").click(function(){
                                   $("#bubble_red").scrollTop(0);
          $("#bubble_red1").scrollTop(0);
           $("#bubble_red2").scrollTop(0);
           $("#bubble_red3").scrollTop(0);
           $("#bubble_red4").scrollTop(0);
            $("#crediti_bubble").scrollTop(0);
      $("#bubble_red4").scrollTop(0);
       $("#bubble_red4").removeClass('hide');
        $("#bubble_red4").addClass('bubble_red');
         $("#bubble_red1").addClass('hide');
          $("#bubble_red2").addClass('hide');
           $("#bubble_red3").addClass('hide');
            $("#bubble_red").addClass('hide');
            $("#crediti_bubble").addClass('hide');

      });

                        $("#crediti").click(function(){
                                   $("#bubble_red").scrollTop(0);
          $("#bubble_red1").scrollTop(0);
           $("#bubble_red2").scrollTop(0);
           $("#bubble_red3").scrollTop(0);
           $("#bubble_red4").scrollTop(0);
            $("#crediti_bubble").scrollTop(0);
      
       $("#crediti_bubble").removeClass('hide');
        $("#crediti_bubble").addClass('bubble_red');
         $("#bubble_red1").addClass('hide');
          $("#bubble_red2").addClass('hide');
           $("#bubble_red3").addClass('hide');
            $("#bubble_red").addClass('hide');
             $("#bubble_red4").addClass('hide');
           

      });



      $(".bubble").click(function(){
                          alert("sadas");
           $(".bubble").addClass('.bubble');

      });





            $("#bubble_red").scrollTop(0);
          $("#bubble_red1").scrollTop(0);
           $("#bubble_red2").scrollTop(0);
           $("#bubble_red3").scrollTop(0);
           $("#bubble_red4").scrollTop(0);
            $("#crediti_bubble").scrollTop(0);
 $("#bubble_red").addClass('hide');
  $("#bubble_red1").addClass('hide');
   $("#bubble_red2").addClass('hide');
    $("#bubble_red3").addClass('hide');
     $("#bubble_red4").addClass('hide');
     $("#crediti_bubble").addClass('hide');




   });

         $(document).ready(function () {


    idleTime = 0;
    var idleInterval = setInterval(timerIncrement, 360000); // 3 minute 

    // //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        //console.log('reload')
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        //console.log('reload')
        idleTime = 0;
    });
    
    function timerIncrement() {
        idleTime = idleTime + 1;
        if (idleTime > 1) {
            loadIdle()
        }
    }
    function loadIdle(){
        location.reload();
    }






});

        </script>

        <img src="assets/CreditiBtn.png" id="crediti" class="crediti"/>
        <img src="Immagini/Focus/1.png" id="Focus3" class="Focus" style=""/>
       
        <img src="Immagini/Focus/2.png" id="Focus2" class="Focus" style=""/>
        <img src="Immagini/Focus/3.png" id="Focus1" class="Focus" style=""/>
        <img src="Immagini/Focus/4.png" id="Focus4" class="Focus" style=""/>
        <img src="Immagini/Focus/5.png" id="Focus5" class="Focus" style=""/>
        
        <div class="bubble_red" id="bubble_red" style="bottom: 260px; left: 110px;"><div class="wrapper">
              <img src="assets/close_btn_white.png" id="close2" class="lide" style="">
                  <div class="content">
                       <div class="space_small"></div>
                  
                    <div class="title_red"><p style='font-size:35pt;'>Cos’è una traccia ?</p><p class="subtitle">What is a trace? </p></div>
                    <div class="space_small"></div>
                    <div class="text_red">
<p >Le <i21>TRACCE</i21>&nbsp;di lingua, sono documenti di eventi linguistici conservati nella loro relazione con un oggetto materiale, un monumento o un luogo la cui memoria si è conservata grazie all’elemento materiale che la ospita. Le <i21>TRACCE </i21>&nbsp;illustrano il rapporto profondo fra gli oggetti materiali e il loro significato immateriale, cioè la storia culturale di cui sono latori. Negli oggetti, monumenti e luoghi si conserva la dimensione linguistica della cultura materiale e tramite essi possiamo ricostruire una archeologia delle lingue attive nei territori, passati e presenti.</p><hr>
                    <p style='color: #29CEAE'>Language <i21>TRACES </i21>&nbsp;are linguistic events documented through their relationship to tangible objects, monuments or places, whose memory echoes through those tangible hosts and geographies. <i21>TRACES </i21>&nbsp;illustrate the deep and layered relationship between tangible objects and their intangible significance–representing, in essence, the linguistic dimension of place and material culture. They allow us to build an archaeology of languages attached to objects and geography, past and present. 
<br></p></div>
                   <div class="Fonti_red"><p></p></div>

                  </div>
                
                  </div></div>

                          <div class="bubble_red" id="bubble_red1" style="bottom: 260px; left: 110px;">
                            <div id="bubble_redin">
                            <div class="wrapper">

              <img src="assets/close_btn_white.png" id="close3" class="lide" style="">
                  <div class="content">
                       <div class="space_small"></div>
                  
                    <div class="title_red"><p style='font-size:35pt;'>Dove sono le tracce ?</p><p class="subtitle">Where do I find them ?</p></div>
                    <div class="space_small"></div>
                    <!--
                    <div class="text_red"><p><cit>Una sera a Firenze, in una delle poche case, a grave danno del faraone tuttavia rallegrate da quella gaja ma ora inelegantissima anticaglia dei giochi di pegno, mi trovai al gioco dei proverbi che si fa mettendosi tutti in un cerchio donne e uomini, e buttandosi uno coll’altro un fazzoletto colla canzoncina: <citi>Uccellin volò volò, su di me non si posò, si posò sul tale e disse...</citi>: qui tirano il fazzoletto sulle ginocchia della persona nominata e dicono un proverbio; e bisogna dirlo presto, e che non sia detto avanti da nessuno, altrimenti si mette pegno. Io che sono nato in provincia e son sempre malato grazie a Dio delle prime impressioni, udendo quel diluvio di proverbi, e con quanta prontezza quelle fanciulle vispe e argute trovavano il modo di punzecchiarsi tra loro, di burlare gl’innamorati, di canzonare i grulli e di mettere in ridicolo la cuffia di questa e la parrucca di quello, confesso il vero che c’ebbi un gusto matto, e posso dire che fino d’allora mi detti a questa raccolta, perché tornato a casa segnai tutti i proverbi che mi ricorsero alla memoria. Anzi ti dirò schiettamente che avendo cominciato da lungo tempo a notare giorno per giorno tutti i proverbi che mi capitavano all’orecchio conversando colle persone del popolo e specialmente coi campagnoli, mi son trovato fatto il lavoro quasi senza accorgermene, e adesso non lo do per una gran bella cosa, ma per quello che è.</cit><br><br>Così Giusti racconta, in modo garbato e scherzoso come si racconta una novella, l’origine della sua passione per la sua raccolta dei proverbi.<br>Ma perché proprio i proverbi? Giusti mostra costantemente un profondo interesse per l’espressione popolare, pur utilizzando nella sua produzione letteraria registri linguistici e stilistici diversi e convenienti alle diverse situazioni. Nel 1839 scrive a Silvio Giannini di essersi dato a raccogliere e di aver messo insieme duemila sei o settecento proverbi «scrivendoli non come a volte si trovano nei libri, ma come li dice il popolo»; nel 1842 scrive a Pietro Giordani di occuparsi «d’una raccolta di proverbi presi dalla viva voce del popolo […] tutte sentenze, avverta bene, non modi proverbiali; ed è stato per me un lavoro piacevolissimo perché ho potuto studiarci la lingua e l’uomo». Ancora nel settembre del 1844 confidava ad Atto Vannucci:<br><br><cit>Soprattutto mi stava a cuore di condurre a termine l’opera pensata lungamente su i Proverbi, dei quali ho fatto raccolta giù giù giorno per giorno, per l’amore della lingua e della sapienza pratica. Se mi fosse riuscito d’incarnare il mio concetto, sarebbe nato un libro da aversi a mano da tutti; scritto senza boria, senza pompa, senza affettazione nessuna: ma alla buona, all’amichevole, come conviene alla materia.</cit><br><br>Presumibilmente Giusti aveva cominciato la sua raccolta fra il 1836 e il 1837 annotando i proverbi su dei fogli, su dei pezzetti e pezzettini di carta che, come scriveva a Massimo d’Azeglio, «buttava là in un cartolare». Successivamente intorno al 1840 Giusti stesso afferma di aver deciso di riunirli tutti in un quaderno per ordine alfabetico. Sempre a d’Azeglio nel 1841 Giusti scriveva: «M’era saltato il grillo di pubblicarli, poi mi ritenne la poca maturità del lavoro, tanto più che tra i mille ve n’è uno che dice: <mi>A far le corbellerie siam sempre a tempo</mi>». E anche a Manzoni parlava così dei suoi proverbi in una lettera del 1° settembre 1845, quando stava andando a trovarlo a Milano: <br><br><cit>Mi duole di non aver meco una gran filza di proverbi che raccolgo da cinque o sei anni per le strade e per le botteghe, e nei quali avreste delle vere gemme di lingua e di sapienza pratica, di quella sapienza che non figura tra le monete d’oro, ma serve mirabilmente per le spese minute della vita. Molti credo che siano già conosciuti e notati, molti no; ma in ogni modo io gli ho restituiti alla loro espressione schietta e genuina, perché gli scrittori gli hanno stiracchiati alle misure del verso o del periodo come la bazzana.</cit><br><br>Nella lettera scritta al maestro antico e «unico» Andrea Francioni, che avrebbe dovuto costituire la prefazione alla raccolta dei proverbi, Giusti chiarisce e approfondisce la sua posizione paremiologica. Premettendo di aver raccolto solo proverbi, e non i modi di dire spesso confusi con quelli, perché il proverbio è un «dettato che chiude una sentenza, un precetto, un avvertimento qualunque» e quindi un’espressione schietta della sapienza popolare, mentre i modi di dire «sanno un po’ troppo di municipio e abbisognano per conseguenza di continue spiegazioni, di commenti continui», dichiara di aver notato che i raccoglitori precedenti prendessero i proverbi piuttosto dai libri che dal popolo e di averne rettificati molti. <br><br>Autorizzato a far così dalla sua devozione all’uso piuttosto che ai trattati del bello scrivere, i proverbi avrebbero costituito oltre che «un tesoro di lingua viva e schiettissima» anche una «raccolta d’utili insegnamenti a portata di tutti, anzi un manuale di prudenza pratica per molti e molti casi che riguardano la vita pubblica e privata».<br>La lettera dedicatoria al Francioni costituisce di fatto il punto di partenza e di arrivo delle chiare e indubitabili intenzioni del Giusti sul significato e sul fine della raccolta che aveva messo insieme con un paziente lavoro, anno dopo anno: un dizionario, un manuale di saggezza pratica, ispirata al tradizionale buon senso popolare, e un «un tesoro di lingua viva e schiettissima».<br>Proprio per questo ribadiva nella lettera a Francioni:<br><br><cit>E già che ci siamo, vedi la ricchezza della lingua e la prontezza, il brio, l’ubertà dell’ingegno popolare: vedi in quanti modi si dice e si rivolta una stessa sentenza, con quanti strali puoi ferire ad un segno, e per quante vie condurre o esser condotto a un punto medesimo. Vuoi riprendere un presuntuoso esprimendo la differenza che passa dal concepire o progettare una cosa, all’eseguirla? — <citi>Dal detto al fatto c’è un gran tratto — Altro è dire, altro è fare — Il dire è una cosa, il fare un’altra — I fatti son maschi e le parole femmine.</citi> — Vuoi fare avvertito l’amico di tener l’occhio alla penna in un acquisto, in una contrattazione qualunque? — <citi>A chi compra non bastan cent’occhi, e a chi vende ne basta un solo — A buona derrata pensaci — Sotto il buon prezzo ci cova la frode</citi> — Vuoi consigliare alcuno d’andare avvisato di non precipitare troppo le cose, d’aspettar favore dall’occasione? — <citi>Chi va piano va sano —— Col tempo e colla paglia si maturan le sorbe — Roma non fu fatta in un giorno — Vuoi raccomandare la prudenza, il segreto, il parlare tardo  e grave, proprio dei savi? — <citi>Al prudente non bisogna consiglio —Al savio poche parole bastano —In bocca chiusa non c’entra mosche — Il tacere adorna l’uomo.</citi></cit><br><br>E di quanto fosse fiero di questo suo lavoro ne è testimone la chiusa della più volte ricordata lettera al Francioni:<br><br><cit>Ho fatto ciò che ho potuto e continuerò in questo lavoro per tutta la vita, pregando di fare altrettanto te e tutti quelli che amano la nostra lingua […]. Da tante mani mosse d’amore e d’accordo a un’opera stessa riuscirebbe ciò che non può essere riuscito a me solo o per difetto d’ingegno o per altre cagioni che non dipendono da me. Sia come vuol essere, accetta questo libercolo, <citi>e godi come godo io d’appartenere a una nazione che nel suo guardaroba, oltre agli abiti di gala, ha una veste da camera di questa fatta.</citi></cit><br><br>Giusti non dette mai alle stampe la sua raccolta di proverbi. Lo fece per lui Gino Capponi che nel 1853 pubblicò la <mi>Raccolta di proverbi toscani di Giuseppe Giusti</mi>. Fin dall’«Avvertimento» premesso all’edizione, si informava il pubblico di come la raccolta veramente propria del Giusti fosse stata poco meno che raddoppiata di mole attingendo in qualche parte all’uso parlato, molto di più a opere consimili; e di come ne fosse stato modificato l’ordinamento, da unicamente alfabetico in essenzialmente tematico. Il libro raccoglieva circa 6.000 proverbi, che diventeranno più di 7.500 nell’edizione successiva e più famosa del 1871, la quale nel frontespizio portava adesso i nomi dei due autori-curatori: Giuseppe Giusti e Gino Capponi. <br><br>L’edizione originale dei suoi manoscritti conservati ancora oggi presso l’Accademia della Crusca è stata pubblicata nel 2011.<br></p></div>  
                    -->
                   <div class="text_red"><p > Tutte le <i21>TRACCE </i21>&nbsp; in questa esposizione sono localizzabili nella loro posizione attuale, o nel luogo in cui sono state ritrovate, sulla carta d’Europa</p><Hr><p style=' color: #29CEAE'>
                    All of our language <i21>TRACES </i21>&nbsp; possess GPS coordinates that link on the European map to their stable locations or, in the case of small objects, to their find spots.
                    <br></p></div>  
                   <div class="Fonti_red"></div>
               
                  </div>
                
                  </div></div>
                  <div class="map_area"><img src="assets/MappaTracceFullscreen.png"> </div>
   
                </div>

                          <div class="bubble_red" id="bubble_red2" style="bottom: 260px; left: 110px;"><div class="wrapper">
              <img src="assets/close_btn_white.png" id="close4" class="lide" style="">
                  <div class="content">
                       <div class="space_small"></div>
                    <div class="title_red"><p style='font-size:35pt;'>Scritture esposte</p><p class="subtitle">Public script</p></div>
                    <div class="space_small"></div>
                    <div class="text_red"><p >Le iscrizioni che troviamo su monumenti pubblici sono tipicamente tracce di natura formale, anche se talvolta rivelano una lingua fuori norma, come nel compianto per il bambino <i21>Mercurio.</i21>&nbsp; I graffiti documentano una scrittura estemporanea, informale e perfino trasgressiva che si conserva spesso in modo casuale. Si va dall’oggetto privato con contenuto lascivo dell’antico <i21>Aryballos</i21> greco, al <i21>Titulus Crucis</i21>, &nbsp;iscrizione trilingue posta sulla croce di Gesù, al fumetto medievale conservato a <i21>San Clemente</i21>. La pratica non è cambiata nei secoli: a Madrid si scrive sui <i21>Trash bins</i21>,&nbsp; a <i21>Bastogi</i21>, estrema periferia romana, si ricorda Dante.</p><hr><p style='color: #29CEAE'>Inscriptions are formal, commissioned acts of language integrated with hard objects, even though they sometimes reveal sub-standard linguistic varieties, as in <i21>Mercurio’s</i21>&nbsp; epitaph. Graffiti are typically informal writings, usually more perishable, and sometimes transgressive. Their types and intended audiences can vary greatly: see the somewhat lascivious content of the ancient <i21>Aryballos</i21>, as opposed to the trilingual inscription on the Holy Cross, the <i21>Titulus Crucis</i21>, &nbsp; or the medieval comic strip embellishing the fresco at <i21>San Clemente</i21>.&nbsp; In our times, we find poetic graffiti on the <i21>trash bins</i21>&nbsp;of Madrid or Dante quoted to describe the woes of Roman inner city at <i21>Bastogi</i21>.&nbsp;</p></div>

            
                  </div>
                
                  </div></div>

                          <div class="bubble_red" id="bubble_red3" style="bottom: 260px; left: 110px;"><div class="wrapper">
              <img src="assets/close_btn_white.png" id="close5" class="lide" style="">
                  <div class="content">
                       <div class="space_small"></div>
                    <div class="title_red"><p style='font-size:35pt;'>Memorie orali</p><p class="subtitle">Orality </p></div>
                    <div class="space_small"></div>
                    <div class="text_red"><p >Gli oggetti e i luoghi sono immersi in memorie orali, testimoniate dai toponimi o da leggende e storie ad essi associate. Talvolta le tradizioni orali prendono il posto di storie che non hanno modo di essere raccontate, come nel cimitero dei <i21>Namenlose</i21>&nbsp; di Vienna. La memoria orale fornisce una voce agli oggetti, come nel caso del Crocifisso di San Damiano che esortò San Francesco a ricostruire la sua chiesa. La voce di generazioni passate echeggia nel toponimo <i21>Canto di Balla</i21>,&nbsp;  o nei canti dell’antica lingua basca <i21>Euskera</i21>&nbsp; che risuonano nelle strade di San Sebastián.</p><hr><p style='color: #29CEAE'>Objects and places are clothed by the oral traditions that surround them, such as toponyms or associated stories. Sometimes oral traditions substitute for writing that cannot be realized such as Vienna’s cemetery of the <i21>Namenlose</i21>.&nbsp; Other oral lore permits objects to speak directly to their publics, such as when the Crucifix of Saint Damian exhorted Saint Francis to rebuild his church, thus providing the objects with their own voices. Yet other linguistic events envelop their hosts with the voices of generations as in the toponym, <i21>Canto di Balla</i21>,&nbsp; or the chants in the ancient language isolate, <i21>Euskera</i21>,&nbsp; still filling the streets of San Sebastián.</p></div>
                   <div class="Fonti_red"><p></p></div>

                    
                  </div>
                
                  </div></div>

                          <div class="bubble_red" id="bubble_red4" style="bottom: 260px; left: 110px;"><div class="wrapper">
              <img src="assets/close_btn_white.png" id="close6" class="lide" style="">
                  <div class="content">
                       <div class="space_small"></div>
                       <div class="title_red"><p style='font-size:35pt;'>Luoghi e oggetti</p><p class="subtitle">Places and Objects</p></div>
                    <div class="space_small"></div>
                    <div class="text_red"><p>La dimensione linguistica del patrimonio culturale è trasmessa da un grande numero di realtà materiali di varie nature, pubbliche e private. Sono testimoni di lingua piccoli oggetti personali inscritti (come l’<i21>Astragalo</i21>, per cui vedi le Pietre Miliari), o la tomba del vescovo inglese Adam Easton, monumento visibile a tutti i fedeli della comunità inglese della Roma trecentesca. Le targhe di <i21>Gogol e Goethe</i21> sono esposte pubblicamente a Roma; le tombe del Cimitero degli Inglesi, a Roma e a Firenze, sono liberamente visitabili; le voci popolari che danno un nome a interi quartieri, come <i21>Testaccio</i21> a Roma e la <i21>Vucciria</i21> a Palermo, sono consegnate alla storia.</p><hr><p style='color: #29CEAE'>The linguistic dimension of cultural heritage resides in a myriad of tangible containers, ranging from tiny personal effects such as the <i21>Astragalus</i21> (early form of Old English, see MILESTONES), to tombs that reflect the multilingualism of places such as <i21>Adam Easton’s</i21>&nbsp; epitaph, to the memories of <i21>Gogol</i21>&nbsp; and <i21>Goethe</i21>&nbsp; in Rome testified to by inscriptions, or the so-called Cimiteri degli Inglesi (i.e. foreigners) in Rome and Florence. Whole quarters of towns bear names derived from local languages, such as <i21>Testaccio</i21>&nbsp; in Rome or <i21>Vucciria </i21>in Palermo.</div>
                       <div class="Fonti_red"></div>

                   
                  </div>
                
                  </div></div>



            <div class="bubble_red" id="crediti_bubble" style="bottom: 260px; left: 110px;"><div class="wrapper">
              <img src="assets/close_btn_white.png" id="close7" class="lide" style="">
                  <div class="content">
                       <div class="title_red_crediti"><p style='font-size:35pt;'>Crediti</p></div>
                    <div class="space_small"></div>
                    <div class="text_red_crediti"><p><b>Progetto e coordinamento scientifico</b>: Nadia Cannata, Maia Wellington Gahtan, Margaret J-M Sönmez, Gaia Tomazzoli<br><br><b>Progetto grafico e allestimenti: </b> AND, Ambienti Narrativi Digitali, Firenze<br><br><b>Testi: </b> Nadia Cannata, Maia Wellington Gahtan, Margaret J-M Sönmez, Gaia Tomazzoli.<br><br><b>Hanno collaborato: </b> Giulia Avalle, Lorenzo Bartoli, Christos Bintoudis, Luca Baruffa, Vanessa Cardamone, Simone Celani, Jessica Cerci, Annalisa Cosentino, Andreea David, Gaia D’Elia, Aliza Fiorentino, Elaine Gold, Stefania De Lucia, Niccolò Galletti,  Elena Jakopović, Peter Kruschwitz, Luigi Marinelli, Camilla Miglio, Oxana Pachlovska, Gerassimos Pagratis, Sofia Pagliarella, Michela Pasquali, Lorenzo Pes, Annamaria Piccoli, Laura Ragone, Barbara Ronchetti, Edit Rózsavölgyi, Serena Sapienza, Roxana Utale, Luca Vaglio, Martine Van Gertruijden, Samuele Vona, Mary Wardle, Gaby Waxenberger. <br>Gli studenti del progetto CIVIS 2021 Linguistic Cultures and Communities in Europe, coordinato da Sapienza. <br>Gli studenti dei corsi di laurea della Facoltà di Lettere, Sapienza: <br>Mediazione Linguistica e Interculturale <br>Lingue, culture, letterature, traduzione<br>Scienze Linguistiche Letterarie e della Traduzione<br>Filologia Moderna<br>Anglo-American Studies<br><br>.<b>Si ringraziano</b>: Andrea Pieroni e il Presidio Tecnico Operativo Marco Polo; AGE Sapienza; il Dipartimento di Studi Europei, Americani e Interculturali; Paesaggi di Voci; la Biblioteca di Lingue e Letterature Straniere Moderne, Sapienza.<br><br><b>Finanziamenti: </b>Sapienza Università di Roma (Terza Missione e bando Ricerca); CIVIS; Erasmus+; Dipartimento di Studi Europei, Americani e Interculturali.</p></div>
                       <div class="Fonti_red"></div>

                   
                  </div>
                
                  </div></div>





    </body>
</html>  