var path = require("path");
var fs = require('fs');
module.exports = function (logger, platformsData, projectData, hookArgs) {


	
    var projectDir = projectData.projectDir;
    var platform = hookArgs.platform.toLowerCase();
    process.env.PLATFORM = platform;


	//console.log(projectData);
    var platformData = platformsData.getPlatformData(platform);
    var platformOutDir = platformData.appDestinationDirectoryPath;
    var platformAppDir = path.join(platformOutDir, "app");
	//platformAppDir = path.join(platformAppDir, "tns_modules");
    //process.env.PLATFORM_DIR = platformOutDir;

	//console.log(logger, platformsData, projectData, hookArgs);
	//console.log(hookArgs);
	//console.log(projectData,platformsData);

	console.log("\nPlatform: " + hookArgs.platform +", Production mode: " + hookArgs.$arguments[1].prepareInfo.release);
	try{
		var release = hookArgs.$arguments[1].prepareInfo.release;
	}catch(e){
		var release = false;
	}

	var keepFiles="debug";
	var deleteFiles="release";
	if(release){
		keepFiles="release";
		deleteFiles="debug";
	}
	
/*
	try{
		getFiles(platformOutDir).forEach(function(file){
			processFiles(platformOutDir,file,keepFiles,deleteFiles);
		});	
	}catch(e){
		console.log(e);
		console.log('Debug/Production hook failed while processing Root folder.');

	}

*/
	
	try{
		walkSync(platformAppDir,keepFiles,deleteFiles);
	}catch(e){
		console.log(e);
		console.log('Debug/Production hook failed while traversing and processing \'App folder\'.');

	}

};


var walkSync = function(dir,toKeep,toDelete) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    files.forEach(function(file) {
		if (fs.statSync(path.join(dir , file)).isDirectory()) {
			walkSync(path.join(dir , file),toKeep,toDelete);
        }
        else { 
			processFiles(dir,file,toKeep,toDelete);
		}
    });

};


var processFiles = function(dir,file,toKeep,toDelete){
	if(file.indexOf(toKeep) > -1){
		fs.rename(path.join(dir , file),path.join(dir , file).replace("." + toKeep + ".","."), function(err) {
			if ( err ) console.log('ERROR: ' + err);
		});
	}else if(file.indexOf("."+toDelete+".") > -1){
		fs.unlinkSync(path.join(dir , file));
	}
};

function getFiles(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
	  return fs.statSync(path.join(srcpath, file)).isFile();
  });
}