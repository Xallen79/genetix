var game = angular.module('bloqhead.genetixApp');


game.component("bloqheadMortal", {
    templateUrl: "components/mortal/mortal.html",
    controller: "bloqheader.controllers.mortal",
    bindings: {
        unit: "<",
        canBreed: "<",
        assign: "&",
        mode: "@",
        display: "@"
    }
});

game.controller("bloqheader.controllers.mortal", ["$uibModal", "jobTypes", function($uibModal, jobTypes) {
    var self = this;
    self.jobTypes = jobTypes;
    self.$onInit = function() {
        self.display = self.display || 'TILE';
    };
    self.assignMe = function(type) {
        self.assign({ $id: self.unit.id, $type: type });
    };
    self.showDetails = function(unit) {
        $uibModal.open({
            component: 'genomeEditor',
            resolve: {
                unit: function() {
                    return self.unit;
                }
            }
        });
    };
}]);