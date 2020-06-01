const recordAudio = () =>
        new Promise(async resolve => {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          let audioChunks = [];

          mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
          });

          const start = () => {
            audioChunks = [];
            mediaRecorder.start();
          };

          const stop = () =>
            new Promise(resolve => {
              mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks,{ 'type' : 'audio/wav; codecs=MS_PCM' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                const play = () => audio.play();
                resolve({ audioChunks, audioBlob, audioUrl, play });
              });

              mediaRecorder.stop();
            });

          resolve({ start, stop });
        });

      const sleep = time => new Promise(resolve => setTimeout(resolve, time));

      const recordButton = document.querySelector('#record');
      const stopButton = document.querySelector('#stop');
      const playButton = document.querySelector('#play');
      const saveButton = document.querySelector('#save');
      const savedAudioMessagesContainer = document.querySelector('#saved-audio-messages');

      let recorder;
      let audio;

      recordButton.addEventListener('click', async () => {
        recordButton.setAttribute('disabled', true);
        stopButton.removeAttribute('disabled');
        playButton.setAttribute('disabled', true);
        saveButton.setAttribute('disabled', true);
        if (!recorder) {
          recorder = await recordAudio();
        }
        recorder.start();
      });

      stopButton.addEventListener('click', async () => {
        recordButton.removeAttribute('disabled');
        stopButton.setAttribute('disabled', true);
        playButton.removeAttribute('disabled');
        saveButton.removeAttribute('disabled');
        audio = await recorder.stop();
      });

      playButton.addEventListener('click', () => {
        audio.play();
      });

      saveButton.addEventListener('click', () => {
        $('.loader').show();
        var fd = new FormData()
        sound = new Blob(audio.audioChunks, { 'type' : 'audio/wav; codecs=MS_PCM' });
        fd.append('data',sound)

        $.ajax({
            type: 'POST',
            url: '/predict',
            data: fd,
            contentType: "audio/wav",
            processData: false,
            contentType: false,
            success: function (response) {
                $('.loader').hide();
                $('.infoResp').text('Voice info prediction: ' + response['inf'])
                $('.sentiResp').text('Sentiment prediction: ' + response['senti'])
            }
        });
        
      });

    // Upload Preview
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
                $('#imagePreview').hide();
                $('#imagePreview').fadeIn(650);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#imageUpload").change(function () {
        $('.image-section').show();
        $('#btn-predict').show();
        $('#result').text('');
        $('#result').hide();
        readURL(this);
    });

    // Predict
    $('#btn-predict').click(function () {
        var form_data = new FormData($('#upload-file')[0]);

        // Show loading animation
        $(this).hide();
        $('.loader').show();

        // Make prediction by calling api /predict
        $.ajax({
            type: 'POST',
            url: '/predict',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                console.log(data);
                // Get and display the result
                $('.loader').hide();
                $('#result').fadeIn(600);
                $('#result').text(' The voice inforamations are:  ' + data);
                console.log('Success!');
            },
        });
    });

// });
