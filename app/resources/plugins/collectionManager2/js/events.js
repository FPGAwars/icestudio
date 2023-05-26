//-- When some change in the configuration or in the environment, launch it
function setupEnvironment(env) {


    iceStudio.bus.events.publish('collectionService.isIndexing');
}

let preload = false; //-- Flag for preload collection tree from database while indexing the new one.

//-- When index event in the collection service fired
function collectionsIndexStatus(status) {

    if (status.queue === 0 && status.indexing === false) {
        iceStudio.bus.events.publish('collectionService.getCollections');
    } else {
        if (preload === false) {
            preload = true;
            iceStudio.bus.events.publish('collectionService.getCollections');
        }
        setTimeout(function () {
            iceStudio.bus.events.publish('collectionService.isIndexing');
        }, 1000);
    }
}

function collectionsRender(tree) {
    if (tree !== false) {
        let playground = iceStudio.gui.el('.playground', pluginHost);
        collectionsTree = new WafleUITree();
        collectionsTree.setId(pluginUUID);
        collectionsTree.setTree(tree);

        if (playground.length) {
            playground[0].innerHTML = collectionsTree.render();
            collectionsTree.setDomRoot(pluginHost);
            iceStudio.gui.activateEventsFromId(`#tree-view-${pluginUUID}`, pluginHost, mouseEvents);
        }
    }
}

function registerEvents() {
    iceStudio.bus.events.subscribe('pluginManager.env', setupEnvironment, false, pluginUUID);
    iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment, false, pluginUUID);
    iceStudio.bus.events.subscribe('collectionService.indexStatus', collectionsIndexStatus, false, pluginUUID);
    iceStudio.bus.events.subscribe('collectionService.collections', collectionsRender, false, pluginUUID);
}

function mouseEvents(eventType, handler, args) {
    switch (eventType) {
        case 'click':
            switch (handler) {
                case 'this.toggleFolder':
                    collectionsTree.toggle(pluginHost, args.id);
                    break;
                case 'this.getBlock':
                    collectionsTree.getBlock(pluginHost, args);
                    break;
            }
            break;
    }
}