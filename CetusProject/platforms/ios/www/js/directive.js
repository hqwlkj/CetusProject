angular.module('starter.directive',[])

//angularjs路由菜单强制刷新
.directive('diHref',[ '$location', '$route', function($location, $route) {
	return function(scope, element, attrs) {
		scope.$watch('diHref', function() {
			if (attrs.diHref) {
				element.attr('href', attrs.diHref);
				element.bind('click', function(event) {
					scope.$apply(function() {
						if ($location.path() == attrs.diHref)
							$route.reload();
					});
				});
			}
		});
	}
} ]);