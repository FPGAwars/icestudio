'use strict';

class UniqueIdGenerator
{
    static UUID() 
    {
        let array = new Uint32Array(8)
        window.crypto.getRandomValues(array)
        let str = ''
        for (let i = 0; i < array.length; i++) {
            str += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4)
        }
        return str
    }; 
}