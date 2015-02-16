module.exports = {

	log : function(msg) {
    	if (!Array.isArray(msg)) {
        	console.log('METIS '.green + msg)
    	} else {
        	msg.forEach(function (m) {
            	console.log('METIS '.green + m)
        	})
    	}
	},	

	warn : function(err) {
    	err = err.toString().replace('Error: ', '')
    	console.warn('POD '.green + 'ERR '.red + err)
	}
}
