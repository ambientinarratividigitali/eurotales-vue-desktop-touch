index_class= 0;
_sizes = ['far', 'medium', 'near'];

function getClass()
{
	index_class++;
	if(index_class==3){index_class=0;}
	//console.log(index_class);
	//console.log(_sizes[index_class]);
	return 'drop '+_sizes[index_class];

}

function makeitrain(dropsdata){

	var centerX = 1920/2,
        centerY = 1080/2,
		fill,
		gauge,
		config,
		sizes = ['far', 'medium', 'near'],
		cannaggio = 0,
		count = 0,
		cannaggioMax = 2,
		cannaggioMin = 1;

	var drops = d3.select("#container")
		.data(dropsdata)
		.enter()
		
		.append('img')
		.attrs({
			//"class": 			function(d){ return 'drop '+sizes[Math.floor(sizes.length * Math.random())] },
			"class": 			()=>getClass(),
			"id": 		 		function(d){ return `drop-${d.id}` },
			"data-drop": 		 	function(d){ return `drop-${d.id}` },
			"data-category": 	function(d){ return `${d.category}` },
			"data-type": 		function(d){ return `${d.type}` },
			"data-content": 	function(d){ return `${d.content}` },
			"src": 	function(d){ return `${d.File}` },
			"data-status": 		'dropping'
		})
		.styles({
			'right': function(d){ return `${(Math.random() * 300)}px` }
		})
		
		.transition()
		.on("start", function repeat() {
			
			if(cannaggio < cannaggioMax){

				d3.select(this).attr('data-status','dropping')
				cannaggio++;
				count++;

				d3.select(this)
				.transition()
					.duration(function(){
						if(d3.select(this).classed("far")){
							return 30000 + Math.random()*5000	
						}else if(d3.select(this).classed("medium")){
							return 20000 + Math.random()*5000
						}else if(d3.select(this).classed("near")){
							return 15000 + Math.random()*5000	
						}
					})
					.ease(d3.easeLinear)
					.style("top", "1200px")
				.transition()
					.duration(0)
					.delay(0)
					.style("display",'none')
				.transition()
					.duration(0)
					.delay(0)
					.style("top", "-400px")
					.attrs({
						"class": 			()=>getClass(),
					})
				.transition()
					.duration(0)
					.delay(0)
					.styles({
						'right': function(d){ 
							return `${(Math.random() * 300)}px` 
						},
						"display": 'block'
					})

				d3.select(this).attr('data-status','wait')
			
				.on("start", repeat);


			}else{
				d3.select(this).attr('data-status','wait')
				d3.select(this)
					.transition().duration(0).delay(8000).style("top", "-400px").on('start',repeat)
					d3.select(this).attr('data-status','dropping')

                   
			}

              if(count == "42"){ 

                d3.selectAll(".brop").attr('data-status','hide');
             	makeitrain(dropsdata); }

			setTimeout(function(){ if(cannaggio > cannaggioMin) { cannaggio--; } }, 2000);

			//console.log("dssadsadasd"); 
	    })
	    .on('end',function(){  })




	/* // gauge for dropping drops

	d3.selectAll('div').append('svg').attrs({
			"width": "80",
			"height": "80",
			"id": function(d){ return `fill-drop-${d.id}` }
		})
	
	d3.selectAll('div').nodes().map(function(d) { 
		//console.log(d.select(this).selectAll('svg'))
		if(d.id != 'container'){
			fill( d.dataset.category, 30, 'fill-'+d.id,false)
		}
	}); */




d3.select(this).on('click', function(){

  d3.select("#close2").on("click", function(){ 


       		d3.select(".bubble").attr('class','hide');
		d3.select(".bubble_red").attr('class','hide');
		d3.select(".bubble_red1").attr('class','hide');
		d3.select(".bubble_red2").attr('class','hide');
		d3.select(".bubble_red3").attr('class','hide');
		d3.select(".bubble_red4").attr('class','hide');
		d3.selectAll(".active").attr('class','hide');
		d3.select("#crediti_bubble").attr('class','hide');


       });
      

       d3.select("#close3").on("click", function(){ 

	d3.select(".bubble_red1").attr('class','hide');
       		d3.select(".bubble").attr('class','hide');
		d3.select(".bubble_red").attr('class','hide');
		
		d3.select(".bubble_red2").attr('class','hide');
		d3.select(".bubble_red3").attr('class','hide');
		d3.select(".bubble_red4").attr('class','hide');
		d3.selectAll(".active").attr('class','hide');
		d3.select("#crediti_bubble").attr('class','hide');


       });
           d3.select("#close4").on("click", function(){ 

	d3.select(".bubble_red2").attr('class','hide');
       		d3.select(".bubble").attr('class','hide');
		d3.select(".bubble_red").attr('class','hide');
		d3.select(".bubble_red1").attr('class','hide');
		
		
		d3.select(".bubble_red3").attr('class','hide');
		d3.select(".bubble_red4").attr('class','hide');
		d3.selectAll(".active").attr('class','hide');
		d3.select("#crediti_bubble").attr('class','hide');


       });

                      d3.select("#close5").on("click", function(){ 
                      	d3.select(".bubble_red3").attr('class','hide');

	d3.select(".bubble_red2").attr('class','hide');
       		d3.select(".bubble").attr('class','hide');
		d3.select(".bubble_red").attr('class','hide');
		
		d3.select(".bubble_red1").attr('class','hide');
		
		d3.select(".bubble_red4").attr('class','hide');
		d3.selectAll(".active").attr('class','hide');
		d3.select("#crediti_bubble").attr('class','hide');


       });
                               d3.select("#close6").on("click", function(){ 
                      	
	d3.select(".bubble_red4").attr('class','hide');
	d3.select(".bubble_red1").attr('class','hide');
       		d3.select(".bubble").attr('class','hide');
		d3.select(".bubble_red").attr('class','hide');
		
		d3.select(".bubble_red2").attr('class','hide');
		d3.select(".bubble_red3").attr('class','hide');

		d3.selectAll(".active").attr('class','hide');
		d3.select("#crediti_bubble").attr('class','hide');

       });

     d3.select("#close7").on("click", function(){ 
                      	
	d3.select(".bubble_red4").attr('class','hide');
	d3.select(".bubble_red1").attr('class','hide');
       		d3.select(".bubble").attr('class','hide');
		d3.select(".bubble_red").attr('class','hide');
		
		d3.select(".bubble_red2").attr('class','hide');
		d3.select(".bubble_red3").attr('class','hide');
		d3.select("#crediti_bubble").attr('class','hide');

		d3.selectAll(".active").attr('class','hide');


       });


       		d3.select(".bubble").attr('class','hide');
	
		d3.selectAll(".active").attr('class','hide');


      
    });


	// ===== handle clicked drop ===== //
		d3.selectAll('img').on('click',function(d){
			//d3.selectAll(".bubble").attr('class','hide');
console.log(d.Type );


	

		
		// Get current event info
		//d3.event.target
  		var clicked = d3.select(this);

  		if(d3.select(this).attr('id') != 'container'){
      			          		
      		switch(clicked.attr('data-status')){
      			
      			case 'active':

      				// back to dropping...
      				//clicked = drop(clicked)
      				break;

      			case 'snapped':
      			case 'dropping':
      			default:

      				// active 
      				clicked = active(clicked)
      				break;

      		}// end check status


  		}// check if container clicked
		

  		// ===== handle unclicked drops... ===== //

  		var leftsnap = 100, leftstep = 120
  		
  		d3.selectAll('img').each(function(d) {
	        
	      // check if node is unclicked
	      if(clicked.attr('id') != d3.select(this).attr('id')){

	      		var unclicked = d3.select(this)

	      		// check is not the container
	      		if(unclicked.attr('id') != 'container'){
      				
          			switch(unclicked.attr('data-status')){

          				case 'active':

          					// is related
          					if(unclicked.attr('data-category') == clicked.attr('data-category')){

          						// snap!
          						//unclicked = snap(unclicked,leftsnap)
          						//leftsnap += leftstep	

          						// back to dropping too...
          						unclicked = drop(unclicked)			

          					}else{
          						// back to dropping...
          						unclicked = drop(unclicked)			
							}
          					break;

          				case 'snapped':

          					// if the old snapped isn't no more relate
          					if(unclicked.attr('data-category') != clicked.attr('data-category')){
	          				
	          					// back to dropping...
	          					unclicked = drop(unclicked)

		          			}else{

		          				// snap!				          	
		          				//unclicked = snap(unclicked,leftsnap)
		          				//leftsnap += leftstep

		          			}
          					break;

          				case 'dropping':
          				default:

          					// is related
          					if(unclicked.attr('data-category') == clicked.attr('data-category')){

          						// snap!
          						//unclicked = snap(unclicked,leftsnap)
          						//leftsnap += leftstep

          					}else{
								// keep going...
							}
          					break;

	          		}// end check status

          		}// end check container

          }// end check unclicked
	      
	    }); // end handle unclicked

	    

	})

function drop(drop){
    	
    	// back to dropping...
		drop.attr('data-status','dropping')
			.classed("active", false)
			.classed("snapped", false)
			.text('')
			.transition()
				.duration(2000)
				.delay(0)
				.ease(d3.easeLinear)
				.styles({
					"top":'1200px'
				})
			.transition()
				.duration(0)
				.delay(0)
				.style("display",'none')
			.transition()
				.duration(0)
				.delay(0)
				.style("top", "-400px")
				.attrs({
					"class":function(d){ return 'drop '+sizes[Math.floor(sizes.length * Math.random())] },
				})
			.transition()
				.duration(0)
				.delay(0)
		
				.style("display",'block')
			.transition()
				.on("start", function repeat() {
					if(cannaggio < cannaggioMax){

						d3.select(this).attr('data-status','dropping')
						cannaggio++;

						d3.active(this)
						.transition()
							.duration(function(){
								if(d3.select(this).classed("far")){
									return 30000 + Math.random()*5000	
								}else if(d3.select(this).classed("medium")){
									return 15000 + Math.random()*5000
								}else if(d3.select(this).classed("near")){
									return 5000 + Math.random()*5000	
								}
							})
							.ease(d3.easeLinear)
							.style("top", "1200px")
						.transition()
							.duration(0)
							.delay(0)
							.style("display",'none')
						.transition()
							.duration(0)
							.delay(0)
							.style("top", "-400px")
						.transition()
							.duration(0)
							.delay(0)
							.style('right',function(d){
								return `${(Math.random() * 300)}px`
							})
							.style("display",'block')
							d3.select(this).attr('data-status','wait')
						.on("start", repeat);
					}else{
						d3.select(this).attr('data-status','wait')
						d3.select(this)
							.transition().duration(0).delay(5000).style("top", "-400px").on('start',repeat)
					}
					setTimeout(function(){ if(cannaggio > cannaggioMin) { cannaggio--; } }, 16000);
			})

		return drop
    }



    function active(drop){

    	drop.attr('data-status','active')
				.classed("snapped", false)
				.transition()
					.duration(0)
					.delay(0)
				.ease(d3.easeExpOut)
				.styles({
					"top": `${centerY+100}px`,
					"left": `${centerX/2+600}px`,
				})

			.on("end", function(d){
				drop.classed("active", !drop.classed("active"))
				
				

				
            var drops = d3.select("#container")
            this.d = d;
           
            if(d.Type == "true" ){
				drops.append('div')
					.attr('class','bubble')
					.html(function(){




						switch(d.Type){

							case 'true':
							default:
								return `<div class="wrapper">
							<img src="assets/close_btn_grey.png" id="close1" class="lide" style="">
									<div class="content">
									<div class="space"></div>
										
										<div class="title">${d.title}</div>
										<div class="space"></div>
                                        <img src="${d.Image}" style="width: 70%;">
										<div class="text">${d.content}</div>
										<div class="text">${d.content2}</div>
										<div class="space"><hr></div>
										<div class="text">${d.datibox}</div>
										<div class="text">${d.biblio}</div>
										<div class="text">${d.Crediti}</div>
										<div class="text">${d.Autore}</div>
										

										
							
								
									</div>`
								break;		
						}
						
						
					})




					.transition()
      					.duration(350)
						.delay(0)
						.ease(d3.easeExpOut)
						.styles({
							"bottom": `260px`,
							"left": `110px`
						})

}

			})

		return drop

    }







    function snap(drop,leftsnap){

    	drop.attr('data-status','snapped')
			.classed("active", false)
			.classed("snapped", true)
			.text('')
			.transition()
				.duration(1000)
				.ease(d3.easeExpOut)
				.styles({
					"top": "900px",
					"left": function(d){ return `${leftsnap}px` }
				})

		return drop

    }

    function fill(color,quantity,id,update){
    	
    	//console.log('[config data]',color,quantity,id,update)
    	let c; 
    	switch(color){
    		case "1": c = '#555555'; break; // cattivi consumi
    		case "2": c = '#678053'; break; // buone pratiche
    		case "3": c = '#638ABF'; break; // pillole
    		default: c = '#638ABF'; break; // default
    	}

    	//console.log(c)

    	config = liquidFillGaugeDefaultSettings();
    	//console.log(config)
	    config.circleColor = c; //"#FF7777";
	    config.textColor = "transparent";
	    config.waveTextColor = c; //"#FF7777";
	    config.waveColor = c; //"#FF7777";
	    config.circleThickness = 0.0;
	    config.textVertPosition = 0.2;
	    config.waveAnimateTime = 1000;

	    gauge = loadLiquidFillGauge(id, quantity, config); //, config);
	    
    }

}
