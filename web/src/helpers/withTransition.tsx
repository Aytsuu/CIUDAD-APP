// route-utils.ts
import { RouteObject } from 'react-router';
import { RouteWithTransition } from '@/components/route-transition/route-with-transition';

export const withTransition = (routes: RouteObject[]): RouteObject[] => {
  return routes.map(route => {
    // Process nested routes recursively
    const processedChildren = route.children 
      ? withTransition(route.children)
      : undefined;

    return {
      ...route,
      element: route.element ? (
        <RouteWithTransition key={route.path}>
          {route.element}
        </RouteWithTransition>
      ) : undefined,
      children: processedChildren
    };
  }) as RouteObject[];
};