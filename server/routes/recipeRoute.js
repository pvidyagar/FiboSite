var Recipe = require('../models/recipe');

module.exports = function(app, cloudinary,fs) {

    app.get('/menu', function(req, res) {
        Recipe.find(function(arr, docs) {
            var urls = {};
            for (var i = 0; i < docs.length; i++) {
                docs[i].url = cloudinary.url(docs[i]._id, { width: 200, height: 150, crop: 'fill' });
            }
            res.json(docs);
        });
    });

    app.get('/byType/:name', function(req, res) {
        var food = req.params.name;
        Recipe.find({ type: food }, function(err, docs) {
            for (var i = 0; i < docs.length; i++) {
                docs[i].url = cloudinary.url(docs[i]._id, { width: 200, height: 150, crop: 'fill' });
            }
            res.json(docs);
        });
    });

    app.get('/getall', function(req, res) {
        Recipe.find(function(arr, docs) {
            var urls = {};
            for (var i = 0; i < docs.length; i++) {
                docs[i].url = cloudinary.url(docs[i]._id, { width: 200, height: 150, crop: 'fill' });
            }
            res.json(docs);
        });
    });

    app.get('/showDetails/:id', function(req, res) {
        var id = req.params.id;
        Recipe.findOne({ _id: id }, function(err, docs) {
            docs.url = cloudinary.url(docs._id, { width: 200, height: 150, crop: 'fill' });
            res.json(docs);
        });
    });
function imgDataSplit(imageData)
	{
		var comaLocation= imageData.indexOf(',');
	    var actualData = imageData.slice(comaLocation+1);
	    var originaldata = new Buffer(actualData, 'base64');

	    var colonLocation = imageData.indexOf(':');
	    var semicolonLocation = imageData.indexOf(';');
	    var mimeType = imageData.slice(colonLocation+1,semicolonLocation);
		var imageD = {
				actualData   : actualData,
				originaldata : originaldata,
				mimeType	 : mimeType
		};
		//console.log(imageD);
		return imageD;
	};

	app.post('/recipeimage', function(req,res){
        console.log(req.body);
	      	var image = req.body.image;
	      	var imageDetails = imgDataSplit(image);

	        var recipeInserted=Recipe({name:req.body.name,
	        	ingredients: req.body.ingredients,
	        	  method: req.body.method,
	        	chef: req.body.chef,
	        	imageName: req.body.imageName,
	          cuisine:req.body.cuisine,
	          type:req.body.type});
	            recipeInserted.save(function (err, docs) {
	        fs.writeFile( req.body.imageName, imageDetails.actualData, 'base64', function(err) {
	          	console.log(err);
	          	res.status(500).send();
	            },function(sucess) {
	          	//uploding to cloud
	          	cloudinary.uploader.upload( req.body.imageName,function(result){
	      	    	console.log(result);
	      	    	if(result.error){
	      	    		//deleteImageRecord(savedImage.get('id'));
	      	    		fs.unlinkSync(req.body.imageName);//deleting temp img
	      	    		res.status(500).send();
	      	    	}
	      	    	else{
	      	    		// deleting temp img
	      	    		fs.unlinkSync(req.body.imageName);//deleting temp img
	      	    	//	savedImage.attributes.imageData= cloudinary.url(result.url);
	      	    	}
	      	    },{	public_id: docs._id, overwrite: true});
	          });
	        });
	      });	
}
