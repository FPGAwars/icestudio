console.log("System.js: here!!!!!!------*********whattttttt!!!!!");

const disp_arch = document.getElementById('disp_arch');
const disp_platform = document.getElementById('disp_platform');
const disp_dir = document.getElementById('disp_dir');
disp_arch.innerHTML += process.arch;
disp_platform.innerHTML += process.platform;
disp_dir.innerHTML += process.cwd();

console.log("Profile: " + common.PROFILE_PATH);
