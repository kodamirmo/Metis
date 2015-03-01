module.exports = {

	log : function(msg) {
    	if (!Array.isArray(msg)) {
        	console.log('Soyuz '.green + msg)
    	} else {
        	msg.forEach(function (m) {
            	console.log('Soyuz '.green + m)
        	})
    	}
	},	

	warn : function(err) {
    	err = err.toString().replace('Error: ', '')
    	console.warn('Soyuz '.green + 'ERR '.red + err)
	}
}