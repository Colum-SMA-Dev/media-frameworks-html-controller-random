'use strict';

var debug = require('debug')('html-controller-random');
var htmlController = require('media-frameworks-html-controller')();
var MediaObjectQueue = require('./src/media-object/media-object-queue');
var TextMediaObject = require('./src/media-object/text-media-object');
var ImageMediaObject = require('./src/media-object/image-media-object');

htmlController.on('connection', function(socket) {
    var mediaObjectQueue = new MediaObjectQueue({image: 3, text: 1, video: 1, audio: 2});

    mediaObjectQueue.on('show', function(data) {
        debug('showMedia sending', data);
        socket.emit('showMedia', data);
    });

    socket.on('playScene', function(sceneId, callback) {
        htmlController.hub.emit('loadScene', sceneId, function(err, scene) {
            if (err) {
                if (callback) {
                    callback(err);                    
                }
            } else if (! scene) {
                if (callback) {
                    callback('requested sceneId of "' + sceneId + '" could not be found'); 
                }
            } else {
                mediaObjectQueue.setScene(scene);
                mediaObjectQueue.play();          
            }
        });
    });

    socket.on('mediaTransitioning', mediaObjectQueue.mediaTransitioning.bind(mediaObjectQueue));
    socket.on('mediaDone', mediaObjectQueue.mediaDone.bind(mediaObjectQueue));
});

htmlController.listen(process.env.PORT, process.env.HUB_URL, process.env.HUB_PASSWORD);




