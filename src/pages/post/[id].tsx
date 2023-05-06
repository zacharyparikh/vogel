import { type NextPage } from 'next';
import Head from 'next/head';

const Profile: NextPage = () => (
  <div>
    <Head>
      <title>Post</title>
      <meta name="description" content="Emojis!" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main className="flex h-screen justify-center">
      <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
        Post
      </div>
    </main>
  </div>
);

export default Profile;
