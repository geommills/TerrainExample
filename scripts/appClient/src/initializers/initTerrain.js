var this_page_name = "Terrain";
MainApplication.pageInitializer[this_page_name] = MainApplication.module(this_page_name+"Module", function () {
    this.startWithParent = false;
});
MainApplication.pageInitializer[this_page_name].on("start", function (options) {
	MainApplication.models.TerrainCollection = new TerrainCollection();	
	MainApplication.models.TerrainCollection.fetch({
			success: function(){
				MainApplication.views.TerrainView = new TerrainView({				
	    			terrainCollection: MainApplication.models.TerrainCollection
				});
	    		MainApplication.mainRegion.show(MainApplication.views.TerrainView);
				$('#loadingDiv').css('display',"none");
				return false;
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
