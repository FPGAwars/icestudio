ICEpm.registerFactory('PF-AND', function(str){
    
            let view={ NAMESUFIX :Math.round(Math.random()*1000),
                       inputs: ICEpm.parametric.inout(50,'in'),
                       pinsin:  ICEpm.parametric.pins(50)
            };
                view.wires=ICEpm.parametric.pair(view.inputs,view.pinsin);
        return ICEpm.tpl.render('PF-AND',str,view);
    } );
