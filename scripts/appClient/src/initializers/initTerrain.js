var this_page_name = "Terrain";
MainApplication.pageInitializer[this_page_name] = MainApplication.module(this_page_name+"Module", function () {
    this.startWithParent = false;
});
MainApplication.pageInitializer[this_page_name].on("start", function (options) {
	MainApplication.models.TerrainCollection = new TerrainCollection();	
	MainApplication.models.PipeCollection = new PipeCollection();	
	MainApplication.models.BoringCollection = new BoringCollection();	
	$('#loadingDiv').css('display',"block");
	MainApplication.models.TerrainCollection.fetch({
			success: function(){
				MainApplication.models.PipeCollection.fetch({
					success: function(){
						MainApplication.models.BoringCollection.fetch({
							success: function(){
								MainApplication.views.TerrainView = new TerrainView({				
					    			terrainCollection: MainApplication.models.TerrainCollection,	
					    			pipeCollection: MainApplication.models.PipeCollection,
					    			boringCollection: MainApplication.models.BoringCollection
								});
					    		MainApplication.mainRegion.show(MainApplication.views.TerrainView);
								$('#loadingDiv').css('display',"none");
								return false;
							},
							error: function(e){
								console.log("Error retrieving Pipe");
								console.log(e);
								$('#loadingDiv').css('display',"none");
								return false;
							}
							});
					},
					error: function(e){
						console.log("Error retrieving Pipe");
						console.log(e);
						$('#loadingDiv').css('display',"none");
						return false;
					}
				});
			},
			error: function(e){
				console.log("Error retrieving terrain");
				console.log(e);
				$('#loadingDiv').css('display',"none");
				return false;
			}
	});
	MainApplication.views.terrainFooterView = new TerrainFooterView({});
	MainApplication.footerRegion.show(MainApplication.views.terrainFooterView);	
});
