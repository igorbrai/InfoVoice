from __future__ import division, print_function
# coding=utf-8
import sys
import os
import glob
import re
from pathlib import Path
import base64
import uuid
import matplotlib
matplotlib.use('Agg') # No pictures displayed 
import pylab
import librosa
import librosa.display
import numpy as np
import glob


# Import fast.ai Library
from fastai import *
from fastai.vision import load_learner, open_image

# Flask utils
from flask import Flask, redirect, url_for, request, render_template , jsonify
from werkzeug.utils import secure_filename


# Define a flask app
app = Flask(__name__)


path = Path("path")
Infolearn = load_learner('path/models/','export.pkl')
sentilearn = load_learner('path/models/','sentiment50epochs.pkl')


def info_model_predict(img_path):
    img = open_image(img_path)
    pred_class,pred_idx,outputs = Infolearn.predict(img)
    return str(pred_class).replace(';','-')

def senti_model_predict(img_path):
    img = open_image(img_path)
    pred_class,pred_idx,outputs = sentilearn.predict(img)
    return str(pred_class)
    

def make_spectogram(audio_path):
    sig, fs = librosa.load(audio_path) 
    save_path = 'spectograms/' + audio_path[8:].replace('.wav','.jpg')
    pylab.axis('off') # no axis
    pylab.axes([0., 0., 1., 1.], frameon=False, xticks=[], yticks=[]) # Remove the white edge
    S = librosa.feature.melspectrogram(y=sig, sr=fs)
    librosa.display.specshow(librosa.power_to_db(S, ref=np.max))
    pylab.savefig(save_path, bbox_inches=None, pad_inches=0)
    pylab.close()
    return save_path

@app.route('/', methods=['GET'])
def index():
    # Main page
    return render_template('index.html')

@app.route('/predict', methods=['POST','GET'])
def test():
    if request.method == 'POST':
        # Get the file from post request
        f = request.files['data']
        
        filename = str(uuid.uuid4()) + '.wav'

        # Save the file to ./sounds
        basepath = os.path.dirname(__file__)
        file_path = os.path.join(
            basepath, 'sounds', secure_filename(filename))
        f.save(file_path)

        #make it into spectogram
        img = make_spectogram('sounds/' + filename)

        #predict 
        info_preds = info_model_predict(img)
        senti_preds = senti_model_predict(img)

        
        return jsonify(inf= info_preds, senti=senti_preds)
    
    return 'Need to be post'



if __name__ == '__main__':
    
    app.run(debug=True)


