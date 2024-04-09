import { monoCloudMiddleware } from '@monocloud/nextjs-auth';

export default monoCloudMiddleware({
  protectedRoutes: ['/middleware-profile'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
