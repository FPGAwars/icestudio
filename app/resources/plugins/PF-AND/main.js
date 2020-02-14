ICEpm.registerFactory('PF-AND', function (str, params) {

    let andInputs = 2;

    if (typeof params !== 'undefined' && params.length > 0) {
        andInputs = params[0][0];
    }

    let view = {
        NAMESUFIX: Math.round(Math.random() * 1000),
        inputs: ICEpm.parametric.inout(andInputs, 'in'),
        pinsin: ICEpm.parametric.pins(andInputs)
    };

    view.wires = ICEpm.parametric.pair(view.inputs, view.pinsin);

    return ICEpm.tpl.render('PF-AND', str, view);
});

ICEpm.paramsFactory('PF-AND', {

    data: [
        [4]
    ],
    columns: [{
        type: 'numeric',
        title: 'Number of inputs',
        width: 120
    }]
}); //PF-AND paramas