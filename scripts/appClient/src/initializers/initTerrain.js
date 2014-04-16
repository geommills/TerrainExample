var this_page_name = "Terrain";
MainApplication.pageInitializer[this_page_name] = MainApplication.module(this_page_name+"Module", function () {
    this.startWithParent = false;
});
MainApplication.pageInitializer[this_page_name].on("start", function (options) {
	//MainApplication.models.WorkflowJobCollection = new WorkflowJobCollection();	
	MainApplication.views.TerrainView = new TerrainView({});
	MainApplication.mainRegion.show(MainApplication.views.TerrainView);
	/*MainApplication.models.WorkflowJobCollection.fetch({
			
			data: { JobIdentifier: '15f4afb0-f309-4ed8-bbaf-5da78fa8de6e'},
			success: function(){
    		MainApplication.views.WorkflowView = new WorkflowView({
    			workflowJobCollection: MainApplication.models.WorkflowJobCollection
    		});
    		MainApplication.mainRegion.show(MainApplication.views.WorkflowView);
				$('#loadingDiv').css('display',"none");
				return false;
			},
			error: function(e){
				console.log("Error retrieving workflows");
				console.log(e);
				$('#loadingDiv').css('display',"none");
				return false;
			}
		});
*/
	MainApplication.views.terrainFooterView = new TerrainFooterView({});
	MainApplication.footerRegion.show(MainApplication.views.terrainFooterView);	
});
