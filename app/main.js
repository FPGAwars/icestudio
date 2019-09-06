function openApp() {
	nw.Window.open('index.html');
}

nw.App.on('open', openApp);
openApp();