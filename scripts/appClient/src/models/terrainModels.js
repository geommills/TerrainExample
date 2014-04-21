var TerrainModel = Backbone.Model.extend({
	url: function() { return MainApplication.hostURL + '/terrain3d' },
    idAttribute: 'Id'
});

var TerrainCollection = Backbone.Collection.extend({
    url: MainApplication.hostURL + '/terrain3d',
    model: TerrainModel
});
