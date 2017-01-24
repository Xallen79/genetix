describe('genetixApp', function() {


    beforeEach(angular.mock.module('bloqhead.genetixApp'));

    describe('constants', function() {
        describe('traitDefinitions', function() {
            beforeEach(inject(function(traitDefinitions) {
                _traitDefinitions_ = traitDefinitions;
            }));
            it('should exist', function() {
                expect(_traitDefinitions_).toBeDefined();
            });
            it('should not have invalid gene ranges', function() {
                var valid = true;
                for (var i = 0; i < _traitDefinitions_.length && valid; i++) {
                    var td = _traitDefinitions_[i];
                    var ranges = {};
                    for (var j = 0; j < td.genes.length; j++) {
                        var tdg = td.genes[j];
                        if (tdg[1] > tdg[2]) {
                            dump(td.name + ' min greater than max');
                            valid = false;
                            break;
                        }
                        if (typeof(ranges[tdg[0]]) == 'undefined') {
                            ranges[tdg[0]] = tdg;
                        } else {
                            //dump(ranges);
                            //dump(tdg);
                            var range = ranges[tdg[0]];
                            var min = range[1];
                            var max = range[2];
                            if (tdg[1] > max) {
                                dump(td.name + ' failed, min is greater than some max for gene: ' + tdg[0]);
                                valid = false;
                                break;
                            }
                            if (tdg[2] < min) {
                                dump(td.name + ' failed, max is less than some min for gene: ' + tdg[0]);
                                valid = false;
                                break;
                            }
                            if (tdg[1] > min)
                                range[1] = tdg[1];
                            if (tdg[2] < max)
                                range[2] = tdg[2];
                        }

                    }

                }
                expect(valid).toEqual(true);

            });
        });
        describe('geneDefinitions', function() {
            beforeEach(inject(function(geneDefinitions) {
                _geneDefinitions_ = geneDefinitions;
            }));
            it('should exist', function() {
                expect(_geneDefinitions_).toBeDefined();
            });
            it('should have 50 values', function() {
                expect(_geneDefinitions_.length).toEqual(50);
            });
        });
    });


});