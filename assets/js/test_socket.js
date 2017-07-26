io.sails.autoConnect = false;
io.sails.url = 'http://localhost:1337';
var txData = {antenna:1,channelMhz:'927.25',epc:'e2801160600002066604dd8b',doppler:'-0.1875',timestamp:'1494999290610129',peakRssi:'-0.1875'};
var ioSocket = io.socket;

// io.sails.connect(url, {});
var sConnection = io.sails.connect();

sConnection.on('connect', function onConnect () {
  console.log(io.sails.url);
  console.log("Socket connected!");
  sConnection.get('/api/race/joinReaderRoom', function gotResponse(data, jwRes) {
        console.log('Server responded with status code ' + jwRes.statusCode + ' data: ', data);
        document.querySelector('.info .room').innerHTML = 'register to server';
  });
});

sConnection.on('startreader', function gotStartMessage (data) {
		console.log('startreader', data);
});

sConnection.on('rxdata', function gotRxMessage (data) {
		console.log('rxdata', data);
    document.querySelector('.rxdata').innerHTML = JSON.stringify(data);
});

sConnection.on('terminatereader', function gotTerminateMessage (data) {
		console.log('terminatereader', data);
});

sConnection.on('status', function gotStatusMessage (data) {
		console.log('status', data);
});
document.querySelector('.start').addEventListener('click', function(e) {
	e.preventDefault();

	sConnection.post(io.sails.url + '/api/race/readerRoom',
                  {
                      type: 'startreader',
                      payload: {}
                  },
                  function gotResponse(data, jwRes) {
			                  console.log('Server responded with status code ' + jwRes.statusCode + ' data: ', data);
                        document.querySelector('.info .reader').innerHTML = 'reader: start';
                  });
});

document.querySelector('.txdata').addEventListener('click', function(e) {
	e.preventDefault();

	sConnection.post('/api/race/readerRoom',
                  {
                      type: 'rxdata',
                      payload: txData
                  },
                  function gotResponse(data, jwRes) {
			                 console.log('Server responded with status code ' + jwRes.statusCode + ' data: ', data);
		                   });
});

document.querySelector('.getreaderstatus').addEventListener('click', function(e) {
	e.preventDefault();

	sConnection.post(io.sails.url + '/api/race/readerRoom',
                  {
                      type: 'getreaderstatus',
                      payload: {}
                  },
                  function gotResponse(data, jwRes) {
			                  console.log('Server responded with status code ' + jwRes.statusCode + ' data: ', data);
                        document.querySelector('.info .reader').innerHTML = 'reader status:' + data;
                  });
});

document.querySelector('.terminate').addEventListener('click', function(e) {
	e.preventDefault();

	sConnection.post('/api/race/readerRoom',
                  {
                      type: 'terminatereader',
                      payload: {}
                  },
                  function gotResponse(data, jwRes) {
			        console.log('Server responded with status code ' + jwRes.statusCode + ' data: ', data);
		        });
});
