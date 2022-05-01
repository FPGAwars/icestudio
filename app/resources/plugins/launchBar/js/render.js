function render(plist){
    
    const filtered = plist.filter(function(item){
        return item.capability.indexOf('core') === -1;
      });
   
    const html=iceStudio.gui.template.render(pluginViews['plugin-list'].tpl,{pluginList:filtered});
    
    $(pluginRoot).find('#launchbar-wrapper').empty().append(html);
    
    let icons=$(pluginRoot).find('#launchbar-wrapper img');

      $('.launcher',pluginRoot).on('click',function(e){
        e.preventDefault();
        const pId=$(this).data('pluginid');
        iceStudio.bus.events.publish('pluginManager.launch',pId); 
        return false;
      });

      $(pluginRoot).find('#launchbar-wrapper').hover(function(e){
        
        if($(this).hasClass('out-of-focus')){
          $(this).removeClass('out-of-focus');
        }
      },
      function(e){
        if(!$(this).hasClass('out-of-focus')){
          $(this).addClass('out-of-focus');
        }

      });

    setTimeout(function(){
      $(pluginRoot).find('#launchbar-wrapper').addClass('out-of-focus');

    },5000);
}