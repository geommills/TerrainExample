var TerrainModel = Backbone.Model.extend({
	url: function() { return MainApplication.hostURL + '/workflowsForQueueName' },
    idAttribute: 'Id'
});

var TerrainCollection = Backbone.Collection.extend({
    url: MainApplication.hostURL + '/workflowsForQueueName',
    model: TerrainModel,
	fetch : function(options, b ,c) {
		options !== undefined ? false : options={} ;
		var cb = options.success !== undefined ? options.success : function(){};
	    var collection = this;
		this.url = MainApplication.hostURL + '/workflowsForQueueName';
		if(GeoAppBase.connectionAvailable()){			
			return Backbone.Collection.prototype.fetch.call(this, options);		
		}else{
			return false;
		}
	},
});
