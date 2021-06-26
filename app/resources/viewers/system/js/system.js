function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

window.onload = function() {
    
    console.log("System info window opened");

    //-- Get the parameters
    const version = getURLParameter('version');
    const base_dir = getURLParameter('base_dir');
    const icestudio_dir = getURLParameter('icestudio_dir');
    const profile_path = getURLParameter('profile_path');
    const apio_home_dir = getURLParameter('apio_home_dir');
    const env_dir = getURLParameter('env_dir');
    const env_bin_dir = getURLParameter('env_bin_dir');
    const env_pip = getURLParameter('env_pip');
    const apio_cmd = getURLParameter('apio_cmd');
    const app = getURLParameter('app');
    const app_dir = getURLParameter('app_dir');
    
    
    //-- Get the HTML elements for displaying the info
    const disp_version = document.getElementById('disp_version');
    const disp_arch = document.getElementById('disp_arch');
    const disp_platform = document.getElementById('disp_platform');

    const disp_base_dir = document.getElementById('disp_base_dir');
    const disp_icestudio_dir = document.getElementById('disp_icestudio_dir');
    const disp_profile_path = document.getElementById('disp_profile_path');
    const disp_apio_home_dir = document.getElementById('disp_apio_home_dir');
    const disp_env_dir = document.getElementById('disp_env_dir');
    const disp_env_bin_dir = document.getElementById('disp_env_bin_dir');
    const disp_env_pip = document.getElementById('disp_env_pip');
    const disp_apio_cmd = document.getElementById('disp_apio_cmd');
    const disp_app = document.getElementById('disp_app');
    const disp_app_dir = document.getElementById('disp_app_dir');


    //-- Display the information
    disp_version.innerHTML += version;
    disp_arch.innerHTML += process.arch;
    disp_platform.innerHTML += process.platform;

    disp_base_dir.innerHTML += base_dir;
    disp_icestudio_dir.innerHTML += icestudio_dir;
    disp_profile_path.innerHTML += profile_path;
    disp_apio_home_dir.innerHTML += apio_home_dir;
    disp_env_dir.innerHTML += env_dir;
    disp_env_bin_dir.innerHTML += env_bin_dir;
    disp_env_pip.innerHTML += env_pip;
    disp_apio_cmd.innerHTML += apio_cmd;
    disp_app.innerHTML += app;
    disp_app_dir.innerHTML += app_dir;
   
    
    //-- Debug
    console.log("Version: " + version + "---");
    console.log("BASE_DIR: " + base_dir + "---");
    console.log("ICESTUDIO_DIR: " + icestudio_dir + "---");
    console.log("PROFILE_PATH: " + profile_path + "---");
    console.log("APIO_HOME_DIR: " + apio_home_dir + "---");
    console.log("ENV_DIR: " + env_dir + "---");
    console.log("ENV_BIN_DIR: " + env_bin_dir + "---");
    console.log("ENV_PIP: " + env_pip + "---");
    console.log("APIO_CMD: " + apio_cmd + "---");
    console.log("APP: " + app + "---");
    console.log("APP_DIR: " + app_dir + "---");
};

