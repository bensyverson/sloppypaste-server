/**
* Item.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
  	text: {
  		type: 'string',
  	},
  	url: {
  		type: 'string',
  	},
  	primaryType: {
  		type: 'string',
  		enum: ['image', 'text', 'url', 'invalid'],
  	},
  },
	beforeValidate: function(values, cb) {
	    if (values.text) {
	    	if (values.text.match(/^https?:\/\//)) {
	    		values.primaryType = 'url';
	    	} else {
	    		values.primaryType = 'text';
	    	}
	    } else {
	    	values.primaryType = 'invalid';
	    }
  		cb();
  	},
};

