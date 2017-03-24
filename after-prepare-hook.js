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
			if('production' in projectData.$options.argv){
				release = projectData.$options.argv.production;
			}
			else if( hookArgs.$arguments.length == 1 && 'release' in projectData.$options.argv){
				release = projectData.$options.argv.release;
				
			}else if('release' in hookArgs.$arguments[1].prepareInfo){
				
				release = hookArgs.$arguments[1].prepareInfo.release;
			}else{
				logger.error("Cannot resolve build type");
				reject("Cannot resolve build type");	
			}
		}catch(e){
			logger.error("Cannot resolve build type");
			reject(e);
		}
		logger.write("\nPlatform: " + platform +", Production mode: " + release + "\n");

		var keepFiles="debug";
		var deleteFiles="production";
		if(release){
			keepFiles="production";
			deleteFiles="debug";
		}
		
		try{
			walkSync(platformAppDir,keepFiles,deleteFiles,logger);
		}catch(e){
			logger.warn(e);
			logger.warn('Debug/Production hook failed while traversing and processing \'App folder\'.');
		}
		resolve();
    });
	

};


var walkSync = function(dir,toKeep,toDelete,logger) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    files.forEach(function(file) {
		if(file === "tns_modules") return;
		else if (fs.statSync(path.join(dir , file)).isDirectory()) {
			walkSync(path.join(dir , file),toKeep,toDelete,logger);
        	}
        	else { 
			processFiles(dir,file,toKeep,toDelete,logger);
		}
    });

};


var processFiles = function(dir,file,toKeep,toDelete,logger){
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
			fs.unlinkSync(path.join(dir , file));
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
