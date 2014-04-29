var TerrainModel = Backbone.Model.extend({
	url: function() { return MainApplication.hostURL + '/terrain3d' },
    idAttribute: 'Id'
});

var TerrainCollection = Backbone.Collection.extend({
    url: MainApplication.hostURL + '/terrain3d',
    model: TerrainModel
});

var PipeModel = Backbone.Model.extend({
	url: function() { return MainApplication.hostURL + '/pipe3d' },
    idAttribute: 'Id'
});

var PipeCollection = Backbone.Collection.extend({
    url: MainApplication.hostURL + '/pipe3d',
    model: PipeModel
});

var BoringModel = Backbone.Model.extend({
	url: function() { return MainApplication.hostURL + '/borings3d' },
    idAttribute: 'Id'
});

var BoringCollection = Backbone.Collection.extend({
    url: MainApplication.hostURL + '/borings3d',
    model: BoringModel
});