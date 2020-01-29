function hasClass(el, className)
{
    if (el.classList)
        return el.classList.contains(className);
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className)
{
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className))
        el.className += " " + className;
}

function removeClass(el, className)
{
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className))
    {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}


function refreshDevices(){
        chrome.serial.getDevices(function(dev){
            console.log(dev);
            let infoLe=document.getElementById('device-info');    
            
            html='<table  class="table-auto"><thead><tr><th  class="w-1/2 px-4 py-2">Name</th><th  class="w-1/2 px-4 py-2">Path</th><th  class="w-1/2 px-4 py-2">productId</th><th  class="w-1/2 px-4 py-2">vendorId</th></tr></thead><tbody>';
            /* Each device object is as:
                displayName: "Alhambra_II_v1.0A_-_B06-158"
                path: "/dev/ttyUSB1"
                productId: 24592
                vendorId: 1027
            */
            for(let i=dev.length-1;i>-1;i--){
                html+='<tr><td class="border px-4 py-2">'+dev[i].displayName+'</td>'+
                        '<td class="border px-4 py-2">'+dev[i].path+'</td>'+
                        '<td class="border px-4 py-2">'+dev[i].productId+'</td>'+
                        '<td class="border px-4 py-2">'+dev[i].vendorId+'</td></tr>';

            }
            html+='</tbody></table>';
            infoLe.innerHTML=html;
            removeClass(infoLe,'hidden');


        });
}


let getDevicesLe=document.querySelectorAll('[data-action="serial-getdevices"]');

getDevicesLe[0].addEventListener('click',function(e){

    e.preventDefault();
    refreshDevices();
    return false;

},false);