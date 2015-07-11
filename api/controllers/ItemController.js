/**
 * ItemController
 *
 * @description :: Server-side logic for managing items
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

function rename(oldPath, newPath, newTempPath, cb){
	var fs = require('fs');
	fs.readFile(oldPath, function(err, data) {

	    fs.writeFile(newPath, data, function(err) {
	    	fs.writeFile(newTempPath, data, function(err){
		        fs.unlink(oldPath, function(){
		            if(err) {
		            	cb("Can't unlink", newPath);
		            } else {
			            cb(null, newPath);
			        }
		        });
	    	});
	    }); 
	});
};

module.exports = {

	uploadForm: function (req,res){
	    res.writeHead(200, {'content-type': 'text/html'});
	    res.end(
		    '<form action="http://localhost:1337/item/upload" enctype="multipart/form-data" method="post">'+
		    '<input type="text" name="title"><br>'+
		    '<input type="file" name="image" multiple="multiple"><br>'+
		    '<input type="submit" value="Upload">'+
		    '</form>'
	    );
	},
	/**
	 * Upload image for currently logged-in user
	 *
	 * (POST /item/upload)
	 */
	upload: function (req, res) {
	  req.file('image').upload({
	  	// Upload directly into our image assets folder
	  	dirname: require('path').resolve(sails.config.appPath, 'assets/images'),
	    // don't allow the total upload size to exceed ~10MB
	    maxBytes: 10000000
	  },function whenDone(err, uploadedFiles) {
	    if (err) {
	      return res.negotiate(err);
	    }

	    // If no files were uploaded, respond with an error.
	    if (uploadedFiles.length === 0){
	      return res.badRequest('No file was uploaded');
	    }


	    var anImage = uploadedFiles[0];
	    var extension = null;

	    switch (anImage.type) {
	    	case 'image/jpeg':
	    		extension = 'jpg';
	    		break;
	    	case 'image/gif':
	    		extension = 'gif';
	    		break;
	    	case 'image/png':
	    		extension = 'png';
	    		break;
	    	default:
	    		break;
	    }


	    if (extension) {
	    	Item.create({}).exec(function(error, anItem) {
		        if (error) {
		            res.send(500, {error: "DB Error"});
		        } else {
		        	var path = require('path');
		        	var util = require('util');

		        	var newName = util.format('%s.%s', anItem.id, extension);
		        	var newURL = util.format('%s/images/%s', sails.getBaseUrl(), newName);

		        	var newTempPath = path.resolve(sails.config.paths.tmp, 'public/images/' + newName);
		        	var newFilePath = path.resolve(sails.config.appPath, 'assets/images/' + newName);

		        	rename(anImage.fd, newFilePath, newTempPath, function(err, finalPath){
		        		anItem.url = newURL;
			        	anItem.save(function (saveErr, savedItem) {
			        		if (error) {
			        			res.send(500, {error: "DB Error"});
			        		} else {
			        			return res.json(anItem);
			        		}
			        	});
		        	});
		        }
		    });
	    } else {
	    	return res.badRequest('Only JPEG and GIF are supported at this time!');
	    }
	  });
	},
};

