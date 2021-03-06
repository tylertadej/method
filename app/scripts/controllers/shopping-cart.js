/**
 * @ngdoc function
 * @name methodApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the methodApp
 */

angular.module('Volusion.controllers')
	.controller('ShoppingCartCtrl', ['$rootScope', '$scope', '$timeout', '$filter', '$window', 'translate', 'vnCart', 'vnContentManager', 'vnAppConfig', 'vnAppMessageService', 'notifications',
		function ($rootScope, $scope, $timeout, $filter, $window, translate, vnCart, vnContentManager, vnAppConfig, vnAppMessageService, notifications) {

			'use strict';

			$scope.cart = {};
			$scope.cartEmpty = true;
			$scope.calcSubtotal = 0;
			$scope.choices = 99;
			$scope.coupon = {
				'code' : '',
				'show' : false
			};
			$scope.couponsEmpty = false;
			$scope.loading = false;
			$scope.showGiftOption = false;
			$scope.visualCue = false;
			$scope.msgLength = 0;

			translate.addParts('shopping-card');

			function updateCart(callback) {

				$scope.loading = true;

				vnCart.updateCart()
					.then(function (cart) {

						$scope.cart = cart;
						$scope.loading = false;

						notifications.displayWarnings($scope.cart.warnings); // if any
						notifications.displayErrors($scope.cart.serviceErrors);

						if ($scope.cart.warnings && $scope.cart.warnings.length > 0 ||
							$scope.cart.serviceErrors && $scope.cart.serviceErrors.length > 0) {
							// scroll cart item to the top so this msg will be visible
							$rootScope.$emit('vnScroll.cart');
						} else {
							if (callback !== undefined) {
								callback();
							}
						}
					});
			}

			$scope.resetGiftOptions = function () {

				var needUpdate = false;

				// ng-change transcludes the scope of the input so the [changed] model
				// is available into child scope [this]
				if (this.showGiftOption) {
					// Gift options are shown - show vusual cue
					$scope.visualCue = true;

					$timeout(function () {
						$scope.visualCue = false;
					}, 3000);

					return;
				}

				angular.forEach($scope.cart.items, function (item) {
					if (item.isGiftWrapAvailable) {
						if (item.giftWrap.selected) {
							item.giftWrap.selected = false;
							needUpdate = true;
						}
					}
				});

				if (needUpdate) {
					updateCart();
				}
			};

			$scope.addGiftWrap = function () {
				updateCart();
			};

			$scope.addGiftMsg = function () {
				updateCart();
			};

			$scope.applyCoupon = function () {
				$scope.cart.discounts = $filter('filter')($scope.cart.discounts, function (coupon) {
					return coupon.couponCode !== $scope.coupon.code;
				});

				$scope.cart.discounts.push({ 'couponCode': $scope.coupon.code });

				updateCart(function () {
					if ($scope.cart.serviceErrors.length === 0) {
						$scope.coupon.show = false;
						$scope.coupon.code = '';
					}
				});
			};

			$scope.deleteCoupon = function (id) {
				$scope.cart.discounts = $filter('filter')($scope.cart.discounts, function (coupon) {
					return coupon.id !== id;
				});

				$scope.couponsEmpty = ($scope.cart.discounts.length > 0) ? false : true;

				updateCart();
			};

			$scope.deleteItem = function (id) {
				$scope.cart.items = $filter('filter')($scope.cart.items, function (item) {
					return item.id !== id;
				});

				updateCart();
			};

			$scope.getArray = function(num) {
				return new Array(num);
			};

			$scope.getCartItemsCount = function () {
				return vnCart.getCartItemsCount();
			};

			$scope.gotoCheckout = function() {

				var host = vnAppConfig.getApiHost();

				if ($rootScope.isInDesktopMode) {
					$window.location.assign(host + '/one-page-checkout.asp');
				} else {
					$window.location.assign(host + '/checkout.asp#shipping');
				}
			};

			$scope.onOptionChanged = function (item, choice) {

				item.qty = choice;

				updateCart();
			};

			$scope.toggleShowCoupon = function () {
				$scope.coupon.show = !$scope.coupon.show;
			};

			$scope.$watch(
				function () {
					return vnCart.getCart();
				},
				function () {
					$scope.cart = vnCart.getCart();

					if ($scope.cart !== undefined && $scope.cart.totals !== undefined) {
						// "$scope.cart.totals.discounts" format is "-amount" ... hence the addition
						$scope.calcSubtotal = $scope.cart.totals.items + $scope.cart.totals.discounts;

						$scope.cartEmpty = ($scope.cart.totals.qty > 0) ? false : true;
					}

					if ($scope.cart !== undefined && $scope.cart.discounts !== undefined) {
						$scope.couponsEmpty = ($scope.cart.discounts.length > 0) ? false : true;
					}

					if ($scope.cart !== undefined && $scope.cart.items !== undefined) {
						// set gift option if any item has gift wrap selected
						for (var i = 0; i < $scope.cart.items.length; i++) {
							if ($scope.cart.items[i].giftWrap.selected) {
								$scope.showGiftOption = true;

								return;
							}
						}
					}
				}
			);
		}]);
