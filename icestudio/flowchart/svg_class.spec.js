
describe('svg_class', function () {

    it('removeClassSVG returns false when there is no classes attr', function () {

        var mockElement = {
            attr: function () {
                return null;
            },
        };
        var testClass = 'foo';

        expect(removeClassSVG(mockElement, testClass)).toBe(false);

    });

    it('removeClassSVG returns false when the element doesnt already have the class', function () {

        var mockElement = {
            attr: function () {
                return 'smeg';
            },
        };
        var testClass = 'foo';

        expect(removeClassSVG(mockElement, testClass)).toBe(false);

    });

    it('removeClassSVG returns true and removes the class when the element does have the class', function () {

        var testClass = 'foo';

        var mockElement = {
            attr: function () {
                return testClass;
            },
        };

        spyOn(mockElement, 'attr').andCallThrough();

        expect(removeClassSVG(mockElement, testClass)).toBe(true);
        expect(mockElement.attr).toHaveBeenCalledWith('class', '');

    });

    it('hasClassSVG returns false when attr returns null', function () {

        var mockElement = {
            attr: function () {
                return null;
            },
        };

        var testClass = 'foo';

        expect(hasClassSVG(mockElement, testClass)).toBe(false);

    });

    it('hasClassSVG returns false when element has no class', function () {

        var mockElement = {
            attr: function () {
                return '';
            },
        };

        var testClass = 'foo';

        expect(hasClassSVG(mockElement, testClass)).toBe(false);

    });

    it('hasClassSVG returns false when element has wrong class', function () {

        var mockElement = {
            attr: function () {
                return 'smeg';
            },
        };

        var testClass = 'foo';

        expect(hasClassSVG(mockElement, testClass)).toBe(false);

    });

    it('hasClassSVG returns true when element has correct class', function () {

        var testClass = 'foo';

        var mockElement = {
            attr: function () {
                return testClass;
            },
        };

        expect(hasClassSVG(mockElement, testClass)).toBe(true);

    });    

    it('hasClassSVG returns true when element 1 correct class of many ', function () {

        var testClass = 'foo';

        var mockElement = {
            attr: function () {
                return "whar " + testClass + " smeg";
            },
        };

        expect(hasClassSVG(mockElement, testClass)).toBe(true);
    });        
});