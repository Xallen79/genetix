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

game.controller("bloqheader.controllers.mortal", ["jobTypes", function(jobTypes) {
    var self = this;
    self.jobTypes = jobTypes;
    self.$onInit = function() {
        self.display = self.display || 'TILE';
    };
    self.assignMe = function(type) {
        self.assign({ $id: self.unit.id, $type: type });
    };


}]);