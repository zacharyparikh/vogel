import { type NextPage } from 'next';
import Head from 'next/head';
import { api } from '~/utils/api';

const Profile: NextPage = () => {
  const { data, isLoading } = api.profile.get.useQuery({
    username: 'zacharyparikh',
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>404</div>;
  }

  console.log({ data });

  return (
    <div>
      <Head>
        <title>Profile</title>
        <meta name="description" content="Emojis!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
          Profile View
        </div>
      </main>
    </div>
  );
};

export default Profile;
