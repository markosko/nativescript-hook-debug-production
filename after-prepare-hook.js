var path = require("path");
var fs = require('fs');
module.exports = function (logger, platformsData, projectData, hookArgs) {
	return new Promise(function(resolve, reject) {

		var release;
	
		var projectDir = projectData.projectDir;
		var platform = hookArgs.platform.toLowerCase();
		
		var platformData = platformsData.getPlatformData(platform);
		var platformOutDir = platformData.appDestinationDirectoryPath;
		var platformAppDir = path.join(platformOutDir, "app");

		try{
			if( hookArgs.$arguments.length == 1 ){
				release = projectData.$options.argv.release;
				
			}else{
				
				release = hookArgs.$arguments[1].prepareInfo.release;
			}
		}catch(e){
			logger.error("Cannot resolve build type");
			reject(err);
		}
		logger.write("\nPlatform: " + platform +", Production mode: " + release + "\n");

		var keepFiles="debug";
		var deleteFiles="production";
		if(release){
			keepFiles="production";
			deleteFiles="debug";
		}
		
		try{
			walkSync(platformAppDir,keepFiles,deleteFiles);
		}catch(e){
			logger.warn(e);
			logger.warn('Debug/Production hook failed while traversing and processing \'App folder\'.');
		}
		resolve();
    });
	

};


var walkSync = function(dir,toKeep,toDelete) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    files.forEach(function(file) {
		if(file === "tns_modules") return;
		else if (fs.statSync(path.join(dir , file)).isDirectory()) {
			walkSync(path.join(dir , file),toKeep,toDelete);
        }
        else { 
			processFiles(dir,file,toKeep,toDelete);
		}
    });

};


var processFiles = function(dir,file,toKeep,toDelete){
	if(file.indexOf("." + toKeep + "." ) > -1){
		try{
			fs.unlinkSync(path.join(dir , file).replace("." + toKeep + ".","."))
			fs.rename(path.join(dir , file),path.join(dir , file).replace("." + toKeep + ".","."), function(err) {
				if ( err ) logger.warn('ERROR: ' + err);
			});
		}catch(e){
			logger.warn(e);
		}
	}else if(file.indexOf( "." + toDelete + "." ) > -1){
		try{
			fs.ulinkSync(path.join(dir , file));
		}catch(e){
			logger.warn(e);
		}
	}
};

function getFiles(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
	  return fs.statSync(path.join(srcpath, file)).isFile();
  });
}