import {
  SignIn,
  SignOut,
  SignUp,
  useUser,
} from '@monocloud/nextjs-auth/client';
import Link from 'next/link';

export const Header = () => {
  const { user, isAuthenticated } = useUser();

  return (
    <nav className="flex bg-blue-900 text-white justify-between p-6">
      {user ? <h1>Hello {user.email}</h1> : <h1>Welcome</h1>}
      <div className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/client">Client</Link>
        <Link href="/server">Server</Link>
        <Link href="/api-profile">Api</Link>
        <Link href="/middleware-profile">Middleware</Link>
        <Link href="/tokens">Tokens</Link>
      </div>
      <div className="flex gap-4">
        {isAuthenticated ? (
          <SignOut>Sign Out</SignOut>
        ) : (
          <>
            <SignIn>Sign In</SignIn>
            <SignUp>Sign Up</SignUp>
          </>
        )}
      </div>
    </nav>
  );
};
