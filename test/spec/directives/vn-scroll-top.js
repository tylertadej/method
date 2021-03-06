'use strict';

describe('Directive: vnScrollTop', function () {

  // load the directive's module
  beforeEach(module('methodApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<vn-scroll-top></vn-scroll-top>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('');
  }));
});
