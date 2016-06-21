const {dialog} = require('electron').remote,
      ipc = require('electron').ipcRenderer,
      PouchDB = require('pouchdb');

var bibUtil = require("../util/usfm_to_json.js"),
    fs = require("fs"),
    path = require("path");

/*const PouchDB = require('pouchdb');
var refDb = new PouchDB('reference');
refDb.destroy().then(function (response) {
    console.log(response);
    console.log('done destroying.');
  // success
}).catch(function (err) {
  console.log(err);
});
db.get('targetBible').then(function (doc) {
    console.log(doc);
}).catch(function (err) {
    console.log(err);
});*/

document.getElementById('export-path').addEventListener('click', function (e) {
    dialog.showOpenDialog({properties: ['openDirectory'],
			   filters: [{name: 'All Files', extensions: ['*']}],
			   title: "Select export destination folder"
			  }, function (selectedDir) {
			      if(selectedDir != null) {
				  e.target.value = selectedDir;
			      }
			  });
});

document.getElementById('save-btn').addEventListener('click', function (e) {
    db = new PouchDB('database');
    db.get('targetBible').then(function (doc) {
	console.log(doc);
	db.put({
	    _id: 'targetBible',
	    _rev: doc._rev,
	    targetLang: document.getElementById('target-lang').value,
	    targetVersion: document.getElementById('target-version').value,
	    targetPath: document.getElementById('export-path').value  
	}).then(function (e) {
	    db.close();
	});
    }).catch(function (err) {
	db.put({
	    _id: 'targetBible',
	    targetLang: document.getElementById('target-lang').value,
	    targetVersion: document.getElementById('target-version').value,
	    targetPath: document.getElementById('export-path').value  
	}).then(function (e) {
	    db.close();
	}).catch(function (err) {
	    db.close();
	});
    });
});

document.getElementById('ref-import-btn').addEventListener('click', function (e) {
    var refDb = new PouchDB('reference'),
	ref_id_value = document.getElementById('ref-lang-code').value.toLowerCase() + '_' + document.getElementById('ref-version').value.toLowerCase(),
	ref_entry = {},
    	files = fs.readdirSync(document.getElementById('ref-path').value);
    ref_entry.ref_id = ref_id_value;
    ref_entry.ref_name =  document.getElementById('ref-name').value;
    ref_entry.isDefault = false;
    refDb.get('refs').then(function (doc) {
	var refExistsFlag = false;
	console.log('see this.');
	var updatedDoc = doc.ref_ids.forEach(function (ref_doc) {
	    if(ref_doc.ref_id === ref_id_value) {
		refExistsFlag = true;
	    }
	});
	if(!refExistsFlag) {
	    doc.ref_ids.push(ref_entry);
	    refDb.put(doc).then(function (res) {
		saveJsonToDB(files);
	    });
	} else {
	    saveJsonToDB(files);
	}
    }).catch(function (err) {
	var refs = {
	    _id: 'refs',
	    ref_ids: []
	};
	ref_entry.isDefault = true;
	refs.ref_ids.push(ref_entry);
	refDb.put(refs).then(function (res) {
	    saveJsonToDB(files);
	});
    });
});

function saveJsonToDB(files) {
        files.forEach(function (file) {
	var filePath = path.join(document.getElementById('ref-path').value, file);
	//				      console.log(filePath + ' ' + fs.statSync(filePath).isFile());
	if(fs.statSync(filePath).isFile()) {
	    var options = {
		lang: document.getElementById('ref-lang-code').value.toLowerCase(),
		version: document.getElementById('ref-version').value.toLowerCase(),
		usfmFile: filePath
	    }
	    bibUtil.toJson(options);
	}
    });
}

document.getElementById('ref-path').addEventListener('click', function (e) {
    dialog.showOpenDialog({properties: ['openDirectory'],
			   filters: [{name: 'All Files', extensions: ['*']}],
			   title: "Select reference version folder"
			  }, function (selectedDir) {
			      if(selectedDir != null) {
				  e.target.value = selectedDir;
			      }
			  });
});